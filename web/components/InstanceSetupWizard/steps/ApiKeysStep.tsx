"use client";

import { useTranslations } from "next-intl";
import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";
import type { WizardState, LLMProvider } from "../types";
import { MODEL_OPTIONS } from "@/lib/openclaw-config";

interface ApiKeysStepProps {
  state: WizardState;
  updateState: (partial: Partial<WizardState>) => void;
  selectProvider: (provider: LLMProvider) => void;
}

export function ApiKeysStep({ state, updateState, selectProvider }: ApiKeysStepProps) {
  const t = useTranslations("instanceSetup");

  return (
    <div className="space-y-5">
      <div>
        <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-3">{t("provider.title")}</label>
        <div className="grid grid-cols-3 gap-3">
          {(["openai", "anthropic", "openrouter"] as LLMProvider[]).map((provider) => (
            <button
              key={provider}
              onClick={() => selectProvider(provider)}
              className={cn(
                "p-3 rounded-xl border text-sm font-medium transition-colors capitalize",
                state.llmProvider === provider
                  ? "border-violet-500 bg-violet-500/10 text-white"
                  : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20"
              )}
            >
              {provider}
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">{t("provider.apiKey")}</label>
        <input
          type="password"
          value={state.apiKey}
          onChange={(e) => updateState({ apiKey: e.target.value })}
          placeholder={state.llmProvider === "openai" ? "sk-..." : state.llmProvider === "anthropic" ? "sk-ant-..." : "sk-or-..."}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
        />
      </div>
      <div>
        <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">{t("provider.model")}</label>
        <select
          value={state.model}
          onChange={(e) => updateState({ model: e.target.value })}
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 transition-colors"
        >
          {(MODEL_OPTIONS as Record<string, { value: string; label: string }[]>)[state.llmProvider]?.map((m: { value: string; label: string }) => (
            <option key={m.value} value={m.value} className="bg-zinc-900">{m.label}</option>
          ))}
        </select>
      </div>
      <div className="flex items-start gap-2 p-3 rounded-xl bg-blue-500/10 border border-blue-500/20">
        <Zap className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-300">
          <span className="font-semibold">{t("provider.secureNote")}</span>{" "}
          {t("provider.billedDirectly")}
        </div>
      </div>
    </div>
  );
}
