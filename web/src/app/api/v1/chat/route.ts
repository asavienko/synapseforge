import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callLLM, ChatMessage } from "@/lib/llm";
import { validateApiKey, CORS_HEADERS } from "@/lib/api-auth";
import { publicChatLimiter, rateLimitHeaders, getRateLimitKey } from "@/lib/rate-limit";

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * POST /api/v1/chat
 *
 * SynapseForge public chat API. Authenticated with API key.
 *
 * Request:
 *   Authorization: Bearer sf-live-<key>
 *   { "message": "Hello!" }
 *   or
 *   { "messages": [{ "role": "user", "content": "Hello!" }] }
 *
 * Response:
 *   { "response": "...", "model": "gpt-4o", "provider": "openai", "latencyMs": 312 }
 */
export async function POST(req: NextRequest) {
  const ctx = await validateApiKey(req);
  if (!ctx) {
    return NextResponse.json(
      { error: "Invalid or missing API key. Pass Authorization: Bearer sf-live-<key>" },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  // Rate limit: 60 req/min per API key
  const rlKey = getRateLimitKey(req, "v1-chat", ctx.keyId);
  const rl = publicChatLimiter.check(rlKey);
  const rlHeaders = { ...CORS_HEADERS, ...rateLimitHeaders(rl) };
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Try again later.", retryAfterMs: rl.resetAt - Date.now() },
      { status: 429, headers: rlHeaders }
    );
  }

  const instance = await prisma.aIInstance.findUnique({
    where: { id: ctx.instanceId },
    select: { status: true, name: true },
  });

  if (!instance) {
    return NextResponse.json({ error: "Instance not found" }, { status: 404, headers: CORS_HEADERS });
  }

  if (instance.status !== "running") {
    return NextResponse.json(
      { error: `Instance is ${instance.status}. Start it before sending requests.` },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400, headers: CORS_HEADERS });
  }

  let messages: ChatMessage[] = [];

  if (Array.isArray(body.messages) && body.messages.length > 0) {
    messages = body.messages as ChatMessage[];
  } else if (typeof body.message === "string" && body.message.trim()) {
    messages = [{ role: "user", content: body.message.trim() }];
  } else {
    return NextResponse.json(
      { error: 'Provide either "message" (string) or "messages" (array)' },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const result = await callLLM(ctx.instanceId, messages);

  if ("error" in result) {
    const status = result.missingCredential ? 400 : 502;
    return NextResponse.json(result, { status, headers: CORS_HEADERS });
  }

  // Log
  prisma.activityLog.create({
    data: {
      instanceId: ctx.instanceId,
      event: "chat_message",
      details: `[API] key="${ctx.keyName}", model: ${result.model}, latency: ${result.latencyMs}ms`,
    },
  }).catch(console.error);

  return NextResponse.json(
    {
      response: result.response,
      model: result.model,
      provider: result.provider,
      latencyMs: result.latencyMs,
    },
    { headers: rlHeaders }
  );
}
