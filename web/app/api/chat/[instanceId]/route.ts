import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { resolveCredentials, ChatMessage, parseInstanceConfig, streamLLM } from "@/lib/llm";
import { retrieveContext } from "@/lib/rag";
import { isSandboxExhausted } from "@/lib/sandbox";
import { decrypt } from "@/lib/crypto";

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
 * Public chat proxy for the web widget and /chat/[instanceId] page.
 * Accepts either:
 *   { message: string }                    — single-turn (legacy)
 *   { message: string, history: [{role, content}][] } — multi-turn with history
 *
 * Supports streaming via Accept: text/event-stream header or ?stream=true
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
    select: { id: true, name: true, status: true, config: true, sandboxMode: true, sandboxUsed: true, userId: true },
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
  let history: ChatMessage[] = [];

  try {
    const body = (await req.json()) as {
      message?: string;
      history?: { role: string; content: string }[];
    };
    message = body.message?.trim() ?? "";

    // Accept conversation history from the client (max 20 turns to cap tokens)
    if (Array.isArray(body.history)) {
      history = body.history
        .filter((m) => m.role === "user" || m.role === "assistant")
        .slice(-20)
        .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));
    }
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

  // Check if streaming is requested
  const wantsStream = 
    req.headers.get("accept")?.includes("text/event-stream") ||
    req.nextUrl.searchParams.get("stream") === "true";

  // Build the full message array: prior history + current user turn
  const messages: ChatMessage[] = [...history, { role: "user", content: message }];

  // Get instance config
  const instanceConfig = parseInstanceConfig(instance.config);

  // ── Sandbox / credential resolution ───────────────────────────────────────
  const hasOwnCredentials = await prisma.instanceCredential.findFirst({
    where: {
      instanceId,
      key: { in: ["openai_api_key", "anthropic_api_key", "openrouter_api_key"] },
    },
  });

  let sandboxActive = false;
  let sandboxApiKey: string | null = null;

  if (!hasOwnCredentials) {
    if (instance.sandboxMode && !isSandboxExhausted(instance.sandboxUsed)) {
      // Use platform key in sandbox mode
      const platformKey = process.env.SYNAPSEFORGE_OPENAI_KEY || process.env.OPENHELIX_OPENAI_KEY || process.env.OPENAI_API_KEY;
      if (!platformKey) {
        return NextResponse.json(
          { error: "Sandbox unavailable — please add your own API key" },
          { status: 503, headers: CORS_HEADERS }
        );
      }
      sandboxActive = true;
      sandboxApiKey = platformKey;
    } else if (isSandboxExhausted(instance.sandboxUsed)) {
      return NextResponse.json(
        { error: "Your free messages have been used. Please add your API key to continue." },
        { status: 402, headers: CORS_HEADERS }
      );
    } else {
      return NextResponse.json(
        { error: "No API key configured." },
        { status: 400, headers: CORS_HEADERS }
      );
    }
  }

  // ── RAG: inject knowledge base context into system prompt ──────────────────
  const ragResult = await retrieveContext(instanceId, message).catch(() => ({ context: "", sources: [] as string[] }));
  if (ragResult.context) {
    const citationsSection = ragResult.sources.length > 0 
      ? `\n\nSources: ${ragResult.sources.join(', ')}` 
      : '';
    instanceConfig.systemPrompt = `${instanceConfig.systemPrompt}\n\n## Relevant Knowledge\n\nUse the following information to answer the user's question. Cite sources using [1], [2], etc. when using specific information.\n\n${ragResult.context}${citationsSection}`;
  }

  // ── Resolve credentials ───────────────────────────────────────────────────
  let resolvedProvider: "openai" | "anthropic" | "openrouter";
  let resolvedModelId: string;
  let resolvedApiKey: string;

  if (sandboxActive && sandboxApiKey) {
    resolvedProvider = "openai";
    resolvedModelId = "gpt-4o-mini";
    resolvedApiKey = sandboxApiKey;
  } else {
    const credResult = await resolveCredentials(instanceId, instanceConfig);
    if (!credResult.ok) {
      const { error } = credResult as { ok: false; error: { error: string; missingCredential?: boolean; requiredKey?: string } };
      return NextResponse.json(error, { status: 400, headers: CORS_HEADERS });
    }
    resolvedProvider = credResult.resolvedProvider;
    resolvedModelId = credResult.resolvedModelId;
    resolvedApiKey = credResult.resolvedApiKey;
  }

  // ── Handle streaming vs non-streaming ─────────────────────────────────────
  const startTime = Date.now();

  if (wantsStream) {
    // Streaming response using SSE format
    const encoder = new TextEncoder();
    
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const result = streamLLM({
            instanceId,
            messages,
            config: instanceConfig,
            apiKey: resolvedApiKey,
            provider: resolvedProvider,
            modelId: resolvedModelId,
            onFinish: async ({ text, inputTokens, outputTokens }) => {
              const latencyMs = Date.now() - startTime;
              
              // Persist messages
              await prisma.chatMessage.createMany({
                data: [
                  { instanceId, role: "user", content: message, source: "widget" },
                  {
                    instanceId,
                    role: "assistant",
                    content: text,
                    source: "widget",
                    inputTokens,
                    outputTokens,
                    model: resolvedModelId,
                    latencyMs,
                  },
                ],
              });

              // Increment sandbox usage if applicable
              if (sandboxActive) {
                await prisma.aIInstance.update({
                  where: { id: instanceId },
                  data: { sandboxUsed: { increment: 1 } },
                }).catch(() => {});
              }
            },
          });

          // Consume the stream and send SSE events
          const reader = result.toTextStreamResponse().body?.getReader();
          if (!reader) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: "Failed to start stream" })}\n\n`));
            controller.enqueue(encoder.encode("data: [DONE]\n\n"));
            controller.close();
            return;
          }

          const decoder = new TextDecoder();
          let fullText = "";

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value, { stream: true });
              fullText += chunk;
              
              // Send as SSE delta event
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ delta: chunk })}\n\n`)
              );
            }
            
            // Flush any remaining bytes
            const finalChunk = decoder.decode();
            if (finalChunk) {
              fullText += finalChunk;
              controller.enqueue(
                encoder.encode(`data: ${JSON.stringify({ delta: finalChunk })}\n\n`)
              );
            }
          } finally {
            reader.releaseLock();
          }

          // Send DONE event
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        } catch (err) {
          console.error("[chat streaming error]", err);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: err instanceof Error ? err.message : "Stream error" })}\n\n`)
          );
          controller.enqueue(encoder.encode("data: [DONE]\n\n"));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: {
        ...CORS_HEADERS,
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
      },
    });
  } else {
    // Non-streaming: collect full response and return JSON
    try {
      const result = streamLLM({
        instanceId,
        messages,
        config: instanceConfig,
        apiKey: resolvedApiKey,
        provider: resolvedProvider,
        modelId: resolvedModelId,
      });

      // Read the full stream
      const response = result.toTextStreamResponse();
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let fullText = "";

      if (reader) {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          fullText += decoder.decode(value, { stream: true });
        }
        fullText += decoder.decode(); // flush
        reader.releaseLock();
      }

      const latencyMs = Date.now() - startTime;

      // Persist messages
      await prisma.chatMessage.createMany({
        data: [
          { instanceId, role: "user", content: message, source: "widget" },
          {
            instanceId,
            role: "assistant",
            content: fullText,
            source: "widget",
            model: resolvedModelId,
            latencyMs,
          },
        ],
      }).catch(() => {});

      // Increment sandbox usage if applicable
      if (sandboxActive) {
        await prisma.aIInstance.update({
          where: { id: instanceId },
          data: { sandboxUsed: { increment: 1 } },
        }).catch(() => {});
      }

      return NextResponse.json(
        {
          response: fullText,
          model: resolvedModelId,
          latencyMs,
        },
        { headers: CORS_HEADERS }
      );
    } catch (err) {
      console.error("[chat error]", err);
      return NextResponse.json(
        { error: err instanceof Error ? err.message : "LLM call failed" },
        { status: 502, headers: CORS_HEADERS }
      );
    }
  }
}
