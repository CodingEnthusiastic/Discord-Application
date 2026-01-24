const ChatSummarizer = require('../services/ChatSummarizer');
const ReminderPreference = require('../models/ReminderPreference');
const ChatSummary = require('../models/ChatSummary');

/**
 * Summary and Reminder Controller
 * Handles API requests for chat summaries and reminder management
 */

const summaryReminderController = {
  /**
   * Request a chat summary for specified period
   */
  requestSummary: async (req, res) => {
    try {
      const { userId, serverId, channelId, period } = req.body;

      // Validate period
      if (!['1day', '3days', '7days'].includes(period)) {
        return res.status(400).json({
          error: 'Invalid period. Must be 1day, 3days, or 7days',
        });
      }

      // Validate required fields
      if (!channelId) {
        return res.status(400).json({
          error: 'channelId is required',
        });
      }

      // Check for recent summary (within 6 hours)
      const summarizer = new ChatSummarizer();
      const recentSummary = await summarizer.getRecentSummary(userId, serverId, period);

      if (recentSummary) {
        return res.status(200).json({
          success: true,
          summary: recentSummary,
          cached: true,
          message: 'Using recently generated summary (from cache)',
        });
      }

      // Convert period to days
      const dayMap = { '1day': 1, '3days': 3, '7days': 7 };
      const days = dayMap[period];

      // Generate new summary
      const result = await summarizer.generateSummary(userId, serverId, channelId, days);

      if (!result.success) {
        return res.status(500).json({
          success: false,
          error: result.error,
        });
      }

      res.status(200).json({
        success: true,
        summary: result.summary,
        stats: result.stats,
        cached: false,
        message: `Summary generated for ${period}`,
      });
    } catch (error) {
      console.error('Error requesting summary:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Get all summaries for a user
   */
  getUserSummaries: async (req, res) => {
    try {
      const { userId, serverId } = req.params;
      const { limit = 10 } = req.query;

      const summarizer = new ChatSummarizer();
      const summaries = await summarizer.getUserSummaries(
        userId,
        serverId,
        parseInt(limit)
      );

      res.json({
        success: true,
        count: summaries.length,
        summaries,
      });
    } catch (error) {
      console.error('Error getting user summaries:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Get single summary by ID
   */
  getSummaryById: async (req, res) => {
    try {
      const { summaryId } = req.params;

      const summary = await ChatSummary.findById(summaryId);

      if (!summary) {
        return res.status(404).json({ error: 'Summary not found' });
      }

      // Mark as read if not already
      if (!summary.isRead) {
        summary.isRead = true;
        summary.readAt = new Date();
        await summary.save();
      }

      res.json({ success: true, summary });
    } catch (error) {
      console.error('Error getting summary:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Get reminder preferences
   */
  getReminderPreferences: async (req, res) => {
    try {
      const { userId, serverId } = req.params;

      let preferences = await ReminderPreference.findOne({
        userId,
        serverId,
      });

      // Return default preferences if not found
      if (!preferences) {
        preferences = {
          userId,
          serverId,
          reminderSettings: {
            enabled: true,
            frequency: '3hours',
            soundEnabled: true,
            soundType: 'notification',
            quietHours: { enabled: true, start: 22, end: 8 },
            reminderMessage: 'You have a reminder! Check your updates.',
          },
          summaryReminder: {
            enabled: true,
            frequency: 'daily',
          },
        };
      }

      res.json({ success: true, preferences });
    } catch (error) {
      console.error('Error getting reminder preferences:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Update reminder preferences
   */
  updateReminderPreferences: async (req, res) => {
    try {
      const { userId, serverId } = req.params;
      const { reminderSettings, summaryReminder } = req.body;

      let preferences = await ReminderPreference.findOne({
        userId,
        serverId,
      });

      if (!preferences) {
        preferences = new ReminderPreference({
          userId,
          serverId,
          reminderSettings,
          summaryReminder,
        });
      } else {
        if (reminderSettings) {
          preferences.reminderSettings = {
            ...preferences.reminderSettings,
            ...reminderSettings,
          };
        }
        if (summaryReminder) {
          preferences.summaryReminder = {
            ...preferences.summaryReminder,
            ...summaryReminder,
          };
        }
      }

      await preferences.save();

      res.json({
        success: true,
        message: 'Preferences updated',
        preferences,
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Toggle reminder enabled/disabled
   */
  toggleReminders: async (req, res) => {
    try {
      const { userId, serverId } = req.params;
      const { enabled } = req.body;

      let preferences = await ReminderPreference.findOne({
        userId,
        serverId,
      });

      if (!preferences) {
        preferences = new ReminderPreference({
          userId,
          serverId,
          reminderSettings: { enabled },
        });
      } else {
        preferences.reminderSettings.enabled = enabled;
      }

      await preferences.save();

      res.json({
        success: true,
        message: `Reminders ${enabled ? 'enabled' : 'disabled'}`,
        enabled: preferences.reminderSettings.enabled,
      });
    } catch (error) {
      console.error('Error toggling reminders:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Update reminder sound preferences
   */
  updateReminderSound: async (req, res) => {
    try {
      const { userId, serverId } = req.params;
      const { soundEnabled, soundType, reminderMessage } = req.body;

      let preferences = await ReminderPreference.findOne({
        userId,
        serverId,
      });

      if (!preferences) {
        preferences = new ReminderPreference({
          userId,
          serverId,
          reminderSettings: {
            soundEnabled,
            soundType,
            reminderMessage,
          },
        });
      } else {
        if (soundEnabled !== undefined) {
          preferences.reminderSettings.soundEnabled = soundEnabled;
        }
        if (soundType) {
          preferences.reminderSettings.soundType = soundType;
        }
        if (reminderMessage) {
          preferences.reminderSettings.reminderMessage = reminderMessage;
        }
      }

      await preferences.save();

      res.json({
        success: true,
        message: 'Sound preferences updated',
        soundSettings: {
          soundEnabled: preferences.reminderSettings.soundEnabled,
          soundType: preferences.reminderSettings.soundType,
          reminderMessage: preferences.reminderSettings.reminderMessage,
        },
      });
    } catch (error) {
      console.error('Error updating sound preferences:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Get reminder statistics
   */
  getReminderStats: async (req, res) => {
    try {
      const { userId, serverId } = req.params;

      const preferences = await ReminderPreference.findOne({
        userId,
        serverId,
      });

      const stats = {
        userId,
        serverId,
        enabled: preferences?.reminderSettings.enabled || false,
        frequency: preferences?.reminderSettings.frequency || '3hours',
        totalReminders: preferences?.reminderCount || 0,
        lastReminderTime: preferences?.lastReminderTime || null,
        soundEnabled: preferences?.reminderSettings.soundEnabled || true,
        soundType: preferences?.reminderSettings.soundType || 'notification',
      };

      res.json({ success: true, stats });
    } catch (error) {
      console.error('Error getting reminder stats:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Mark all summaries as read
   */
  markAllSummariesRead: async (req, res) => {
    try {
      const { userId, serverId } = req.params;

      const result = await ChatSummary.updateMany(
        { userId, serverId, isRead: false },
        {
          isRead: true,
          readAt: new Date(),
        }
      );

      res.json({
        success: true,
        message: `${result.modifiedCount} summaries marked as read`,
        modifiedCount: result.modifiedCount,
      });
    } catch (error) {
      console.error('Error marking summaries as read:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Get unread summaries count
   */
  getUnreadCount: async (req, res) => {
    try {
      const { userId, serverId } = req.params;

      const unreadCount = await ChatSummary.countDocuments({
        userId,
        serverId,
        isRead: false,
      });

      res.json({
        success: true,
        unreadCount,
      });
    } catch (error) {
      console.error('Error getting unread count:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Delete summary
   */
  deleteSummary: async (req, res) => {
    try {
      const { summaryId } = req.params;

      const summary = await ChatSummary.findByIdAndDelete(summaryId);

      if (!summary) {
        return res.status(404).json({ error: 'Summary not found' });
      }

      res.json({
        success: true,
        message: 'Summary deleted',
      });
    } catch (error) {
      console.error('Error deleting summary:', error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = summaryReminderController;
