/**
 * Conversation Intelligence Service
 * 
 * Provides intent classification and unanswered detection for chat messages
 * using GPT-4o-mini for cost-efficient analysis.
 */

import { prisma } from "@/lib/prisma";

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ClassificationResult {
  intent: string;
  wasAnswered: boolean;
}

// Valid intent categories
const VALID_INTENTS = ["booking", "pricing", "complaint", "faq", "out_of_scope", "other"] as const;
type IntentType = (typeof VALID_INTENTS)[number];

// Phrases that indicate the question was NOT answered
const UNANSWERED_INDICATORS = [
  "i don't know",
  "i'm not sure",
  "i do not know",
  "i am not sure",
  "contact us",
  "can't help",
  "cannot help",
  "unable to help",
  "not able to help",
  "don't have that information",
  "do not have that information",
  "no information",
  "not sure about",
  "i'm afraid i",
  "i am afraid i",
  "unable to answer",
  "not sure i can",
  "outside my scope",
  "beyond my scope",
  "not equipped to",
  "unable to assist",
  "can't assist",
  "cannot assist",
];

/**
 * Classify a conversation based on the last user message and assistant response.
 * Uses GPT-4o-mini for cost-efficient classification.
 * 
 * @param messages - Array of chat messages (should include at least last user + assistant)
 * @returns Classification result with intent and wasAnswered flag
 */
export async function classifyConversation(messages: ChatMessage[]): Promise<ClassificationResult> {
  // Get the last user message and assistant response
  const lastUserMessage = [...messages].reverse().find((m) => m.role === "user");
  const lastAssistantMessage = [...messages].reverse().find((m) => m.role === "assistant");

  if (!lastUserMessage || !lastAssistantMessage) {
    // Not enough context to classify
    return { intent: "other", wasAnswered: true };
  }

  // First, do a quick heuristic check for unanswered indicators
  const assistantLower = lastAssistantMessage.content.toLowerCase();
  const hasUnansweredIndicator = UNANSWERED_INDICATORS.some((phrase) =>
    assistantLower.includes(phrase)
  );

  try {
    // Use GPT-4o-mini for intent classification
    const apiKey = process.env.SYNAPSEFORGE_OPENAI_KEY || process.env.OPENHELIX_OPENAI_KEY || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.warn("[conversation-intelligence] No API key available for classification");
      return { intent: "other", wasAnswered: !hasUnansweredIndicator };
    }

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: `You are a conversation intelligence classifier. Analyze the user message and assistant response.

Classify the user's intent into ONE of these categories:
- booking: User wants to schedule, book, reserve, or make an appointment
- pricing: User asks about cost, price, fees, payment, or billing
- complaint: User is unhappy, frustrated, reporting a problem, or expressing dissatisfaction
- faq: User asks general questions about features, hours, location, policies, how-to
- out_of_scope: User asks something completely unrelated or inappropriate
- other: None of the above categories fit

Respond with ONLY a JSON object in this exact format:
{"intent": "category_name", "wasAnswered": true/false}

For wasAnswered: determine if the assistant actually answered the user's question. 
Return false if the assistant said they don't know, can't help, suggested contacting support, or gave a non-answer.
Return true if the assistant provided a helpful response to the question.`,
          },
          {
            role: "user",
            content: `User message: ${lastUserMessage.content}

Assistant response: ${lastAssistantMessage.content}

Classify the intent and determine if the question was answered.`,
          },
        ],
        temperature: 0.1,
        max_tokens: 100,
      }),
      signal: AbortSignal.timeout(10000),
    });

    if (!response.ok) {
      const error = await response.text();
      console.error("[conversation-intelligence] OpenAI API error:", error);
      // Fall back to heuristic
      return {
        intent: "other",
        wasAnswered: !hasUnansweredIndicator,
      };
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content?.trim() || "";

    // Extract JSON from the response (handle markdown code blocks)
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      const intent = normalizeIntent(parsed.intent);
      
      // Use LLM wasAnswered if provided, otherwise fall back to heuristic
      const wasAnswered = typeof parsed.wasAnswered === "boolean" 
        ? parsed.wasAnswered 
        : !hasUnansweredIndicator;

      return { intent, wasAnswered };
    }

    // Couldn't parse JSON, fall back to heuristic
    return {
      intent: "other",
      wasAnswered: !hasUnansweredIndicator,
    };
  } catch (error) {
    console.error("[conversation-intelligence] Classification error:", error);
    // Fall back to heuristic-based detection
    return {
      intent: "other",
      wasAnswered: !hasUnansweredIndicator,
    };
  }
}

/**
 * Normalize intent string to one of the valid categories
 */
function normalizeIntent(intent: string): IntentType {
  const normalized = intent?.toLowerCase().trim();
  if (VALID_INTENTS.includes(normalized as IntentType)) {
    return normalized as IntentType;
  }
  return "other";
}

/**
 * Fetch conversation context and classify the conversation.
 * Updates the ChatMessage record with intent and wasAnswered fields.
 * 
 * @param instanceId - The AI instance ID
 * @param messageId - The assistant message ID to update (the response)
 */
export async function classifyAndStore(
  instanceId: string,
  messageId: string
): Promise<void> {
  try {
    // Fetch the message and recent context
    const message = await prisma.chatMessage.findFirst({
      where: { id: messageId, instanceId },
    });

    if (!message) {
      console.warn("[conversation-intelligence] Message not found:", messageId);
      return;
    }

    // Fetch recent context (last 10 messages) for better classification
    const contextMessages = await prisma.chatMessage.findMany({
      where: { instanceId },
      orderBy: { createdAt: "desc" },
      take: 10,
    });

    // Reverse to get chronological order
    const messages: ChatMessage[] = contextMessages
      .reverse()
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    // Add the current message if not already in context
    // We check by content since our ChatMessage interface doesn't have id
    const lastContextMessage = contextMessages[0]; // Most recent due to desc order
    if (!lastContextMessage || lastContextMessage.id !== messageId) {
      messages.push({ role: "assistant", content: message.content });
    }

    // Classify the conversation
    const classification = await classifyConversation(messages);

    // Update the message record
    await prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        intent: classification.intent,
        wasAnswered: classification.wasAnswered,
      },
    });

    console.log(
      `[conversation-intelligence] Classified message ${messageId}: intent=${classification.intent}, wasAnswered=${classification.wasAnswered}`
    );
  } catch (error) {
    console.error("[conversation-intelligence] classifyAndStore error:", error);
    // Don't throw - this is a background operation
  }
}
