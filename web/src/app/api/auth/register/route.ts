import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { email as emailService } from "@/lib/email";

export async function POST(req: NextRequest) {
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

  // Send welcome email (non-blocking)
  emailService.welcome(userEmail, name).catch(console.error);

  return NextResponse.json({ ok: true });
}
