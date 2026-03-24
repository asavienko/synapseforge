import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import crypto from "crypto";

/**
 * GET /api/team
 * 
 * Get all team members for the current user.
 */
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const members = await prisma.teamMember.findMany({
    where: { ownerId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ members });
}

/**
 * POST /api/team
 * 
 * Invite a new team member.
 */
export async function POST(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { email, role } = await req.json();

  if (!email || !role) {
    return NextResponse.json({ error: "Email and role required" }, { status: 400 });
  }

  // Check if already a member
  const existing = await prisma.teamMember.findFirst({
    where: { ownerId: session.user.id, email },
  });

  if (existing) {
    return NextResponse.json({ error: "Already a team member" }, { status: 400 });
  }

  // Generate invite token
  const inviteToken = crypto.randomBytes(32).toString("hex");

  const member = await prisma.teamMember.create({
    data: {
      ownerId: session.user.id,
      email,
      role,
      status: "pending",
      inviteToken,
    },
  });

  // Send invite email
  const appUrl = process.env.NEXTAUTH_URL ?? "https://openhelixai.com";
  const inviteUrl = `${appUrl}/team/join?token=${inviteToken}`;

  await sendEmail({
    to: email,
    subject: "You've been invited to join a team on SynapseForge",
    html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0a0a0f; color: #e2e8f0; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="background: #12121a; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 32px; text-align: center;">
    <h1 style="color: #a78bfa; font-size: 24px; margin: 0 0 16px;">Team Invitation</h1>
    <p style="color: #94a3b8; margin: 0 0 24px;">
      You've been invited to join a team on SynapseForge with ${role} access.
    </p>
    <a href="${inviteUrl}" 
       style="display: inline-block; background: #7c3aed; color: white; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: 600; margin: 16px 0;">
      Accept Invitation →
    </a>
    <p style="color: #475569; font-size: 12px; margin-top: 24px;">
      This link expires in 7 days.
    </p>
  </div>
</body>
</html>`,
  }).catch(console.error);

  return NextResponse.json({ member });
}

/**
 * DELETE /api/team?id=<memberId>
 * 
 * Remove a team member.
 */
export async function DELETE(req: Request) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");

  if (!id) {
    return NextResponse.json({ error: "Member ID required" }, { status: 400 });
  }

  await prisma.teamMember.deleteMany({
    where: { id, ownerId: session.user.id },
  });

  return NextResponse.json({ ok: true });
}
