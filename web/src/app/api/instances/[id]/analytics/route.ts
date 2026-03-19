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

    // Get daily breakdown
    const dailyStats = await prisma.$queryRaw<Array<{
      date: string;
      count: bigint;
    }>>`
      SELECT DATE(created_at) as date, COUNT(*) as count
      FROM "ChatMessage"
      WHERE instance_id = ${id}
        AND created_at >= ${since}
      GROUP BY DATE(created_at)
      ORDER BY date ASC
    `;

    // Get source breakdown (telegram, discord, web, etc.)
    const sourceStats = await prisma.$queryRaw<Array<{
      source: string;
      count: bigint;
    }>>`
      SELECT source, COUNT(*) as count
      FROM "ChatMessage"
      WHERE instance_id = ${id}
        AND created_at >= ${since}
        AND source IS NOT NULL
      GROUP BY source
      ORDER BY count DESC
    `;

    // Calculate response times between user and assistant messages
    const avgResponseTime = await prisma.$queryRaw<Array<{
      avg_seconds: number;
    }>>`
      SELECT AVG(EXTRACT(EPOCH FROM (m2.created_at - m1.created_at))) as avg_seconds
      FROM "ChatMessage" m1
      JOIN "ChatMessage" m2 ON m1.instance_id = m2.instance_id
        AND m2.created_at > m1.created_at
        AND m1.role = 'user'
        AND m2.role = 'assistant'
      WHERE m1.instance_id = ${id}
        AND m1.created_at >= ${since}
        AND EXTRACT(EPOCH FROM (m2.created_at - m1.created_at)) < 300
    `;

    return NextResponse.json({
      period: days,
      totalMessages,
      avgMessagesPerDay: Math.round(totalMessages / days),
      avgResponseTime: Math.round((avgResponseTime[0]?.avg_seconds || 0)),
      dailyStats: dailyStats.map((d) => ({
        date: d.date,
        count: Number(d.count),
      })),
      channelStats: sourceStats.map((c) => ({
        source: c.source || "Unknown",
        count: Number(c.count),
      })),
    });
  } catch (error) {
    console.error("[analytics] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}
