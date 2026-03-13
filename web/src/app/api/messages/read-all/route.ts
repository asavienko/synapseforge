import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH() {
  const session = await auth();
  if (!session?.user?.id)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await prisma.message.updateMany({
    where: { userId: session.user.id, senderType: "manager", read: false },
    data: { read: true },
  });

  return NextResponse.json({ ok: true });
}
