const { GoogleGenerativeAI } = require('@google/generative-ai');
const Message = require('../models/Message');
const ChatSummary = require('../models/ChatSummary');
require('dotenv').config();

/**
 * Chat Summarizer Service
 * Generates summaries of conversations for specified time periods using Gemini AI
 */

class ChatSummarizer {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  /**
   * Get summarization prompt for Gemini
   */
  getSummarizationPrompt(days, messageCount, conversations) {
    return `Analyze the following Discord chat conversations from the last ${days} day(s) and provide a comprehensive summary.

TASK: Create a professional, engaging summary that includes:
1. Key topics discussed
2. Main highlights and important announcements
3. Overall sentiment and mood
4. Most active participants
5. Key decisions or action items

FORMAT (return as JSON):
{
  "keyTopics": ["topic1", "topic2", "topic3"],
  "highlights": ["highlight1", "highlight2", "highlight3"],
  "mainDiscussions": "2-3 paragraph summary of main discussions",
  "engagementLevel": "high|medium|low",
  "sentiment": "positive|neutral|negative",
  "actionItems": ["item1", "item2"],
  "mostActiveChannels": ["channel1", "channel2"],
  "interestingMoments": ["interesting discussion", "announcement", "milestone"]
}

CONVERSATIONS TO ANALYZE:
${conversations}

MESSAGE COUNT: ${messageCount}

Provide ONLY valid JSON response, no additional text.`;
  }

  /**
   * Get messages for a time period
   */
  async getMessagesByPeriod(channelId, days) {
    try {
      const daysAgo = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const messages = await Message.find({
        channel: channelId,
        createdAt: { $gte: daysAgo },
      })
        .select('content senderName createdAt channel')
        .populate('channel', 'name')
        .sort({ createdAt: -1 })
        .lean();

      return messages;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  }

  /**
   * Format messages for LLM analysis
   */
  formatMessagesForAnalysis(messages, maxMessages = 100) {
    // Get recent and relevant messages
    const selected = messages.slice(0, maxMessages);

    return selected
      .map((msg) => {
        const time = new Date(msg.createdAt).toLocaleString();
        return `[${time}] ${msg.senderName}: ${msg.content}`;
      })
      .join('\n');
  }

  /**
   * Get channel breakdown
   */
  getChannelBreakdown(messages) {
    const channelMap = {};

    messages.forEach((msg) => {
      const channelName = msg.channel?.name || 'unknown';
      channelMap[channelName] = (channelMap[channelName] || 0) + 1;
    });

    return Object.entries(channelMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([channel, count]) => ({ channel, count }));
  }

  /**
   * Generate summary using Gemini
   */
  async generateSummary(userId, serverId, channelId, days) {
    const startTime = Date.now();

    try {
      // 1. Fetch messages
      const messages = await this.getMessagesByPeriod(channelId, days);

      if (messages.length === 0) {
        return {
          success: false,
          error: 'No messages found for this period',
        };
      }

      // 2. Format for LLM
      const formattedMessages = this.formatMessagesForAnalysis(messages);
      const channelBreakdown = this.getChannelBreakdown(messages);

      // 3. Get LLM summary
      const prompt = this.getSummarizationPrompt(days, messages.length, formattedMessages);

      const response = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1000,
        },
      });

      const responseText = response.response.text();

      // 4. Parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in LLM response');
      }

      const summary = JSON.parse(jsonMatch[0]);

      // 5. Create summary document
      const summaryType = days === 1 ? '1day' : days === 3 ? '3days' : '7days';
      const endDate = new Date();
      const startDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

      const chatSummary = new ChatSummary({
        userId,
        serverId,
        summaryType,
        period: { startDate, endDate },
        summaryContent: {
          keyTopics: summary.keyTopics || [],
          highlights: summary.highlights || [],
          mainDiscussions: summary.mainDiscussions || '',
          engagement: {
            messageCount: messages.length,
            channelsActive: channelBreakdown.map((c) => c.channel),
            participantsCount: new Set(messages.map((m) => m.senderName)).size,
          },
          sentiment: {
            overall: summary.sentiment || 'neutral',
            trending: summary.interestingMoments || [],
          },
        },
        metadata: {
          messageCount: messages.length,
          channelCount: channelBreakdown.length,
          processingTime: Date.now() - startTime,
        },
      });

      await chatSummary.save();

      return {
        success: true,
        summary: chatSummary,
        stats: {
          messageCount: messages.length,
          channelCount: channelBreakdown.length,
          processingTime: Date.now() - startTime,
        },
      };
    } catch (error) {
      console.error('Error generating summary:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }

  /**
   * Get recent summary (check if exists within last 6 hours)
   */
  async getRecentSummary(userId, serverId, summaryType) {
    try {
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);

      const summary = await ChatSummary.findOne({
        userId,
        serverId,
        summaryType,
        createdAt: { $gte: sixHoursAgo },
      }).lean();

      return summary;
    } catch (error) {
      console.error('Error getting recent summary:', error);
      return null;
    }
  }

  /**
   * Get all summaries for a user
   */
  async getUserSummaries(userId, serverId, limit = 10) {
    try {
      const summaries = await ChatSummary.find({
        userId,
        serverId,
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      return summaries;
    } catch (error) {
      console.error('Error getting user summaries:', error);
      return [];
    }
  }

  /**
   * Mark summary as read
   */
  async markSummaryAsRead(summaryId) {
    try {
      const updated = await ChatSummary.findByIdAndUpdate(
        summaryId,
        {
          isRead: true,
          readAt: new Date(),
        },
        { new: true }
      );

      return updated;
    } catch (error) {
      console.error('Error marking summary as read:', error);
      return null;
    }
  }

  /**
   * Delete old summaries (older than 30 days)
   */
  async cleanupOldSummaries(olderThanDays = 30) {
    try {
      const cutoffDate = new Date(Date.now() - olderThanDays * 24 * 60 * 60 * 1000);

      const result = await ChatSummary.deleteMany({
        createdAt: { $lt: cutoffDate },
      });

      console.log(`🧹 Cleaned up ${result.deletedCount} old summaries`);
      return result.deletedCount;
    } catch (error) {
      console.error('Error cleaning up summaries:', error);
      return 0;
    }
  }
}

module.exports = ChatSummarizer;
