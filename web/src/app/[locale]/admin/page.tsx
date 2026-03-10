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

  const [users, managers] = await Promise.all([
    prisma.user.findMany({
      include: { manager: true, instances: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.manager.findMany({ orderBy: { createdAt: "asc" } }),
  ]);

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
        instances: u.instances.map((i) => ({
          id: i.id,
          name: i.name,
          type: i.type,
          status: i.status,
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
    />
  );
}
