import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";

/**
 * GET /api/team/join?token=<token>
 * 
 * Validate invite token and return invite details.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const member = await prisma.teamMember.findUnique({
    where: { inviteToken: token },
  });

  if (!member) {
    return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  }

  if (member.status === "active") {
    return NextResponse.json({ error: "Already joined" }, { status: 400 });
  }

  // Get owner info separately
  const owner = await prisma.user.findUnique({
    where: { id: member.ownerId },
    select: { name: true, email: true },
  });

  return NextResponse.json({
    invite: {
      email: member.email,
      role: member.role,
      teamOwner: owner?.name || owner?.email || "Unknown",
    },
  });
}

/**
 * POST /api/team/join
 * 
 * Accept team invite. User must be logged in with matching email.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { token } = await req.json();

  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const member = await prisma.teamMember.findUnique({
    where: { inviteToken: token },
  });

  if (!member) {
    return NextResponse.json({ error: "Invalid invite" }, { status: 404 });
  }

  if (member.status === "active") {
    return NextResponse.json({ error: "Already joined" }, { status: 400 });
  }

  // Verify email matches
  if (member.email.toLowerCase() !== session.user.email.toLowerCase()) {
    return NextResponse.json(
      { error: "Email mismatch. Please sign in with the invited email." },
      { status: 403 }
    );
  }

  // Activate membership
  await prisma.teamMember.update({
    where: { id: member.id },
    data: {
      status: "active",
      joinedAt: new Date(),
      inviteToken: null, // Clear token after use
    },
  });

  return NextResponse.json({ ok: true });
}
