const cron = require('node-cron');
const ReminderPreference = require('../models/ReminderPreference');
const User = require('../models/User');
const Server = require('../models/Server');

/**
 * Reminder Scheduler
 * Sends reminder notifications every 3 hours (or user-configured interval)
 * Includes popup sound notification
 */

class ReminderScheduler {
  constructor() {
    this.isRunning = false;
    this.jobs = [];
  }

  /**
   * Initialize scheduler - runs every 3 hours
   */
  initialize() {
    // Run every 3 hours (0:00, 3:00, 6:00, 9:00, 12:00, 15:00, 18:00, 21:00)
    this.job = cron.schedule('0 0,3,6,9,12,15,18,21 * * *', () => {
      this.runReminderCycle();
    });

    console.log('🔔 Reminder Scheduler initialized (runs every 3 hours)');
  }

  /**
   * Stop scheduler
   */
  stop() {
    if (this.job) {
      this.job.stop();
      this.isRunning = false;
      console.log('🛑 Reminder Scheduler stopped');
    }
  }

  /**
   * Main reminder cycle
   */
  async runReminderCycle() {
    if (this.isRunning) {
      console.log('⏳ Reminder cycle already running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    console.log(`\n🔔 Starting reminder cycle at ${new Date().toLocaleString()}`);

    try {
      // Get all active reminder preferences
      const reminders = await ReminderPreference.find({
        'reminderSettings.enabled': true,
      })
        .populate('userId', 'username email')
        .lean();

      console.log(`📊 Found ${reminders.length} active reminders`);

      let remindersSent = 0;
      let remindersSkipped = 0;

      for (const reminder of reminders) {
        const result = await this.processUserReminder(reminder);

        if (result.sent) {
          remindersSent++;
        } else {
          remindersSkipped++;
        }
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ Reminder cycle completed in ${duration}s`);
      console.log(`   Sent: ${remindersSent}, Skipped: ${remindersSkipped}\n`);
    } catch (error) {
      console.error('❌ Error in reminder cycle:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Process reminder for individual user
   */
  async processUserReminder(reminder) {
    try {
      const { userId, reminderSettings, lastReminderTime } = reminder;

      // Check quiet hours
      if (reminderSettings.quietHours.enabled) {
        if (this.isInQuietHours(reminderSettings.quietHours)) {
          return { sent: false, reason: 'quiet_hours' };
        }
      }

      // Check frequency
      if (lastReminderTime) {
        const timeSinceLastReminder = Date.now() - new Date(lastReminderTime).getTime();
        const minIntervalMs = this.getFrequencyInMs(reminderSettings.frequency);

        if (timeSinceLastReminder < minIntervalMs) {
          return { sent: false, reason: 'frequency_not_met' };
        }
      }

      // Send reminder
      const reminderData = {
        userId,
        message: reminderSettings.reminderMessage,
        soundEnabled: reminderSettings.soundEnabled,
        soundType: reminderSettings.soundType,
        timestamp: new Date(),
        type: 'reminder',
        frequency: reminderSettings.frequency,
      };

      await this.sendReminder(userId, reminderData);

      // Update last reminder time
      await ReminderPreference.findByIdAndUpdate(reminder._id, {
        lastReminderTime: new Date(),
        $inc: { reminderCount: 1 },
      });

      return { sent: true, userId };
    } catch (error) {
      console.error(`Error processing reminder for user:`, error);
      return { sent: false, reason: 'error', error: error.message };
    }
  }

  /**
   * Check if current time is within quiet hours
   */
  isInQuietHours(quietHours) {
    const now = new Date();
    const currentHour = now.getHours();
    const { start, end } = quietHours;

    // If start < end (e.g., 22-23), simple comparison
    if (start < end) {
      return currentHour >= start && currentHour < end;
    }

    // If start > end (e.g., 22-8), wraps around midnight
    return currentHour >= start || currentHour < end;
  }

  /**
   * Convert frequency string to milliseconds
   */
  getFrequencyInMs(frequency) {
    const frequencies = {
      '3hours': 3 * 60 * 60 * 1000,
      '6hours': 6 * 60 * 60 * 1000,
      '12hours': 12 * 60 * 60 * 1000,
      'daily': 24 * 60 * 60 * 1000,
      'manual': Infinity, // Only on manual trigger
    };

    return frequencies[frequency] || 3 * 60 * 60 * 1000; // Default to 3 hours
  }

  /**
   * Send reminder notification
   */
  async sendReminder(userId, reminderData) {
    try {
      const user = await User.findById(userId).lean();
      if (!user) return;

      // Format reminder message
      const timestamp = new Date().toLocaleTimeString();
      const message = `🔔 [${timestamp}] ${reminderData.message}`;

      console.log(`   🔊 [${reminderData.soundType}] ${user.username}: ${message}`);

      // TODO: Implement actual notification delivery
      // Options:
      // 1. Socket.io with popup
      // 2. Email notification
      // 3. Push notification
      // 4. In-app notification with sound

      // Example: Socket.io event
      /*
      io.to(userId).emit('reminder', {
        message: reminderData.message,
        soundEnabled: reminderData.soundEnabled,
        soundType: reminderData.soundType,
        timestamp: reminderData.timestamp,
        audioUrl: `/sounds/${reminderData.soundType}.mp3`
      });
      */

      return { success: true, reminderData };
    } catch (error) {
      console.error(`Error sending reminder to user ${userId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Manually trigger reminder for user
   */
  async triggerManualReminder(userId, serverId) {
    try {
      const reminder = await ReminderPreference.findOne({
        userId,
        serverId,
      }).lean();

      if (!reminder || !reminder.reminderSettings.enabled) {
        return {
          success: false,
          error: 'Reminders not enabled for this user',
        };
      }

      const reminderData = {
        userId,
        message: reminder.reminderSettings.reminderMessage,
        soundEnabled: reminder.reminderSettings.soundEnabled,
        soundType: reminder.reminderSettings.soundType,
        timestamp: new Date(),
        type: 'manual_reminder',
      };

      await this.sendReminder(userId, reminderData);

      // Update reminder count
      await ReminderPreference.findByIdAndUpdate(reminder._id, {
        lastReminderTime: new Date(),
        $inc: { reminderCount: 1 },
      });

      return { success: true, reminderData };
    } catch (error) {
      console.error('Error triggering manual reminder:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: 'Every 3 hours (0, 3, 6, 9, 12, 15, 18, 21)',
      lastRun: new Date(),
    };
  }
}

module.exports = ReminderScheduler;
