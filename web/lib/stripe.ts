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

// New pricing model:
// Self-Service Plans (AI Manager only):
// - free: 2,000 messages/month, 1 instance
// - starter_10k: $50, 10,000 messages/month, 3 instances
// - growth_30k: $100, 30,000 messages/month, 3 instances
// - scale_100k: $200, 100,000 messages/month, 5 instances
// - business_200k: $300, 200,000 messages/month, 10 instances
// Managed Plans (Human Support):
// - managed_starter: $300, 10,000 messages + 4 hours support/month
// - managed_growth: $500, 30,000 messages + 8 hours support/month
// - managed_scale: $1000, 100,000 messages + 18 hours support/month
export const STRIPE_PLANS = {
  free: {
    priceId: "",
    name: "Free",
    amount: 0,
    messages: 2000,
    instances: 1,
    supportHours: 0,
    features: ["2,000 messages/month", "1 AI instance", "Community support", "Basic integrations"],
  },
  // Self-Service Plans
  starter_10k: {
    priceId: process.env.STRIPE_STARTER_10K_PRICE_ID ?? "",
    name: "Starter",
    amount: 5000, // $50/mo in cents
    messages: 10000,
    instances: 3,
    supportHours: 0,
    features: [
      "10,000 messages/month",
      "Up to 3 AI instances",
      "AI Manager (self-service)",
      "Telegram & WhatsApp integration",
      "99% uptime SLA",
    ],
  },
  growth_30k: {
    priceId: process.env.STRIPE_GROWTH_30K_PRICE_ID ?? "",
    name: "Growth",
    amount: 10000, // $100/mo in cents
    messages: 30000,
    instances: 3,
    supportHours: 0,
    features: [
      "30,000 messages/month",
      "Up to 3 AI instances",
      "AI Manager (self-service)",
      "Telegram & WhatsApp integration",
      "99% uptime SLA",
    ],
  },
  scale_100k: {
    priceId: process.env.STRIPE_SCALE_100K_PRICE_ID ?? "",
    name: "Scale",
    amount: 20000, // $200/mo in cents
    messages: 100000,
    instances: 5,
    supportHours: 0,
    features: [
      "100,000 messages/month",
      "Up to 5 AI instances",
      "AI Manager (self-service)",
      "Telegram & WhatsApp integration",
      "Priority API access",
      "99.9% uptime SLA",
    ],
  },
  business_200k: {
    priceId: process.env.STRIPE_BUSINESS_200K_PRICE_ID ?? "",
    name: "Business",
    amount: 30000, // $300/mo in cents
    messages: 200000,
    instances: 10,
    supportHours: 0,
    features: [
      "200,000 messages/month",
      "Up to 10 AI instances",
      "AI Manager (self-service)",
      "Telegram & WhatsApp integration",
      "Priority API access",
      "Custom configurations",
      "99.9% uptime SLA",
    ],
  },
  // Managed Plans (with Human Support)
  managed_starter: {
    priceId: process.env.STRIPE_MANAGED_STARTER_PRICE_ID ?? "",
    name: "Managed Starter",
    amount: 30000, // $300/mo in cents
    messages: 10000,
    instances: 3,
    supportHours: 4,
    features: [
      "10,000 messages/month",
      "Up to 3 AI instances",
      "4 hours human support/month",
      "Dedicated human manager",
      "Telegram & WhatsApp integration",
      "Custom configurations",
      "99.9% uptime SLA",
    ],
  },
  managed_growth: {
    priceId: process.env.STRIPE_MANAGED_GROWTH_PRICE_ID ?? "",
    name: "Managed Growth",
    amount: 50000, // $500/mo in cents
    messages: 30000,
    instances: 3,
    supportHours: 8,
    features: [
      "30,000 messages/month",
      "Up to 3 AI instances",
      "8 hours human support/month",
      "Dedicated human manager",
      "Weekly check-ins",
      "Telegram & WhatsApp integration",
      "Custom configurations",
      "99.9% uptime SLA",
    ],
  },
  managed_scale: {
    priceId: process.env.STRIPE_MANAGED_SCALE_PRICE_ID ?? "",
    name: "Managed Scale",
    amount: 100000, // $1000/mo in cents
    messages: 100000,
    instances: 5,
    supportHours: 18,
    features: [
      "100,000 messages/month",
      "Up to 5 AI instances",
      "18 hours human support/month",
      "Dedicated human manager",
      "Weekly check-ins",
      "Telegram & WhatsApp integration",
      "Custom integrations",
      "Team training",
      "99.9% uptime SLA",
    ],
  },
  // Legacy plans for backward compatibility
  pro: {
    priceId: process.env.STRIPE_PRO_PRICE_ID ?? "",
    name: "Pro (Legacy)",
    amount: 4900, // $49/mo in cents
    messages: 10000,
    instances: 3,
    supportHours: 0,
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
    name: "Enterprise (Legacy)",
    amount: 29900, // $299/mo in cents
    messages: 100000,
    instances: -1, // unlimited
    supportHours: 0,
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

// Helper to get plan details
export function getPlanDetails(planKey: PlanKey) {
  return STRIPE_PLANS[planKey] ?? STRIPE_PLANS.free;
}

// Support hours add-on pricing
export const SUPPORT_ADDON = {
  pricePerHour: 10000, // $100/hour in cents
  bundledPricePerHour: 5000, // $50/hour when bundled with managed plans
} as const;

/**
 * Maps legacy plans to new plans for backward compatibility
 */
export function mapLegacyPlan(plan: string): PlanKey {
  switch (plan) {
    case "pro":
      return "starter_10k"; // Pro maps to Starter
    case "enterprise":
      return "scale_100k"; // Enterprise maps to Scale
    default:
      return (plan as PlanKey) || "free";
  }
}

/**
 * Get the effective plan for a user based on their subscription status
 */
export function getUserPlan(
  userPlan: string | null | undefined,
  stripeSubscriptionStatus?: string | null,
  stripeCurrentPeriodEnd?: Date | null
): PlanKey {
  // Check if subscription period has ended
  const now = new Date();
  const hasValidPeriod = !stripeCurrentPeriodEnd || stripeCurrentPeriodEnd > now;

  // If user has an active Stripe subscription with a valid period, use that plan
  if (hasValidPeriod && (stripeSubscriptionStatus === "active" || stripeSubscriptionStatus === "trialing")) {
    // Map legacy plans to new plans
    const mappedPlan = mapLegacyPlan(userPlan ?? "");
    if (STRIPE_PLANS[mappedPlan]) {
      return mappedPlan;
    }
    // Default to free if plan not found
    return "free";
  }

  // Otherwise use the stored plan (with legacy mapping)
  return mapLegacyPlan(userPlan ?? "") || "free";
}

/**
 * Check if a plan is a managed plan (includes human support)
 */
export function isManagedPlan(planKey: PlanKey): boolean {
  return planKey.startsWith("managed_");
}

/**
 * Get all self-service plans
 */
export function getSelfServicePlans(): PlanKey[] {
  return ["free", "starter_10k", "growth_30k", "scale_100k", "business_200k"];
}

/**
 * Get all managed plans
 */
export function getManagedPlans(): PlanKey[] {
  return ["managed_starter", "managed_growth", "managed_scale"];
}
