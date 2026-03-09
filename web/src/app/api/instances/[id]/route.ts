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

  const updated = await prisma.aIInstance.update({
    where: { id },
    data: {
      name: body.name ?? instance.name,
      status: body.status ?? instance.status,
      description: body.description ?? instance.description,
    },
  });

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
