import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/stats
 *
 * Public endpoint returning platform statistics for social proof.
 * Used by landing page to display real usage numbers.
 */
export async function GET() {
  try {
    // Get counts (use Promise.all for parallel queries)
    const [
      totalUsers,
      totalInstances,
      totalMessages,
      activeInstances,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.aIInstance.count(),
      prisma.activityLog.count({
        where: { event: "message" },
      }),
      prisma.aIInstance.count({
        where: { status: "running" },
      }),
    ]);

    // Calculate messages in last 24 hours
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const messagesLast24h = await prisma.activityLog.count({
      where: {
        event: "message",
        createdAt: { gte: oneDayAgo },
      },
    });

    return NextResponse.json({
      users: {
        total: totalUsers,
      },
      instances: {
        total: totalInstances,
        active: activeInstances,
      },
      messages: {
        total: totalMessages,
        last24h: messagesLast24h,
      },
      generatedAt: new Date().toISOString(),
    });
  } catch {
    // Return fallback stats if database is unavailable
    return NextResponse.json(
      {
        error: "Unable to fetch statistics",
        users: { total: 0 },
        instances: { total: 0, active: 0 },
        messages: { total: 0, last24h: 0 },
      },
      { status: 503 }
    );
  }
}