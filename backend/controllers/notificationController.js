const NotificationPolicy = require('../services/NotificationPolicy');
const GeminiLLMEngine = require('../services/GeminiLLMEngine');
const ActivityLog = require('../models/ActivityLog');

/**
 * Notification Controller
 * Handles notification-related API routes
 */

const notificationController = {
  /**
   * Log user activity event
   * Call this whenever a Discord event occurs
   */
  logActivity: async (req, res) => {
    try {
      const { userId, serverId, eventType, metadata } = req.body;

      if (!userId || !eventType) {
        return res.status(400).json({ error: 'userId and eventType required' });
      }

      const activityLog = new ActivityLog({
        userId,
        serverId,
        eventType,
        metadata,
      });

      await activityLog.save();

      res.status(201).json({
        success: true,
        activityLog,
        message: `Activity logged: ${eventType}`,
      });
    } catch (error) {
      console.error('Error logging activity:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Get user's notification preferences
   */
  getPreferences: async (req, res) => {
    try {
      const { userId, serverId } = req.params;

      const preferences = await NotificationPolicy.getPreferences(userId, serverId);

      res.json(preferences);
    } catch (error) {
      console.error('Error getting preferences:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Update user's notification preferences
   */
  updatePreferences: async (req, res) => {
    try {
      const { userId, serverId } = req.params;
      const preferences = req.body;

      const result = await NotificationPolicy.updatePreferences(userId, serverId, preferences);

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.json({
        success: true,
        message: 'Preferences updated',
        preferences: result.cache.notificationPreference,
      });
    } catch (error) {
      console.error('Error updating preferences:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Get user's activity history
   */
  getActivityHistory: async (req, res) => {
    try {
      const { userId } = req.params;
      const { days = 7, limit = 50 } = req.query;

      const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const activities = await ActivityLog.find({
        userId,
        timestamp: { $gte: daysAgo },
      })
        .sort({ timestamp: -1 })
        .limit(parseInt(limit))
        .lean();

      res.json({
        success: true,
        userId,
        days: parseInt(days),
        totalActivities: activities.length,
        activities,
      });
    } catch (error) {
      console.error('Error getting activity history:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Test notification decision for a user
   * (Useful for debugging/testing)
   */
  testNotificationDecision: async (req, res) => {
    try {
      const { userId, serverId } = req.body;

      if (!userId || !serverId) {
        return res.status(400).json({ error: 'userId and serverId required' });
      }

      const llmEngine = new GeminiLLMEngine();
      const decision = await llmEngine.makeNotificationDecision(userId, serverId);

      if (!decision.success) {
        return res.status(500).json({
          success: false,
          error: decision.error,
        });
      }

      // Check policy as well
      const policyCheck = await NotificationPolicy.canNotify(userId, serverId, decision.decision);

      res.json({
        success: true,
        llmDecision: decision.decision,
        policyCheck,
        context: decision.context,
        signals: decision.signals,
      });
    } catch (error) {
      console.error('Error testing notification:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Record user ignoring a notification
   */
  ignoreNotification: async (req, res) => {
    try {
      const { userId, serverId } = req.body;

      if (!userId || !serverId) {
        return res.status(400).json({ error: 'userId and serverId required' });
      }

      const result = await NotificationPolicy.recordIgnore(userId, serverId);

      if (!result.success) {
        return res.status(500).json({ error: result.error });
      }

      res.json({
        success: true,
        message: 'Ignore recorded',
        ignoreCount: result.cache.ignoreCount,
      });
    } catch (error) {
      console.error('Error recording ignore:', error);
      res.status(500).json({ error: error.message });
    }
  },

  /**
   * Get user's notification stats
   */
  getNotificationStats: async (req, res) => {
    try {
      const { userId, serverId } = req.params;

      const prefs = await NotificationPolicy.getPreferences(userId, serverId);

      const activities = await ActivityLog.find({ userId }).sort({ timestamp: -1 }).limit(100).lean();

      const stats = {
        userId,
        serverId,
        preferences: prefs.notificationPreference,
        totalActivities: activities.length,
        lastNotificationTime: prefs.lastNotificationTime,
        notificationCount: prefs.notificationCount,
        ignoreCount: prefs.ignoreCount,
        activityBreakdown: {
          messagesSent: activities.filter((a) => a.eventType === 'message_sent').length,
          voiceJoins: activities.filter((a) => a.eventType === 'voice_joined').length,
          reactions: activities.filter((a) => a.eventType === 'reaction_added').length,
          otherEvents: activities.length
            - activities.filter(
              (a) => a.eventType === 'message_sent' || a.eventType === 'voice_joined' || a.eventType === 'reaction_added'
            ).length,
        },
      };

      res.json(stats);
    } catch (error) {
      console.error('Error getting notification stats:', error);
      res.status(500).json({ error: error.message });
    }
  },
};

module.exports = notificationController;
