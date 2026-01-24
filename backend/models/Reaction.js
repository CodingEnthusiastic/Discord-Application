const mongoose = require('mongoose');

const reactionSchema = new mongoose.Schema({
    messageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Message', required: true },
    userId: { type: String, required: true }, // clerkId
    username: { type: String, required: true },
    emoji: { type: String, required: true }, // emoji character or unicode
    emojiName: { type: String }, // e.g., "thumbs_up", "heart"
    createdAt: { type: Date, default: Date.now },
    // Composite index to prevent duplicate reactions
    __v: { type: Number, select: false }
});

// Prevent duplicate reactions from same user on same message with same emoji
reactionSchema.index({ messageId: 1, userId: 1, emoji: 1 }, { unique: true });

module.exports = mongoose.model('Reaction', reactionSchema);
