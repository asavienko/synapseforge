import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";

// Generate a unique referral code: NAME(5)-XXXX
function generateReferralCode(name: string | null | undefined): string {
  const prefix = (name || "USER").toUpperCase().slice(0, 5).replace(/[^A-Z0-9]/g, "").padEnd(3, "X");
  const randomHex = crypto.randomBytes(2).toString("hex").toUpperCase();
  return `${prefix}-${randomHex}`;
}

// Commission per conversion type (20% of first month)
const COMMISSION_RATES: Record<string, number> = {
  starter_10k: 9.8, // ~20% of $49
  growth_30k: 19.8, // ~20% of $99
  scale_100k: 39.8, // ~20% of $199
  business_200k: 79.8, // ~20% of $399
  managed_chatbot: 39.8,
  managed_analyst: 39.8,
  managed_support: 39.8,
  managed_custom: 79.8,
};

function getCommissionForPlan(plan: string | null | undefined): number {
  if (!plan || plan === "free") return 0;
  return COMMISSION_RATES[plan] || 10; // Default $10 for unknown paid plans
}

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session.user.id;

    // Get or auto-create referral record for the user
    let referral = await prisma.referral.findFirst({
      where: { referrerId: userId },
      include: {
        conversions: {
          include: {
            referredUser: {
              select: { email: true },
            },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!referral) {
      // Get user's name for code generation
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, referralCode: true },
      });

      // Generate unique code (retry on collision)
      let code: string;
      let attempts = 0;
      do {
        code = user?.referralCode || generateReferralCode(user?.name);
        const existing = await prisma.referral.findUnique({ where: { code } });
        if (!existing) break;
        // Collision - generate new random suffix
        code = generateReferralCode((user?.name || "") + attempts);
        attempts++;
      } while (attempts < 5);

      referral = await prisma.referral.create({
        data: {
          code,
          referrerId: userId,
        },
        include: {
          conversions: {
            include: {
              referredUser: {
                select: { email: true },
              },
            },
            orderBy: { createdAt: "desc" },
          },
        },
      });
    }

    // Calculate stats
    const totalReferrals = referral.conversions.length;
    const conversions = referral.conversions.filter(
      (c) => c.status === "converted" || c.status === "paid"
    ).length;

    // Calculate earnings
    let pendingEarnings = 0;
    let paidEarnings = 0;

    const conversionsList = referral.conversions.map((c) => {
      const commission = c.commissionUsd ?? getCommissionForPlan(c.planAtConversion);
      const maskedEmail = c.referredUser.email
        ? c.referredUser.email.replace(/(.{2}).*(@.*)/, "$1***$2")
        : "Unknown";

      return {
        id: c.id,
        email: maskedEmail,
        date: c.createdAt.toISOString(),
        status: c.status,
        amount: commission,
        plan: c.planAtConversion || "free",
      };
    });

    for (const c of referral.conversions) {
      const commission = c.commissionUsd ?? getCommissionForPlan(c.planAtConversion);
      if (c.status === "converted") {
        pendingEarnings += commission;
      } else if (c.status === "paid") {
        paidEarnings += commission;
      }
    }

    // Round to 2 decimal places
    pendingEarnings = Math.round(pendingEarnings * 100) / 100;
    paidEarnings = Math.round(paidEarnings * 100) / 100;

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://openhelixai.com";

    return NextResponse.json({
      code: referral.code,
      referralUrl: `${baseUrl}/sign-up?ref=${referral.code}`,
      totalReferrals,
      conversions,
      pendingEarnings,
      paidEarnings,
      conversionsList,
    });
  } catch (error) {
    console.error("[Referrals API Error]:", error);
    return NextResponse.json(
      { error: "Failed to fetch referral data" },
      { status: 500 }
    );
  }
}
