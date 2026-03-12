import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callLLM, ChatMessage } from "@/lib/llm";
import { dashboardChatLimiter, rateLimitHeaders, getRateLimitKey } from "@/lib/rate-limit";

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
 * Send a message. Persists both the user message and the assistant reply.
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

  // Persist the user message (the last one in the array)
  const userContent = messages[messages.length - 1]?.content ?? "";
  await prisma.chatMessage.create({
    data: { instanceId: id, role: "user", content: userContent, source: "dashboard" },
  });

  const result = await callLLM(id, messages);

  if ("error" in result) {
    // Persist the error as an assistant message so the UI can show it after reload
    await prisma.chatMessage.create({
      data: {
        instanceId: id,
        role: "assistant",
        content: result.error,
        isError: true,
        source: "dashboard",
      },
    });
    const status = result.missingCredential ? 400 : 502;
    return NextResponse.json(result, { status });
  }

  // Persist the assistant reply — now including token counts
  await prisma.chatMessage.create({
    data: {
      instanceId: id,
      role: "assistant",
      content: result.response,
      latencyMs: result.latencyMs,
      provider: result.provider,
      model: result.model,
      inputTokens: result.inputTokens ?? null,
      outputTokens: result.outputTokens ?? null,
      source: "dashboard",
    },
  });

  // Log to activity with token info (fire-and-forget)
  const tokenNote = (result.inputTokens != null && result.outputTokens != null)
    ? `, tokens: ${result.inputTokens}in/${result.outputTokens}out`
    : "";
  prisma.activityLog.create({
    data: {
      instanceId: id,
      event: "chat_message",
      details: `Model: ${result.model}, provider: ${result.provider}, latency: ${result.latencyMs}ms${tokenNote}`,
    },
  }).catch(console.error);

  // Trim old messages — keep at most 200 per instance to avoid unbounded growth
  prisma.chatMessage.findMany({
    where: { instanceId: id },
    orderBy: { createdAt: "desc" },
    skip: 200,
    select: { id: true },
  }).then((old) => {
    if (old.length > 0) {
      prisma.chatMessage.deleteMany({ where: { id: { in: old.map((m) => m.id) } } }).catch(() => {});
    }
  }).catch(() => {});

  return NextResponse.json({
    ...result,
    inputTokens: result.inputTokens ?? undefined,
    outputTokens: result.outputTokens ?? undefined,
  });
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
