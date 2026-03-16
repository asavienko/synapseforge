import Stripe from "stripe";

let _stripe: Stripe | null = null;

export function getStripe(): Stripe {
  if (!_stripe) {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error("STRIPE_SECRET_KEY is not set");
    }
    _stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: "2026-02-25.clover",
      typescript: true,
    });
  }
  return _stripe;
}

// Convenience export — lazily resolved
export const stripe = new Proxy({} as Stripe, {
  get(_target, prop) {
    return (getStripe() as unknown as Record<string, unknown>)[prop as string];
  },
});

export const STRIPE_PLANS = {
  free: {
    priceId: "",
    name: "Free",
    amount: 0,
    features: ["1 AI instance", "Community support", "Basic integrations"],
  },
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
    name: "Pro",
    amount: 4900, // $49/mo in cents
    features: [
      "Up to 3 AI instances",
      "Dedicated human manager",
      "24h response time",
      "Weekly check-ins",
      "Custom configurations",
      "Telegram & WhatsApp integration",
      "99% uptime SLA",
    ],
  },
  enterprise: {
    priceId: process.env.STRIPE_ENTERPRISE_PRICE_ID ?? "",
    name: "Enterprise",
    amount: 29900, // $299/mo in cents
    features: [
      "Unlimited AI instances",
      "Dedicated manager team",
      "4h response SLA",
      "Custom integrations",
      "Team training",
      "Monthly strategy calls",
      "White-label option",
    ],
  },
} as const;

export type PlanKey = keyof typeof STRIPE_PLANS;

/**
 * Get the effective plan for a user based on their subscription status
 */
export function getUserPlan(
  userPlan: string | null | undefined,
  stripeSubscriptionStatus?: string | null,
  stripeCurrentPeriodEnd?: Date | null
): PlanKey {
  // If user has an active Stripe subscription, use that plan
  if (stripeSubscriptionStatus === "active" || stripeSubscriptionStatus === "trialing") {
    // Determine which plan based on stripeSubscriptionId or stored plan
    if (userPlan === "pro" || userPlan === "enterprise") {
      return userPlan as PlanKey;
    }
    // Default to pro if subscription exists but plan unclear
    return "pro";
  }

  // Otherwise use the stored plan (defaults to free)
  return (userPlan as PlanKey) || "free";
}