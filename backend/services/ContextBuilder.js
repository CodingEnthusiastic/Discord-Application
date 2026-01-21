const ActivityLog = require('../models/ActivityLog');
const User = require('../models/User');
const Server = require('../models/Server');
const Channel = require('../models/Channel');

/**
 * Context Builder - Creates structured context for LLM
 * Converts behavioral signals into a prompt-ready context
 */

class ContextBuilder {
  /**
   * Build user profile information
   */
  static async buildUserProfile(userId) {
    const user = await User.findById(userId).lean();
    if (!user) return null;

    return {
      username: user.username,
      joinedAt: user.createdAt,
      memberSinceDays: Math.floor((Date.now() - new Date(user.createdAt).getTime()) / (1000 * 60 * 60 * 24)),
      lastActive: user.lastActive,
      avatar: user.avatar,
    };
  }

  /**
   * Build recent behavior context
   */
  static async buildRecentBehavior(userId, days = 7) {
    const sevenDaysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    const recentLogs = await ActivityLog.find({
      userId,
      timestamp: { $gte: sevenDaysAgo },
    })
      .sort({ timestamp: -1 })
      .limit(100)
      .lean();

    const messageCount = recentLogs.filter((log) => log.eventType === 'message_sent').length;
    const voiceTime = recentLogs
      .filter((log) => log.eventType === 'voice_joined')
      .reduce((sum, log) => sum + (log.metadata?.duration || 0), 0);

    const lastActivityLog = recentLogs[0];

    return {
      messagesInLastDays: messageCount,
      voiceTimeHours: Math.round(voiceTime / 3600),
      lastActivityType: lastActivityLog?.eventType || 'none',
      lastActivityTime: lastActivityLog?.timestamp,
      activityPatterns: {
        mostActiveOn: this.getMostActiveDayOfWeek(recentLogs),
        peakHours: this.getPeakHours(recentLogs),
      },
      totalActivities: recentLogs.length,
    };
  }

  /**
   * Determine most active day
   */
  static getMostActiveDayOfWeek(logs) {
    const dayCount = {};
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

    logs.forEach((log) => {
      const day = days[new Date(log.timestamp).getDay()];
      dayCount[day] = (dayCount[day] || 0) + 1;
    });

    const mostActive = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0];
    return mostActive ? mostActive[0] : 'unknown';
  }

  /**
   * Determine peak hours
   */
  static getPeakHours(logs) {
    const hourCount = {};

    logs.forEach((log) => {
      const hour = new Date(log.timestamp).getHours();
      hourCount[hour] = (hourCount[hour] || 0) + 1;
    });

    const sorted = Object.entries(hourCount).sort((a, b) => b[1] - a[1]);
    return sorted.slice(0, 3).map(([hour]) => `${hour}:00`);
  }

  /**
   * Build server context
   */
  static async buildServerContext(serverId) {
    const server = await Server.findById(serverId).populate('channels').lean();
    if (!server) return null;

    const recentActivity = await ActivityLog.countDocuments({
      serverId,
      timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
    });

    return {
      serverName: server.name,
      memberCount: server.members?.length || 0,
      channelCount: server.channels?.length || 0,
      recentActivityLast24h: recentActivity,
      description: server.description || 'No description',
    };
  }

  /**
   * Build complete context window for LLM
   */
  static async buildContextWindow(userId, serverId) {
    const [userProfile, recentBehavior, serverContext] = await Promise.all([
      this.buildUserProfile(userId),
      this.buildRecentBehavior(userId),
      this.buildServerContext(serverId),
    ]);

    if (!userProfile || !recentBehavior) {
      return null;
    }

    return {
      timestamp: new Date(),
      user: userProfile,
      recentBehavior,
      server: serverContext,
      // Summary flags for LLM decision making
      flags: {
        isNewMember: userProfile.memberSinceDays < 30,
        isInactive: recentBehavior.lastActivityTime && Date.now() - new Date(recentBehavior.lastActivityTime).getTime() > 48 * 60 * 60 * 1000,
        isHighlyEngaged: recentBehavior.totalActivities > 20,
        hasBeenQuiet: recentBehavior.messagesInLastDays === 0 && recentBehavior.voiceTimeHours === 0,
      },
    };
  }

  /**
   * Format context for LLM prompt
   */
  static formatContextForPrompt(context) {
    if (!context) return null;

    return `
USER PROFILE:
- Username: ${context.user.username}
- Member Since: ${context.user.memberSinceDays} days ago
- Last Active: ${context.user.lastActive ? new Date(context.user.lastActive).toLocaleString() : 'Never'}

RECENT BEHAVIOR (Last 7 Days):
- Messages Sent: ${context.recentBehavior.messagesInLastDays}
- Voice Time: ${context.recentBehavior.voiceTimeHours} hours
- Total Activities: ${context.recentBehavior.totalActivities}
- Most Active Day: ${context.recentBehavior.activityPatterns.mostActiveOn}
- Peak Hours: ${context.recentBehavior.activityPatterns.peakHours.join(', ')}
- Last Activity: ${context.recentBehavior.lastActivityType} at ${new Date(context.recentBehavior.lastActivityTime).toLocaleString()}

SERVER CONTEXT:
- Server Name: ${context.server.serverName}
- Members: ${context.server.memberCount}
- Channels: ${context.server.channelCount}
- Activity Last 24h: ${context.server.recentActivityLast24h} events

STATUS FLAGS:
- New Member: ${context.flags.isNewMember}
- Inactive (>48h): ${context.flags.isInactive}
- Highly Engaged: ${context.flags.isHighlyEngaged}
- Been Quiet: ${context.flags.hasBeenQuiet}
    `;
  }
}

module.exports = ContextBuilder;
