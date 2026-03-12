import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { email as emailService } from "@/lib/email";
import { rateLimit } from "@/lib/ratelimit";

export async function POST(req: NextRequest) {
  // Rate limit: 5 registrations per IP per 15 minutes
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  if (!rateLimit(`register:${ip}`, 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 });
  }

  const body = await req.json();
  const { name, password } = body;
  const userEmail: string = body.email;

  if (!userEmail || !password || !name) {
    return NextResponse.json({ error: "All fields required." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email: userEmail } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email: userEmail,
      password: hashedPassword,
      plan: "free",
    },
  });

  // Auto-create a free minimal instance
  const instance = await prisma.aIInstance.create({
    data: {
      name: "My First Agent",
      type: "assistant",
      status: "stopped",
      tier: "minimal",
      description: "Your starter AI assistant",
      userId: user.id,
    },
  });

  await prisma.activityLog.create({
    data: { event: "created", details: "Instance created on sign-up", instanceId: instance.id },
  });

  // Create email verification token (expires in 24h)
  const verificationToken = crypto.randomBytes(32).toString("hex");
  await prisma.verificationToken.create({
    data: {
      identifier: userEmail,
      token: verificationToken,
      expires: new Date(Date.now() + 24 * 60 * 60 * 1000),
    },
  });

  // Send welcome + verification emails (non-blocking)
  emailService.welcome(userEmail, name).catch(console.error);
  emailService.verifyEmail(userEmail, name, verificationToken).catch(console.error);

  // Notify admins so a manager can be assigned immediately
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  if (adminEmails.length > 0) {
    emailService.newSignupAlert(adminEmails, name, userEmail).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}
