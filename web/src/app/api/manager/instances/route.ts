import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { PLANS } from "@/lib/utils";

export async function GET() {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const manager = await prisma.manager.findUnique({ where: { email: session.user.email } });
  if (!manager) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const clients = await prisma.user.findMany({
    where: { managerId: manager.id },
    select: {
      id: true,
      name: true,
      email: true,
      instances: {
        select: {
          id: true,
          name: true,
          status: true,
          healthStatus: true,
          tier: true,
          vpsUrl: true,
          provisionStatus: true,
          lastCheckedAt: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
    orderBy: { name: "asc" },
  });

  const result = clients.map((c) => ({
    id: c.id,
    name: c.name,
    email: c.email,
    instances: c.instances.map((i) => ({
      id: i.id,
      name: i.name,
      status: i.status,
      healthStatus: i.healthStatus ?? null,
      tier: i.tier,
      vpsUrl: i.vpsUrl ?? null,
      hasGateway: !!i.vpsUrl,
      provisionStatus: i.provisionStatus ?? null,
      lastCheckedAt: i.lastCheckedAt?.toISOString() ?? null,
    })),
  }));

  return NextResponse.json(result);
}
