import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get("days") || "7", 10);

    // Verify instance ownership
    const instance = await prisma.aIInstance.findFirst({
      where: { id, user: { email: session.user.email } },
      select: { id: true },
    });

    if (!instance) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const since = new Date();
    since.setDate(since.getDate() - days);

    // Get total messages
    const totalMessages = await prisma.chatMessage.count({
      where: {
        instanceId: id,
        createdAt: { gte: since },
      },
    });

    // Get all messages for daily breakdown (avoid raw SQL column name issues)
    const messages = await prisma.chatMessage.findMany({
      where: {
        instanceId: id,
        createdAt: { gte: since },
      },
      select: {
        createdAt: true,
        source: true,
        role: true,
        latencyMs: true,
      },
      orderBy: { createdAt: "asc" },
    });

    // Build daily stats from ORM results
    const dailyMap = new Map<string, number>();
    for (const msg of messages) {
      const date = msg.createdAt.toISOString().split("T")[0];
      dailyMap.set(date, (dailyMap.get(date) || 0) + 1);
    }
    const dailyStats = Array.from(dailyMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Build source/channel stats
    const sourceMap = new Map<string, number>();
    for (const msg of messages) {
      const src = msg.source || "web";
      sourceMap.set(src, (sourceMap.get(src) || 0) + 1);
    }
    const channelStats = Array.from(sourceMap.entries())
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count);

    // Avg response time from latencyMs (assistant messages have this set)
    const assistantMessages = messages.filter(
      (m) => m.role === "assistant" && m.latencyMs != null
    );
    const avgResponseTime =
      assistantMessages.length > 0
        ? Math.round(
            assistantMessages.reduce((sum, m) => sum + (m.latencyMs ?? 0), 0) /
              assistantMessages.length /
              1000
          )
        : 0;

    return NextResponse.json({
      period: days,
      totalMessages,
      avgMessagesPerDay: Math.round(totalMessages / days),
      avgResponseTime,
      dailyStats,
      channelStats,
    });
  } catch (error) {
    console.error("[analytics] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
