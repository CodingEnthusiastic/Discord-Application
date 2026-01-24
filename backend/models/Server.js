const mongoose = require('mongoose');

const serverSchema = new mongoose.Schema({
    name: { type: String, required: true },
    icon: { type: String }, // URL to server icon
    owner: { type: String, required: true }, // clerkId of the owner
    members: [{ type: String }], // Array of clerkIds
    roles: [{
        name: { type: String, required: true },
        color: { type: String, default: '#99AAB5' },
        permissions: { type: Number, default: 0 } // Bitfield for permissions
    }],
    categories: [{ type: String }], // Simple category names for now
    inviteCode: { type: String, unique: true },
    channels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Channel' }],
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Server', serverSchema);
