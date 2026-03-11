import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { callLLM, ChatMessage } from "@/lib/llm";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

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

  const result = await callLLM(id, messages);

  if ("error" in result) {
    const status = result.missingCredential ? 400 : 502;
    return NextResponse.json(result, { status });
  }

  // Log to activity
  prisma.activityLog.create({
    data: {
      instanceId: id,
      event: "chat_message",
      details: `Model: ${result.model}, provider: ${result.provider}, latency: ${result.latencyMs}ms`,
    },
  }).catch(console.error);

  return NextResponse.json(result);
}
