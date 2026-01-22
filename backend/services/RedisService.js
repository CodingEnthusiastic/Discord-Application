// services/RedisService.js
import redis from 'redis';

const REDIS_HOST = process.env.REDIS_HOST || 'localhost';
const REDIS_PORT = process.env.REDIS_PORT || 6379;

class RedisService {
    constructor() {
        this.client = null;
    }

    async connect() {
        if (this.client) return this.client;

        this.client = redis.createClient({
            host: REDIS_HOST,
            port: REDIS_PORT,
            socket: {
                reconnectStrategy: (retries) => Math.min(retries * 50, 500)
            }
        });

        this.client.on('error', (err) => console.error('Redis Client Error', err));
        this.client.on('connect', () => console.log('Redis connected'));

        await this.client.connect();
        return this.client;
    }

    async disconnect() {
        if (this.client) {
            await this.client.disconnect();
        }
    }

    // Cache message in Redis
    async cacheMessage(channelId, message) {
        try {
            const key = `messages:${channelId}`;
            const cacheKey = `message:${message._id}`;
            
            // Store individual message
            await this.client.setEx(cacheKey, 3600, JSON.stringify(message));
            
            // Add to channel messages list (keep last 100)
            await this.client.lPush(key, JSON.stringify(message));
            await this.client.lTrim(key, 0, 99);
            
            return true;
        } catch (err) {
            console.error('Failed to cache message:', err);
            return false;
        }
    }

    // Get cached messages
    async getMessagesByChannel(channelId, limit = 50) {
        try {
            const key = `messages:${channelId}`;
            const messages = await this.client.lRange(key, 0, limit - 1);
            return messages.map(msg => JSON.parse(msg));
        } catch (err) {
            console.error('Failed to get cached messages:', err);
            return [];
        }
    }

    // Cache active users
    async setActiveUser(userId, channelId, userData) {
        try {
            const key = `active_users:${channelId}:${userId}`;
            await this.client.setEx(key, 300, JSON.stringify(userData)); // 5 mins expiry
            
            // Add to channel active users set
            await this.client.sAdd(`channel:${channelId}:active`, userId);
            return true;
        } catch (err) {
            console.error('Failed to set active user:', err);
            return false;
        }
    }

    // Get active users in channel
    async getActiveUsers(channelId) {
        try {
            const userIds = await this.client.sMembers(`channel:${channelId}:active`);
            const users = [];
            
            for (const userId of userIds) {
                const key = `active_users:${channelId}:${userId}`;
                const userData = await this.client.get(key);
                if (userData) {
                    users.push(JSON.parse(userData));
                }
            }
            return users;
        } catch (err) {
            console.error('Failed to get active users:', err);
            return [];
        }
    }

    // Invalidate channel cache
    async invalidateChannelCache(channelId) {
        try {
            const keys = await this.client.keys(`messages:${channelId}*`);
            if (keys.length > 0) {
                await this.client.del(keys);
            }
            return true;
        } catch (err) {
            console.error('Failed to invalidate cache:', err);
            return false;
        }
    }

    // Increment unread count
    async incrementUnreadCount(userId, channelId) {
        try {
            const key = `unread:${userId}:${channelId}`;
            await this.client.incr(key);
            return true;
        } catch (err) {
            console.error('Failed to increment unread count:', err);
            return false;
        }
    }

    // Get unread count
    async getUnreadCount(userId, channelId) {
        try {
            const key = `unread:${userId}:${channelId}`;
            const count = await this.client.get(key);
            return parseInt(count) || 0;
        } catch (err) {
            console.error('Failed to get unread count:', err);
            return 0;
        }
    }

    // Clear unread count
    async clearUnreadCount(userId, channelId) {
        try {
            const key = `unread:${userId}:${channelId}`;
            await this.client.del(key);
            return true;
        } catch (err) {
            console.error('Failed to clear unread count:', err);
            return false;
        }
    }
}

export default new RedisService();
