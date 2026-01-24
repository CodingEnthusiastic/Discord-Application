const mongoose = require('mongoose');

const notificationCacheSchema = new mongoose.Schema(
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
    lastNotificationTime: {
      type: Date,
      default: null,
    },
    notificationCount: {
      type: Number,
      default: 0,
    },
    lastIgnoredTime: {
      type: Date,
      default: null,
    },
    ignoreCount: {
      type: Number,
      default: 0,
    },
    notificationPreference: {
      enabled: { type: Boolean, default: true },
      quietHours: {
        start: { type: Number, default: 22 }, // 10 PM
        end: { type: Number, default: 8 }, // 8 AM
      },
      maxPerDay: { type: Number, default: 3 },
      cooldownMinutes: { type: Number, default: 720 }, // 12 hours
    },
  },
  { timestamps: true }
);

notificationCacheSchema.index({ userId: 1, serverId: 1 });

module.exports = mongoose.model('NotificationCache', notificationCacheSchema);
