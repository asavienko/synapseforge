"use client";

import { useState } from "react";
import { Zap, X } from "lucide-react";
import { Instance, CredentialRow } from "../types";

interface SetupChecklistCardProps {
  instance: Instance;
  credentials: CredentialRow[];
  onGoToCredentials: () => void;
  instanceId: string;
}

export function SetupChecklistCard({ instance, credentials, onGoToCredentials, instanceId }: SetupChecklistCardProps) {
  const [dismissed, setDismissed] = useState(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(`sf_checklist_dismissed_${instanceId}`) === "1";
  });

  const credKeys = credentials.map((c) => c.key);
  const hasLLMKey = credKeys.some((k) => ["openai_api_key", "anthropic_api_key", "openrouter_api_key"].includes(k));
  const hasChannel = credKeys.some((k) => ["telegram_bot_token", "discord_bot_token", "slack_app_token", "slack_bot_token", "whatsapp_business_token"].includes(k));
  const llmReady = hasLLMKey || (instance.sandboxMode === true);

  const allGreen = llmReady && hasChannel;

  function dismiss() {
    localStorage.setItem(`sf_checklist_dismissed_${instanceId}`, "1");
    setDismissed(true);
  }

  if (dismissed) return null;

  if (allGreen) {
    return (
      <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/20 p-4 mb-4 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center shrink-0 text-emerald-400 text-base">🎉</div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-emerald-300">Your agent is live!</p>
          <p className="text-xs text-emerald-400/70 mt-0.5">Messages from your connected channel will be answered by your AI agent.</p>
        </div>
        <button onClick={dismiss} className="text-emerald-600 hover:text-emerald-400 transition-colors shrink-0">
          <X className="w-4 h-4" />
        </button>
      </div>
    );
  }

  const items = [
    {
      done: llmReady,
      label: "AI Model",
      doneText: hasLLMKey ? "API key saved" : `Sandbox active (${instance.sandboxUsed ?? 0}/${20} messages used)`,
      pendingText: "Add your OpenAI / Anthropic / OpenRouter key",
      action: onGoToCredentials,
      actionLabel: "Add key →",
    },
    {
      done: hasChannel,
      label: "Channel",
      doneText: "Channel connected — your agent is receiving messages",
      pendingText: "Connect Telegram, WhatsApp, or Discord",
      action: onGoToCredentials,
      actionLabel: "Connect →",
    },
  ];

  return (
    <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden mb-4">
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-violet-400" />
          <h3 className="text-sm font-semibold text-white">Get your agent live</h3>
          <span className="text-xs text-zinc-500">
            {items.filter((i) => i.done).length}/{items.length} complete
          </span>
        </div>
        <button onClick={dismiss} title="Dismiss" className="text-zinc-600 hover:text-zinc-400 transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="divide-y divide-white/5">
        {items.map((item) => (
          <div key={item.label} className="flex items-center gap-3 px-4 py-3">
            <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
              item.done
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-amber-500/10 text-amber-500 border border-amber-500/20"
            }`}>
              {item.done ? "✓" : "·"}
            </div>
            <div className="flex-1 min-w-0">
              <span className="text-sm text-zinc-300">{item.label}</span>
              <span className={`text-xs ml-2 ${item.done ? "text-emerald-500" : "text-amber-500/80"}`}>
                — {item.done ? item.doneText : item.pendingText}
              </span>
            </div>
            {!item.done && item.action && (
              <button
                onClick={item.action}
                className="text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 px-2 py-1 rounded-lg transition-colors shrink-0"
              >
                {item.actionLabel}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
