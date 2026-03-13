import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { streamLLM, resolveCredentials, ChatMessage, parseInstanceConfig } from "@/lib/llm";
import { callOpenClawVps } from "@/lib/openclaw-proxy";
import { dashboardChatLimiter, rateLimitHeaders, getRateLimitKey } from "@/lib/rate-limit";

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
        await prisma.chatMessage.create({
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
        prisma.activityLog
          .create({
            data: {
              instanceId: id,
              event: "chat_message",
              details: `VPS routed, model: ${vpsResult.model}`,
            },
          })
          .catch(console.error);

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
  const credResult = await resolveCredentials(id, instanceConfig);
  if (!credResult.ok) {
    return NextResponse.json(credResult.error, { status: 400 });
  }
  const { resolvedProvider, resolvedModelId, resolvedApiKey } = credResult;

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
        await prisma.chatMessage.create({
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
        prisma.activityLog
          .create({
            data: {
              instanceId: id,
              event: "chat_message",
              details: `Model: ${resolvedModelId}, provider: ${resolvedProvider}, latency: ${latencyMs}ms, tokens: ${inputTokens}in/${outputTokens}out`,
            },
          })
          .catch(console.error);

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
