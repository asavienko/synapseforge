import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { prisma } from "@/lib/prisma";
import { email } from "@/lib/email";

export async function POST(req: NextRequest) {
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
