import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { STATUS_COLORS, PLANS, formatDate } from "@/lib/utils";
import { AdminClient } from "./AdminClient";

export default async function AdminPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  if (!adminEmails.includes(session.user.email ?? "")) redirect("/dashboard");

  const [users, managers, allInstancesForHealth] = await Promise.all([
    prisma.user.findMany({
      include: {
        manager: true,
        instances: {
          include: {
            credentials: { select: { key: true } },
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.manager.findMany({ orderBy: { createdAt: "asc" } }),
    prisma.aIInstance.findMany({
      select: {
        id: true,
        name: true,
        healthStatus: true,
        lastCheckedAt: true,
        vpsUrl: true,
        user: { select: { email: true } },
      },
    }),
  ]);

  const healthSummary = {
    monitored: allInstancesForHealth.filter((i) => i.vpsUrl).length,
    healthy: allInstancesForHealth.filter((i) => i.healthStatus === "healthy").length,
    degraded: allInstancesForHealth.filter((i) => i.healthStatus === "degraded").length,
    down: allInstancesForHealth.filter((i) => i.healthStatus === "down").length,
    unknown: allInstancesForHealth.filter((i) => !i.healthStatus).length,
    issues: allInstancesForHealth
      .filter((i) => i.healthStatus === "down" || i.healthStatus === "degraded")
      .map((i) => ({
        id: i.id,
        name: i.name,
        healthStatus: i.healthStatus!,
        lastCheckedAt: i.lastCheckedAt?.toISOString() ?? null,
        userEmail: i.user.email,
      })),
  };

  // Fetch unread message counts per user (messages sent by users, not yet read by manager)
  const unreadCounts = await prisma.message.groupBy({
    by: ["userId"],
    where: { senderType: "user", read: false },
    _count: { id: true },
  });
  const unreadMap: Record<string, number> = {};
  for (const u of unreadCounts) unreadMap[u.userId] = u._count.id;

  const totalInstances = users.reduce((sum, u) => sum + u.instances.length, 0);
  const runningInstances = users.reduce(
    (sum, u) => sum + u.instances.filter((i) => i.status === "running").length,
    0
  );
  const unassigned = users.filter((u) => !u.managerId).length;

  return (
    <AdminClient
      users={users.map((u) => ({
        id: u.id,
        name: u.name,
        email: u.email,
        plan: u.plan,
        createdAt: u.createdAt.toISOString(),
        managerId: u.managerId,
        managerName: u.manager?.name ?? null,
        onboardingData: u.onboardingData as { industry?: string; useCase?: string; businessName?: string; agentType?: string } | null,
        instances: u.instances.map((i) => ({
          id: i.id,
          name: i.name,
          type: i.type,
          tier: i.tier,
          status: i.status,
          healthStatus: i.healthStatus ?? null,
          vpsUrl: i.vpsUrl ?? null,
          hasGateway: !!i.vpsUrl,
          configSynced: i.configSynced,
          provisionStatus: i.provisionStatus ?? null,
          sandboxMode: i.sandboxMode,
          sandboxUsed: i.sandboxUsed,
          hasLLMKey: i.credentials.some(c => ["openai_api_key","anthropic_api_key","openrouter_api_key"].includes(c.key)),
          hasChannel: i.credentials.some(c => ["telegram_bot_token","discord_bot_token","slack_app_token","slack_bot_token","whatsapp_business_token"].includes(c.key)),
        })),
        unreadMessages: unreadMap[u.id] ?? 0,
      }))}
      managers={managers.map((m) => ({
        id: m.id,
        name: m.name,
        email: m.email,
        userCount: users.filter((u) => u.managerId === m.id).length,
      }))}
      stats={{ totalUsers: users.length, totalInstances, runningInstances, unassigned }}
      healthSummary={healthSummary}
    />
  );
}
