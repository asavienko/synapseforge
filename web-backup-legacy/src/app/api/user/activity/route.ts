import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/user/activity
 * 
 * Returns recent activity for the authenticated user:
 * - Recent messages
 * - Instance activity logs
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

  // Get user's instances first
  const instances = await prisma.aIInstance.findMany({
    where: { userId },
    select: { id: true, name: true },
  });

  const instanceIds = instances.map((i) => i.id);
  const instanceMap = new Map(instances.map((i) => [i.id, i.name]));

  // Get recent messages
  const recentMessages = await prisma.chatMessage.findMany({
    where: {
      instanceId: { in: instanceIds },
      createdAt: { gte: oneDayAgo },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      instance: { select: { name: true } },
    },
  });

  // Get recent activity logs
  const recentLogs = await prisma.activityLog.findMany({
    where: {
      instanceId: { in: instanceIds },
      createdAt: { gte: oneDayAgo },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  // Combine and format activities
  const activities = [
    ...recentMessages.map((msg) => ({
      id: `msg-${msg.id}`,
      type: "message" as const,
      message: `New ${msg.role} message received`,
      timestamp: msg.createdAt.toISOString(),
      instanceName: msg.instance.name,
    })),
    ...recentLogs.map((log) => ({
      id: `log-${log.id}`,
      type: log.event?.includes("start")
        ? ("instance_started" as const)
        : log.event?.includes("stop")
          ? ("instance_stopped" as const)
          : log.event?.includes("health")
            ? ("health_alert" as const)
            : ("message" as const),
      message: log.details || `Instance ${log.event}`,
      timestamp: log.createdAt.toISOString(),
      instanceName: instanceMap.get(log.instanceId),
    })),
  ]
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 10);

  return NextResponse.json({ activities });
}
