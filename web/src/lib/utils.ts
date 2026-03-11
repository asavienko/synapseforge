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

export const PLANS = {
  free: { label: "Free", instances: 1, tier: "minimal" },
  pro: { label: "Pro", instances: 3, tier: "standard" },
  enterprise: { label: "Enterprise", instances: -1, tier: "pro" },
} as const;

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
