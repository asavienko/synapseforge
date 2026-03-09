import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(email?: string | null) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  return adminEmails.includes(email ?? "");
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const { managerId, plan } = await req.json();

  const data: { managerId?: string | null; plan?: string } = {};
  if (managerId !== undefined) data.managerId = managerId || null;
  if (plan !== undefined) data.plan = plan;

  const user = await prisma.user.update({ where: { id }, data });
  return NextResponse.json(user);
}
