import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { email as emailService } from "@/lib/email";

// Plan pricing (monthly USD) for commission calculation
const PLAN_PRICE: Record<string, number> = {
  pro: 49,
  enterprise: 149,
};

/**
 * POST /api/referral/track
 * Called from Stripe webhook when a referred user upgrades.
 * Body: { userId, plan, amountUsd? }
 */
export async function POST(req: NextRequest) {
  // Validate internal key
  const apiKey = req.headers.get("x-api-key");
  if (apiKey !== process.env.INTERNAL_API_KEY) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { userId, plan, amountUsd } = body as {
    userId: string;
    plan: string;
    amountUsd?: number;
  };

  if (!userId || !plan) {
    return NextResponse.json({ error: "userId and plan required" }, { status: 400 });
  }

  // Find conversion record for this user
  const conversion = await prisma.referralConversion.findUnique({
    where: { referredUserId: userId },
    include: {
      referral: {
        include: {
          referrer: { select: { id: true, name: true, email: true } },
        },
      },
      referredUser: { select: { name: true, email: true } },
    },
  });

  if (!conversion) {
    return NextResponse.json({ ok: false, message: "No referral conversion found for this user" });
  }

  if (conversion.status !== "pending") {
    return NextResponse.json({ ok: false, message: "Conversion already processed" });
  }

  const price = amountUsd ?? PLAN_PRICE[plan] ?? 0;
  const commissionUsd = Math.round(price * 0.1 * 100) / 100; // 10%

  await prisma.referralConversion.update({
    where: { id: conversion.id },
    data: {
      status: "converted",
      planAtConversion: plan,
      commissionUsd,
      convertedAt: new Date(),
    },
  });

  // Send email to referrer
  const referrer = conversion.referral.referrer;
  const referredName = conversion.referredUser.name ?? "Someone";
  emailService
    .referralConverted(referrer.email, referrer.name ?? "there", referredName, commissionUsd)
    .catch(console.error);

  return NextResponse.json({ ok: true, commissionUsd });
}
