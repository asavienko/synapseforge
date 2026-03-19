import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(email?: string | null) {
  return (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim()).includes(email ?? "");
}

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const logs = await prisma.activityLog.findMany({
    where: { event: "upgrade_requested" },
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { instance: { include: { user: { select: { email: true, name: true, plan: true } } } } },
  });

  return NextResponse.json(logs.map(log => ({
    id: log.id,
    details: log.details,
    createdAt: log.createdAt,
    userEmail: log.instance?.user?.email,
    userName: log.instance?.user?.name,
    currentPlan: log.instance?.user?.plan,
    instanceId: log.instanceId,
  })));
}
