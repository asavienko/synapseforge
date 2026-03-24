import { NextResponse } from "next/server";
import crypto from "crypto";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { email as emailService } from "@/lib/email";
import { rateLimit } from "@/lib/ratelimit";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Rate limit: 3 resends per user per hour
  if (!rateLimit(`resend-verify:${session.user.id}`, 3, 60 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please wait before requesting another." }, { status: 429 });
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.emailVerified) return NextResponse.json({ error: "Email already verified." }, { status: 400 });

  // Delete any existing token for this email
  await prisma.verificationToken.deleteMany({ where: { identifier: user.email } });

  // Create new token
  const token = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: user.email,
      token,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  await emailService.verifyEmail(user.email, user.name ?? "there", token);

  return NextResponse.json({ ok: true });
}
