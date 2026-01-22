// utils/fanoutManager.js
// Manages fanout of messages to connected WebSocket clients

class FanoutManager {
    constructor(io) {
        this.io = io;
        this.activeConnections = new Map(); // userId -> { socketId, channelId, etc }
    }

    // Register user connection
    registerConnection(userId, socketId, channelId, userData) {
        if (!this.activeConnections.has(userId)) {
            this.activeConnections.set(userId, []);
        }
        this.activeConnections.get(userId).push({
            socketId,
            channelId,
            userData,
            connectedAt: new Date()
        });
        console.log(`User ${userId} connected to channel ${channelId}`);
    }

    // Unregister user connection
    unregisterConnection(userId, socketId) {
        if (this.activeConnections.has(userId)) {
            const connections = this.activeConnections.get(userId);
            const filtered = connections.filter(c => c.socketId !== socketId);
            
            if (filtered.length === 0) {
                this.activeConnections.delete(userId);
            } else {
                this.activeConnections.set(userId, filtered);
            }
        }
        console.log(`User ${userId} disconnected (socket: ${socketId})`);
    }

    // Fanout message to channel
    fanoutMessage(channelId, message) {
        if (this.io) {
            this.io.to(channelId).emit('new_message', message);
            console.log(`Message fanned out to channel: ${channelId}`);
        }
    }

    // Fanout to specific user
    fanoutToUser(userId, event, data) {
        if (this.io) {
            this.io.to(`user:${userId}`).emit(event, data);
            console.log(`Event '${event}' fanned out to user: ${userId}`);
        }
    }

    // Fanout to multiple users
    fanoutToUsers(userIds, event, data) {
        userIds.forEach(userId => {
            this.fanoutToUser(userId, event, data);
        });
    }

    // Broadcast to channel
    broadcastToChannel(channelId, event, data) {
        if (this.io) {
            this.io.to(channelId).emit(event, data);
            console.log(`Broadcast '${event}' to channel: ${channelId}`);
        }
    }

    // Get active users in channel
    getActiveUsersInChannel(channelId) {
        const users = [];
        for (const [userId, connections] of this.activeConnections) {
            for (const conn of connections) {
                if (conn.channelId === channelId) {
                    users.push(userId);
                    break;
                }
            }
        }
        return users;
    }

    // Get user connection info
    getUserConnections(userId) {
        return this.activeConnections.get(userId) || [];
    }

    // Get total active connections
    getTotalActiveConnections() {
        let total = 0;
        for (const connections of this.activeConnections.values()) {
            total += connections.length;
        }
        return total;
    }

    // Fanout reaction
    fanoutReaction(channelId, reaction) {
        this.broadcastToChannel(channelId, 'reaction_added', reaction);
    }

    // Fanout typing indicator
    fanoutTyping(channelId, userId, userName) {
        this.broadcastToChannel(channelId, 'user_typing', { userId, userName });
    }

    // Fanout user joined
    fanoutUserJoined(channelId, userData) {
        this.broadcastToChannel(channelId, 'user_joined', userData);
    }

    // Fanout user left
    fanoutUserLeft(channelId, userId, userName) {
        this.broadcastToChannel(channelId, 'user_left', { userId, userName });
    }
}

export default FanoutManager;
