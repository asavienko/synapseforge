import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ManagerClient } from "./ManagerClient";

export default async function ManagerPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/sign-in");

  // Check if the logged-in user is a manager
  const manager = await prisma.manager.findUnique({ where: { email: session.user.email } });
  if (!manager) redirect("/dashboard");

  const clients = await prisma.user.findMany({
    where: { managerId: manager.id },
    include: {
      instances: { orderBy: { createdAt: "desc" }, take: 5 },
      messages: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
    orderBy: { createdAt: "desc" },
    // healthScore is already on User model
  });

  const unreadCounts = await prisma.message.groupBy({
    by: ["userId"],
    where: { managerId: manager.id, senderType: "user", read: false },
    _count: { id: true },
  });
  const unreadMap: Record<string, number> = {};
  for (const u of unreadCounts) unreadMap[u.userId] = u._count.id;

  return (
    <ManagerClient
      manager={{ id: manager.id, name: manager.name, email: manager.email }}
      clients={clients.map((c) => ({
        id: c.id,
        name: c.name,
        email: c.email,
        plan: c.plan,
        createdAt: c.createdAt.toISOString(),
        onboardingData: c.onboardingData as { businessName?: string; industry?: string; useCase?: string; teamSize?: string; agentType?: string } | null,
        healthScore: c.healthScore ?? null,
        unreadMessages: unreadMap[c.id] ?? 0,
        lastMessage: c.messages[0] ? {
          body: c.messages[0].body,
          senderType: c.messages[0].senderType,
          createdAt: c.messages[0].createdAt.toISOString(),
        } : null,
        instances: c.instances.map((i) => ({
          id: i.id, name: i.name, type: i.type, status: i.status, tier: i.tier,
        })),
      }))}
    />
  );
}
