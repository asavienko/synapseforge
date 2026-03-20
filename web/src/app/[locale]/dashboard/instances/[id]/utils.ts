// utils.ts - Helper functions for the instance detail page

import { LogRow } from "./types";

export function formatAbsoluteTime(date: string | Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
}

export function groupLogsByDay(
  logs: LogRow[]
): Array<{ label: string; logs: LogRow[] }> {
  const groups: Map<string, LogRow[]> = new Map();
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  for (const log of logs) {
    const d = new Date(log.createdAt);
    let key: string;
    if (d.toDateString() === today.toDateString()) key = "Today";
    else if (d.toDateString() === yesterday.toDateString()) key = "Yesterday";
    else
      key = new Intl.DateTimeFormat("en-US", {
        month: "short",
        day: "numeric",
      }).format(d);

    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(log);
  }
  return Array.from(groups.entries()).map(([label, logs]) => ({
    label,
    logs,
  }));
}

export const LOG_ICONS: Record<string, { icon: string; color: string }> = {
  started: { icon: "▶️", color: "text-emerald-400" },
  stopped: { icon: "⏹️", color: "text-zinc-400" },
  config_changed: { icon: "⚙️", color: "text-blue-400" },
  key_generated: { icon: "🔑", color: "text-violet-400" },
  key_revoked: { icon: "❌", color: "text-red-400" },
  created: { icon: "🆕", color: "text-violet-400" },
  deleted: { icon: "❌", color: "text-red-400" },
  chat_message: { icon: "💬", color: "text-sky-400" },
  config_synced: { icon: "🔄", color: "text-blue-400" },
  health_check: { icon: "💓", color: "text-rose-400" },
  provision_start: { icon: "⚙️", color: "text-amber-400" },
  provision_done: { icon: "⚙️", color: "text-emerald-400" },
  provision_failed: { icon: "❌", color: "text-red-400" },
  error: { icon: "❌", color: "text-red-400" },
};

export const PROVIDER_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; border: string }
> = {
  openai: {
    label: "OpenAI",
    color: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
  },
  anthropic: {
    label: "Anthropic",
    color: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
  },
  openrouter: {
    label: "OpenRouter",
    color: "text-violet-400",
    bg: "bg-violet-500/10",
    border: "border-violet-500/20",
  },
};

export const CREDENTIAL_KEY_LABELS: Record<string, string> = {
  openai_api_key: "OpenAI API Key",
  anthropic_api_key: "Anthropic API Key",
  openrouter_api_key: "OpenRouter API Key",
  telegram_bot_token: "Telegram Bot Token",
  discord_bot_token: "Discord Bot Token",
  slack_app_token: "Slack App Token",
  slack_bot_token: "Slack Bot Token",
  gateway_token: "Gateway Token",
};

export const LLM_CRED_KEYS = [
  "openai_api_key",
  "anthropic_api_key",
  "openrouter_api_key",
];
