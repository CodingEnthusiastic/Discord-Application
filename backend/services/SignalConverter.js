const ActivityLog = require('../models/ActivityLog');

/**
 * Converts raw Discord events into meaningful behavioral signals
 * These signals are used for LLM decision making
 */

class SignalConverter {
  /**
   * Calculate inactivity level based on last activity
   * @param {Date} lastActivity - Timestamp of last activity
   * @returns {string} 'low' | 'medium' | 'high'
   */
  static getInactivityLevel(lastActivity) {
    const hoursInactive = (Date.now() - new Date(lastActivity).getTime()) / (1000 * 60 * 60);

    if (hoursInactive < 6) return 'low';
    if (hoursInactive < 24) return 'medium';
    return 'high';
  }

  /**
   * Calculate engagement trend
   * @param {Array} activityLogs - Recent activity logs (last 7 days)
   * @returns {string} 'increasing' | 'stable' | 'dropping'
   */
  static getEngagementTrend(activityLogs) {
    if (activityLogs.length === 0) return 'unknown';

    const firstHalf = activityLogs.slice(0, Math.floor(activityLogs.length / 2)).length;
    const secondHalf = activityLogs.slice(Math.floor(activityLogs.length / 2)).length;

    if (secondHalf > firstHalf * 1.2) return 'increasing';
    if (secondHalf < firstHalf * 0.8) return 'dropping';
    return 'stable';
  }

  /**
   * Estimate user mood based on event types and frequency
   * @param {Array} recentLogs - Recent activity logs
   * @returns {string} 'frustrated' | 'neutral' | 'positive'
   */
  static getUserMood(recentLogs) {
    const recentMessages = recentLogs.filter((log) => log.eventType === 'message_sent');
    const reactions = recentLogs.filter((log) => log.eventType === 'reaction_added');
    const voiceActivity = recentLogs.filter((log) => log.eventType === 'voice_joined');

    const totalInteraction = recentMessages.length + reactions.length + voiceActivity.length;

    if (totalInteraction === 0) return 'neutral';

    const engagementScore = voiceActivity.length * 2 + reactions.length + recentMessages.length;
    const negativeFactor = recentLogs.filter((log) => log.eventType === 'inactivity_detected').length;

    if (negativeFactor > totalInteraction * 0.3) return 'frustrated';
    if (engagementScore > totalInteraction * 2) return 'positive';
    return 'neutral';
  }

  /**
   * Detect topic interests based on channel activity
   * @param {Array} activityLogs - Activity logs with channel metadata
   * @returns {Array<string>} Array of detected interests
   */
  static getTopicInterests(activityLogs) {
    const channelActivity = {};

    activityLogs.forEach((log) => {
      if (log.metadata?.channelId) {
        channelActivity[log.metadata.channelId] = (channelActivity[log.metadata.channelId] || 0) + 1;
      }
    });

    // Return top 3 channels (simplified, can be mapped to channel names/categories)
    return Object.entries(channelActivity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([channel]) => channel);
  }

  /**
   * Determine social state
   * @param {Array} activityLogs - Activity logs
   * @returns {string} 'isolated' | 'active' | 'social'
   */
  static getSocialState(activityLogs) {
    const voiceJoins = activityLogs.filter((log) => log.eventType === 'voice_joined').length;
    const groupMessages = activityLogs.filter((log) => log.eventType === 'message_sent').length;

    if (voiceJoins > 0 || groupMessages > 5) return 'social';
    if (groupMessages > 0) return 'active';
    return 'isolated';
  }

  /**
   * Build complete signal object from raw activity
   * @param {Object} userData - User data
   * @param {Array} activityLogs - Activity logs (last 7 days)
   * @returns {Object} Behavioral signals
   */
  static buildSignals(userData, activityLogs) {
    const recentLogs = activityLogs.slice(0, 20); // Last 20 activities

    return {
      userId: userData._id,
      inactivityLevel: this.getInactivityLevel(userData.lastActive || userData.createdAt),
      engagementTrend: this.getEngagementTrend(activityLogs),
      userMood: this.getUserMood(recentLogs),
      topicInterests: this.getTopicInterests(activityLogs),
      socialState: this.getSocialState(recentLogs),
      totalActivitiesLast7Days: activityLogs.length,
      memberSinceWeeks: Math.floor((Date.now() - new Date(userData.createdAt).getTime()) / (1000 * 60 * 60 * 24 * 7)),
      timestamp: new Date(),
    };
  }
}

module.exports = SignalConverter;
