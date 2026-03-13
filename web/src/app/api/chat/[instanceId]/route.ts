import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callLLM, LLMResult, LLMError } from "@/lib/llm";

// LLM calls can take 30-60s — extend Vercel's default 10s limit
export const maxDuration = 60;

// Simple in-memory rate limiter: max 20 req/min per IP+instance
const windowMs = 60_000;
const maxPerWindow = 20;
const ipWindows = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(key: string): { allowed: boolean; resetAt: number } {
  const now = Date.now();
  const entry = ipWindows.get(key);
  if (!entry || now > entry.resetAt) {
    ipWindows.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, resetAt: now + windowMs };
  }
  if (entry.count >= maxPerWindow) {
    return { allowed: false, resetAt: entry.resetAt };
  }
  entry.count++;
  return { allowed: true, resetAt: entry.resetAt };
}

function getClientIp(req: NextRequest): string {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    req.headers.get("x-real-ip") ??
    "unknown"
  );
}

export const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * POST /api/chat/[instanceId]
 *
 * Public chat proxy for the web widget. No auth needed from the client.
 * Rate limited by IP. Only works for running instances.
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ instanceId: string }> }
) {
  const { instanceId } = await params;

  // ── Rate limit ────────────────────────────────────────────────────────────
  const ip = getClientIp(req);
  const rlKey = `widget:${instanceId}:${ip}`;
  const rl = checkRateLimit(rlKey);
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Please wait before sending another message." },
      {
        status: 429,
        headers: {
          ...CORS_HEADERS,
          "Retry-After": String(Math.ceil((rl.resetAt - Date.now()) / 1000)),
        },
      }
    );
  }

  // ── Load instance ─────────────────────────────────────────────────────────
  const instance = await prisma.aIInstance.findUnique({
    where: { id: instanceId },
    select: { id: true, name: true, status: true },
  });

  if (!instance) {
    return NextResponse.json(
      { error: "Instance not found" },
      { status: 404, headers: CORS_HEADERS }
    );
  }

  if (instance.status !== "running") {
    return NextResponse.json(
      { error: "This assistant is currently offline. Please try again later." },
      { status: 503, headers: CORS_HEADERS }
    );
  }

  // ── Parse body ────────────────────────────────────────────────────────────
  let message: string;
  try {
    const body = (await req.json()) as { message?: string };
    message = body.message?.trim() ?? "";
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (!message) {
    return NextResponse.json(
      { error: "message is required" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  if (message.length > 2000) {
    return NextResponse.json(
      { error: "Message too long (max 2000 characters)" },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  // ── Call LLM ──────────────────────────────────────────────────────────────
  let result: LLMResult | LLMError;
  try {
    result = await callLLM(instanceId, [{ role: "user", content: message }]);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "LLM call failed" },
      { status: 502, headers: CORS_HEADERS }
    );
  }

  if ("error" in result) {
    const status = result.missingCredential ? 503 : 502;
    return NextResponse.json({ error: result.error }, { status, headers: CORS_HEADERS });
  }

  // Store chat messages (best-effort, non-blocking)
  prisma.chatMessage
    .createMany({
      data: [
        { instanceId, role: "user", content: message, source: "widget" },
        {
          instanceId,
          role: "assistant",
          content: result.response,
          source: "widget",
          inputTokens: result.inputTokens,
          outputTokens: result.outputTokens,
          model: result.model,
        },
      ],
    })
    .catch(() => {});

  return NextResponse.json(
    {
      response: result.response,
      model: result.model,
      latencyMs: result.latencyMs,
    },
    { headers: CORS_HEADERS }
  );
}
