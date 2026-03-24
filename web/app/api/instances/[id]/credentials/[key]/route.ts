import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function DELETE(
  _: NextRequest,
  { params }: { params: Promise<{ id: string; key: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id, key } = await params;
  const instance = await prisma.aIInstance.findFirst({
    where: { id, userId: session.user.id },
  });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.instanceCredential.deleteMany({
    where: { instanceId: id, key },
  });

  // Mark configSynced = false since credentials changed
  await prisma.aIInstance.update({
    where: { id },
    data: { configSynced: false },
  });

  return NextResponse.json({ ok: true });
}
