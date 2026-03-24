"use client";

import { useTranslations } from "next-intl";
import { MessageSquare, Hash, Bot } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WizardState } from "../types";

interface ChannelsStepProps {
  state: WizardState;
  updateState: (partial: Partial<WizardState>) => void;
}

export function ChannelsStep({ state, updateState }: ChannelsStepProps) {
  const t = useTranslations("instanceSetup");

  return (
    <div className="space-y-4">
      <div>
        <div className="text-sm font-semibold text-white mb-1">{t("channels.title")}</div>
        <div className="text-xs text-zinc-500">{t("channels.subtitle")}</div>
      </div>

      {/* Telegram */}
      <div className={cn("rounded-xl border p-4 transition-colors", state.telegramEnabled ? "border-violet-500/50 bg-violet-500/5" : "border-white/10 bg-white/[0.02]")}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-blue-400" />
            <span className="text-sm font-medium text-white">{t("channels.telegram")}</span>
          </div>
          <button
            onClick={() => updateState({ telegramEnabled: !state.telegramEnabled })}
            className={cn(
              "w-10 h-5 rounded-full transition-colors relative",
              state.telegramEnabled ? "bg-violet-600" : "bg-white/10"
            )}
          >
            <div className={cn("w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all", state.telegramEnabled ? "right-0.5" : "left-0.5")} />
          </button>
        </div>
        {state.telegramEnabled && (
          <div className="space-y-2">
            <input
              type="password"
              value={state.telegramToken}
              onChange={(e) => updateState({ telegramToken: e.target.value })}
              placeholder={t("channels.botToken")}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
            />
            <p className="text-xs text-zinc-500">{t("channels.telegramHelp")}</p>
          </div>
        )}
      </div>

      {/* Discord */}
      <div className={cn("rounded-xl border p-4 transition-colors", state.discordEnabled ? "border-violet-500/50 bg-violet-500/5" : "border-white/10 bg-white/[0.02]")}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Hash className="w-4 h-4 text-indigo-400" />
            <span className="text-sm font-medium text-white">{t("channels.discord")}</span>
          </div>
          <button
            onClick={() => updateState({ discordEnabled: !state.discordEnabled })}
            className={cn(
              "w-10 h-5 rounded-full transition-colors relative",
              state.discordEnabled ? "bg-violet-600" : "bg-white/10"
            )}
          >
            <div className={cn("w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all", state.discordEnabled ? "right-0.5" : "left-0.5")} />
          </button>
        </div>
        {state.discordEnabled && (
          <div className="space-y-2">
            <input
              type="password"
              value={state.discordToken}
              onChange={(e) => updateState({ discordToken: e.target.value })}
              placeholder={t("channels.botToken")}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
            />
            <p className="text-xs text-zinc-500">{t("channels.discordHelp")}</p>
          </div>
        )}
      </div>

      {/* Slack */}
      <div className={cn("rounded-xl border p-4 transition-colors", state.slackEnabled ? "border-violet-500/50 bg-violet-500/5" : "border-white/10 bg-white/[0.02]")}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-green-400" />
            <span className="text-sm font-medium text-white">{t("channels.slack")}</span>
          </div>
          <button
            onClick={() => updateState({ slackEnabled: !state.slackEnabled })}
            className={cn(
              "w-10 h-5 rounded-full transition-colors relative",
              state.slackEnabled ? "bg-violet-600" : "bg-white/10"
            )}
          >
            <div className={cn("w-4 h-4 rounded-full bg-white absolute top-0.5 transition-all", state.slackEnabled ? "right-0.5" : "left-0.5")} />
          </button>
        </div>
        {state.slackEnabled && (
          <div className="space-y-2">
            <input
              type="password"
              value={state.slackAppToken}
              onChange={(e) => updateState({ slackAppToken: e.target.value })}
              placeholder={t("channels.slackAppToken")}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
            />
            <input
              type="password"
              value={state.slackBotToken}
              onChange={(e) => updateState({ slackBotToken: e.target.value })}
              placeholder={t("channels.slackBotToken")}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
            />
            <p className="text-xs text-zinc-500">{t("channels.slackHelp")}</p>
          </div>
        )}
      </div>
    </div>
  );
}
