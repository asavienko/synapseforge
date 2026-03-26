"use client";

import { useTranslations } from "next-intl";
import type { WizardState } from "../types";

interface PersonaStepProps {
  state: WizardState;
  updateState: (partial: Partial<WizardState>) => void;
}

export function PersonaStep({ state, updateState }: PersonaStepProps) {
  const t = useTranslations("instanceSetup");

  return (
    <div className="space-y-5">
      <div className="text-sm font-semibold text-white">{t("persona.title")}</div>
      <div>
        <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">{t("persona.systemPrompt")}</label>
        <textarea
          value={state.systemPrompt}
          onChange={(e) => updateState({ systemPrompt: e.target.value })}
          rows={6}
          className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-zinc-600 focus:outline-none focus:border-blue-500 transition-colors resize-none"
        />
      </div>
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs text-zinc-500 uppercase tracking-wider">{t("persona.temperature")}</label>
          <span className="text-sm font-mono text-blue-600 dark:text-blue-300">{state.temperature.toFixed(1)}</span>
        </div>
        <input
          type="range" min="0" max="1" step="0.1" value={state.temperature}
          onChange={(e) => updateState({ temperature: parseFloat(e.target.value) })}
          className="w-full accent-blue-500"
        />
        <p className="text-xs text-zinc-600 mt-1">{t("persona.temperatureHelp")}</p>
      </div>
      <div>
        <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">{t("persona.maxTokens")}</label>
        <input
          type="number" value={state.maxTokens} min={64} max={32768} step={64}
          onChange={(e) => updateState({ maxTokens: parseInt(e.target.value) || 1024 })}
          className="w-full bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500 transition-colors"
        />
      </div>
    </div>
  );
}
