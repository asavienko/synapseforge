"use client";

import { useTranslations } from "next-intl";
import { Check, Copy } from "lucide-react";
import { cn } from "@/lib/utils";
import { maskValue } from "@/lib/crypto";
import { generateOpenClawConfig, type CredentialMap, type InstanceConfig } from "@/lib/openclaw-config";
import type { WizardState } from "../types";
import { AGENT_TEMPLATES } from "../hooks/useWizardState";

interface DeployStepProps {
  state: WizardState;
  updateState: (partial: Partial<WizardState>) => void;
  configPreview: string;
  copied: boolean;
  error: string;
  copyConfig: () => void;
}

export function DeployStep({ state, updateState, configPreview, copied, error, copyConfig }: DeployStepProps) {
  const t = useTranslations("instanceSetup");

  return (
    <div className="space-y-5">
      <div className="text-sm font-semibold text-white">{t("deploy.title")}</div>

      {/* Summary */}
      <div className="bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl p-4 space-y-2 text-sm">
        <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">{t("deploy.summary")}</div>
        {[
          { label: "Name", value: state.name },
          { label: "Model", value: state.model },
          { label: "Template", value: AGENT_TEMPLATES.find((t) => t.id === state.agentTemplateId)?.name ?? t(`templates.${state.template}`) },
          {
            label: "Channels",
            value: [
              state.telegramEnabled && "Telegram",
              state.discordEnabled && "Discord",
              state.slackEnabled && "Slack",
            ].filter(Boolean).join(", ") || "None"
          },
        ].map((f) => (
          <div key={f.label} className="flex flex-col sm:flex-row sm:gap-3">
            <span className="text-zinc-500 w-full sm:w-20 shrink-0 text-xs sm:text-sm">{f.label}</span>
            <span className="text-zinc-200 text-sm sm:text-base break-words">{f.value}</span>
          </div>
        ))}
      </div>

      {/* Config preview */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">{t("deploy.configPreview")}</span>
          <button
            onClick={copyConfig}
            className="flex items-center gap-1.5 text-xs text-blue-600 dark:text-blue-400 hover:text-blue-300 bg-blue-500/10 px-2 py-1 rounded-lg transition-colors"
          >
            {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
            {copied ? t("deploy.copied") : t("deploy.copyConfig")}
          </button>
        </div>
        <pre className="bg-black/40 border border-gray-200 dark:border-white/10 rounded-xl p-4 text-xs text-zinc-300 overflow-x-auto max-h-48 font-mono">
          {configPreview}
        </pre>
      </div>

      {/* Deploy mode */}
      <div>
        <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-3">Deployment</label>
        <div className="space-y-2">
          {[
            { value: "hetzner" as const, label: t("deploy.deployHetzner"), desc: "~€5/mo, auto-configured" },
            { value: "manual" as const, label: t("deploy.deployManual"), desc: "Download and run yourself" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => updateState({ deployMode: opt.value })}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-colors",
                state.deployMode === opt.value
                  ? "border-blue-500 bg-blue-500/10"
                  : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] hover:border-white/20"
              )}
            >
              <div className={cn(
                "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                state.deployMode === opt.value ? "border-blue-500" : "border-zinc-600"
              )}>
                {state.deployMode === opt.value && <div className="w-2 h-2 rounded-full bg-blue-500" />}
              </div>
              <div>
                <div className="text-sm font-medium text-white">{opt.label}</div>
                <div className="text-xs text-zinc-500">{opt.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
          {error}
        </div>
      )}
    </div>
  );
}

// Helper function to generate config preview - used by the main component
export function generateConfigPreview(state: WizardState): string {
  const apiKeyField = state.llmProvider === "openai"
    ? "openai_api_key"
    : state.llmProvider === "anthropic"
    ? "anthropic_api_key"
    : "openrouter_api_key";

  const maskedKey = state.apiKey ? maskValue(state.apiKey) : "sk-••••••••";

  const creds: CredentialMap = {
    gateway_token: "gw-••••••••",
    ...(state.apiKey ? { [apiKeyField]: maskedKey } : {}),
    ...(state.telegramEnabled && state.telegramToken ? { telegram_bot_token: maskValue(state.telegramToken) } : {}),
    ...(state.discordEnabled && state.discordToken ? { discord_bot_token: maskValue(state.discordToken) } : {}),
    ...(state.slackEnabled && state.slackAppToken ? { slack_app_token: maskValue(state.slackAppToken) } : {}),
    ...(state.slackEnabled && state.slackBotToken ? { slack_bot_token: maskValue(state.slackBotToken) } : {}),
  };

  const config: InstanceConfig = {
    model: state.model,
    systemPrompt: state.systemPrompt,
    temperature: state.temperature,
    maxTokens: state.maxTokens,
    template: state.template,
  };

  try {
    return generateOpenClawConfig(config, creds);
  } catch {
    return "// Error generating config preview";
  }
}
