"use client";

import { useState, useEffect } from "react";
import { X, Check, Copy, Loader2, ChevronRight, ChevronLeft, Bot, MessageSquare, Hash, Zap } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { TEMPLATE_PROMPTS, MODEL_OPTIONS, generateOpenClawConfig, type InstanceTemplate, type LLMProvider, type CredentialMap, type InstanceConfig } from "@/lib/openclaw-config";
import { maskValue } from "@/lib/crypto";
import { cn } from "@/lib/utils";

interface WizardProps {
  onClose: () => void;
  onCreated: () => void;
}

type Step = "template" | "provider" | "channels" | "persona" | "deploy";
const STEPS: Step[] = ["template", "provider", "channels", "persona", "deploy"];

interface WizardState {
  // Step 1
  name: string;
  instanceType: string;
  template: InstanceTemplate;
  // Step 2
  llmProvider: LLMProvider;
  apiKey: string;
  model: string;
  // Step 3
  telegramEnabled: boolean;
  telegramToken: string;
  discordEnabled: boolean;
  discordToken: string;
  slackEnabled: boolean;
  slackAppToken: string;
  slackBotToken: string;
  // Step 4
  systemPrompt: string;
  temperature: number;
  maxTokens: number;
  // Step 5
  deployMode: "hetzner" | "manual";
}

const TEMPLATE_ICONS: Record<InstanceTemplate, string> = {
  general: "🤖",
  customer_support: "💬",
  faq_bot: "❓",
  lead_qualification: "🎯",
};

export function InstanceSetupWizard({ onClose, onCreated }: WizardProps) {
  const t = useTranslations("instanceSetup");
  const router = useRouter();
  const [step, setStep] = useState<Step>("template");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [copied, setCopied] = useState(false);
  const [configPreview, setConfigPreview] = useState("");
  const [createdInstanceId, setCreatedInstanceId] = useState<string | null>(null);

  const [state, setState] = useState<WizardState>({
    name: "",
    instanceType: "assistant",
    template: "general",
    llmProvider: "openai",
    apiKey: "",
    model: "openai/gpt-4o",
    telegramEnabled: false,
    telegramToken: "",
    discordEnabled: false,
    discordToken: "",
    slackEnabled: false,
    slackAppToken: "",
    slackBotToken: "",
    systemPrompt: TEMPLATE_PROMPTS.general,
    temperature: 0.7,
    maxTokens: 1024,
    deployMode: "manual",
  });

  function updateState(partial: Partial<WizardState>) {
    setState((prev) => ({ ...prev, ...partial }));
  }

  function selectTemplate(tpl: InstanceTemplate) {
    updateState({
      template: tpl,
      systemPrompt: TEMPLATE_PROMPTS[tpl],
    });
  }

  function selectProvider(provider: LLMProvider) {
    const firstModel = MODEL_OPTIONS[provider][0].value;
    updateState({ llmProvider: provider, model: firstModel, apiKey: "" });
  }

  // Regenerate config preview when reaching deploy step
  useEffect(() => {
    if (step === "deploy") {
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
        setConfigPreview(generateOpenClawConfig(config, creds));
      } catch {
        setConfigPreview("// Error generating config preview");
      }
    }
  }, [step]);

  async function handleSubmit() {
    setSubmitting(true);
    setError("");

    try {
      // 1. Create the instance
      const instanceRes = await fetch("/api/instances", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: state.name,
          type: state.instanceType,
          description: `${TEMPLATE_PROMPTS[state.template].slice(0, 80)}...`,
          config: JSON.stringify({
            model: state.model,
            systemPrompt: state.systemPrompt,
            temperature: state.temperature,
            maxTokens: state.maxTokens,
            template: state.template,
          }),
        }),
      });

      if (!instanceRes.ok) {
        const d = await instanceRes.json();
        throw new Error(d.error ?? "Failed to create instance");
      }

      const instance = await instanceRes.json();
      const instanceId = instance.id;
      setCreatedInstanceId(instanceId);

      // 2. Save credentials
      const apiKeyField = state.llmProvider === "openai"
        ? "openai_api_key"
        : state.llmProvider === "anthropic"
        ? "anthropic_api_key"
        : "openrouter_api_key";

      const credentialsToSave: Array<{ key: string; value: string }> = [];

      if (state.apiKey) {
        credentialsToSave.push({ key: apiKeyField, value: state.apiKey });
      }
      if (state.telegramEnabled && state.telegramToken) {
        credentialsToSave.push({ key: "telegram_bot_token", value: state.telegramToken });
      }
      if (state.discordEnabled && state.discordToken) {
        credentialsToSave.push({ key: "discord_bot_token", value: state.discordToken });
      }
      if (state.slackEnabled && state.slackAppToken) {
        credentialsToSave.push({ key: "slack_app_token", value: state.slackAppToken });
      }
      if (state.slackEnabled && state.slackBotToken) {
        credentialsToSave.push({ key: "slack_bot_token", value: state.slackBotToken });
      }

      for (const cred of credentialsToSave) {
        await fetch(`/api/instances/${instanceId}/credentials`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(cred),
        });
      }

      // 3. If Hetzner deploy, kick off VPS provisioning via the user-facing endpoint
      if (state.deployMode === "hetzner") {
        const provRes = await fetch(`/api/instances/${instanceId}/deploy`, {
          method: "POST",
        });
        if (!provRes.ok) {
          const d = await provRes.json().catch(() => ({}));
          // Non-fatal: instance is created with credentials, user can deploy from the Deploy tab
          setError(`Instance created! VPS provisioning will start from the Deploy tab. (${d.error ?? provRes.status})`);
        }
      }

      setSuccess(true);
      onCreated();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Something went wrong";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  function copyConfig() {
    navigator.clipboard.writeText(configPreview);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const stepIndex = STEPS.indexOf(step);
  const canGoNext = (() => {
    if (step === "template") return state.name.trim().length > 0;
    if (step === "provider") return state.apiKey.trim().length > 0;
    return true;
  })();

  function goNext() {
    if (stepIndex < STEPS.length - 1) setStep(STEPS[stepIndex + 1]);
  }
  function goPrev() {
    if (stepIndex > 0) setStep(STEPS[stepIndex - 1]);
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 px-4 py-6">
      <div className="bg-[#111118] border border-white/10 rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-white/5 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">{t("title")}</h2>
            <div className="flex items-center gap-2 mt-2">
              {STEPS.map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <button
                    onClick={() => i < stepIndex && setStep(s)}
                    className={cn(
                      "w-6 h-6 rounded-full text-xs font-bold flex items-center justify-center transition-colors",
                      i < stepIndex
                        ? "bg-violet-600 text-white cursor-pointer"
                        : i === stepIndex
                        ? "bg-violet-600/30 border border-violet-500 text-violet-300"
                        : "bg-white/5 text-zinc-600"
                    )}
                  >
                    {i < stepIndex ? <Check className="w-3 h-3" /> : i + 1}
                  </button>
                  {i < STEPS.length - 1 && (
                    <div className={cn("w-6 h-0.5 rounded", i < stepIndex ? "bg-violet-600" : "bg-white/10")} />
                  )}
                </div>
              ))}
              <span className="text-xs text-zinc-500 ml-2">{t(`steps.${step}`)}</span>
            </div>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {success ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t("deploy.success")}</h3>
              {state.deployMode === "hetzner" && !error && (
                <p className="text-sm text-zinc-400">{t("deploy.provisioningNote")}</p>
              )}
              {error && (
                <p className="text-sm text-amber-300 mt-2 bg-amber-400/10 border border-amber-400/20 rounded-lg px-3 py-2">{error}</p>
              )}
              <div className="mt-6 flex flex-col gap-3">
                {createdInstanceId && (
                  <button
                    onClick={() => {
                      onClose();
                      router.push(`/dashboard/instances/${createdInstanceId}` as Parameters<typeof router.push>[0]);
                    }}
                    className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-xl text-sm font-semibold text-white"
                  >
                    {state.deployMode === "hetzner" ? "Monitor deployment →" : "Go to instance →"}
                  </button>
                )}
                <button
                  onClick={onClose}
                  className="text-sm text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  Back to dashboard
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* ── Step 1: Template ── */}
              {step === "template" && (
                <div className="space-y-5">
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Instance Name</label>
                    <input
                      type="text"
                      value={state.name}
                      onChange={(e) => updateState({ name: e.target.value })}
                      placeholder="My Support Bot"
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-3">Choose a template</label>
                    <div className="grid grid-cols-2 gap-3">
                      {(["general", "customer_support", "faq_bot", "lead_qualification"] as InstanceTemplate[]).map((tpl) => (
                        <button
                          key={tpl}
                          onClick={() => selectTemplate(tpl)}
                          className={cn(
                            "p-4 rounded-xl border text-left transition-colors",
                            state.template === tpl
                              ? "border-violet-500 bg-violet-500/10 text-white"
                              : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20"
                          )}
                        >
                          <div className="text-2xl mb-2">{TEMPLATE_ICONS[tpl]}</div>
                          <div className="text-sm font-semibold text-white">{t(`templates.${tpl}`)}</div>
                          <div className="text-xs text-zinc-500 mt-1 line-clamp-2">{TEMPLATE_PROMPTS[tpl].slice(0, 60)}...</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Step 2: AI Provider ── */}
              {step === "provider" && (
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
                      {MODEL_OPTIONS[state.llmProvider].map((m) => (
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
              )}

              {/* ── Step 3: Channels ── */}
              {step === "channels" && (
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
              )}

              {/* ── Step 4: Persona ── */}
              {step === "persona" && (
                <div className="space-y-5">
                  <div className="text-sm font-semibold text-white">{t("persona.title")}</div>
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">{t("persona.systemPrompt")}</label>
                    <textarea
                      value={state.systemPrompt}
                      onChange={(e) => updateState({ systemPrompt: e.target.value })}
                      rows={6}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                    />
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs text-zinc-500 uppercase tracking-wider">{t("persona.temperature")}</label>
                      <span className="text-sm font-mono text-violet-300">{state.temperature.toFixed(1)}</span>
                    </div>
                    <input
                      type="range" min="0" max="1" step="0.1" value={state.temperature}
                      onChange={(e) => updateState({ temperature: parseFloat(e.target.value) })}
                      className="w-full accent-violet-500"
                    />
                    <p className="text-xs text-zinc-600 mt-1">{t("persona.temperatureHelp")}</p>
                  </div>
                  <div>
                    <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">{t("persona.maxTokens")}</label>
                    <input
                      type="number" value={state.maxTokens} min={64} max={32768} step={64}
                      onChange={(e) => updateState({ maxTokens: parseInt(e.target.value) || 1024 })}
                      className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>
              )}

              {/* ── Step 5: Deploy ── */}
              {step === "deploy" && (
                <div className="space-y-5">
                  <div className="text-sm font-semibold text-white">{t("deploy.title")}</div>

                  {/* Summary */}
                  <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 space-y-2 text-sm">
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">{t("deploy.summary")}</div>
                    {[
                      { label: "Name", value: state.name },
                      { label: "Model", value: state.model },
                      { label: "Template", value: t(`templates.${state.template}`) },
                      {
                        label: "Channels",
                        value: [
                          state.telegramEnabled && "Telegram",
                          state.discordEnabled && "Discord",
                          state.slackEnabled && "Slack",
                        ].filter(Boolean).join(", ") || "None"
                      },
                    ].map((f) => (
                      <div key={f.label} className="flex gap-3">
                        <span className="text-zinc-500 w-20 shrink-0">{f.label}</span>
                        <span className="text-zinc-200">{f.value}</span>
                      </div>
                    ))}
                  </div>

                  {/* Config preview */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-zinc-500 uppercase tracking-wider">{t("deploy.configPreview")}</span>
                      <button
                        onClick={copyConfig}
                        className="flex items-center gap-1.5 text-xs text-violet-400 hover:text-violet-300 bg-violet-500/10 px-2 py-1 rounded-lg transition-colors"
                      >
                        {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        {copied ? t("deploy.copied") : t("deploy.copyConfig")}
                      </button>
                    </div>
                    <pre className="bg-black/40 border border-white/10 rounded-xl p-4 text-xs text-zinc-300 overflow-x-auto max-h-48 font-mono">
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
                              ? "border-violet-500 bg-violet-500/10"
                              : "border-white/10 bg-white/[0.02] hover:border-white/20"
                          )}
                        >
                          <div className={cn(
                            "w-4 h-4 rounded-full border-2 flex items-center justify-center shrink-0",
                            state.deployMode === opt.value ? "border-violet-500" : "border-zinc-600"
                          )}>
                            {state.deployMode === opt.value && <div className="w-2 h-2 rounded-full bg-violet-500" />}
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
              )}
            </>
          )}
        </div>

        {/* Footer */}
        {!success && (
          <div className="flex items-center justify-between p-6 border-t border-white/5 shrink-0">
            <button
              onClick={stepIndex === 0 ? onClose : goPrev}
              className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2.5 rounded-xl border border-white/10 hover:border-white/20"
            >
              <ChevronLeft className="w-4 h-4" />
              {stepIndex === 0 ? "Cancel" : "Back"}
            </button>

            {step !== "deploy" ? (
              <button
                onClick={goNext}
                disabled={!canGoNext}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-4 py-2.5 rounded-xl text-sm font-semibold text-white"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors px-5 py-2.5 rounded-xl text-sm font-semibold text-white"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {submitting ? t("deploy.deploying") : t("deploy.createInstance")}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
