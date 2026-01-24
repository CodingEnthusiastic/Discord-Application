const { GoogleGenerativeAI } = require('@google/generative-ai');
const ContextBuilder = require('./ContextBuilder');
require('dotenv').config();

/**
 * Gemini LLM Integration - Decision Engine
 * Uses Google Gemini API to make intelligent notification decisions
 */

class GeminiLLMEngine {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY not found in environment variables');
    }
    this.client = new GoogleGenerativeAI(apiKey);
    this.model = this.client.getGenerativeModel({ model: 'gemini-2.0-flash' });
  }

  /**
   * Build the system prompt for LLM decision making
   */
  getSystemPrompt() {
    return `You are an intelligent Discord community assistant that decides when and how to notify users.

Your role is to:
1. Analyze user activity patterns and engagement trends
2. Decide whether a user needs a notification based on their behavior
3. Determine the tone and content of the message
4. Consider the user's timezone and activity patterns

RESPONSE FORMAT (strict JSON):
{
  "shouldNotify": boolean,
  "priority": "low" | "medium" | "high",
  "tone": "friendly" | "hype" | "calm" | "encouraging",
  "message": "max 2 lines, personalized message",
  "reason": "why this decision was made"
}

RULES FOR DECISION MAKING:
- Only notify if user has been inactive for >24 hours AND was previously active
- Don't notify if they're new members (<1 week) unless highly relevant
- Prioritize positive engagement (gaming events, friend activity, achievements)
- Consider peak activity hours - avoid quiet hours (10pm-8am)
- Maximum 1 notification per 12 hours per user
- Don't be repetitive - vary message content

TONE SELECTION:
- "friendly": Default, casual conversation
- "hype": For exciting events or achievements
- "calm": For gentle reminders
- "encouraging": For re-engagement with inactive users`;
  }

  /**
   * Build the user prompt for LLM
   */
  getUserPrompt(contextData, signals) {
    return `
Based on this user's activity and server context, decide if they should receive a notification now.

${ContextBuilder.formatContextForPrompt(contextData)}

BEHAVIORAL SIGNALS:
- Inactivity Level: ${signals.inactivityLevel}
- Engagement Trend: ${signals.engagementTrend}
- User Mood: ${signals.userMood}
- Social State: ${signals.socialState}
- Primary Interests: ${signals.topicInterests.join(', ') || 'Unknown'}

Current Time: ${new Date().toLocaleString()}
Day of Week: ${new Date().toLocaleDateString('en-US', { weekday: 'long' })}

Make a decision: Should we notify this user? If yes, what should we say?
Respond ONLY with valid JSON.`;
  }

  /**
   * Generate notification decision from context
   */
  async generateNotificationDecision(contextData, signals) {
    try {
      const systemPrompt = this.getSystemPrompt();
      const userPrompt = this.getUserPrompt(contextData, signals);

      const response = await this.model.generateContent({
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: systemPrompt + '\n\n' + userPrompt,
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 300,
        },
      });

      const responseText = response.response.text();

      // Parse JSON response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No valid JSON found in response');
      }

      const decision = JSON.parse(jsonMatch[0]);

      return {
        success: true,
        decision,
        rawResponse: responseText,
      };
    } catch (error) {
      console.error('Gemini API Error:', error);
      return {
        success: false,
        error: error.message,
        decision: null,
      };
    }
  }

  /**
   * Validate decision output
   */
  validateDecision(decision) {
    const requiredFields = ['shouldNotify', 'priority', 'tone', 'message', 'reason'];
    const validPriorities = ['low', 'medium', 'high'];
    const validTones = ['friendly', 'hype', 'calm', 'encouraging'];

    for (const field of requiredFields) {
      if (!(field in decision)) {
        return { valid: false, error: `Missing field: ${field}` };
      }
    }

    if (!validPriorities.includes(decision.priority)) {
      return { valid: false, error: `Invalid priority: ${decision.priority}` };
    }

    if (!validTones.includes(decision.tone)) {
      return { valid: false, error: `Invalid tone: ${decision.tone}` };
    }

    if (decision.message.length > 200) {
      return { valid: false, error: 'Message too long (max 200 chars)' };
    }

    return { valid: true };
  }

  /**
   * Full pipeline: Context -> Signals -> Decision
   */
  async makeNotificationDecision(userId, serverId) {
    try {
      // 1. Build context
      const context = await ContextBuilder.buildContextWindow(userId, serverId);
      if (!context) {
        return { success: false, error: 'Could not build context for user' };
      }

      // 2. Get signals (import from SignalConverter)
      const SignalConverter = require('./SignalConverter');
      const user = await require('../models/User').findById(userId).lean();
      const activityLogs = await require('../models/ActivityLog')
        .find({ userId })
        .sort({ timestamp: -1 })
        .limit(100)
        .lean();

      const signals = SignalConverter.buildSignals(user, activityLogs);

      // 3. Generate LLM decision
      const result = await this.generateNotificationDecision(context, signals);

      if (!result.success) {
        return result;
      }

      // 4. Validate decision
      const validation = this.validateDecision(result.decision);
      if (!validation.valid) {
        return { success: false, error: validation.error };
      }

      return {
        success: true,
        decision: result.decision,
        context,
        signals,
      };
    } catch (error) {
      console.error('Error in notification decision pipeline:', error);
      return {
        success: false,
        error: error.message,
      };
    }
  }
}

module.exports = GeminiLLMEngine;
