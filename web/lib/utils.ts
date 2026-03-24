import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

// Updated PLANS constant to match new pricing structure
// Self-Service Plans:
// - free: 1 instance, 2,000 messages
// - starter_10k: 3 instances, 10,000 messages
// - growth_30k: 3 instances, 30,000 messages
// - scale_100k: 5 instances, 100,000 messages
// - business_200k: 10 instances, 200,000 messages
// Managed Plans:
// - managed_starter: 3 instances, 10,000 messages, 4h support
// - managed_growth: 3 instances, 30,000 messages, 8h support
// - managed_scale: 5 instances, 100,000 messages, 18h support
// Legacy Plans (for backward compatibility):
// - pro: 3 instances (maps to starter_10k)
// - enterprise: unlimited instances (maps to scale_100k)
export const PLANS = {
  free: { label: "Free", instances: 1, messages: 2000, supportHours: 0, tier: "minimal" },
  // Self-Service Plans
  starter_10k: { label: "Starter", instances: 3, messages: 10000, supportHours: 0, tier: "standard" },
  growth_30k: { label: "Growth", instances: 3, messages: 30000, supportHours: 0, tier: "standard" },
  scale_100k: { label: "Scale", instances: 5, messages: 100000, supportHours: 0, tier: "pro" },
  business_200k: { label: "Business", instances: 10, messages: 200000, supportHours: 0, tier: "pro" },
  // Managed Plans
  managed_starter: { label: "Managed Starter", instances: 3, messages: 10000, supportHours: 4, tier: "managed" },
  managed_growth: { label: "Managed Growth", instances: 3, messages: 30000, supportHours: 8, tier: "managed" },
  managed_scale: { label: "Managed Scale", instances: 5, messages: 100000, supportHours: 18, tier: "managed" },
  // Legacy plans for backward compatibility
  pro: { label: "Pro (Legacy)", instances: 3, messages: 10000, supportHours: 0, tier: "standard" },
  enterprise: { label: "Enterprise (Legacy)", instances: -1, messages: 100000, supportHours: 0, tier: "pro" },
} as const;

export type PlanKey = keyof typeof PLANS;

/**
 * Get plan details by key
 */
export function getPlanDetails(planKey: PlanKey) {
  return PLANS[planKey] ?? PLANS.free;
}

/**
 * Check if a plan is a managed plan (includes human support hours)
 */
export function isManagedPlan(planKey: PlanKey): boolean {
  return planKey.startsWith("managed_");
}

/**
 * Check if a plan is a self-service plan (no human support)
 */
export function isSelfServicePlan(planKey: PlanKey): boolean {
  return !isManagedPlan(planKey);
}

/**
 * Get instance limit for a plan
 * Returns -1 for unlimited
 */
export function getInstanceLimit(planKey: PlanKey): number {
  return PLANS[planKey]?.instances ?? 1;
}

/**
 * Get message limit for a plan
 */
export function getMessageLimit(planKey: PlanKey): number {
  return PLANS[planKey]?.messages ?? 2000;
}

/**
 * Get support hours for a plan
 */
export function getSupportHours(planKey: PlanKey): number {
  return PLANS[planKey]?.supportHours ?? 0;
}

/**
 * Map legacy plan keys to new plan keys
 */
export function mapLegacyPlan(plan: string): PlanKey {
  switch (plan) {
    case "pro":
      return "starter_10k";
    case "enterprise":
      return "scale_100k";
    default:
      if (plan in PLANS) {
        return plan as PlanKey;
      }
      return "free";
  }
}

export const INSTANCE_TYPES = [
  { value: "assistant", label: "AI Assistant" },
  { value: "analyst", label: "Data Analyst" },
  { value: "support", label: "Support Agent" },
  { value: "custom", label: "Custom" },
] as const;

export const STATUS_COLORS: Record<string, string> = {
  running: "text-emerald-400 bg-emerald-400/10",
  stopped: "text-zinc-400 bg-zinc-400/10",
  pending: "text-yellow-400 bg-yellow-400/10",
  error: "text-red-400 bg-red-400/10",
};

export function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return "Never";
  const now = Date.now();
  const then = new Date(date).getTime();
  const diffMs = now - then;
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) return `${diffSec}s ago`;
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? "" : "s"} ago`;
  const diffHr = Math.floor(diffMin / 60);
  if (diffHr < 24) return `${diffHr} hour${diffHr === 1 ? "" : "s"} ago`;
  const diffDay = Math.floor(diffHr / 24);
  return `${diffDay} day${diffDay === 1 ? "" : "s"} ago`;
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString("en-US");
}

/**
 * Format price from cents to dollars
 */
export function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}`;
}

/**
 * Format price with monthly period
 */
export function formatMonthlyPrice(cents: number): string {
  return `$${(cents / 100).toFixed(0)}/mo`;
}
