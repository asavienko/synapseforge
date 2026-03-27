import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/ratelimit";

export const maxDuration = 30;

const SYSTEM_PROMPT = `You are a live sales demo for OpenHelix AI — a platform that deploys custom AI agents to Telegram, WhatsApp, and websites in minutes.

Your goal: help this visitor imagine what AI could do for THEIR specific business, then inspire them to sign up.

CONVERSATION FLOW:
1. Start by warmly asking what type of business or use case they're exploring. Keep it casual and friendly.

2. Once they share their business, SWITCH ROLE — respond as if you ARE their business's AI agent. Answer as that business would: handle their customers' typical questions, qualify leads, answer FAQs. Be specific and genuinely useful.
   Examples:
   - Restaurant → answer about menu, hours, reservations, dietary restrictions
   - E-commerce → handle order status, returns, product questions
   - SaaS → answer pricing, features, troubleshooting
   - Real estate → qualify buyers, share property info, schedule viewings

3. After 2–3 exchanges demonstrating the capability, naturally mention they can have this live on Telegram or their website in about 10 minutes — and point them to sign up.

RULES:
- Keep every response under 3 sentences. Brevity wins.
- Be specific to their industry — no generic filler.
- Show don't tell: BE the agent, don't describe what an agent could do.
- If they ask about pricing or setup, direct them to sign up (the platform is free to try).`;

const FALLBACK_REPLIES = [
  "What type of business are you running? I'll show you exactly what your AI agent could do for your customers.",
  "Tell me about your business — I'll act as your custom AI agent so you can see the experience firsthand.",
  "I can show you what an AI agent would look like for your specific business. What industry are you in?",
];

// In-memory session store (serverless = short-lived anyway)
// Key: sessionId, Value: array of messages (last 6 max)
const sessionStore = new Map<string, Array<{ role: "user" | "assistant" | "system"; content: string }>>();

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

/**
 * POST /api/demo/chat
 *
 * Public chat endpoint for the landing page demo.
 * No auth required. Rate limited to 5 messages per IP per 10 minutes.
 * Supports both SSE streaming and JSON response modes.
 *
 * Body (streaming mode): { message: string, sessionId: string, stream?: true }
 * Body (legacy mode):   { messages?: ChatMessage[] }
 */
export async function POST(req: NextRequest) {
  // ── Check OpenAI key configured ─────────────────────────────────────────
  const apiKey = process.env.OPENHELIX_OPENAI_KEY || process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "OpenAI API key not configured." },
      { status: 503 }
    );
  }

  // ── Rate limit ───────────────────────────────────────────────────────────
  const ip = getClientIp(req);
  const allowed = await rateLimit(`demo:${ip}`, 5, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Demo rate limit reached. Sign up for unlimited access." },
      { status: 429 }
    );
  }

  // ── Parse body ───────────────────────────────────────────────────────────
  let body: { 
    message?: string; 
    sessionId?: string; 
    stream?: boolean;
    messages?: ChatMessage[] 
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  // Check if client wants streaming (new format)
  const wantsStream = body.stream === true || (body.message !== undefined && body.sessionId !== undefined);

  if (wantsStream) {
    // ── New streaming mode ─────────────────────────────────────────────────
    const { message, sessionId = crypto.randomUUID() } = body;

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Get or create session context
    let sessionMessages = sessionStore.get(sessionId) || [];
    
    // Add user message to context
    sessionMessages.push({ role: "user", content: message.trim() });
    
    // Keep only last 6 messages (3 exchanges)
    if (sessionMessages.length > 6) {
      sessionMessages = sessionMessages.slice(-6);
    }
    
    sessionStore.set(sessionId, sessionMessages);

    // Build messages for OpenAI
    const messagesForOpenAI: ChatMessage[] = [
      { role: "system", content: SYSTEM_PROMPT },
      ...sessionMessages,
    ];

    try {
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: messagesForOpenAI,
          max_tokens: 500,
          stream: true,
        }),
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`OpenAI API error: ${response.status} - ${error}`);
      }

      if (!response.body) {
        throw new Error("No response body from OpenAI");
      }

      // Transform OpenAI stream to SSE format
      const encoder = new TextEncoder();
      let assistantContent = "";

      const stream = new ReadableStream({
        async start(controller) {
          const reader = response.body!.getReader();
          const decoder = new TextDecoder();

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split("\n");

              for (const line of lines) {
                if (line.startsWith("data: ")) {
                  const data = line.slice(6);
                  if (data === "[DONE]") {
                    controller.enqueue(encoder.encode("data: [DONE]\n\n"));
                    continue;
                  }

                  try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices?.[0]?.delta?.content;
                    if (content) {
                      assistantContent += content;
                      controller.enqueue(
                        encoder.encode(`data: ${JSON.stringify({ delta: content })}\n\n`)
                      );
                    }
                  } catch {
                    // Ignore parse errors
                  }
                }
              }
            }
          } catch (err) {
            console.error("[demo/chat] Stream error:", err);
            controller.enqueue(
              encoder.encode(`data: ${JSON.stringify({ error: "Stream error" })}\n\n`)
            );
          } finally {
            // Store assistant response in session
            if (assistantContent) {
              const currentMessages = sessionStore.get(sessionId) || [];
              currentMessages.push({ role: "assistant", content: assistantContent });
              if (currentMessages.length > 6) {
                sessionStore.set(sessionId, currentMessages.slice(-6));
              } else {
                sessionStore.set(sessionId, currentMessages);
              }
            }
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            reader.releaseLock();
          }
        },
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Session-Id": sessionId,
        },
      });
    } catch (err) {
      console.error("[demo/chat] OpenAI streaming error:", err);
      // Fallback to non-streaming response on error
      const idx = Math.floor(Math.random() * FALLBACK_REPLIES.length);
      return NextResponse.json({ reply: FALLBACK_REPLIES[idx] });
    }
  } else {
    // ── Legacy non-streaming mode (for LandingDemoChat widget) ─────────────
    const messages: ChatMessage[] = Array.isArray(body.messages) ? body.messages : [];

    // Demo limit: max 5 user messages
    const userMessageCount = messages.filter((m) => m.role === "user").length;
    if (userMessageCount > 5) {
      return NextResponse.json({
        reply:
          "🚀 You've reached the demo limit! Sign up free to deploy your own AI agent in under 3 minutes.",
        limitReached: true,
      });
    }

    try {
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            ...messages.slice(-10),
          ],
          max_tokens: 300,
        }),
      });

      if (!openaiRes.ok) {
        throw new Error(`OpenAI API error: ${openaiRes.status}`);
      }

      const data = (await openaiRes.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const reply =
        data.choices?.[0]?.message?.content?.trim() ??
        "Sorry, I couldn't generate a response. Please try again!";

      return NextResponse.json({ reply });
    } catch (err) {
      console.error("[demo/chat] OpenAI call failed:", err);
      const idx = Math.floor(Math.random() * FALLBACK_REPLIES.length);
      return NextResponse.json({ reply: FALLBACK_REPLIES[idx] });
    }
  }
}

/**
 * CORS preflight
 */
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}
