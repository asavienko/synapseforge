import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// GET the current config for an instance (manager access)
export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify the instance belongs to a user who is assigned to this manager
  const manager = await prisma.manager.findFirst({
    where: { users: { some: { instances: { some: { id } } } } },
    select: { id: true },
  });
  if (!manager) return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });

  const instance = await prisma.aIInstance.findUnique({
    where: { id },
    select: { id: true, name: true, config: true, status: true, tier: true },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  return NextResponse.json(instance);
}

// PATCH — update agent config (manager access)
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Verify manager access
  const manager = await prisma.manager.findFirst({
    where: { users: { some: { instances: { some: { id } } } } },
    select: { id: true },
  });
  if (!manager) return NextResponse.json({ error: "Not found or not authorized" }, { status: 404 });

  const body = await req.json();
  const { config } = body;
  if (!config || typeof config !== "string") {
    return NextResponse.json({ error: "config (JSON string) is required" }, { status: 400 });
  }

  // Validate it's valid JSON
  try {
    JSON.parse(config);
  } catch {
    return NextResponse.json({ error: "config must be valid JSON" }, { status: 400 });
  }

  const updated = await prisma.aIInstance.update({
    where: { id },
    data: { config, configSynced: false, updatedAt: new Date() },
  });

  // Log the change
  await prisma.activityLog.create({
    data: { instanceId: id, event: "config_changed", details: "Manager updated config" },
  });

  return NextResponse.json({ ok: true, instance: updated });
}
