import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { ManagerClient } from "./ManagerClient";

export const dynamic = "force-dynamic";

interface RawClient {
  id: string;
  name: string | null;
  email: string;
  plan: string;
  createdAt: Date;
  onboardingData: unknown;
  healthScore: number | null;
  instances: Array<{ id: string; name: string; type: string; status: string; tier: string }>;
  messages?: Array<{ body: string; senderType: string; createdAt: Date }>;
}

export default async function ManagerPage() {
  const session = await auth();
  if (!session?.user?.email) redirect("/sign-in");

  // Check if the logged-in user is a manager
  const manager = await prisma.manager.findUnique({ where: { email: session.user.email } });
  if (!manager) redirect("/dashboard");

  // Fetch clients — messages include is guarded because the Message table
  // may be missing in environments where schema drift occurred.
  let clients: RawClient[] = [];
  let messagesAvailable = true;

  try {
    const rows = await prisma.user.findMany({
      where: { managerId: manager.id },
      include: {
        instances: { orderBy: { createdAt: "desc" }, take: 5 },
        messages: { orderBy: { createdAt: "desc" }, take: 1 },
      },
      orderBy: { createdAt: "desc" },
    });
    clients = rows.map((r) => ({
      id: r.id,
      name: r.name,
      email: r.email,
      plan: r.plan,
      createdAt: r.createdAt,
      onboardingData: r.onboardingData,
      healthScore: r.healthScore ?? null,
      instances: r.instances.map((i) => ({
        id: i.id, name: i.name, type: i.type, status: i.status, tier: i.tier,
      })),
      messages: r.messages.map((m) => ({
        body: m.body, senderType: m.senderType, createdAt: m.createdAt,
      })),
    }));
  } catch (err) {
    // Fallback: fetch without messages (handles missing Message table in DB)
    console.error("[ManagerPage] messages include failed, retrying without:", err);
    messagesAvailable = false;
    try {
      const rows = await prisma.user.findMany({
        where: { managerId: manager.id },
        include: { instances: { orderBy: { createdAt: "desc" }, take: 5 } },
        orderBy: { createdAt: "desc" },
      });
      clients = rows.map((r) => ({
        id: r.id,
        name: r.name,
        email: r.email,
        plan: r.plan,
        createdAt: r.createdAt,
        onboardingData: r.onboardingData,
        healthScore: r.healthScore ?? null,
        instances: r.instances.map((i) => ({
          id: i.id, name: i.name, type: i.type, status: i.status, tier: i.tier,
        })),
      }));
    } catch (fallbackErr) {
      console.error("[ManagerPage] fallback query also failed:", fallbackErr);
      // Return empty clients rather than crash
    }
  }

  const unreadMap: Record<string, number> = {};
  if (messagesAvailable) {
    try {
      const unreadCounts = await prisma.message.groupBy({
        by: ["userId"],
        where: { managerId: manager.id, senderType: "user", read: false },
        _count: { id: true },
      });
      for (const u of unreadCounts) unreadMap[u.userId] = u._count.id;
    } catch (err) {
      console.error("[ManagerPage] unread count failed:", err);
    }
  }

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
        healthScore: c.healthScore,
        unreadMessages: unreadMap[c.id] ?? 0,
        lastMessage: c.messages?.[0] ? {
          body: c.messages[0].body,
          senderType: c.messages[0].senderType,
          createdAt: c.messages[0].createdAt.toISOString(),
        } : null,
        instances: c.instances,
      }))}
    />
  );
}
