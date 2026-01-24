const mongoose = require('mongoose');

const chatSummarySchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    serverId: {
      type: String,
    },
    summaryType: {
      type: String,
      enum: ['1day', '3days', '7days'],
      required: true,
    },
    period: {
      startDate: {
        type: Date,
        required: true,
      },
      endDate: {
        type: Date,
        required: true,
      },
    },
    summaryContent: {
      keyTopics: [String],
      highlights: [String],
      mainDiscussions: String,
      engagement: {
        messageCount: Number,
        channelsActive: [String],
        participantsCount: Number,
      },
      sentiment: {
        overall: String, // positive, neutral, negative
        trending: [String],
      },
    },
    metadata: {
      messageCount: Number,
      channelCount: Number,
      generatedAt: {
        type: Date,
        default: Date.now,
      },
      processingTime: Number, // in milliseconds
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
  },
  { timestamps: true }
);

chatSummarySchema.index({ userId: 1, createdAt: -1 });
chatSummarySchema.index({ userId: 1, summaryType: 1 });

module.exports = mongoose.model('ChatSummary', chatSummarySchema);
