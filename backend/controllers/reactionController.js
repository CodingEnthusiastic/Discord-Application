const Reaction = require('../models/Reaction');
const Message = require('../models/Message');

/**
 * Add reaction to a message
 */
const addReaction = async (req, res) => {
    try {
        const { messageId, emoji, emojiName } = req.body;
        const { userId, userName } = req.body;

        if (!messageId || !emoji || !userId || !userName) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        // Verify message exists
        const message = await Message.findById(messageId);
        if (!message) {
            return res.status(404).json({ error: "Message not found" });
        }

        try {
            // Try to create reaction (will fail if duplicate due to unique index)
            const reaction = new Reaction({
                messageId,
                userId,
                username: userName,
                emoji,
                emojiName: emojiName || 'custom'
            });

            await reaction.save();

            // Emit via Socket.io if available
            if (req.io) {
                req.io.emit('reaction_added', {
                    messageId,
                    reaction: reaction.toObject()
                });
            }

            res.status(201).json(reaction);
        } catch (uniqueError) {
            if (uniqueError.code === 11000) {
                // Duplicate reaction - user already reacted with this emoji
                return res.status(400).json({ error: "You already reacted with this emoji" });
            }
            throw uniqueError;
        }
    } catch (error) {
        console.error("Error adding reaction:", error);
        res.status(500).json({ error: "Failed to add reaction" });
    }
};

/**
 * Remove reaction from a message
 */
const removeReaction = async (req, res) => {
    try {
        const { messageId, emoji } = req.body;
        const userId = req.body.userId;

        if (!messageId || !emoji || !userId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const reaction = await Reaction.findOneAndDelete({
            messageId,
            userId,
            emoji
        });

        if (!reaction) {
            return res.status(404).json({ error: "Reaction not found" });
        }

        // Emit via Socket.io
        if (req.io) {
            req.io.emit('reaction_removed', {
                messageId,
                userId,
                emoji
            });
        }

        res.json({ message: "Reaction removed", reaction });
    } catch (error) {
        console.error("Error removing reaction:", error);
        res.status(500).json({ error: "Failed to remove reaction" });
    }
};

/**
 * Get all reactions for a message
 */
const getMessageReactions = async (req, res) => {
    try {
        const { messageId } = req.params;

        if (!messageId) {
            return res.status(400).json({ error: "Message ID required" });
        }

        const reactions = await Reaction.find({ messageId })
            .sort({ createdAt: 1 });

        // Aggregate reactions - group by emoji and count
        const aggregated = {};
        reactions.forEach(reaction => {
            const emoji = reaction.emoji;
            if (!aggregated[emoji]) {
                aggregated[emoji] = {
                    emoji,
                    emojiName: reaction.emojiName,
                    count: 0,
                    users: []
                };
            }
            aggregated[emoji].count += 1;
            aggregated[emoji].users.push({
                userId: reaction.userId,
                username: reaction.username
            });
        });

        res.json({
            messageId,
            reactions: Object.values(aggregated),
            total: reactions.length
        });
    } catch (error) {
        console.error("Error fetching reactions:", error);
        res.status(500).json({ error: "Failed to fetch reactions" });
    }
};

/**
 * Get top reactions across messages (for stats)
 */
const getTopReactions = async (req, res) => {
    try {
        const { serverId, limit = 10 } = req.query;

        const topReactions = await Reaction.aggregate([
            {
                $lookup: {
                    from: 'messages',
                    localField: 'messageId',
                    foreignField: '_id',
                    as: 'message'
                }
            },
            {
                $unwind: '$message'
            },
            ...(serverId ? [{
                $match: {
                    'message.server': new (require('mongoose')).Types.ObjectId(serverId)
                }
            }] : []),
            {
                $group: {
                    _id: '$emoji',
                    emoji: { $first: '$emoji' },
                    emojiName: { $first: '$emojiName' },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: parseInt(limit)
            }
        ]);

        res.json({
            topReactions,
            total: topReactions.length
        });
    } catch (error) {
        console.error("Error fetching top reactions:", error);
        res.status(500).json({ error: "Failed to fetch top reactions" });
    }
};

/**
 * Check if current user has reacted with specific emoji
 */
const userHasReacted = async (req, res) => {
    try {
        const { messageId, emoji } = req.query;
        const userId = req.body?.userId || req.query.userId;

        if (!messageId || !emoji || !userId) {
            return res.status(400).json({ error: "Missing required fields" });
        }

        const reaction = await Reaction.findOne({
            messageId,
            userId,
            emoji
        });

        res.json({
            hasReacted: !!reaction
        });
    } catch (error) {
        console.error("Error checking reaction:", error);
        res.status(500).json({ error: "Failed to check reaction" });
    }
};

module.exports = {
    addReaction,
    removeReaction,
    getMessageReactions,
    getTopReactions,
    userHasReacted
};
