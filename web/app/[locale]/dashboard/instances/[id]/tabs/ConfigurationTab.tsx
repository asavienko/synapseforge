"use client";

import { useState, useRef, useEffect } from "react";
import { Settings2, Loader2, Send, AlertCircle, RotateCcw } from "lucide-react";
import { useTranslations } from "next-intl";
import { AGENT_TEMPLATES } from "@/lib/agent-templates";
import { ConfigImportExport } from "@/components/ConfigImportExport";
import { Instance, Config } from "../types";

interface ConfigurationTabProps {
  instance: Instance;
  id: string;
  config: Config;
  setConfig: React.Dispatch<React.SetStateAction<Config>>;
  configDirty: boolean;
  setConfigDirty: React.Dispatch<React.SetStateAction<boolean>>;
  savingConfig: boolean;
  saveConfig: () => Promise<void>;
  showToast: (text: string, type?: "success" | "error") => void;
}

export function ConfigurationTab({
  instance,
  id,
  config,
  setConfig,
  configDirty,
  setConfigDirty,
  savingConfig,
  saveConfig,
  showToast,
}: ConfigurationTabProps) {
  const t = useTranslations("instanceDetail");
  const [showAdvancedConfig, setShowAdvancedConfig] = useState(false);
  const [previewInput, setPreviewInput] = useState("");
  const [previewMessages, setPreviewMessages] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);
  const [previewLoading, setPreviewLoading] = useState(false);
  const previewEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => previewEndRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }, [previewMessages, previewLoading]);

  async function sendPreviewMessage() {
    const text = previewInput.trim();
    if (!text || previewLoading) return;
    const userMsg = { role: "user" as const, content: text };
    const history = [...previewMessages, userMsg];
    setPreviewMessages(history);
    setPreviewInput("");
    setPreviewLoading(true);
    const placeholderId = `preview-${Date.now()}`;
    setPreviewMessages((prev) => [...prev, { role: "assistant", content: "", id: placeholderId } as never]);
    try {
      const res = await fetch(`/api/instances/${instance.id}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        setPreviewMessages((prev) => prev.map((m) =>
          (m as { id?: string }).id === placeholderId
            ? { role: "assistant", content: err.error ?? "Something went wrong" }
            : m
        ));
      } else {
        const reader = res.body?.getReader();
        const decoder = new TextDecoder();
        let full = "";
        if (reader) {
          while (true) {
            const { done, value } = await reader.read();
            if (done) break;
            full += decoder.decode(value, { stream: true });
            setPreviewMessages((prev) => prev.map((m) =>
              (m as { id?: string }).id === placeholderId ? { role: "assistant", content: full } : m
            ));
          }
          reader.releaseLock();
        }
        setPreviewMessages((prev) => prev.map((m) =>
          (m as { id?: string }).id === placeholderId ? { role: "assistant" as const, content: full } : m
        ));
      }
    } catch {
      setPreviewMessages((prev) => prev.map((m) =>
        (m as { id?: string }).id === placeholderId
          ? { role: "assistant", content: "Something went wrong" }
          : m
      ));
    } finally {
      setPreviewLoading(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Template Picker */}
      <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white">{t("config.templateTitle")}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{t("config.templateDesc")}</p>
        </div>
        <div className="p-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {AGENT_TEMPLATES.map((tmpl) => (
            <button
              key={tmpl.id}
              onClick={() => {
                setConfig(prev => ({
                  ...prev,
                  agentName: tmpl.defaultAgentName ?? prev.agentName,
                  systemPrompt: tmpl.systemPrompt ?? prev.systemPrompt,
                }));
                setConfigDirty(true);
                showToast(t("config.templateApplied", { name: tmpl.name }));
              }}
              className="flex flex-col gap-1.5 p-3 rounded-xl border border-white/10 hover:border-violet-500/40 bg-white/[0.02] hover:bg-violet-500/5 transition-colors text-left"
            >
              <span className="text-lg leading-none">{tmpl.icon ?? "🤖"}</span>
              <span className="text-sm font-medium text-zinc-200">{tmpl.name}</span>
              <span className="text-xs text-zinc-500 line-clamp-2">{tmpl.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Agent Identity */}
      <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white">{t("config.agentIdentity")}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{t("config.agentIdentityDesc")}</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">{t("config.agentNameLabel")}</label>
              <input
                type="text"
                value={config.agentName}
                onChange={(e) => { setConfig((p) => ({ ...p, agentName: e.target.value })); setConfigDirty(true); }}
                placeholder={t("config.agentNamePlaceholder")}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">{t("config.roleLabel")}</label>
              <input
                type="text"
                value={config.role}
                onChange={(e) => { setConfig((p) => ({ ...p, role: e.target.value })); setConfigDirty(true); }}
                placeholder={t("config.rolePlaceholder")}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
              {t("config.traitsLabel")} <span className="text-zinc-600 normal-case">{t("config.traitsHint")}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {(["Friendly", "Professional", "Concise", "Formal", "Casual", "Empathetic"] as const).map((trait) => {
                const active = config.traits.includes(trait);
                return (
                  <button
                    key={trait}
                    onClick={() => {
                      setConfig((p) => {
                        const already = p.traits.includes(trait);
                        if (already) return { ...p, traits: p.traits.filter((t) => t !== trait) };
                        if (p.traits.length >= 3) return p;
                        return { ...p, traits: [...p.traits, trait] };
                      });
                      setConfigDirty(true);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${
                      active
                        ? "bg-violet-600/30 border-violet-500/50 text-violet-200"
                        : "bg-white/5 border-white/10 text-zinc-500 hover:text-zinc-300 hover:border-white/20"
                    }`}
                  >
                    {active && "✓ "}{t(`config.traits.${trait}` as Parameters<typeof t>[0])}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
              {t("config.customInstructionsLabel")} <span className="text-zinc-600 normal-case">{t("config.optional")}</span>
            </label>
            <textarea
              value={config.customInstructions}
              onChange={(e) => { setConfig((p) => ({ ...p, customInstructions: e.target.value })); setConfigDirty(true); }}
              placeholder={t("config.customInstructionsPlaceholder")}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* Business Context */}
      <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white">{t("config.businessContextTitle")}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{t("config.businessContextDesc")}</p>
        </div>
        <div className="p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">{t("config.businessNameLabel")}</label>
              <input
                type="text"
                value={config.businessName}
                onChange={(e) => { setConfig((p) => ({ ...p, businessName: e.target.value })); setConfigDirty(true); }}
                placeholder={t("config.businessNamePlaceholder")}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">{t("config.industryLabel")}</label>
              <select
                value={config.businessContext.startsWith("Industry:") ? config.businessContext.split("\n")[0].replace("Industry: ", "") : ""}
                onChange={(e) => {
                  const industry = e.target.value;
                  setConfig((p) => {
                    const existing = p.businessContext.replace(/^Industry: .+\n?/, "");
                    return { ...p, businessContext: industry ? `Industry: ${industry}\n${existing}`.trim() : existing };
                  });
                  setConfigDirty(true);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
              >
                <option value="">{t("config.selectIndustry")}</option>
                {(["E-commerce", "Healthcare", "Finance", "Education", "Technology", "Real Estate", "Hospitality", "Legal", "Marketing", "Other"] as const).map((i) => (
                  <option key={i} value={i}>{t(`config.industries.${i}` as Parameters<typeof t>[0])}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">{t("config.keyInfoLabel")}</label>
            <textarea
              value={config.businessContext}
              onChange={(e) => { setConfig((p) => ({ ...p, businessContext: e.target.value })); setConfigDirty(true); }}
              placeholder="Our return policy is 30 days. Main products: shoes, bags. Support hours: 9am–6pm EST."
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
            />
          </div>
        </div>
      </div>

      {/* AI Model */}
      <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white">{t("config.aiModelSection")}</h3>
        </div>
        <div className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { value: "openai/gpt-4o", label: "GPT-4o", sub: t("config.modelBestQuality"), badge: "⚡" },
              { value: "anthropic/claude-sonnet-4-6", label: "Claude Sonnet", sub: t("config.modelCreative"), badge: "✦" },
              { value: "openrouter/meta-llama/llama-3.3-70b-instruct", label: "Llama 3", sub: t("config.modelFreeTier"), badge: "🦙" },
            ].map(({ value, label, sub, badge }) => {
              const active = config.model === value;
              return (
                <button
                  key={value}
                  onClick={() => { setConfig((p) => ({ ...p, model: value })); setConfigDirty(true); }}
                  className={`flex flex-col items-start gap-1 p-4 rounded-xl border transition-colors text-left ${
                    active
                      ? "bg-violet-600/20 border-violet-500/50"
                      : "bg-white/[0.02] border-white/10 hover:border-white/20"
                  }`}
                >
                  <div className="flex items-center gap-2 w-full">
                    <span className="text-base leading-none">{badge}</span>
                    <span className={`ml-auto w-3 h-3 rounded-full border-2 shrink-0 ${
                      active ? "border-violet-400 bg-violet-400" : "border-zinc-600"
                    }`} />
                  </div>
                  <div className={`text-sm font-semibold mt-1 ${active ? "text-white" : "text-zinc-300"}`}>{label}</div>
                  <div className="text-xs text-zinc-500">{sub}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Capabilities */}
      <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white">{t("config.capabilities")}</h3>
        </div>
        <div className="divide-y divide-white/5">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <div className="text-sm font-medium text-zinc-200">{t("config.memoryCapability")}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{t("config.memoryDesc")}</div>
            </div>
            <button
              onClick={() => { setConfig((p) => ({ ...p, memoryEnabled: !p.memoryEnabled })); setConfigDirty(true); }}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                config.memoryEnabled ? "bg-violet-600" : "bg-zinc-700"
              }`}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                config.memoryEnabled ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <div className="text-sm font-medium text-zinc-200">{t("config.smartThinking")}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{t("config.smartThinkingDesc")}</div>
            </div>
            <button
              onClick={() => { setConfig((p) => ({ ...p, thinking: p.thinking === "adaptive" ? "off" : "adaptive" })); setConfigDirty(true); }}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                config.thinking === "adaptive" ? "bg-violet-600" : "bg-zinc-700"
              }`}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                config.thinking === "adaptive" ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <div className="text-sm font-medium text-zinc-200">{t("config.languageLabel")}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{t("config.languageDesc")}</div>
            </div>
            <select
              value={config.language}
              onChange={(e) => { setConfig((p) => ({ ...p, language: e.target.value })); setConfigDirty(true); }}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
            >
              {(["English", "Spanish", "French", "German", "Portuguese", "Italian", "Dutch", "Russian", "Chinese", "Japanese", "Arabic"] as const).map((lang) => (
                <option key={lang} value={lang}>{t(`config.languages.${lang}` as Parameters<typeof t>[0])}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center justify-between px-5 py-4 border-t border-white/5">
            <div>
              <div className="text-sm font-medium text-zinc-200">{t("config.sandboxMode")}</div>
              <div className="text-xs text-zinc-500 mt-0.5">{t("config.sandboxDesc")}</div>
            </div>
            <button
              onClick={() => { setConfig((p) => ({ ...p, sandboxMode: !p.sandboxMode })); setConfigDirty(true); }}
              className={`relative inline-flex h-6 w-11 shrink-0 rounded-full border-2 border-transparent transition-colors ${
                config.sandboxMode ? "bg-amber-600" : "bg-zinc-700"
              }`}
            >
              <span className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
                config.sandboxMode ? "translate-x-5" : "translate-x-0"
              }`} />
            </button>
          </div>
        </div>
      </div>

      {/* Advanced settings */}
      <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
        <button
          onClick={() => setShowAdvancedConfig(!showAdvancedConfig)}
          className="flex items-center gap-2 text-xs text-zinc-500 hover:text-zinc-300 transition-colors w-full px-5 py-4"
        >
          <Settings2 className="w-3.5 h-3.5" />
          {showAdvancedConfig ? t("config.hideAdvanced") : t("config.showAdvanced")}
          <span className="ml-auto">{showAdvancedConfig ? "▲" : "▼"}</span>
        </button>
        {showAdvancedConfig && (
          <div className="px-5 pb-5 space-y-4 border-t border-white/5 pt-4">
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                {t("config.temperature")} <span className="text-zinc-600 normal-case">{t("config.temperatureHint")}</span>
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={config.temperature}
                  onChange={(e) => { setConfig((p) => ({ ...p, temperature: parseFloat(e.target.value) })); setConfigDirty(true); }}
                  className="flex-1 accent-violet-500"
                />
                <span className="text-sm text-zinc-300 w-10 text-right tabular-nums">{config.temperature.toFixed(2)}</span>
              </div>
            </div>
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                {t("config.maxTokensLabel")} <span className="text-zinc-600 normal-case">{t("config.maxTokensHint")}</span>
              </label>
              <input
                type="number"
                min={64}
                max={8192}
                step={64}
                value={config.maxTokens}
                onChange={(e) => { setConfig((p) => ({ ...p, maxTokens: parseInt(e.target.value) || 1024 })); setConfigDirty(true); }}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>
          </div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <button onClick={saveConfig} disabled={!configDirty || savingConfig}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-5 py-3 rounded-xl text-sm font-semibold text-white">
          {savingConfig ? <Loader2 className="w-4 h-4 animate-spin" /> : <Settings2 className="w-4 h-4" />}
          {savingConfig ? t("config.saving") : configDirty ? t("config.save") : t("config.saved")}
        </button>
        
        <button
          onClick={() => {
            if (confirm(t("config.resetConfirm"))) {
              setConfig({
                model: "gpt-4o-mini",
                systemPrompt: "",
                temperature: 0.7,
                maxTokens: 1024,
                agentName: "",
                role: "",
                traits: [],
                customInstructions: "",
                businessName: "",
                businessContext: "",
                memoryEnabled: false,
                thinking: "off" as const,
                language: "en",
              });
              setConfigDirty(true);
              showToast(t("config.resetSuccess"), "success");
            }
          }}
          className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors px-5 py-3 rounded-xl text-sm font-semibold text-zinc-300"
        >
          <RotateCcw className="w-4 h-4" />
          {t("config.reset")}
        </button>
      </div>

      {/* Config Import/Export */}
      <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-white/5">
          <h3 className="text-sm font-semibold text-white">{t("config.importExportTitle")}</h3>
          <p className="text-xs text-zinc-500 mt-0.5">{t("config.importExportDesc")}</p>
        </div>
        <div className="p-4">
          <ConfigImportExport
            config={config as unknown as Record<string, unknown>}
            onImport={(importedConfig) => {
              setConfig((prev) => ({ ...prev, ...importedConfig }));
              setConfigDirty(true);
              showToast(t("config.importSuccess"), "success");
            }}
          />
        </div>
      </div>

      {/* Live Preview */}
      <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-white">{t("config.previewTitle")}</h3>
            <p className="text-xs text-zinc-500 mt-0.5">{t("config.previewDesc")}</p>
          </div>
          {previewMessages.length > 0 && (
            <button
              onClick={() => setPreviewMessages([])}
              className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              {t("config.previewClear")}
            </button>
          )}
        </div>

        {previewMessages.length > 0 && (
          <div className="p-4 space-y-3 max-h-72 overflow-y-auto">
            {previewMessages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-violet-600 text-white rounded-br-sm"
                    : "bg-white/[0.06] text-zinc-200 rounded-bl-sm"
                }`}>
                  {msg.content || (previewLoading && i === previewMessages.length - 1
                    ? <span className="flex gap-1 py-0.5 px-1"><span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:0ms]" /><span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:150ms]" /><span className="w-1.5 h-1.5 rounded-full bg-zinc-400 animate-bounce [animation-delay:300ms]" /></span>
                    : "")}
                </div>
              </div>
            ))}
            <div ref={previewEndRef} />
          </div>
        )}

        <div className={`p-3 ${previewMessages.length > 0 ? "border-t border-white/5" : ""}`}>
          <div className="flex gap-2">
            <input
              type="text"
              value={previewInput}
              onChange={(e) => setPreviewInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendPreviewMessage(); } }}
              placeholder={t("config.previewPlaceholder")}
              disabled={previewLoading}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            />
            <button
              onClick={sendPreviewMessage}
              disabled={!previewInput.trim() || previewLoading}
              className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-4 py-2.5 rounded-xl text-sm font-medium text-white shrink-0"
            >
              {previewLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            </button>
          </div>
          {configDirty && (
            <p className="text-xs text-amber-400/70 mt-2 flex items-center gap-1">
              <AlertCircle className="w-3 h-3" /> {t("config.previewUnsaved")}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
