import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { email as emailService } from "@/lib/email";
import bcrypt from "bcryptjs";

function isAdmin(userEmail?: string | null) {
  return (process.env.ADMIN_EMAILS ?? "").split(",").map(e => e.trim()).includes(userEmail ?? "");
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user || !isAdmin(session.user.email)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { name, email, managerId } = await req.json();
  if (!name?.trim() || !email?.trim()) {
    return NextResponse.json({ error: "Name and email are required." }, { status: 400 });
  }

  // Check if user already exists
  const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
  if (existing) {
    return NextResponse.json({ error: "A user with this email already exists." }, { status: 409 });
  }

  // Create the user account with a random temp password
  const tempPassword = await bcrypt.hash(Math.random().toString(36) + Date.now(), 12);
  const user = await prisma.user.create({
    data: {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password: tempPassword,
      managerId: managerId || null,
      emailVerified: new Date(), // pre-verify so they don't hit the email verification wall
    },
  });

  // Create invite token (expires in 7 days)
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const invite = await prisma.clientInvite.create({
    data: {
      email: email.toLowerCase().trim(),
      name: name.trim(),
      managerId: managerId || null,
      userId: user.id,
      expiresAt,
    },
  });

  // Fetch manager details for email
  const manager = managerId
    ? await prisma.manager.findUnique({ where: { id: managerId } })
    : null;

  const APP_URL = process.env.NEXTAUTH_URL ?? "https://openhelixai.com";
  const acceptUrl = `${APP_URL}/accept-invite?token=${invite.token}`;

  // Send invite email
  await emailService.clientInvite(
    email,
    name.trim(),
    manager?.name ?? "the OpenHelix AI team",
    acceptUrl,
  ).catch(console.error);

  return NextResponse.json({ ok: true, userId: user.id, inviteToken: invite.token });
}
