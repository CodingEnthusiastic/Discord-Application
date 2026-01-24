const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    participants: [{ type: String, required: true }], // Array of clerkIds
    lastMessage: { type: mongoose.Schema.Types.ObjectId, ref: 'Message' },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Conversation', conversationSchema);
