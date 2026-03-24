import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  if (!adminEmails.includes(session.user.email)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const body = await req.json();
  const { vpsUrl } = body as { vpsUrl: string };

  const instance = await prisma.aIInstance.findUnique({ where: { id } });
  if (!instance) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await prisma.aIInstance.update({
    where: { id },
    data: { vpsUrl: vpsUrl ?? null },
  });

  return NextResponse.json({ ok: true });
}
