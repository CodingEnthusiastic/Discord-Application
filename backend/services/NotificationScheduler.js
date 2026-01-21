const cron = require('node-cron');
const GeminiLLMEngine = require('./GeminiLLMEngine');
const NotificationPolicy = require('./NotificationPolicy');
const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const Server = require('../models/Server');

/**
 * Notification Scheduler
 * Runs every 12 hours to generate and send AI-powered notifications
 */

class NotificationScheduler {
  constructor() {
    this.isRunning = false;
    this.llmEngine = new GeminiLLMEngine();
  }

  /**
   * Initialize scheduler
   */
  initialize() {
    // Run every 12 hours (0:00 and 12:00)
    this.job = cron.schedule('0 0,12 * * *', () => {
      this.runNotificationCycle();
    });

    console.log('✅ Notification Scheduler initialized (runs every 12 hours)');

    // Optional: Run immediately on startup (comment out for production)
    // this.runNotificationCycle();
  }

  /**
   * Stop scheduler
   */
  stop() {
    if (this.job) {
      this.job.stop();
      this.isRunning = false;
      console.log('🛑 Notification Scheduler stopped');
    }
  }

  /**
   * Main notification cycle
   */
  async runNotificationCycle() {
    if (this.isRunning) {
      console.log('⏳ Notification cycle already running, skipping...');
      return;
    }

    this.isRunning = true;
    const startTime = Date.now();
    console.log(`\n🚀 Starting notification cycle at ${new Date().toLocaleString()}`);

    try {
      // 1. Get all servers
      const servers = await Server.find({}).lean();
      console.log(`📊 Found ${servers.length} servers`);

      for (const server of servers) {
        await this.processServerNotifications(server);
      }

      const duration = ((Date.now() - startTime) / 1000).toFixed(2);
      console.log(`✅ Notification cycle completed in ${duration}s\n`);
    } catch (error) {
      console.error('❌ Error in notification cycle:', error);
    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Process all users in a server
   */
  async processServerNotifications(server) {
    try {
      const serverUsers = server.members || [];
      console.log(`\n📌 Processing server: ${server.name} (${serverUsers.length} members)`);

      let notificationsSent = 0;
      let notificationsSkipped = 0;

      for (const userId of serverUsers) {
        const result = await this.processUserNotification(userId, server._id);

        if (result.notified) {
          notificationsSent++;
        } else {
          notificationsSkipped++;
        }
      }

      console.log(
        `  └─ Sent: ${notificationsSent}, Skipped: ${notificationsSkipped}, Total: ${serverUsers.length}`
      );
    } catch (error) {
      console.error(`Error processing server ${server.name}:`, error);
    }
  }

  /**
   * Process notification for individual user
   */
  async processUserNotification(userId, serverId) {
    try {
      // 1. Check policy
      const policyCheck = await NotificationPolicy.canNotify(userId, serverId);

      if (!policyCheck.canNotify) {
        return {
          notified: false,
          reason: policyCheck.reason,
          userId,
        };
      }

      // 2. Make LLM decision
      const decision = await this.llmEngine.makeNotificationDecision(userId, serverId);

      if (!decision.success) {
        return {
          notified: false,
          reason: 'llm_error',
          error: decision.error,
          userId,
        };
      }

      // 3. Check if LLM decided to notify
      if (!decision.decision.shouldNotify) {
        return {
          notified: false,
          reason: 'llm_no_notify',
          userId,
        };
      }

      // 4. Validate policy one more time
      const validation = NotificationPolicy.validateDecisionPolicy(decision.decision);
      if (!validation.valid) {
        return {
          notified: false,
          reason: 'policy_validation_failed',
          issues: validation.issues,
          userId,
        };
      }

      // 5. Record notification
      await NotificationPolicy.recordNotification(userId, serverId, decision.decision);

      // 6. Send notification (integrate with your notification system)
      await this.sendNotification(userId, serverId, decision.decision);

      return {
        notified: true,
        userId,
        message: decision.decision.message,
        priority: decision.decision.priority,
      };
    } catch (error) {
      console.error(`Error processing user ${userId}:`, error);
      return {
        notified: false,
        reason: 'processing_error',
        error: error.message,
        userId,
      };
    }
  }

  /**
   * Send notification to user
   * Integrate with your notification system (email, push, in-app, etc.)
   */
  async sendNotification(userId, serverId, decision) {
    try {
      const user = await User.findById(userId).lean();
      if (!user) return;

      // TODO: Implement actual notification sending
      // Options:
      // - Send email notification
      // - Send push notification
      // - Store in database for in-app display
      // - Send webhook to mobile app

      const notificationData = {
        userId,
        serverId,
        type: 'ai_engagement',
        message: decision.message,
        priority: decision.priority,
        tone: decision.tone,
        timestamp: new Date(),
        read: false,
      };

      console.log(`   ✉️ [${decision.priority.toUpperCase()}] ${user.username}: ${decision.message}`);

      // Example: Store in notifications collection
      // await Notification.create(notificationData);

      // Example: Send email
      // await sendEmail(user.email, decision.message);

      // Example: Emit socket event
      // io.to(user._id).emit('notification', notificationData);

      return { success: true, notificationData };
    } catch (error) {
      console.error(`Error sending notification to user ${userId}:`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Manually trigger notification cycle (for testing)
   */
  async triggerManually() {
    if (this.isRunning) {
      console.log('⏳ Notification cycle already running');
      return;
    }
    await this.runNotificationCycle();
  }

  /**
   * Get scheduler status
   */
  getStatus() {
    return {
      isRunning: this.isRunning,
      nextRun: this.job ? 'Every 12 hours' : 'Not scheduled',
      lastRun: new Date(),
    };
  }
}

module.exports = NotificationScheduler;
