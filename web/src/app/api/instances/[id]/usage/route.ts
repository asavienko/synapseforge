import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
    select: { id: true },
  });
  if (!instance) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Fetch all chat_message events for this instance
  const logs = await prisma.activityLog.findMany({
    where: { instanceId: id, event: "chat_message" },
    select: { createdAt: true, details: true },
    orderBy: { createdAt: "asc" },
  });

  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const fourteenDaysAgo = new Date(startOfToday);
  fourteenDaysAgo.setDate(fourteenDaysAgo.getDate() - 13);

  let totalMessages = logs.length;
  let messagesThisMonth = 0;
  let todayMessages = 0;
  let totalLatency = 0;
  let latencyCount = 0;
  const modelCounts: Record<string, number> = {};
  const dailyCounts: Record<string, number> = {};

  // Pre-fill daily slots for last 14 days
  for (let i = 0; i < 14; i++) {
    const d = new Date(fourteenDaysAgo);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
    dailyCounts[key] = 0;
  }

  for (const log of logs) {
    const ts = new Date(log.createdAt);

    if (ts >= startOfMonth) messagesThisMonth++;
    if (ts >= startOfToday) todayMessages++;

    // Parse details: "Model: gpt-4o, provider: openai, latency: 1234ms"
    if (log.details) {
      const modelMatch = log.details.match(/Model:\s*([^,]+)/i);
      if (modelMatch) {
        const model = modelMatch[1].trim();
        modelCounts[model] = (modelCounts[model] ?? 0) + 1;
      }
      const latencyMatch = log.details.match(/latency:\s*(\d+)ms/i);
      if (latencyMatch) {
        totalLatency += parseInt(latencyMatch[1]);
        latencyCount++;
      }
    }

    // Daily counts (last 14 days only)
    if (ts >= fourteenDaysAgo) {
      const dayKey = ts.toISOString().slice(0, 10);
      dailyCounts[dayKey] = (dailyCounts[dayKey] ?? 0) + 1;
    }
  }

  // Top model
  const topModel = Object.entries(modelCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null;
  const avgLatencyMs = latencyCount > 0 ? Math.round(totalLatency / latencyCount) : null;

  // Build 14-day array sorted by date
  const daily = Object.entries(dailyCounts)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  return NextResponse.json({
    totalMessages,
    messagesThisMonth,
    todayMessages,
    avgLatencyMs,
    topModel,
    modelCounts,
    daily,
  });
}
