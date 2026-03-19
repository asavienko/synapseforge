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
  const { name, password, referralCode } = body as {
    name: string;
    password: string;
    email: string;
    referralCode?: string;
  };
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

  // Auto-assign manager:
  //   1. Use DEFAULT_MANAGER_ID env var if set (explicit config)
  //   2. Otherwise fall back to the first Manager in the DB (works without env var)
  //   This ensures every signup gets a manager as long as one exists.
  const defaultManagerId = process.env.DEFAULT_MANAGER_ID?.trim() || null;
  const defaultManager = defaultManagerId
    ? await prisma.manager.findUnique({ where: { id: defaultManagerId } })
    : await prisma.manager.findFirst({ orderBy: { createdAt: "asc" } });

  const user = await prisma.user.create({
    data: {
      name,
      email: userEmail,
      password: hashedPassword,
      plan: "free",
      ...(defaultManager ? { managerId: defaultManager.id } : {}),
    },
  });

  // Auto-create a free minimal instance — start as "running" so chat works immediately
  const instance = await prisma.aIInstance.create({
    data: {
      name: "My First Agent",
      type: "assistant",
      status: "running",
      tier: "minimal",
      description: "Your starter AI assistant",
      userId: user.id,
    },
  });

  await prisma.activityLog.create({
    data: { event: "created", details: "Instance created on sign-up", instanceId: instance.id },
  });

  // If a manager was auto-assigned, drop a personalised welcome message in their thread
  if (defaultManager) {
    const firstName = name.split(" ")[0];
    await prisma.message.create({
      data: {
        body: `Hi ${firstName}! 👋 I'm ${defaultManager.name}, your dedicated manager at OpenHelix AI. I'll be helping you get your AI agent set up and running. To get started, head to the Chat tab and add your OpenAI (or Anthropic) API key — you'll be chatting with your AI in under a minute. Let me know if you have any questions!`,
        senderType: "manager",
        userId: user.id,
        managerId: defaultManager.id,
      },
    });
  }

  // Link referral if a code was provided
  if (referralCode) {
    try {
      const referral = await prisma.referral.findUnique({ where: { code: referralCode } });
      if (referral && referral.referrerId !== user.id) {
        await prisma.referralConversion.create({
          data: {
            referralId: referral.id,
            referredUserId: user.id,
            status: "pending",
          },
        });
      }
    } catch {
      // Non-fatal: referral linking failure shouldn't block sign-up
    }
  }

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

  // Notify manager + admins
  if (defaultManager) {
    emailService
      .newUserAlert(defaultManager.email, defaultManager.name, name, userEmail)
      .catch(console.error);
  }
  const adminEmails = (process.env.ADMIN_EMAILS ?? "").split(",").map((e) => e.trim()).filter(Boolean);
  if (adminEmails.length > 0) {
    emailService.newSignupAlert(adminEmails, name, userEmail).catch(console.error);
  }

  return NextResponse.json({ ok: true });
}
