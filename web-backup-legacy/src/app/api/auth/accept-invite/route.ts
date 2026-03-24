import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomUUID } from "crypto";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  // Rate limit: 5 attempts per IP per hour (prevents token enumeration)
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const allowed = await rateLimit(`accept-invite:${ip}`, 5, 60 * 60 * 1000);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many attempts. Please try again later." },
      { status: 429 }
    );
  }

  const { token } = await req.json();

  if (!token) return NextResponse.json({ error: "Token required." }, { status: 400 });

  const invite = await prisma.clientInvite.findUnique({ where: { token } });

  if (!invite || invite.used) {
    return NextResponse.json({ error: "Invalid or already-used invite link." }, { status: 400 });
  }
  if (invite.expiresAt < new Date()) {
    return NextResponse.json({ error: "This invite link has expired. Please contact your manager for a new one." }, { status: 400 });
  }

  // Mark invite as used
  await prisma.clientInvite.update({ where: { token }, data: { used: true } });

  // Generate a password-reset token directly so the invited user can set their
  // password in one step — no separate "forgot password" email needed.
  const resetToken = randomUUID();
  const expires = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours
  await prisma.passwordResetToken.create({
    data: { token: resetToken, email: invite.email, expires },
  });

  return NextResponse.json({ ok: true, email: invite.email, resetToken });
}
