import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/**
 * POST /api/referral/link
 * Links a referral code to the currently authenticated user (used after Google OAuth).
 * Body: { code: string }
 * Idempotent — safe to call multiple times.
 */
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { code } = (await req.json()) as { code?: string };
  if (!code) return NextResponse.json({ error: "code required" }, { status: 400 });

  const userId = session.user.id;

  // Already has a referral?
  const existing = await prisma.referralConversion.findUnique({
    where: { referredUserId: userId },
  });
  if (existing) {
    return NextResponse.json({ ok: true, alreadyLinked: true });
  }

  const referral = await prisma.referral.findUnique({ where: { code } });
  if (!referral) {
    return NextResponse.json({ error: "Invalid referral code" }, { status: 404 });
  }

  // Don't let users refer themselves
  if (referral.referrerId === userId) {
    return NextResponse.json({ ok: false, error: "Cannot refer yourself" }, { status: 400 });
  }

  await prisma.referralConversion.create({
    data: {
      referralId: referral.id,
      referredUserId: userId,
      status: "pending",
    },
  });

  return NextResponse.json({ ok: true });
}
