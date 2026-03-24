import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Any authenticated user can poll — but only their own instance
  const instance = await prisma.aIInstance.findFirst({
    where: {
      id,
      user: { email: session.user.email },
    },
    select: {
      provisionStatus: true,
      vpsUrl: true,
      vpsServerId: true,
      healthStatus: true,
      lastCheckedAt: true,
      configSynced: true,
    },
  });

  // Also allow admins to poll any instance
  if (!instance) {
    const adminEmails = (process.env.ADMIN_EMAILS ?? "")
      .split(",")
      .map((e) => e.trim())
      .filter(Boolean);
    const isAdmin = adminEmails.includes(session.user.email);

    if (!isAdmin) {
      // Check if manager owns the instance's client
      const manager = await prisma.manager.findUnique({
        where: { email: session.user.email },
      });
      if (manager) {
        const inst = await prisma.aIInstance.findFirst({
          where: {
            id,
            user: { managerId: manager.id },
          },
          select: {
            provisionStatus: true,
            vpsUrl: true,
            vpsServerId: true,
            healthStatus: true,
            lastCheckedAt: true,
            configSynced: true,
          },
        });
        if (!inst) return NextResponse.json({ error: "Not found" }, { status: 404 });
        return NextResponse.json(formatResponse(inst));
      }
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    const adminInstance = await prisma.aIInstance.findUnique({
      where: { id },
      select: {
        provisionStatus: true,
        vpsUrl: true,
        vpsServerId: true,
        healthStatus: true,
        lastCheckedAt: true,
        configSynced: true,
      },
    });
    if (!adminInstance) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(formatResponse(adminInstance));
  }

  return NextResponse.json(formatResponse(instance));
}

function formatResponse(inst: {
  provisionStatus: string | null;
  vpsUrl: string | null;
  vpsServerId: string | null;
  healthStatus: string | null;
  lastCheckedAt: Date | null;
  configSynced: boolean;
}) {
  // Extract IP from vpsUrl (http://1.2.3.4:18789)
  let ip: string | null = null;
  if (inst.vpsUrl) {
    const match = inst.vpsUrl.match(/https?:\/\/([^:]+)/);
    ip = match ? match[1] : null;
  }

  return {
    provisionStatus: inst.provisionStatus ?? null,
    vpsUrl: inst.vpsUrl ?? null,
    healthStatus: inst.healthStatus ?? null,
    lastCheckedAt: inst.lastCheckedAt?.toISOString() ?? null,
    serverId: inst.vpsServerId ?? null,
    ip,
    configSynced: inst.configSynced,
  };
}
