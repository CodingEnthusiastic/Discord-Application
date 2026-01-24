const mongoose = require('mongoose');

const channelSchema = new mongoose.Schema({
    name: { type: String, required: true },
    type: { type: String, enum: ['text', 'voice'], default: 'text' },
    category: { type: String, default: 'General' },
    server: { type: mongoose.Schema.Types.ObjectId, ref: 'Server', required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Channel', channelSchema);
