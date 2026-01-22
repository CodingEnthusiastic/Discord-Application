const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/User');
const { getEmbedding } = require('../services/aiService');
const AutoModService = require('../services/AutoModService');
const mongoose = require('mongoose');
import KafkaProducerService from '../services/KafkaProducerService.js';
import RedisService from '../services/RedisService.js';

const sendMessage = async (req, res) => {
    try {
        const { content, channelId, conversationId, senderId, senderName, senderAvatar, serverId } = req.body;

        if (!content || (!channelId && !conversationId) || !senderId || !senderName) {
            return res.status(400).json({ message: "Missing required fields" });
        }

        // Run AutoMod AI analysis
        let moderationResult = null;
        let shouldBlock = false;

        try {
            const channelContext = channelId ? "Server Channel" : "Direct Message";
            moderationResult = await AutoModService.analyzeMessage(
                content,
                senderName,
                channelContext,
                [],
                serverId
            );

            if (moderationResult.action === 'block' && moderationResult.confidence > 0.7) {
                shouldBlock = true;
            }
        } catch (modError) {
            console.error("AutoMod error (non-fatal):", modError);
        }

        // If blocked, return error before creating message
        if (shouldBlock) {
            return res.status(403).json({
                message: AutoModService.getActionMessage('block'),
                blocked: true,
                moderation: moderationResult
            });
        }

        // Generate embedding for the message content
        let vector = [];

        if (channelId) {
            try {
                vector = await getEmbedding(content);
            } catch (embeddingError) {
                console.error("Embedding generation failed:", embeddingError);
            }
        }

        const newMessage = new Message({
            content,
            senderId,
            senderName,
            senderAvatar,
            channel: channelId || undefined,
            server: serverId || undefined, // Save server ID
            conversation: conversationId || undefined,
            embedding: vector,
            moderation: {
                analyzed: true,
                ...(moderationResult || {}),
                analyzedAt: new Date()
            }
        });

        await newMessage.save();

        // Publish message event to Kafka
        try {
            await KafkaProducerService.publishMessage(newMessage.toObject());
        } catch (kafkaErr) {
            console.error('Failed to publish to Kafka:', kafkaErr);
        }

        // Log moderation action if needed
        if (moderationResult && moderationResult.action !== 'allow') {
            await AutoModService.processModerationAction(
                moderationResult.action,
                newMessage._id,
                { content, channelId, conversationId },
                senderId
            );
        }

        // Socket.io emission
        if (req.io) {
            if (channelId || conversationId) {
                req.io.to(channelId || conversationId).emit('new_message', newMessage);
            }
        }

        // Update conversation last message if it's a DM
        if (conversationId) {
            await Conversation.findByIdAndUpdate(conversationId, {
                lastMessage: newMessage._id,
                updatedAt: Date.now()
            });
        }

        res.status(201).json({
            ...newMessage.toObject(),
            moderation: {
                action: newMessage.moderation.action,
                severity: newMessage.moderation.severity,
                reason: newMessage.moderation.reason,
                ...(newMessage.moderation.shouldWarn && { warning: AutoModService.getActionMessage('warn') })
            }
        });
    } catch (err) {
        console.error("Error sending message:", err);
        res.status(500).json({ message: "Error sending message" });
    }
};

const getMessages = async (req, res) => {
    try {
        const { channelId } = req.params;
        if (!channelId) return res.status(400).json({ message: "Channel ID required" });

        // Try to get from Redis cache first
        let messages = await RedisService.getMessagesByChannel(channelId, 50);
        
        if (!messages || messages.length === 0) {
            // If not in cache, fetch from DB
            messages = await Message.find({ channel: channelId }).sort({ createdAt: 1 });
            
            // Cache the messages
            for (const msg of messages) {
                await RedisService.cacheMessage(channelId, msg.toObject());
            }
        }

        res.status(200).json(messages);
    } catch (err) {
        console.error("Error fetching messages:", err);
        res.status(500).json({ message: "Error fetching messages" });
    }
};

const getConversationMessages = async (req, res) => {
    try {
        const { conversationId } = req.params;
        if (!conversationId) return res.status(400).json({ message: "Conversation ID required" });

        const messages = await Message.find({ conversation: conversationId }).sort({ createdAt: 1 });
        res.status(200).json(messages);
    } catch (err) {
        console.error("Error fetching conversation messages:", err);
        res.status(500).json({ message: "Error fetching messages" });
    }
}

const searchMessages = async (req, res) => {
    try {
        const { query, serverId } = req.query;

        if (!query || !serverId) {
            return res.status(400).json({ error: "Query and Server ID are required" });
        }

        const queryVector = await getEmbedding(query);

        // 1. Message Search (Vector)
        const messagePromise = Message.aggregate([
            {
                "$vectorSearch": {
                    "index": "vector_index",
                    "path": "embedding",
                    "queryVector": queryVector,
                    "numCandidates": 100,
                    "limit": 10,
                    "filter": {
                        "server": {
                            "$eq": new mongoose.Types.ObjectId(serverId)
                        }
                    }
                }
            },
            {
                "$lookup": {
                    from: "channels",
                    localField: "channel",
                    foreignField: "_id",
                    as: "channelInfo"
                }
            },
            {
                "$unwind": "$channelInfo"
            },
            {
                "$project": {
                    _id: 1,
                    content: 1,
                    senderName: 1,
                    senderAvatar: 1,
                    createdAt: 1,
                    channelName: "$channelInfo.name",
                    channelId: "$channelInfo._id",
                    score: { $meta: "vectorSearchScore" }
                }
            }
        ]);

        // 2. User Search (Regex) - Global search for now
        const userPromise = User.find({
            $or: [
                { username: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ]
        }).limit(5).select('username avatar _id isOnline email clerkId');

        // Execute both
        const [messages, users] = await Promise.all([messagePromise, userPromise]);

        // Combine and Tag
        const results = [
            ...users.map(u => ({ ...u.toObject(), type: 'user' })),
            ...messages.map(m => ({ ...m, type: 'message' }))
        ];

        res.json(results);

    } catch (error) {
        console.error("Search Error:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

module.exports = { sendMessage, getMessages, getConversationMessages, searchMessages };
