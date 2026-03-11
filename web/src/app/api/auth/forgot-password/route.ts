import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { email } from "@/lib/email";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  // Rate limit: 5 attempts per IP per 15 minutes (prevent email bombing)
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`forgot-pw:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const { emailAddress } = await req.json();
  if (!emailAddress) return NextResponse.json({ error: "Email required." }, { status: 400 });

  const user = await prisma.user.findUnique({ where: { email: emailAddress } });

  // Always respond OK — don't reveal whether email exists
  if (user) {
    // Invalidate any existing tokens
    await prisma.passwordResetToken.deleteMany({ where: { email: emailAddress } });

    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({ data: { token, email: emailAddress, expires } });

    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    await email.passwordReset(emailAddress, resetUrl);
  }

  return NextResponse.json({ ok: true });
}
