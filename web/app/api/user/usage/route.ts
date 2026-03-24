import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/utils";

/**
 * GET /api/user/usage
 * 
 * Returns current usage statistics for the authenticated user:
 * - Messages used this month
 * - Instances count
 * - API calls (approximated from usage events)
 * - Plan limits
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;

  // Get user with plan info
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      _count: {
        select: { instances: true },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Get plan limits
  const planKey = user.plan as keyof typeof PLANS;
  const plan = PLANS[planKey] ?? PLANS.free;

  // Calculate period (current month)
  const now = new Date();
  const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
  const daysRemaining = Math.ceil((periodEnd.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  // Get message count for this period
  const messagesUsed = await prisma.usageEvent.count({
    where: {
      userId,
      type: "chat",
      createdAt: { gte: periodStart },
    },
  });

  // Get API call count (all usage events)
  const apiCallsUsed = await prisma.usageEvent.count({
    where: {
      userId,
      createdAt: { gte: periodStart },
    },
  });

  return NextResponse.json({
    plan: user.plan,
    messagesUsed,
    messagesLimit: plan.messages,
    instancesUsed: user._count.instances,
    instancesLimit: plan.instances,
    apiCallsUsed,
    apiCallsLimit: plan.messages * 2, // Rough estimate: 2 API calls per message
    periodStart: periodStart.toISOString(),
    periodEnd: periodEnd.toISOString(),
    daysRemaining,
  });
}
