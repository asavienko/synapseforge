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
import { PLANS } from "@/lib/utils";

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

  const plan = PLANS[newPlan as keyof typeof PLANS] ?? PLANS.free;
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
  const expiredUsers = await prisma.user.findMany({
    where: {
      plan: { not: "free" },
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
