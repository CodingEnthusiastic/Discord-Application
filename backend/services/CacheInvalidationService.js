// services/CacheInvalidationService.js
import RedisService from './RedisService.js';

class CacheInvalidationService {
    // Invalidate channel messages cache
    async invalidateChannelMessages(channelId) {
        try {
            await RedisService.invalidateChannelCache(channelId);
            console.log(`Cache invalidated for channel: ${channelId}`);
            return true;
        } catch (err) {
            console.error('Failed to invalidate channel cache:', err);
            return false;
        }
    }

    // Clear user unread counts
    async clearUserUnreadCounts(userId) {
        try {
            // This would need a way to know all channels
            // For now, it's called when user reads a specific channel
            console.log(`Unread counts cleared for user: ${userId}`);
            return true;
        } catch (err) {
            console.error('Failed to clear unread counts:', err);
            return false;
        }
    }

    // Invalidate entire server cache
    async invalidateServerCache(serverId) {
        try {
            // Get all channels in server and invalidate
            const pattern = `messages:channel:${serverId}*`;
            // Implementation would depend on how channels are organized
            console.log(`Server cache invalidated: ${serverId}`);
            return true;
        } catch (err) {
            console.error('Failed to invalidate server cache:', err);
            return false;
        }
    }

    // Update active users in channel
    async updateChannelActiveUsers(channelId, userId, action = 'join') {
        try {
            const key = `channel:${channelId}:active`;
            
            if (action === 'join') {
                await RedisService.client.sAdd(key, userId);
            } else if (action === 'leave') {
                await RedisService.client.sRem(key, userId);
            }
            
            return true;
        } catch (err) {
            console.error('Failed to update active users:', err);
            return false;
        }
    }

    // Get channel statistics
    async getChannelStats(channelId) {
        try {
            const activeUsers = await RedisService.getActiveUsers(channelId);
            const messageCount = await RedisService.client.lLen(`messages:${channelId}`);
            
            return {
                activeUsers: activeUsers.length,
                recentMessages: messageCount,
                lastUpdated: new Date().toISOString()
            };
        } catch (err) {
            console.error('Failed to get channel stats:', err);
            return null;
        }
    }

    // Broadcast cache status (for monitoring)
    async getCacheStatus() {
        try {
            const info = await RedisService.client.info();
            return {
                status: 'connected',
                info: info,
                timestamp: new Date().toISOString()
            };
        } catch (err) {
            console.error('Failed to get cache status:', err);
            return {
                status: 'disconnected',
                error: err.message
            };
        }
    }
}

export default new CacheInvalidationService();
