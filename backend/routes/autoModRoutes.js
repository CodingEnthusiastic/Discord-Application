const express = require('express');
const router = express.Router();
const AutoModService = require('../services/AutoModService');
const Message = require('../models/Message');

/**
 * GET /api/automod/stats - Get moderation statistics
 */
router.get('/stats', async (req, res) => {
    try {
        const { serverId, timeWindow = 24 } = req.query;
        
        if (!serverId) {
            return res.status(400).json({ error: "Server ID is required" });
        }

        const stats = await AutoModService.getModerationStats(serverId, parseInt(timeWindow));
        res.json(stats);
    } catch (error) {
        console.error("Error fetching moderation stats:", error);
        res.status(500).json({ error: "Failed to fetch moderation statistics" });
    }
});

/**
 * POST /api/automod/analyze - Analyze a message
 */
router.post('/analyze', async (req, res) => {
    try {
        const { content, authorName, channelContext } = req.body;

        if (!content || !authorName) {
            return res.status(400).json({ error: "Content and authorName are required" });
        }

        const result = await AutoModService.analyzeMessage(
            content,
            authorName,
            channelContext || "General"
        );

        res.json(result);
    } catch (error) {
        console.error("Error analyzing message:", error);
        res.status(500).json({ error: "Failed to analyze message" });
    }
});

/**
 * GET /api/automod/flagged-messages - Get flagged messages
 */
router.get('/flagged-messages', async (req, res) => {
    try {
        const { serverId, limit = 20, page = 1 } = req.query;

        if (!serverId) {
            return res.status(400).json({ error: "Server ID is required" });
        }

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const flaggedMessages = await Message.find({
            server: serverId,
            'moderation.flagged': true
        })
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip(skip)
            .select('content senderName senderId createdAt moderation');

        const total = await Message.countDocuments({
            server: serverId,
            'moderation.flagged': true
        });

        res.json({
            messages: flaggedMessages,
            total,
            page: parseInt(page),
            pages: Math.ceil(total / parseInt(limit))
        });
    } catch (error) {
        console.error("Error fetching flagged messages:", error);
        res.status(500).json({ error: "Failed to fetch flagged messages" });
    }
});

/**
 * GET /api/automod/message/:messageId - Get message details with moderation info
 */
router.get('/message/:messageId', async (req, res) => {
    try {
        const { messageId } = req.params;

        const message = await Message.findById(messageId)
            .populate('channel', 'name')
            .populate('server', 'name');

        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        res.json(message);
    } catch (error) {
        console.error("Error fetching message details:", error);
        res.status(500).json({ error: "Failed to fetch message" });
    }
});

/**
 * POST /api/automod/batch-analyze - Analyze multiple messages
 */
router.post('/batch-analyze', async (req, res) => {
    try {
        const { messages, channelContext } = req.body;

        if (!Array.isArray(messages) || messages.length === 0) {
            return res.status(400).json({ error: "Messages array is required" });
        }

        const results = await AutoModService.analyzeBatch(
            messages,
            channelContext || "General"
        );

        res.json({ results, count: results.length });
    } catch (error) {
        console.error("Error batch analyzing messages:", error);
        res.status(500).json({ error: "Failed to analyze messages" });
    }
});

/**
 * GET /api/automod/warned-users - Get users who received warnings
 */
router.get('/warned-users', async (req, res) => {
    try {
        const { serverId, limit = 10 } = req.query;

        if (!serverId) {
            return res.status(400).json({ error: "Server ID is required" });
        }

        const warnedUsers = await Message.aggregate([
            {
                $match: {
                    server: new (require('mongoose')).Types.ObjectId(serverId),
                    'moderation.warned': true
                }
            },
            {
                $group: {
                    _id: '$senderId',
                    senderName: { $first: '$senderName' },
                    warningCount: { $sum: 1 },
                    lastWarning: { $max: '$createdAt' }
                }
            },
            {
                $sort: { warningCount: -1 }
            },
            {
                $limit: parseInt(limit)
            }
        ]);

        res.json(warnedUsers);
    } catch (error) {
        console.error("Error fetching warned users:", error);
        res.status(500).json({ error: "Failed to fetch warned users" });
    }
});

/**
 * POST /api/automod/resolve-message/:messageId - Resolve a flagged message
 */
router.post('/resolve-message/:messageId', async (req, res) => {
    try {
        const { messageId } = req.params;
        const { action, notes, moderatorId } = req.body;

        if (!messageId || !action) {
            return res.status(400).json({ error: "Message ID and action are required" });
        }

        const message = await AutoModService.resolveMessage(
            messageId,
            action,
            moderatorId || 'system',
            notes || ''
        );

        res.json({
            message: 'Message resolved successfully',
            data: message
        });
    } catch (error) {
        console.error("Error resolving message:", error);
        res.status(500).json({ error: "Failed to resolve message" });
    }
});

/**
 * GET /api/automod/blocked-users - Get users with blocked messages
 */
router.get('/blocked-users', async (req, res) => {
    try {
        const { serverId, limit = 10 } = req.query;

        if (!serverId) {
            return res.status(400).json({ error: "Server ID is required" });
        }

        const blockedUsers = await Message.aggregate([
            {
                $match: {
                    server: new (require('mongoose')).Types.ObjectId(serverId),
                    'moderation.blocked': true
                }
            },
            {
                $group: {
                    _id: '$senderId',
                    senderName: { $first: '$senderName' },
                    blockedCount: { $sum: 1 },
                    lastBlocked: { $max: '$createdAt' },
                    violations: { $push: '$moderation.type' }
                }
            },
            {
                $sort: { blockedCount: -1 }
            },
            {
                $limit: parseInt(limit)
            }
        ]);

        res.json(blockedUsers);
    } catch (error) {
        console.error("Error fetching blocked users:", error);
        res.status(500).json({ error: "Failed to fetch blocked users" });
    }
});

/**
 * POST /api/automod/set-server-policy - Set server moderation policy
 */
router.post('/set-server-policy', async (req, res) => {
    try {
        const { serverId, policy } = req.body;

        if (!serverId || !policy) {
            return res.status(400).json({ error: "Server ID and policy are required" });
        }

        AutoModService.setServerPolicy(serverId, {
            ...policy,
            updatedAt: new Date()
        });

        res.json({
            message: 'Server policy updated successfully',
            policy: AutoModService.getServerPolicy(serverId)
        });
    } catch (error) {
        console.error("Error setting server policy:", error);
        res.status(500).json({ error: "Failed to set server policy" });
    }
});

module.exports = router;
