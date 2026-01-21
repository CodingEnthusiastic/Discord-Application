const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    content: { type: String, required: true },
    senderId: { type: String, required: true }, // clerkId
    senderName: { type: String, required: true }, // Cache username for display
    senderAvatar: { type: String }, // Cache avatar for display
    channel: { type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }, // Optional if conversation
    server: { type: mongoose.Schema.Types.ObjectId, ref: 'Server' },   // Server ID for search scope
    conversation: { type: mongoose.Schema.Types.ObjectId, ref: 'Conversation' }, // Optional if channel
    createdAt: { type: Date, default: Date.now },
    embedding: {
        type: [Number], // An array of numbers (floats)
        index: true     // Essential for performance
    },
    // AutoMod AI fields
    moderation: {
        analyzed: { type: Boolean, default: false },
        violates: { type: Boolean, default: false },
        confidence: { type: Number, default: 0, min: 0, max: 1 },
        severity: { 
            type: String, 
            enum: ['none', 'low', 'medium', 'high', 'critical'], 
            default: 'none' 
        },
        reason: { type: String },
        type: { 
            type: String, 
            enum: ['none', 'harassment', 'hate_speech', 'violence', 'spam', 'nsfw', 'misinformation'], 
            default: 'none' 
        },
        action: { 
            type: String, 
            enum: ['allow', 'warn', 'flag', 'block'], 
            default: 'allow' 
        },
        blocked: { type: Boolean, default: false },
        warned: { type: Boolean, default: false },
        flagged: { type: Boolean, default: false },
        moderatorNotes: { type: String },
        resolvedAt: { type: Date },
        resolvedBy: { type: String }, // moderator user ID
        analyzedAt: { type: Date }
    }
});

module.exports = mongoose.model('Message', messageSchema);
