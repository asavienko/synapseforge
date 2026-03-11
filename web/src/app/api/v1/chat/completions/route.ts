import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { callLLM, ChatMessage } from "@/lib/llm";
import { validateApiKey, CORS_HEADERS } from "@/lib/api-auth";
import { randomBytes } from "crypto";

// Handle CORS preflight
export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: CORS_HEADERS });
}

/**
 * POST /api/v1/chat/completions
 *
 * OpenAI-compatible chat completions endpoint.
 * Drop-in replacement: point any OpenAI client at this URL.
 *
 * Request (OpenAI format):
 *   Authorization: Bearer sf-live-<key>
 *   {
 *     "model": "gpt-4o",             // optional — uses instance default
 *     "messages": [{ "role": "user", "content": "Hello" }],
 *     "temperature": 0.7,            // optional
 *     "max_tokens": 1024             // optional
 *   }
 *
 * Response (OpenAI format):
 *   {
 *     "id": "chatcmpl-...",
 *     "object": "chat.completion",
 *     "model": "gpt-4o",
 *     "choices": [{ "index": 0, "message": { "role": "assistant", "content": "..." }, "finish_reason": "stop" }],
 *     "usage": { "prompt_tokens": 0, "completion_tokens": 0, "total_tokens": 0 }
 *   }
 */
export async function POST(req: NextRequest) {
  const ctx = await validateApiKey(req);
  if (!ctx) {
    return NextResponse.json(
      {
        error: {
          message: "Invalid or missing API key. Pass Authorization: Bearer sf-live-<key>",
          type: "invalid_request_error",
          code: "invalid_api_key",
        },
      },
      { status: 401, headers: CORS_HEADERS }
    );
  }

  const instance = await prisma.aIInstance.findUnique({
    where: { id: ctx.instanceId },
    select: { status: true },
  });

  if (!instance || instance.status !== "running") {
    return NextResponse.json(
      {
        error: {
          message: `Instance is ${instance?.status ?? "not found"}. Start it before sending requests.`,
          type: "invalid_request_error",
          code: "instance_not_running",
        },
      },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: { message: "Invalid JSON body", type: "invalid_request_error" } },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  const messages = body.messages as ChatMessage[] | undefined;
  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: { message: "'messages' array is required", type: "invalid_request_error" } },
      { status: 400, headers: CORS_HEADERS }
    );
  }

  // Allow caller to override model/temperature/max_tokens for this request
  const configOverride: Record<string, unknown> = {};
  if (typeof body.temperature === "number") configOverride.temperature = body.temperature;
  if (typeof body.max_tokens === "number") configOverride.maxTokens = body.max_tokens;
  // model override: if caller passes a model, use it (only if it's a valid format we know)
  if (typeof body.model === "string" && body.model.trim()) configOverride.model = body.model.trim();

  const result = await callLLM(ctx.instanceId, messages, configOverride as never);

  if ("error" in result) {
    const status = result.missingCredential ? 400 : 502;
    return NextResponse.json(
      { error: { message: result.error, type: "api_error" } },
      { status, headers: CORS_HEADERS }
    );
  }

  // Log (fire-and-forget)
  prisma.activityLog.create({
    data: {
      instanceId: ctx.instanceId,
      event: "chat_message",
      details: `[API/openai-compat] key="${ctx.keyName}", model: ${result.model}, latency: ${result.latencyMs}ms`,
    },
  }).catch(console.error);

  // Return OpenAI-compatible response
  const inputTokens = result.inputTokens ?? 0;
  const outputTokens = result.outputTokens ?? 0;

  return NextResponse.json(
    {
      id: `chatcmpl-${randomBytes(12).toString("hex")}`,
      object: "chat.completion",
      created: Math.floor(Date.now() / 1000),
      model: result.model,
      choices: [
        {
          index: 0,
          message: { role: "assistant", content: result.response },
          finish_reason: "stop",
        },
      ],
      usage: {
        prompt_tokens: inputTokens,
        completion_tokens: outputTokens,
        total_tokens: inputTokens + outputTokens,
      },
    },
    { headers: CORS_HEADERS }
  );
}
