/**
 * Plan enforcement utilities.
 *
 * When a user's plan is downgraded (subscription canceled, expired, or unpaid)
 * their active instances may exceed the new plan's instance limit.
 *
 * These functions safely stop excess instances and return a summary so the
 * caller can notify the user.
 */

import { prisma } from "@/lib/prisma";
import { PLANS, PlanKey, mapLegacyPlan } from "@/lib/utils";

export interface EnforcementResult {
  /** User email (for notifications) */
  userEmail: string;
  userName: string;
  /** New plan they were downgraded to */
  newPlan: string;
  /** Number of instances allowed under the new plan */
  allowedInstances: number;
  /** Number of instances they had before enforcement */
  totalInstances: number;
  /** Instances that were stopped (name + id) */
  stoppedInstances: { id: string; name: string }[];
  /** Number of messages allowed under the new plan */
  allowedMessages: number;
  /** Support hours included in the new plan */
  supportHours: number;
}

/**
 * Enforces plan limits for a single user after a plan downgrade.
 *
 * - Finds all their instances, sorted by createdAt ascending (oldest first = kept).
 * - Stops (status → "stopped") any instances beyond the plan limit.
 * - Logs an ActivityLog entry for each stopped instance.
 * - Returns a summary for the caller to use in email notifications.
 */
export async function enforcePlanLimits(userId: string, newPlan: string): Promise<EnforcementResult | null> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      email: true,
      name: true,
      instances: {
        orderBy: { createdAt: "asc" }, // oldest first = most likely to keep
        select: { id: true, name: true, status: true },
      },
    },
  });

  if (!user) return null;

  // Map legacy plans to new plans
  const mappedPlanKey = mapLegacyPlan(newPlan);
  const plan = PLANS[mappedPlanKey] ?? PLANS.free;
  const limit = plan.instances; // -1 = unlimited

  const totalInstances = user.instances.length;
  const stoppedInstances: { id: string; name: string }[] = [];

  if (limit !== -1 && totalInstances > limit) {
    // Instances beyond the limit — stop them (keep the first `limit` running)
    const toStop = user.instances.slice(limit).filter((i) => i.status === "running");

    for (const inst of toStop) {
      await prisma.aIInstance.update({
        where: { id: inst.id },
        data: { status: "stopped" },
      });

      await prisma.activityLog.create({
        data: {
          instanceId: inst.id,
          event: "stopped",
          details: `Automatically stopped — plan downgraded to ${newPlan} (limit: ${limit} instance${limit !== 1 ? "s" : ""}).`,
        },
      });

      stoppedInstances.push({ id: inst.id, name: inst.name });
    }
  }

  return {
    userEmail: user.email,
    userName: user.name ?? user.email,
    newPlan,
    allowedInstances: limit,
    totalInstances,
    stoppedInstances,
    allowedMessages: plan.messages,
    supportHours: plan.supportHours,
  };
}

/**
 * Scans all users with expired Stripe subscriptions (stripeCurrentPeriodEnd < now)
 * whose plan is still set to a paid tier, and downgrades + enforces them.
 *
 * Used by the /api/internal/plan-enforcement cron job as a safety net
 * in case Stripe webhooks failed.
 *
 * Returns the list of users that were downgraded.
 */
export async function enforceExpiredSubscriptions(): Promise<EnforcementResult[]> {
  const now = new Date();

  // Find users who have a paid plan but their subscription period has expired
  // Include both new plan keys and legacy plan keys
  const paidPlans = [
    "starter_10k", "growth_30k", "scale_100k", "business_200k",
    "managed_starter", "managed_growth", "managed_scale",
    "pro", "enterprise" // legacy plans
  ];

  const expiredUsers = await prisma.user.findMany({
    where: {
      plan: { in: paidPlans },
      stripeCurrentPeriodEnd: { lt: now },
    },
    select: { id: true, plan: true },
  });

  const results: EnforcementResult[] = [];

  for (const user of expiredUsers) {
    // Downgrade to free
    await prisma.user.update({
      where: { id: user.id },
      data: {
        plan: "free",
        stripeSubscriptionId: null,
        stripePriceId: null,
        stripeCurrentPeriodEnd: null,
      },
    });

    const result = await enforcePlanLimits(user.id, "free");
    if (result) results.push(result);
  }

  return results;
}

/**
 * Check if user has exceeded their message limit
 */
export async function checkMessageLimit(userId: string, planKey: PlanKey): Promise<{
  allowed: boolean;
  currentCount: number;
  limit: number;
}> {
  const plan = PLANS[planKey] ?? PLANS.free;
  const limit = plan.messages;

  // Get message count for current month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const messageCount = await prisma.activityLog.count({
    where: {
      instance: { userId },
      event: "message",
      createdAt: { gte: startOfMonth },
    },
  });

  return {
    allowed: messageCount < limit,
    currentCount: messageCount,
    limit,
  };
}

/**
 * Get plan features for display
 */
export function getPlanFeatures(planKey: PlanKey): {
  messages: number;
  instances: number;
  supportHours: number;
  isManaged: boolean;
} {
  const mappedKey = mapLegacyPlan(planKey);
  const plan = PLANS[mappedKey] ?? PLANS.free;

  return {
    messages: plan.messages,
    instances: plan.instances,
    supportHours: plan.supportHours,
    isManaged: plan.supportHours > 0,
  };
}
