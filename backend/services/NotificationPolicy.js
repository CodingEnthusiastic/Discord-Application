const NotificationCache = require('../models/NotificationCache');

/**
 * Notification Policy Engine
 * Enforces rules and constraints to prevent spam and ensure quality notifications
 */

class NotificationPolicy {
  /**
   * Check if user is in quiet hours
   */
  static isInQuietHours(userPreference) {
    const now = new Date();
    const currentHour = now.getHours();
    const { start, end } = userPreference.quietHours;

    // If start < end (e.g., 22-23), simple comparison
    if (start < end) {
      return currentHour >= start && currentHour < end;
    }

    // If start > end (e.g., 22-8), wraps around midnight
    return currentHour >= start || currentHour < end;
  }

  /**
   * Check if user can receive notification
   */
  static async canNotify(userId, serverId, decision) {
    try {
      const cache = await NotificationCache.findOne({ userId, serverId });

      if (!cache) {
        // Create new cache entry
        const newCache = new NotificationCache({
          userId,
          serverId,
        });
        await newCache.save();
        return { canNotify: true, reason: 'new_user' };
      }

      const prefs = cache.notificationPreference;

      // 1. Check if notifications are enabled
      if (!prefs.enabled) {
        return { canNotify: false, reason: 'notifications_disabled' };
      }

      // 2. Check quiet hours
      if (this.isInQuietHours(prefs)) {
        return { canNotify: false, reason: 'quiet_hours' };
      }

      // 3. Check cooldown period
      const timeSinceLastNotification = cache.lastNotificationTime
        ? Date.now() - new Date(cache.lastNotificationTime).getTime()
        : null;

      const cooldownMs = prefs.cooldownMinutes * 60 * 1000;

      if (timeSinceLastNotification && timeSinceLastNotification < cooldownMs) {
        const minutesRemaining = Math.ceil((cooldownMs - timeSinceLastNotification) / 60000);
        return {
          canNotify: false,
          reason: 'cooldown_active',
          minutesRemaining,
        };
      }

      // 4. Check daily limit
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);

      const notificationsToday = await NotificationCache.countDocuments({
        userId,
        serverId,
        lastNotificationTime: { $gte: todayStart },
      });

      if (notificationsToday >= prefs.maxPerDay) {
        return {
          canNotify: false,
          reason: 'daily_limit_reached',
          limit: prefs.maxPerDay,
        };
      }

      // 5. Check ignore cooldown
      if (cache.lastIgnoredTime) {
        const timeSinceIgnore = Date.now() - new Date(cache.lastIgnoredTime).getTime();
        const ignoreCooldownMs = 6 * 60 * 60 * 1000; // 6 hours

        if (timeSinceIgnore < ignoreCooldownMs && cache.ignoreCount > 2) {
          return {
            canNotify: false,
            reason: 'repeated_ignore',
            ignoreCount: cache.ignoreCount,
          };
        }
      }

      return { canNotify: true, reason: 'policy_approved' };
    } catch (error) {
      console.error('Error checking notification policy:', error);
      return { canNotify: false, reason: 'error', error: error.message };
    }
  }

  /**
   * Record a successful notification
   */
  static async recordNotification(userId, serverId, decision) {
    try {
      const cache = await NotificationCache.findOneAndUpdate(
        { userId, serverId },
        {
          lastNotificationTime: new Date(),
          $inc: { notificationCount: 1 },
          lastIgnoredTime: null,
          ignoreCount: 0,
        },
        { upsert: true, new: true }
      );

      return { success: true, cache };
    } catch (error) {
      console.error('Error recording notification:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Record when user ignores notification
   */
  static async recordIgnore(userId, serverId) {
    try {
      const cache = await NotificationCache.findOneAndUpdate(
        { userId, serverId },
        {
          lastIgnoredTime: new Date(),
          $inc: { ignoreCount: 1 },
        },
        { upsert: true, new: true }
      );

      return { success: true, cache };
    } catch (error) {
      console.error('Error recording ignore:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Update user notification preferences
   */
  static async updatePreferences(userId, serverId, preferences) {
    try {
      const cache = await NotificationCache.findOneAndUpdate(
        { userId, serverId },
        {
          notificationPreference: {
            ...preferences,
          },
        },
        { upsert: true, new: true }
      );

      return { success: true, cache };
    } catch (error) {
      console.error('Error updating preferences:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user notification preferences
   */
  static async getPreferences(userId, serverId) {
    try {
      const cache = await NotificationCache.findOne({ userId, serverId });

      if (!cache) {
        return {
          userId,
          serverId,
          notificationPreference: {
            enabled: true,
            quietHours: { start: 22, end: 8 },
            maxPerDay: 3,
            cooldownMinutes: 720, // 12 hours
          },
        };
      }

      return {
        userId,
        serverId,
        ...cache.toObject(),
      };
    } catch (error) {
      console.error('Error getting preferences:', error);
      return { error: error.message };
    }
  }

  /**
   * Validate decision against policy before sending
   */
  static validateDecisionPolicy(decision, cache) {
    const issues = [];

    // Ensure message is appropriate
    if (!decision.message || decision.message.trim().length === 0) {
      issues.push('Empty message');
    }

    // Check message length
    if (decision.message.length > 200) {
      issues.push('Message exceeds 200 characters');
    }

    // Validate priority
    if (!['low', 'medium', 'high'].includes(decision.priority)) {
      issues.push('Invalid priority');
    }

    // Validate tone
    if (!['friendly', 'hype', 'calm', 'encouraging'].includes(decision.tone)) {
      issues.push('Invalid tone');
    }

    return {
      valid: issues.length === 0,
      issues,
    };
  }
}

module.exports = NotificationPolicy;
