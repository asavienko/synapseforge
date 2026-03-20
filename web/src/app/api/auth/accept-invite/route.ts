import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { token } = await req.json();

  if (!token) return NextResponse.json({ error: "Token required." }, { status: 400 });

  const invite = await prisma.clientInvite.findUnique({ where: { token } });

  if (!invite || invite.used) {
    return NextResponse.json({ error: "Invalid or already-used invite link." }, { status: 400 });
  }
  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "This invite link has expired. Please contact your manager for a new one." }, { status: 400 });
  }

  // Mark as used
  await prisma.clientInvite.update({ where: { token }, data: { used: true } });

  return NextResponse.json({ ok: true, email: invite.email });
}
