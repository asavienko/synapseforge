import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/admin/analytics
 *
 * Admin endpoint returning comprehensive platform analytics.
 * Protected by admin authentication.
 */
export async function GET() {
  const session = await auth();
  
  // Check if user is admin
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  const isAdmin = adminEmails.includes(session?.user?.email ?? "");
  
  if (!isAdmin) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Get date ranges
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Parallel queries for performance
    const [
      totalUsers,
      newUsersToday,
      newUsersThisMonth,
      totalInstances,
      activeInstances,
      instancesByStatus,
      totalMessages,
      messagesToday,
      messagesThisMonth,
      usersByPlan,
    ] = await Promise.all([
      // User stats
      prisma.user.count(),
      prisma.user.count({ where: { createdAt: { gte: today } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      
      // Instance stats
      prisma.aIInstance.count(),
      prisma.aIInstance.count({ where: { status: "running" } }),
      prisma.aIInstance.groupBy({
        by: ["status"],
        _count: { status: true },
      }),
      
      // Message stats
      prisma.activityLog.count({ where: { event: "message" } }),
      prisma.activityLog.count({
        where: { event: "message", createdAt: { gte: today } },
      }),
      prisma.activityLog.count({
        where: { event: "message", createdAt: { gte: thirtyDaysAgo } },
      }),
      
      // Users by plan
      prisma.user.groupBy({
        by: ["plan"],
        _count: { plan: true },
      }),
    ]);

    // Get daily signup data for the last 30 days
    const dailySignups = await prisma.user.groupBy({
      by: ["createdAt"],
      where: { createdAt: { gte: thirtyDaysAgo } },
      _count: { id: true },
    });

    // Build a map of existing signups
    const signupsMap = new Map<string, number>();
    dailySignups.forEach((day) => {
      const dateKey = day.createdAt.toISOString().split("T")[0];
      signupsMap.set(dateKey, (signupsMap.get(dateKey) || 0) + day._count.id);
    });

    // Fill in all 30 days (including zeros for days with no signups)
    const signupsByDay = [];
    for (let i = 0; i < 30; i++) {
      const d = new Date(thirtyDaysAgo);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split("T")[0];
      signupsByDay.push({
        date: dateStr,
        count: signupsMap.get(dateStr) || 0,
      });
    }

    // Get top events from analytics
    const topEvents = await prisma.analyticsEvent.groupBy({
      by: ["event"],
      where: { timestamp: { gte: thirtyDaysAgo } },
      _count: { event: true },
      orderBy: { _count: { event: "desc" } },
      take: 10,
    });

    // Get checkout events for conversion tracking
    const checkoutEvents = await prisma.analyticsEvent.groupBy({
      by: ["event"],
      where: {
        timestamp: { gte: thirtyDaysAgo },
        event: { in: ["checkout_started", "checkout_completed"] },
      },
      _count: { event: true },
    });

    const checkoutStarted = checkoutEvents.find((e) => e.event === "checkout_started")?._count.event || 0;
    const checkoutCompleted = checkoutEvents.find((e) => e.event === "checkout_completed")?._count.event || 0;

    return NextResponse.json({
      users: {
        total: totalUsers,
        newToday: newUsersToday,
        newThisMonth: newUsersThisMonth,
        byPlan: usersByPlan.map((p) => ({
          plan: p.plan || "free",
          count: p._count.plan,
        })),
      },
      instances: {
        total: totalInstances,
        active: activeInstances,
        byStatus: instancesByStatus.reduce((acc, curr) => {
          acc[curr.status] = curr._count.status;
          return acc;
        }, {} as Record<string, number>),
      },
      messages: {
        total: totalMessages,
        today: messagesToday,
        thisMonth: messagesThisMonth,
      },
      trends: {
        signupsByDay,
      },
      events: {
        topEvents: topEvents.map((e) => ({
          event: e.event,
          count: e._count.event,
        })),
      },
      revenue: {
        checkoutStarted,
        checkoutCompleted,
        conversionRate: checkoutStarted > 0 ? Math.round((checkoutCompleted / checkoutStarted) * 100) : 0,
      },
      generatedAt: now.toISOString(),
    });
  } catch (err) {
    console.error("[admin/analytics] Error:", err);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}