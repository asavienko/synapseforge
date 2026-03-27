import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { streamLLM, resolveCredentials, ChatMessage, parseInstanceConfig } from "@/lib/llm";
import { callOpenClawVps } from "@/lib/openclaw-proxy";
import { retrieveContext } from "@/lib/rag";
import { dashboardChatLimiter, rateLimitHeaders, getRateLimitKey } from "@/lib/rate-limit";
import { deliverWebhook } from "@/lib/webhooks";
import { isSandboxExhausted } from "@/lib/sandbox";
import { captureApiError } from "@/lib/monitoring";
import { classifyAndStore } from "@/lib/conversation-intelligence";

// LLM calls can take 30-60s
export const maxDuration = 60;

const HISTORY_LIMIT = 50;

/**
 * GET /api/instances/:id/chat
 * Returns the last 50 persisted chat messages for this instance.
 */
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const messages = await prisma.chatMessage.findMany({
    where: { instanceId: id },
    orderBy: { createdAt: "asc" },
    take: HISTORY_LIMIT,
  });

  return NextResponse.json(
    messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      isError: m.isError,
      latencyMs: m.latencyMs ?? undefined,
      provider: m.provider ?? undefined,
      model: m.model ?? undefined,
      inputTokens: m.inputTokens ?? undefined,
      outputTokens: m.outputTokens ?? undefined,
      source: m.source ?? undefined,
      createdAt: m.createdAt.toISOString(),
    }))
  );
}

/**
 * POST /api/instances/:id/chat
 * Send a message. Returns a streaming plain-text response via AI SDK streamText.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Rate limit: 30 req/min per user
  const rl = dashboardChatLimiter.check(getRateLimitKey(req, "dash-chat", session.user.id));
  if (!rl.allowed) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Slow down a bit.", retryAfterMs: rl.resetAt - Date.now() },
      { status: 429, headers: rateLimitHeaders(rl) }
    );
  }

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (instance.status !== "running") {
    return NextResponse.json({ error: "Instance is not running" }, { status: 400 });
  }

  const body = await req.json();
  let messages: ChatMessage[] = [];

  if (Array.isArray(body.messages) && body.messages.length > 0) {
    messages = body.messages as ChatMessage[];
  } else if (typeof body.message === "string" && body.message.trim()) {
    messages = [{ role: "user", content: body.message.trim() }];
  } else {
    return NextResponse.json({ error: "messages or message is required" }, { status: 400 });
  }

  // Persist the user message
  const userContent = messages.filter((m) => m.role === "user").pop()?.content ?? "";
  await prisma.chatMessage.create({
    data: { instanceId: id, role: "user", content: userContent, source: "dashboard" },
  });

  const instanceConfig = parseInstanceConfig(instance.config);

  // ── Sandbox / credential resolution ───────────────────────────────────────
  const hasOwnCredentials = await prisma.instanceCredential.findFirst({
    where: {
      instanceId: id,
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
          { error: "Sandbox unavailable — please add your own API key in Credentials" },
          { status: 503 }
        );
      }
      sandboxActive = true;
      sandboxApiKey = platformKey;
    } else if (isSandboxExhausted(instance.sandboxUsed)) {
      return NextResponse.json(
        {
          error: "sandbox_exhausted",
          message:
            "Your 20 free messages have been used. Please add your API key in the Credentials tab to continue.",
        },
        { status: 402 }
      );
    } else {
      return NextResponse.json(
        { error: "No API key configured. Please add credentials in the Credentials tab." },
        { status: 400 }
      );
    }
  }

  // ── RAG: inject knowledge base context into system prompt ──────────────────
  const ragResult = await retrieveContext(id, userContent).catch(() => ({ context: "", sources: [] }));
  if (ragResult.context) {
    const citationsSection = ragResult.sources.length > 0 
      ? `\n\nSources: ${ragResult.sources.join(', ')}` 
      : '';
    instanceConfig.systemPrompt = `${instanceConfig.systemPrompt}\n\n## Relevant Knowledge\n\nUse the following information to answer the user's question. Cite sources using [1], [2], etc. when using specific information.\n\n${ragResult.context}${citationsSection}`;
  }

  // ── VPS routing: if instance has a live VPS, try it first ──────────────────
  const hasVps =
    instance.vpsUrl &&
    instance.provisionStatus === "ready" &&
    instance.gatewayToken;

  if (hasVps) {
    try {
      const vpsResult = await callOpenClawVps(
        { vpsUrl: instance.vpsUrl!, gatewayToken: instance.gatewayToken! },
        messages,
        instanceConfig
      );
      if (!("error" in vpsResult)) {
        // VPS succeeded — persist and stream back as plain text
        const assistantMessage = await prisma.chatMessage.create({
          data: {
            instanceId: id,
            role: "assistant",
            content: vpsResult.response,
            latencyMs: vpsResult.latencyMs,
            provider: vpsResult.provider,
            model: vpsResult.model,
            inputTokens: vpsResult.inputTokens ?? null,
            outputTokens: vpsResult.outputTokens ?? null,
            source: "openclaw",
          },
        });
        
        // Fire-and-forget classification in the background
        classifyAndStore(id, assistantMessage.id).catch((err) => {
          console.error("[chat/classify] Background classification failed:", err);
        });
        
        prisma.activityLog
          .create({
            data: {
              instanceId: id,
              event: "chat_message",
              details: `VPS routed, model: ${vpsResult.model}`,
            },
          })
          .catch(console.error);

        deliverWebhook({
          userId: instance.userId,
          event: "chat.message",
          data: { instanceId: id, role: "assistant", content: vpsResult.response },
        }).catch(console.error);

        const encoder = new TextEncoder();
        const stream = new ReadableStream({
          start(controller) {
            controller.enqueue(encoder.encode(vpsResult.response));
            controller.close();
          },
        });
        return new Response(stream, {
          headers: { "Content-Type": "text/plain; charset=utf-8" },
        });
      }
      // VPS returned an error — fall through to direct LLM
    } catch (e) {
      console.error("[openclaw-proxy] VPS failed, falling back to direct LLM:", e);
    }
  }

  // ── Direct LLM streaming via Vercel AI SDK ─────────────────────────────────
  let resolvedProvider: "openai" | "anthropic" | "openrouter";
  let resolvedModelId: string;
  let resolvedApiKey: string;

  if (sandboxActive && sandboxApiKey) {
    // Sandbox: always use OpenAI gpt-4o-mini for cost efficiency
    resolvedProvider = "openai";
    resolvedModelId = "gpt-4o-mini";
    resolvedApiKey = sandboxApiKey;
  } else {
    const credResult = await resolveCredentials(id, instanceConfig);
    if (!credResult.ok) {
      const { error } = credResult as { ok: false; error: { error: string; missingCredential?: boolean; requiredKey?: string } };
      return NextResponse.json(error, { status: 400 });
    }
    resolvedProvider = credResult.resolvedProvider;
    resolvedModelId = credResult.resolvedModelId;
    resolvedApiKey = credResult.resolvedApiKey;
  }

  const startTime = Date.now();

  try {
    const result = streamLLM({
      instanceId: id,
      messages,
      config: instanceConfig,
      apiKey: resolvedApiKey,
      provider: resolvedProvider,
      modelId: resolvedModelId,
      onFinish: async ({ text, inputTokens, outputTokens }) => {
        const latencyMs = Date.now() - startTime;
        const assistantMessage = await prisma.chatMessage.create({
          data: {
            instanceId: id,
            role: "assistant",
            content: text,
            latencyMs,
            provider: resolvedProvider,
            model: resolvedModelId,
            inputTokens: inputTokens || null,
            outputTokens: outputTokens || null,
            source: "dashboard",
          },
        });
        
        // Fire-and-forget classification in the background
        classifyAndStore(id, assistantMessage.id).catch((err) => {
          console.error("[chat/classify] Background classification failed:", err);
        });

        // Increment sandbox usage counter if we used the platform key
        if (sandboxActive) {
          prisma.aIInstance
            .update({ where: { id }, data: { sandboxUsed: { increment: 1 } } })
            .catch(console.error);
        }
        prisma.activityLog
          .create({
            data: {
              instanceId: id,
              event: "chat_message",
              details: `Model: ${resolvedModelId}, provider: ${resolvedProvider}, latency: ${latencyMs}ms, tokens: ${inputTokens}in/${outputTokens}out`,
            },
          })
          .catch(console.error);

        deliverWebhook({
          userId: instance.userId,
          event: "chat.message",
          data: { instanceId: id, role: "assistant", content: text },
        }).catch(console.error);

        // Trim old messages — keep at most 200 per instance
        prisma.chatMessage
          .findMany({
            where: { instanceId: id },
            orderBy: { createdAt: "desc" },
            skip: 200,
            select: { id: true },
          })
          .then((old) => {
            if (old.length > 0) {
              prisma.chatMessage
                .deleteMany({ where: { id: { in: old.map((m) => m.id) } } })
                .catch(() => {});
            }
          })
          .catch(() => {});
      },
    });

    // Return a plain text stream — client reads chunks directly
    return result.toTextStreamResponse();
  } catch (err: unknown) {
    captureApiError(err, { instanceId: id, route: "chat" });
    const message = err instanceof Error ? err.message : "LLM call failed";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}

/**
 * DELETE /api/instances/:id/chat
 * Clears all persisted chat messages for this instance.
 */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.chatMessage.deleteMany({ where: { instanceId: id } });
  return NextResponse.json({ ok: true });
}
