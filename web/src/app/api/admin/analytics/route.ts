import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(email: string) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  return adminEmails.includes(email);
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isAdmin(session.user.email)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [users, instances, managers] = await Promise.all([
    prisma.user.findMany({
      select: {
        id: true,
        email: true,
        plan: true,
        createdAt: true,
        managerId: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.aIInstance.findMany({
      select: {
        id: true,
        name: true,
        status: true,
        healthStatus: true,
        vpsUrl: true,
        provisionStatus: true,
        user: { select: { email: true } },
      },
    }),
    prisma.manager.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        users: { select: { id: true } },
      },
    }),
  ]);

  // Plan counts
  const planCounts = { free: 0, pro: 0, enterprise: 0 };
  for (const u of users) {
    if (u.plan === "pro") planCounts.pro++;
    else if (u.plan === "enterprise") planCounts.enterprise++;
    else planCounts.free++;
  }
  const mrr = planCounts.pro * 499 + planCounts.enterprise * 2499;

  // Users this week
  const newThisWeek = users.filter((u) => new Date(u.createdAt) >= sevenDaysAgo).length;

  // Instance stats
  const activeInstances = instances.filter((i) => i.status === "running").length;
  const provisionedVps = instances.filter((i) => !!i.vpsUrl).length;

  // Health breakdown
  const healthBreakdown = {
    healthy: instances.filter((i) => i.healthStatus === "healthy").length,
    degraded: instances.filter((i) => i.healthStatus === "degraded").length,
    down: instances.filter((i) => i.healthStatus === "down").length,
    notDeployed: instances.filter((i) => !i.vpsUrl).length,
  };

  const downInstances = instances
    .filter((i) => i.healthStatus === "down")
    .map((i) => ({ id: i.id, name: i.name, userEmail: i.user.email }));

  // User growth: group signups by day for last 30 days
  const signupsByDay: Record<string, number> = {};
  for (let d = 0; d < 30; d++) {
    const date = new Date(now.getTime() - d * 24 * 60 * 60 * 1000);
    const key = date.toISOString().slice(0, 10);
    signupsByDay[key] = 0;
  }
  for (const u of users) {
    const key = new Date(u.createdAt).toISOString().slice(0, 10);
    if (key in signupsByDay) signupsByDay[key]++;
  }
  // Sort ascending
  const userGrowth = Object.entries(signupsByDay)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, count]) => ({ date, count }));

  // Manager efficiency
  const managerEfficiency = managers.map((m) => ({
    id: m.id,
    name: m.name,
    email: m.email,
    userCount: m.users.length,
  }));

  const unassignedUsers = users.filter((u) => !u.managerId).length;

  return NextResponse.json({
    planCounts,
    mrr,
    totalUsers: users.length,
    newThisWeek,
    activeInstances,
    provisionedVps,
    healthBreakdown,
    downInstances,
    userGrowth,
    managerEfficiency,
    unassignedUsers,
  });
}
