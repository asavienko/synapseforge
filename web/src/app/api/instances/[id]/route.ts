import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });

  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(instance);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const data: Record<string, unknown> = {};
  const logEvents: { event: string; details?: string }[] = [];

  if (body.name !== undefined) data.name = body.name;
  if (body.description !== undefined) data.description = body.description;

  if (body.status !== undefined && body.status !== instance.status) {
    data.status = body.status;
    logEvents.push({ event: body.status === "running" ? "started" : "stopped" });
  }

  if (body.config !== undefined) {
    data.config = typeof body.config === "string" ? body.config : JSON.stringify(body.config);
    logEvents.push({ event: "config_changed", details: "Configuration updated" });
  }

  const updated = await prisma.aIInstance.update({ where: { id }, data });

  if (logEvents.length > 0) {
    await prisma.activityLog.createMany({
      data: logEvents.map((e) => ({ ...e, instanceId: id })),
    });
  }

  return NextResponse.json(updated);
}

export async function DELETE(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.aIInstance.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
