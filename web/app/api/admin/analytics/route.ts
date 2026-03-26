import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { isAdmin } from "@/lib/auth";

/**
 * GET /api/admin/analytics
 *
 * Returns business analytics for the admin dashboard.
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!isAdmin(session?.user?.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    // Get date ranges
    const now = new Date();
    const thirtyDaysAgo = new Date(now);
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const sevenDaysAgo = new Date(now);
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Get all users with their data
    const users = await prisma.user.findMany({
      include: {
        instances: true,
        manager: true,
      },
    });

    // Plan counts
    const planCounts = {
      free: users.filter((u) => u.plan === "free").length,
      pro: users.filter((u) => ["starter_10k", "growth_30k", "scale_100k", "business_200k"].includes(u.plan)).length,
      enterprise: users.filter((u) => ["managed_starter", "managed_growth", "managed_scale"].includes(u.plan)).length,
    };

    // Calculate MRR
    const planPricing: Record<string, number> = {
      free: 0,
      starter_10k: 29,
      growth_30k: 79,
      scale_100k: 199,
      business_200k: 499,
      managed_starter: 299,
      managed_growth: 799,
      managed_scale: 1499,
    };

    const mrr = users.reduce((sum, user) => {
      return sum + (planPricing[user.plan] || 0);
    }, 0);

    const totalUsers = users.length;

    // New this week
    const newThisWeek = users.filter((u) => u.createdAt >= sevenDaysAgo).length;

    // Instances
    const allInstances = await prisma.aIInstance.findMany({
      include: { user: { select: { email: true } } },
    });

    const activeInstances = allInstances.filter((i) => i.status === "running").length;
    const provisionedVps = allInstances.filter((i) => i.vpsUrl).length;

    // Health breakdown
    const healthBreakdown = {
      healthy: allInstances.filter((i) => i.healthStatus === "healthy").length,
      degraded: allInstances.filter((i) => i.healthStatus === "degraded").length,
      down: allInstances.filter((i) => i.healthStatus === "down").length,
      notDeployed: allInstances.filter((i) => !i.vpsUrl).length,
    };

    // Down instances
    const downInstances = allInstances
      .filter((i) => i.healthStatus === "down")
      .map((i) => ({
        id: i.id,
        name: i.name,
        userEmail: i.user.email,
      }));

    // User growth (last 30 days)
    const userGrowth: { date: string; count: number }[] = [];
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const dateStr = d.toISOString().split("T")[0];
      const count = users.filter((u) => {
        const uDate = u.createdAt.toISOString().split("T")[0];
        return uDate === dateStr;
      }).length;
      userGrowth.push({ date: dateStr, count });
    }

    // Manager efficiency
    const managers = await prisma.manager.findMany({
      include: {
        _count: { select: { users: true } },
      },
    });

    const managerEfficiency = managers.map((m) => ({
      id: m.id,
      name: m.name,
      email: m.email,
      userCount: m._count.users,
    }));

    // Unassigned users
    const unassignedUsers = users.filter((u) => !u.managerId).length;

    // Funnel data
    const funnel = {
      signedUp: totalUsers,
      emailVerified: users.filter((u) => u.emailVerified).length,
      onboardingDone: users.filter((u) => !!u.onboardingData).length,
      triedSandbox: users.filter((u) => 
        u.instances.some((i) => i.sandboxMode && i.sandboxUsed > 0)
      ).length,
      sandboxExhausted: users.filter((u) =>
        u.instances.some((i) => i.sandboxMode && i.sandboxUsed >= 50)
      ).length,
      addedApiKey: 0, // Would need credentials query
      connectedTelegram: users.filter((u) =>
        u.instances.some((i) => i.telegramBotUsername)
      ).length,
    };

    return NextResponse.json({
      planCounts,
      mrr,
      totalUsers,
      newThisWeek,
      activeInstances,
      provisionedVps,
      healthBreakdown,
      downInstances,
      userGrowth,
      managerEfficiency,
      unassignedUsers,
      funnel,
    });
  } catch (error) {
    console.error("[admin/analytics] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}