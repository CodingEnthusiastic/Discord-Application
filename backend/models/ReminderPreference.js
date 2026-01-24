const mongoose = require('mongoose');

const reminderPreferenceSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    serverId: {
      type: String,
    },
    reminderSettings: {
      enabled: {
        type: Boolean,
        default: true,
      },
      frequency: {
        type: String,
        enum: ['3hours', '6hours', '12hours', 'daily', 'manual'],
        default: '3hours',
      },
      soundEnabled: {
        type: Boolean,
        default: true,
      },
      soundType: {
        type: String,
        enum: ['bell', 'chime', 'notification', 'alert', 'custom'],
        default: 'notification',
      },
      quietHours: {
        enabled: {
          type: Boolean,
          default: true,
        },
        start: {
          type: Number,
          default: 22, // 10 PM
        },
        end: {
          type: Number,
          default: 8, // 8 AM
        },
      },
      reminderMessage: {
        type: String,
        default: 'You have a reminder! Check your updates.',
      },
    },
    summaryReminder: {
      enabled: {
        type: Boolean,
        default: true,
      },
      frequency: {
        type: String,
        enum: ['daily', '3days', '7days', 'manual'],
        default: 'daily',
      },
    },
    lastReminderTime: Date,
    reminderCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

reminderPreferenceSchema.index({ userId: 1, serverId: 1 });

module.exports = mongoose.model('ReminderPreference', reminderPreferenceSchema);
