import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

function isAdmin(email?: string | null) {
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  return adminEmails.includes(email ?? "");
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const managers = await prisma.manager.findMany({ orderBy: { createdAt: "asc" } });
  return NextResponse.json(managers);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email } = await req.json();
  if (!name || !email) return NextResponse.json({ error: "Name and email required." }, { status: 400 });

  const existing = await prisma.manager.findUnique({ where: { email } });
  if (existing) return NextResponse.json({ error: "Manager with this email already exists." }, { status: 409 });

  const manager = await prisma.manager.create({ data: { name, email } });
  return NextResponse.json(manager, { status: 201 });
}

export async function DELETE(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  await prisma.manager.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
