"use client";

import { cn } from "@/lib/utils";
import type { AgentTemplate, WizardState } from "../types";
import { AGENT_TEMPLATES, TEMPLATE_COLOR_IDLE, TEMPLATE_COLOR_ACTIVE } from "../hooks/useWizardState";

interface BasicInfoStepProps {
  state: WizardState;
  updateState: (partial: Partial<WizardState>) => void;
  selectAgentTemplate: (tpl: typeof AGENT_TEMPLATES[0]) => void;
}

export function BasicInfoStep({ state, updateState, selectAgentTemplate }: BasicInfoStepProps) {
  return (
    <div className="space-y-5">
      {/* Gallery */}
      <div>
        <div className="text-sm font-semibold text-white mb-1">Choose a template</div>
        <p className="text-xs text-zinc-500 mb-4">Pick one to pre-fill your agent — you can customise everything afterwards.</p>
        <div className="grid grid-cols-2 gap-3">
          {AGENT_TEMPLATES.map((tpl) => {
            const active = state.agentTemplateId === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => selectAgentTemplate(tpl)}
                className={cn(
                  "p-4 rounded-xl border text-left transition-all",
                  active ? TEMPLATE_COLOR_ACTIVE[tpl.color] : TEMPLATE_COLOR_IDLE[tpl.color]
                )}
              >
                <div className="text-2xl mb-2">{tpl.emoji}</div>
                <div className="text-sm font-semibold text-white">{tpl.name}</div>
                <div className="text-xs text-zinc-400 mt-1 line-clamp-2">{tpl.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Name field — shown after selecting a template */}
      {state.agentTemplateId && (
        <div>
          <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Instance Name</label>
          <input
            type="text"
            value={state.name}
            onChange={(e) => updateState({ name: e.target.value })}
            placeholder="My Support Bot"
            autoFocus
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
          />
        </div>
      )}
    </div>
  );
}
