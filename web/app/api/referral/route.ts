import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

/** Generate a unique referral code like "JOHN-X7K2" */
function generateCode(name: string): string {
  const prefix = name
    .toUpperCase()
    .replace(/[^A-Z]/g, "")
    .slice(0, 6)
    .padEnd(3, "X");
  const suffix = Math.random().toString(36).toUpperCase().slice(2, 6);
  return `${prefix}-${suffix}`;
}

async function ensureUniqueCode(name: string): Promise<string> {
  let code = generateCode(name);
  let attempts = 0;
  while (attempts < 10) {
    const existing = await prisma.referral.findUnique({ where: { code } });
    if (!existing) return code;
    code = generateCode(name);
    attempts++;
  }
  // Fallback: use random suffix
  return `USER-${Math.random().toString(36).toUpperCase().slice(2, 8)}`;
}

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, referralCode: true },
  });

  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // Get or create referral record
  let referral = await prisma.referral.findFirst({
    where: { referrerId: userId },
    include: {
      conversions: {
        include: {
          referredUser: { select: { email: true, name: true, plan: true } },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!referral) {
    // Create code and referral
    const code = await ensureUniqueCode(user.name ?? "USER");

    // Update user's referralCode field
    await prisma.user.update({ where: { id: userId }, data: { referralCode: code } });

    referral = await prisma.referral.create({
      data: { code, referrerId: userId },
      include: {
        conversions: {
          include: {
            referredUser: { select: { email: true, name: true, plan: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
  }

  const APP_URL = process.env.NEXTAUTH_URL ?? "https://openhelixai.com";
  const link = `${APP_URL}/r/${referral.code}`;

  // Stats
  const signups = referral.conversions.length;
  const conversions = referral.conversions.filter((c) => c.status !== "pending").length;
  const pendingCommissionUsd = referral.conversions
    .filter((c) => c.status === "converted")
    .reduce((sum, c) => sum + (c.commissionUsd ?? 0), 0);
  const earnedCommissionUsd = referral.conversions
    .filter((c) => c.status === "paid")
    .reduce((sum, c) => sum + (c.commissionUsd ?? 0), 0);

  // Mask emails in conversion list
  const conversionRows = referral.conversions.map((c) => {
    const [localPart, domain] = (c.referredUser.email ?? "").split("@");
    const masked = localPart
      ? `${localPart.slice(0, 2)}${"*".repeat(Math.max(1, localPart.length - 2))}@${domain}`
      : "***";
    return {
      id: c.id,
      maskedEmail: masked,
      plan: c.planAtConversion ?? "—",
      status: c.status,
      commissionUsd: c.commissionUsd,
      createdAt: c.createdAt,
      convertedAt: c.convertedAt,
    };
  });

  return NextResponse.json({
    code: referral.code,
    link,
    stats: {
      signups,
      conversions,
      pendingCommissionUsd,
      earnedCommissionUsd,
    },
    conversions: conversionRows,
  });
}
