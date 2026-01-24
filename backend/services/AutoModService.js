const { GoogleGenerativeAI } = require("@google/generative-ai");
const ActivityLog = require("../models/ActivityLog");
const Message = require("../models/Message");
require('dotenv').config();

let genAI;
try {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
} catch (error) {
  console.warn('⚠️ Gemini API not initialized:', error.message);
}

class AutoModService {
  constructor() {
    this.violationThreshold = 0.7; // 70% confidence threshold for blocking
    this.warnThreshold = 0.5; // 50% confidence threshold for warning
    this.cacheSize = 100; // Cache recent moderation decisions
    this.violationCache = new Map();
    this.serverPolicies = new Map(); // Store per-server moderation policies
  }

  /**
   * Analyzes message content using LLM for context-aware moderation
   * @param {string} messageContent - The message to analyze
   * @param {string} authorName - Name of the message author
   * @param {string} channelContext - Channel or conversation name
   * @param {Array} recentMessages - Recent messages for context (optional)
   * @param {string} serverId - Server ID for policy lookup (optional)
   * @returns {Promise<Object>} - Moderation result with confidence and action
   */
  async analyzeMessage(messageContent, authorName, channelContext, recentMessages = [], serverId = null) {
    try {
      if (!genAI) {
        return {
          violates: false,
          confidence: 0,
          severity: "none",
          reason: "Moderation service not available",
          type: "none",
          shouldBlock: false,
          shouldWarn: false,
          shouldFlag: false,
          action: "allow",
          timestamp: new Date()
        };
      }

      // Check cache first
      const cacheKey = this.generateCacheKey(messageContent);
      if (this.violationCache.has(cacheKey)) {
        return this.violationCache.get(cacheKey);
      }

      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      // Build context from recent messages
      const contextMessages = recentMessages
        .slice(-5)
        .map((msg) => `${msg.senderName || msg.authorName}: ${msg.content}`)
        .join("\n");

      // Get server policy if available
      const policy = serverId ? this.serverPolicies.get(serverId) : null;
      const policyGuidance = policy ? `\nServer Policy: ${policy.description}` : '';

      const prompt = `You are a Discord AutoMod AI that uses contextual understanding to detect harmful content. Analyze the following message and determine if it violates Discord's community guidelines.

CRITICAL CONTEXT RULES:
- Understanding CONTEXT is essential. A joke between friends is different from actual harassment
- Sarcasm and exaggeration should not be flagged if clearly not serious
- Banter in casual channels is normal - only flag if genuinely harmful
- Consider if the message would harm someone, not if it's just edgy or crude
- Gaming terms, gaming banter, and competitive trash talk are generally acceptable
- Consider tone, intent, and relationship between users when available${policyGuidance}

Channel/Context: ${channelContext}
Author: ${authorName}
Recent Conversation:
${contextMessages || "No recent context available"}

Message to analyze: "${messageContent}"

Analyze carefully. Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "violates": boolean,
  "confidence": number (0-1),
  "severity": "none" | "low" | "medium" | "high" | "critical",
  "reason": "brief explanation of why or why not",
  "type": "none" | "harassment" | "hate_speech" | "violence" | "spam" | "nsfw" | "misinformation",
  "shouldBlock": boolean,
  "shouldWarn": boolean,
  "shouldFlag": boolean,
  "contextRelevant": "brief note about how context affected the decision"
}`;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();

      // Parse JSON response
      let moderationResult;
      try {
        // Extract JSON from the response (in case there's surrounding text)
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        moderationResult = JSON.parse(jsonMatch ? jsonMatch[0] : responseText);
      } catch (parseError) {
        console.error("Failed to parse moderation response:", parseError);
        moderationResult = {
          violates: false,
          confidence: 0,
          severity: "none",
          reason: "Unable to analyze message",
          type: "none",
          shouldBlock: false,
          shouldWarn: false,
          shouldFlag: false
        };
      }

      // Determine action based on thresholds
      const action = this.determineAction(moderationResult);
      const finalResult = {
        ...moderationResult,
        action,
        timestamp: new Date()
      };

      // Cache the result
      this.violationCache.set(cacheKey, finalResult);
      if (this.violationCache.size > this.cacheSize) {
        const firstKey = this.violationCache.keys().next().value;
        this.violationCache.delete(firstKey);
      }

      return finalResult;
    } catch (error) {
      console.error("Error in AutoMod analysis:", error);
      return {
        violates: false,
        confidence: 0,
        severity: "none",
        reason: "Analysis service error",
        type: "none",
        shouldBlock: false,
        shouldWarn: false,
        shouldFlag: false,
        action: "allow",
        timestamp: new Date()
      };
    }
  }

  /**
   * Determines the action to take based on moderation results
   */
  determineAction(moderationResult) {
    if (moderationResult.shouldBlock && moderationResult.confidence > this.violationThreshold) {
      if (moderationResult.severity === "critical") return "block";
      if (moderationResult.severity === "high") return "block";
    }
    if (moderationResult.shouldWarn && moderationResult.confidence > this.warnThreshold) return "warn";
    if (moderationResult.shouldFlag) return "flag";
    return "allow";
  }

  /**
   * Process moderation action and update message document
   */
  async processModerationAction(action, messageId, messageData, userId) {
    try {
      // Update message with moderation info
      if (messageId) {
        const updateData = {
          'moderation.analyzed': true,
          'moderation.action': action,
          'moderation.analyzedAt': new Date()
        };

        if (action === 'block') updateData['moderation.blocked'] = true;
        if (action === 'warn') updateData['moderation.warned'] = true;
        if (action === 'flag') updateData['moderation.flagged'] = true;

        await Message.findByIdAndUpdate(messageId, updateData);
      }

      // Log the action
      const log = new ActivityLog({
        userId,
        type: "moderation",
        action,
        details: {
          messageContent: messageData.content,
          channelId: messageData.channelId,
          conversationId: messageData.conversationId,
          messageId,
          timestamp: new Date()
        }
      });
      await log.save();

      return {
        logged: true,
        action,
        message: this.getActionMessage(action)
      };
    } catch (error) {
      console.error("Error logging moderation action:", error);
      return {
        logged: false,
        action,
        message: "Moderation action recorded"
      };
    }
  }

  /**
   * Get user-friendly message for action
   */
  getActionMessage(action) {
    const messages = {
      allow: "Message sent successfully",
      warn: "⚠️ Your message may violate community guidelines. Please review it.",
      flag: "🚩 Your message has been flagged for review by moderators",
      block: "❌ Your message violates community guidelines and has been blocked"
    };
    return messages[action] || "Message processed";
  }

  /**
   * Generate cache key
   */
  generateCacheKey(content) {
    return `mod_${content.slice(0, 50).toLowerCase().replace(/\s+/g, '_')}`;
  }

  /**
   * Batch analyze multiple messages
   */
  async analyzeBatch(messages, channelContext, serverId = null) {
    const results = await Promise.all(
      messages.map((msg) =>
        this.analyzeMessage(
          msg.content,
          msg.senderName || msg.authorName,
          channelContext,
          messages,
          serverId
        )
      )
    );
    return results;
  }

  /**
   * Get moderation statistics
   */
  async getModerationStats(serverId, timeWindow = 24) {
    try {
      const since = new Date(Date.now() - timeWindow * 60 * 60 * 1000);
      
      const stats = await Message.aggregate([
        {
          $match: {
            server: new (require('mongoose')).Types.ObjectId(serverId),
            'moderation.analyzedAt': { $gte: since }
          }
        },
        {
          $group: {
            _id: '$moderation.action',
            count: { $sum: 1 }
          }
        }
      ]);

      const blockedCount = stats.find(s => s._id === 'block')?.count || 0;
      const warnedCount = stats.find(s => s._id === 'warn')?.count || 0;
      const flaggedCount = stats.find(s => s._id === 'flag')?.count || 0;
      const totalAnalyzed = stats.reduce((sum, s) => sum + s.count, 0);

      // Get severity breakdown
      const severityStats = await Message.aggregate([
        {
          $match: {
            server: new (require('mongoose')).Types.ObjectId(serverId),
            'moderation.analyzedAt': { $gte: since }
          }
        },
        {
          $group: {
            _id: '$moderation.severity',
            count: { $sum: 1 }
          }
        }
      ]);

      return {
        totalAnalyzed,
        blocked: blockedCount,
        warned: warnedCount,
        flagged: flaggedCount,
        severity: severityStats.reduce((acc, s) => ({ ...acc, [s._id]: s.count }), {}),
        timeWindow: `${timeWindow}h`,
        timestamp: new Date()
      };
    } catch (error) {
      console.error("Error getting moderation stats:", error);
      return {
        totalAnalyzed: 0,
        blocked: 0,
        warned: 0,
        flagged: 0,
        severity: {},
        error: "Unable to fetch stats"
      };
    }
  }

  /**
   * Set server moderation policy
   */
  setServerPolicy(serverId, policy) {
    this.serverPolicies.set(serverId, policy);
  }

  /**
   * Get server moderation policy
   */
  getServerPolicy(serverId) {
    return this.serverPolicies.get(serverId) || null;
  }

  /**
   * Resolve a flagged message (moderator action)
   */
  async resolveMessage(messageId, action, moderatorId, notes = '') {
    try {
      const updateData = {
        'moderation.resolvedAt': new Date(),
        'moderation.resolvedBy': moderatorId,
        'moderation.moderatorNotes': notes
      };

      if (action === 'approve') {
        updateData['moderation.action'] = 'allow';
        updateData['moderation.flagged'] = false;
      } else if (action === 'block') {
        updateData['moderation.action'] = 'block';
        updateData['moderation.blocked'] = true;
      }

      const message = await Message.findByIdAndUpdate(messageId, updateData, { new: true });
      
      // Log moderation action
      const log = new ActivityLog({
        userId: moderatorId,
        type: "moderation",
        action: `resolved_${action}`,
        details: {
          messageId,
          moderatorNotes: notes,
          timestamp: new Date()
        }
      });
      await log.save();

      return message;
    } catch (error) {
      console.error("Error resolving message:", error);
      throw error;
    }
  }

}

module.exports = new AutoModService();
