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
  pro: { label: "Pro", instances: 5, tier: "standard" },
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
