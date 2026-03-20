import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";
import { email } from "@/lib/email";

export async function POST(req: NextRequest) {
  try {
    const { email: emailAddress } = await req.json();

    if (!emailAddress || typeof emailAddress !== "string") {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // Normalize email
    const normalizedEmail = emailAddress.toLowerCase().trim();

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    // Don't reveal if user exists - same response either way
    if (!user) {
      return NextResponse.json({ success: true });
    }

    // Delete any existing tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: normalizedEmail },
    });

    // Create new token (1 hour expiry)
    const token = randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        token,
        email: normalizedEmail,
        expires,
      },
    });

    // Send email
    const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    await email.passwordReset(normalizedEmail, resetUrl);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "Failed to send reset email" },
      { status: 500 }
    );
  }
}
