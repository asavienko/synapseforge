import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function generateKey(): { key: string; preview: string } {
  const raw = randomBytes(24).toString("hex"); // 48 chars
  const key = `sf-live-${raw}`;
  const preview = `sf-live-${raw.slice(0, 4)}...${raw.slice(-4)}`;
  return { key, preview };
}

async function ownsInstance(userId: string, instanceId: string) {
  const inst = await prisma.aIInstance.findFirst({ where: { id: instanceId, userId } });
  return !!inst;
}

export async function GET(_: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await ownsInstance(session.user.id, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const keys = await prisma.apiKey.findMany({
    where: { instanceId: id },
    orderBy: { createdAt: "desc" },
    select: { id: true, name: true, preview: true, createdAt: true, lastUsedAt: true },
  });

  return NextResponse.json(keys);
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await ownsInstance(session.user.id, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { name } = await req.json().catch(() => ({}));
  const { key, preview } = generateKey();

  const apiKey = await prisma.apiKey.create({
    data: { key, preview, name: name || "Default", instanceId: id },
  });

  await prisma.activityLog.create({
    data: { event: "key_generated", details: `API key "${apiKey.name}" created`, instanceId: id },
  });

  // Return the full key only once
  return NextResponse.json({ ...apiKey, key }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  if (!(await ownsInstance(session.user.id, id))) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { keyId } = await req.json();
  const apiKey = await prisma.apiKey.findFirst({ where: { id: keyId, instanceId: id } });
  if (!apiKey) return NextResponse.json({ error: "Key not found" }, { status: 404 });

  await prisma.apiKey.delete({ where: { id: keyId } });
  await prisma.activityLog.create({
    data: { event: "key_revoked", details: `API key "${apiKey.name}" revoked`, instanceId: id },
  });

  return NextResponse.json({ ok: true });
}
