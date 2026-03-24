import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS, mapLegacyPlan } from "@/lib/utils";

/**
 * GET /api/user/usage-status
 *
 * Returns current usage vs limits for the authenticated user.
 * Used by the UsageWarningBanner to show proactive warnings.
 */
export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: {
      plan: true,
      instances: {
        select: {
          id: true,
          sandboxMode: true,
          sandboxUsed: true,
          status: true,
        },
      },
    },
  });

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  const mappedPlan = mapLegacyPlan(user.plan);
  const plan = PLANS[mappedPlan] ?? PLANS.free;

  // Count instances
  const instanceCount = user.instances.length;
  const runningInstances = user.instances.filter((i) => i.status === "running").length;

  // Count messages this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const messageCount = await prisma.activityLog.count({
    where: {
      instance: { userId: session.user.id },
      event: "message",
      createdAt: { gte: startOfMonth },
    },
  });

  // Check if any instance is in sandbox mode
  const sandboxInstance = user.instances.find((i) => i.sandboxMode);
  const sandboxUsed = sandboxInstance?.sandboxUsed ?? 0;

  // Check if user has their own API keys (if so, sandbox warnings are less critical)
  const hasOwnCredentials = await prisma.instanceCredential.findFirst({
    where: {
      instanceId: { in: user.instances.map((i) => i.id) },
      key: { in: ["openai_api_key", "anthropic_api_key", "openrouter_api_key"] },
    },
  });

  return NextResponse.json({
    plan: user.plan,
    instances: {
      used: instanceCount,
      running: runningInstances,
      limit: plan.instances,
    },
    messages: {
      used: messageCount,
      limit: plan.messages,
    },
    sandbox: {
      active: !!sandboxInstance && !hasOwnCredentials,
      used: sandboxUsed,
      limit: 20,
    },
  });
}