import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { name, email, password } = await req.json();

  if (!email || !password || !name) {
    return NextResponse.json({ error: "All fields required." }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "Password must be at least 8 characters." }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already in use." }, { status: 409 });
  }

  // In production, hash password with bcrypt
  const user = await prisma.user.create({
    data: {
      name,
      email,
      password, // TODO: hash with bcrypt in production
      plan: "free",
    },
  });

  // Auto-create a free minimal instance
  await prisma.aIInstance.create({
    data: {
      name: "My First Agent",
      type: "assistant",
      status: "stopped",
      tier: "minimal",
      description: "Your starter AI assistant",
      userId: user.id,
    },
  });

  return NextResponse.json({ ok: true });
}
