import { NextRequest, NextResponse } from "next/server";
import { rateLimit } from "@/lib/ratelimit";

export const maxDuration = 30;

const SYSTEM_PROMPT =
  "You are a friendly AI assistant for SynapseForge. Your job is to demo how a custom AI agent works. Be helpful, concise, and occasionally mention that users can deploy their own agent like you in under 3 minutes at SynapseForge.";

const FALLBACK_REPLIES = [
  "Hi! I'm SynapseForge's demo assistant. You can deploy your own AI agent just like me in under 3 minutes at SynapseForge! What would you like to know?",
  "SynapseForge lets you build and deploy custom AI agents with no infrastructure headaches. You can have your own agent live in under 3 minutes — no DevOps required!",
  "Great question! With SynapseForge, you configure your system prompt, choose a model, and your AI agent is live. Ready to try it yourself?",
];

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
 * Public chat endpoint for the landing page demo widget.
 * No auth required. Rate limited to 5 messages per IP per 10 minutes.
 * Max 5 user messages per conversation (server-enforced).
 */
export async function POST(req: NextRequest) {
  // ── Rate limit ───────────────────────────────────────────────────────────
  const ip = getClientIp(req);
  const allowed = rateLimit(`demo:${ip}`, 5, 10 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many messages. Please wait a few minutes and try again." },
      { status: 429 }
    );
  }

  // ── Parse body ───────────────────────────────────────────────────────────
  let body: { messages?: ChatMessage[] };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const messages: ChatMessage[] = Array.isArray(body.messages)
    ? body.messages
    : [];

  // ── Demo limit: max 5 user messages ─────────────────────────────────────
  const userMessageCount = messages.filter((m) => m.role === "user").length;
  if (userMessageCount > 5) {
    return NextResponse.json({
      reply:
        "🚀 You've reached the demo limit! Sign up free to deploy your own AI agent in under 3 minutes.",
      limitReached: true,
    });
  }

  // ── Call OpenAI (or fallback) ────────────────────────────────────────────
  const apiKey = process.env.SYNAPSEFORGE_OPENAI_KEY;
  if (!apiKey) {
    // No key configured — return a friendly hardcoded response
    const idx = Math.floor(Math.random() * FALLBACK_REPLIES.length);
    return NextResponse.json({ reply: FALLBACK_REPLIES[idx] });
  }

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          // Keep last 10 messages for context (conversation history)
          ...messages.slice(-10),
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = (await response.json()) as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const reply =
      data.choices?.[0]?.message?.content?.trim() ??
      "Sorry, I couldn't generate a response. Please try again!";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[demo/chat] OpenAI call failed:", err);
    // Graceful fallback
    const idx = Math.floor(Math.random() * FALLBACK_REPLIES.length);
    return NextResponse.json({ reply: FALLBACK_REPLIES[idx] });
  }
}
