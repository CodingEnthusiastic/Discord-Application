const mongoose = require('mongoose');

const activityLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    serverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Server',
    },
    eventType: {
      type: String,
      enum: [
        'message_sent',
        'user_joined',
        'user_left',
        'reaction_added',
        'voice_joined',
        'voice_left',
        'command_used',
        'role_changed',
        'inactivity_detected',
      ],
      required: true,
    },
    metadata: {
      channelId: mongoose.Schema.Types.ObjectId,
      messageId: String,
      reactionEmoji: String,
      duration: Number, // for voice channel duration
      role: String,
    },
    timestamp: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { timestamps: true }
);

// Index for efficient queries
activityLogSchema.index({ userId: 1, timestamp: -1 });
activityLogSchema.index({ serverId: 1, timestamp: -1 });

module.exports = mongoose.model('ActivityLog', activityLogSchema);
