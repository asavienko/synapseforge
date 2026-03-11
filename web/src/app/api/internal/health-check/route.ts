import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { email as emailService } from "@/lib/email";

export async function POST(req: NextRequest) {
  // Validate API key
  const authHeader = req.headers.get("authorization") ?? "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
  const internalKey = process.env.INTERNAL_API_KEY;

  if (!internalKey || token !== internalKey) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { instanceId, status, responseMs, error } = body as {
    instanceId: string;
    status: "healthy" | "degraded" | "down";
    responseMs?: number;
    error?: string;
  };

  if (!instanceId || !status) {
    return NextResponse.json({ error: "instanceId and status are required" }, { status: 400 });
  }

  // Create HealthCheck record
  await prisma.healthCheck.create({
    data: {
      instanceId,
      status,
      responseMs: responseMs ?? null,
      error: error ?? null,
    },
  });

  // Update AIInstance healthStatus, lastCheckedAt, and promote provisionStatus→ready
  const instance = await prisma.aIInstance.findUnique({
    where: { id: instanceId },
    select: { provisionStatus: true, status: true },
  });

  const updates: Record<string, unknown> = {
    healthStatus: status,
    lastCheckedAt: new Date(),
  };

  // First health check after provisioning: promote to ready + set status running
  const justWentLive = instance?.provisionStatus === "provisioning" && status === "healthy";
  if (justWentLive) {
    updates.provisionStatus = "ready";
    updates.status = "running";
  }

  await prisma.aIInstance.update({ where: { id: instanceId }, data: updates });

  // Send "instance is live" email on first successful provisioning
  if (justWentLive) {
    const fullInstance = await prisma.aIInstance.findUnique({
      where: { id: instanceId },
      include: { user: true, credentials: { select: { key: true } } },
    });
    if (fullInstance?.user?.email) {
      const channels: string[] = [];
      const credKeys = fullInstance.credentials.map((c) => c.key);
      if (credKeys.includes("telegram_bot_token")) channels.push("Telegram");
      if (credKeys.includes("discord_bot_token")) channels.push("Discord");
      if (credKeys.includes("slack_app_token") || credKeys.includes("slack_bot_token")) channels.push("Slack");

      emailService
        .instanceReady(
          fullInstance.user.email,
          fullInstance.user.name ?? fullInstance.user.email,
          fullInstance.name,
          channels
        )
        .catch(console.error);
    }
  }

  // Keep only last 100 health checks per instance
  const checks = await prisma.healthCheck.findMany({
    where: { instanceId },
    orderBy: { checkedAt: "desc" },
    skip: 100,
    select: { id: true },
  });

  if (checks.length > 0) {
    await prisma.healthCheck.deleteMany({
      where: { id: { in: checks.map((c) => c.id) } },
    });
  }

  return NextResponse.json({ ok: true });
}
