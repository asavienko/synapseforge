import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS ?? "")
  .split(",")
  .map((e) => e.trim())
  .filter(Boolean);

async function requireAdmin() {
  const session = await auth();
  if (!session?.user?.email || !ADMIN_EMAILS.includes(session.user.email)) {
    return null;
  }
  return session;
}

/** GET /api/admin/referrals — list all conversions with referrer info */
export async function GET() {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const conversions = await prisma.referralConversion.findMany({
    include: {
      referral: {
        include: {
          referrer: { select: { id: true, name: true, email: true } },
        },
      },
      referredUser: { select: { id: true, name: true, email: true, plan: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalOutstandingUsd = conversions
    .filter((c) => c.status === "converted")
    .reduce((sum, c) => sum + (c.commissionUsd ?? 0), 0);

  return NextResponse.json({
    conversions: conversions.map((c) => ({
      id: c.id,
      referrerName: c.referral.referrer.name,
      referrerEmail: c.referral.referrer.email,
      referredName: c.referredUser.name,
      referredEmail: c.referredUser.email,
      plan: c.planAtConversion ?? c.referredUser.plan,
      status: c.status,
      commissionUsd: c.commissionUsd,
      monthsRemaining: c.monthsRemaining,
      createdAt: c.createdAt,
      convertedAt: c.convertedAt,
    })),
    totalOutstandingUsd,
  });
}

/** PATCH /api/admin/referrals — mark conversion as paid */
export async function PATCH(req: NextRequest) {
  const session = await requireAdmin();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await req.json();
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });

  const updated = await prisma.referralConversion.update({
    where: { id },
    data: { status: "paid" },
  });

  return NextResponse.json({ ok: true, id: updated.id, status: updated.status });
}
