"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast, Toaster } from "sonner";
import {
  Zap, Loader2, Building2, Sparkles, CheckCircle2, ArrowRight,
  Key, MessageSquare, Bot, Eye, EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { analytics } from "@/lib/analytics";
import { agentTemplates } from "@/lib/templates";

const TOTAL_STEPS = 5;

const INDUSTRIES = [
  "SaaS / Software", "E-commerce", "Healthcare", "Finance",
  "Education", "Agency", "Real Estate", "Hospitality", "Other",
] as const;

const USE_CASES = [
  { value: "customer-support", icon: "🎧" },
  { value: "sales-assistant",  icon: "📈" },
  { value: "data-analyst",     icon: "📊" },
  { value: "internal-tools",   icon: "⚙️" },
  { value: "content",          icon: "✍️" },
  { value: "custom",           icon: "💬" },
] as const;

const LLM_PROVIDERS = [
  {
    key: "openai_api_key",
    label: "OpenAI",
    badgeKey: "openai",
    placeholder: "sk-...",
    docsUrl: "https://platform.openai.com/api-keys",
    color: "border-emerald-500/40 bg-emerald-500/5",
    activeColor: "border-emerald-500 bg-emerald-500/10",
  },
  {
    key: "anthropic_api_key",
    label: "Anthropic",
    badgeKey: "anthropic",
    placeholder: "sk-ant-...",
    docsUrl: "https://console.anthropic.com/settings/keys",
    color: "border-violet-500/40 bg-violet-500/5",
    activeColor: "border-violet-500 bg-violet-500/10",
  },
  {
    key: "openrouter_api_key",
    label: "OpenRouter",
    badgeKey: "openrouter",
    placeholder: "sk-or-...",
    docsUrl: "https://openrouter.ai/keys",
    color: "border-blue-500/40 bg-blue-500/5",
    activeColor: "border-blue-500 bg-blue-500/10",
  },
];

// Multi-select channel options
const CHANNEL_OPTIONS = [
  {
    key: "telegram_bot_token",
    label: "Telegram",
    channelKey: "telegram",
    icon: "✈️",
    placeholder: "1234567890:AAFake...",
    docsUrl: "https://core.telegram.org/bots#6-botfather",
  },
  {
    key: "whatsapp_business_token",
    label: "WhatsApp",
    channelKey: "whatsapp",
    icon: "💬",
    placeholder: "EAAG...",
    docsUrl: "https://business.whatsapp.com/products/business-platform",
  },
  {
    key: "discord_bot_token",
    label: "Discord",
    channelKey: "discord",
    icon: "🎮",
    placeholder: "MTI3NDU2NzA4...",
    docsUrl: "https://discord.com/developers/applications",
  },
  {
    key: "slack_app_token",
    label: "Slack",
    channelKey: "slack",
    icon: "💼",
    placeholder: "xapp-1-...",
    docsUrl: "https://api.slack.com/apps",
  },
];

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-1 sm:gap-2 mb-10 justify-center overflow-x-auto scrollbar-none px-2">
      {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
        <div key={s} className="flex items-center gap-1 sm:gap-2">
          <div className={cn(
            "w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold border-2 transition-all shrink-0",
            step > s  ? "bg-violet-600 border-violet-600 text-white" :
            step === s ? "border-violet-500 text-violet-300 bg-violet-600/20" :
                         "border-zinc-700 text-zinc-600"
          )}>
            {step > s ? <CheckCircle2 className="w-3 h-3 sm:w-4 sm:h-4" /> : s}
          </div>
          {s < total && (
            <div className={cn("w-4 sm:w-8 h-0.5 transition-all shrink-0", step > s ? "bg-violet-600" : "bg-zinc-800")} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("onboarding");

  // Step state
  const [step, setStep] = useState(1);

  // Step 1 — Business + Industry
  const [business, setBusiness] = useState("");
  const [industry, setIndustry] = useState("");

  // Step 2 — Use case selection + description textarea
  const [useCase, setUseCase] = useState("");
  const [useCaseDescription, setUseCaseDescription] = useState("");

  // Step 3 — Channels wanted (multi-select checkboxes)
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [channelTokens, setChannelTokens] = useState<Record<string, string>>({});
  const [showChannelKey, setShowChannelKey] = useState<Record<string, boolean>>({});

  // Step 4 — LLM provider
  const [llmProvider, setLlmProvider] = useState<string | null>(null);
  const [llmKey, setLlmKey] = useState("");
  const [showLlmKey, setShowLlmKey] = useState(false);

  // LLM key validation state
  const [llmValidating, setLlmValidating] = useState(false);
  const [llmValidState, setLlmValidState] = useState<"idle" | "valid" | "invalid">("idle");
  const [llmValidError, setLlmValidError] = useState<string | null>(null);

  // Submission
  const [loading, setLoading] = useState(false);
  const [instanceId, setInstanceId] = useState<string | null>(null);

  // Applied template (from ?template= param)
  const [appliedTemplate, setAppliedTemplate] = useState<typeof agentTemplates[0] | null>(null);

  // Link referral code passed via Google OAuth callback URL
  useEffect(() => {
    const ref = searchParams.get("_ref");
    if (ref) {
      fetch("/api/referral/link", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: ref }),
      }).catch(() => {/* non-fatal */});
    }
  }, [searchParams]);

  // Read template from URL or sessionStorage and pre-fill fields
  useEffect(() => {
    const tmplId = searchParams.get("template") ?? sessionStorage.getItem("pendingTemplate");
    if (!tmplId) return;
    const tmpl = agentTemplates.find(t => t.id === tmplId);
    if (!tmpl) return;
    setAppliedTemplate(tmpl);

    // Pre-fill industry from template category
    setIndustry(tmpl.category); // use the category as industry hint

    // Pre-fill useCase — map template category to onboarding useCase keys
    const categoryToUseCase: Record<string, string> = {
      "Customer Support": "customer-support",
      "Sales": "sales-assistant",
      "Marketing": "content",
      "Internal Tools": "internal-tools",
    };
    const uc = categoryToUseCase[tmpl.category];
    if (uc) setUseCase(uc);

    // Pre-fill useCase description with template short description
    setUseCaseDescription(tmpl.shortDescription);

    sessionStorage.removeItem("pendingTemplate");
  }, [searchParams]);

  // ── Toggle channel selection ──────────────────────────────────────────────

  function toggleChannel(channelKey: string) {
    setSelectedChannels((prev) =>
      prev.includes(channelKey)
        ? prev.filter((k) => k !== channelKey)
        : [...prev, channelKey]
    );
  }

  function updateChannelToken(channelKey: string, value: string) {
    setChannelTokens((prev) => ({ ...prev, [channelKey]: value }));
  }

  function toggleShowChannelKey(channelKey: string) {
    setShowChannelKey((prev) => ({ ...prev, [channelKey]: !prev[channelKey] }));
  }

  // ── Validate LLM key before finishing ─────────────────────────────────────

  async function validateAndFinish() {
    if (!llmProvider || !llmKey.trim()) {
      await finish();
      return;
    }
    setLlmValidating(true);
    setLlmValidState("idle");
    setLlmValidError(null);
    try {
      const res = await fetch("/api/onboarding/validate-key", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key: llmProvider, value: llmKey.trim() }),
      });
      const data = await res.json() as { valid: boolean; error?: string };
      if (data.valid) {
        setLlmValidState("valid");
        setTimeout(() => finish(), 400);
      } else {
        setLlmValidState("invalid");
        setLlmValidError(data.error ?? "Invalid key");
        setLlmValidating(false);
      }
    } catch {
      setLlmValidState("invalid");
      setLlmValidError("Validation request failed — check your connection");
      setLlmValidating(false);
    }
  }

  // ── Finish ───────────────────────────────────────────────────────────────

  async function finish() {
    setLoading(true);

    const credentials: Record<string, string> = {};
    if (llmProvider && llmKey.trim()) credentials[llmProvider] = llmKey.trim();
    
    // Add selected channel tokens
    selectedChannels.forEach((channelKey) => {
      const token = channelTokens[channelKey];
      if (token && token.trim()) {
        credentials[channelKey] = token.trim();
      }
    });

    const hasLLMKey = !!(llmProvider && llmKey.trim());
    const hasChannel = selectedChannels.length > 0;

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        business, 
        industry, 
        useCase, 
        useCaseDescription,
        channelsWanted: selectedChannels,
        credentials,
        templateId: appliedTemplate?.id ?? null,
        templateSystemPrompt: appliedTemplate?.systemPrompt ?? null,
      }),
    });

    const data = await res.json();
    const id: string | null = data.instanceId ?? null;
    setInstanceId(id);

    analytics.onboardingStep(4);
    analytics.onboardingCompleted({ hasLLMKey, hasChannel });

    setStep(5);
    setLoading(false);
  }

  // ── Step 5 → redirect ────────────────────────────────────────────────────

  function goToDashboard() {
    // Store toast message in sessionStorage to show on dashboard
    sessionStorage.setItem("onboardingComplete", "true");
    if (instanceId) {
      router.push(`/dashboard/instances/${instanceId}?firstRun=1`);
    } else {
      router.push("/dashboard");
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12">
      <Toaster 
        position="top-center" 
        toastOptions={{
          style: {
            background: '#1a1a1f',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#fff',
          },
        }}
      />
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-violet-400" />
            <span className="text-xl font-bold text-white tracking-tight">OpenHelix AI</span>
          </div>
        </div>

        <ProgressBar step={step} total={TOTAL_STEPS} />

        {/* ── Step 1 — Business + Industry ── */}
        {step === 1 && (
          <div className="glow-border rounded-2xl p-5 sm:p-8 bg-white/[0.02]">
            {appliedTemplate && (
              <div className="flex items-center gap-2 bg-violet-500/10 border border-violet-500/30 rounded-xl px-4 py-3 mb-4">
                <span className="text-lg">{appliedTemplate.icon}</span>
                <div className="flex-1">
                  <p className="text-sm font-medium text-violet-300">Starting from: {appliedTemplate.name}</p>
                  <p className="text-xs text-zinc-500">{appliedTemplate.shortDescription}</p>
                </div>
              </div>
            )}
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{t("step1Title")}</h2>
                <p className="text-zinc-500 text-sm">{t("step1Subtitle")}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">{t("businessName")}</label>
                <input
                  type="text"
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">{t("industry")}</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="">{t("selectIndustry")}</option>
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{t(`industries.${i}` as Parameters<typeof t>[0])}</option>)}
                </select>
              </div>
            </div>
            <button
              onClick={() => { analytics.onboardingStep(1); setStep(2); }}
              disabled={!business.trim() || !industry}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors py-3 rounded-xl text-sm font-semibold text-white"
            >
              {t("continue")} <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Step 2 — Use case selection + description ── */}
        {step === 2 && (
          <div className="glow-border rounded-2xl p-5 sm:p-8 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{t("step2Title")}</h2>
                <p className="text-zinc-500 text-sm">{t("step2Subtitle")}</p>
              </div>
            </div>
            
            {/* Use case selection */}
            <div className="grid grid-cols-1 gap-2.5 mb-5">
              {USE_CASES.map((uc) => (
                <button
                  key={uc.value}
                  onClick={() => setUseCase(uc.value)}
                  className={cn(
                    "flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
                    useCase === uc.value
                      ? "border-violet-500 bg-violet-600/10 text-white"
                      : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                  )}
                >
                  <span className="text-lg shrink-0">{uc.icon}</span>
                  <div>
                    <div className="text-sm font-medium">{t(`useCases.${uc.value}.label` as Parameters<typeof t>[0])}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{t(`useCases.${uc.value}.desc` as Parameters<typeof t>[0])}</div>
                  </div>
                </button>
              ))}
            </div>

            {/* Use case description textarea */}
            <div>
              <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">
                {t("useCaseDescLabel")} <span className="text-zinc-600 normal-case">({t("optional")})</span>
              </label>
              <textarea
                value={useCaseDescription}
                onChange={(e) => setUseCaseDescription(e.target.value)}
                placeholder={t("useCaseDescPlaceholder")}
                rows={4}
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
              />
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-3 rounded-xl text-sm font-semibold text-zinc-300">{t("back")}</button>
              <button
                onClick={() => { analytics.onboardingStep(2); setStep(3); }}
                disabled={!useCase}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors py-3 rounded-xl text-sm font-semibold text-white"
              >
                {t("continue")} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3 — Channels wanted (multi-select) ── */}
        {step === 3 && (
          <div className="glow-border rounded-2xl p-5 sm:p-8 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{t("step3Title")}</h2>
                <p className="text-zinc-500 text-sm">{t("step3Subtitle")}</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 mb-5">
              {t("channelsOptionalNote")}
            </p>

            {/* Multi-select channel checkboxes */}
            <div className="space-y-3 mb-5">
              {CHANNEL_OPTIONS.map((c) => (
                <div key={c.key}>
                  <button
                    onClick={() => toggleChannel(c.key)}
                    className={cn(
                      "w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
                      selectedChannels.includes(c.key)
                        ? "border-violet-500 bg-violet-600/10"
                        : "border-white/10 bg-white/[0.02] hover:border-white/20"
                    )}
                  >
                    <div className={cn(
                      "w-5 h-5 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                      selectedChannels.includes(c.key)
                        ? "bg-violet-500 border-violet-500"
                        : "border-zinc-600"
                    )}>
                      {selectedChannels.includes(c.key) && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                    </div>
                    <span className="text-xl shrink-0">{c.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{c.label}</span>
                      </div>
                      <div className="text-xs text-zinc-500 mt-0.5">{t(`channels.${c.channelKey}.desc` as Parameters<typeof t>[0])}</div>
                    </div>
                  </button>

                  {/* Token input for selected channel */}
                  {selectedChannels.includes(c.key) && (
                    <div className="mt-2 ml-8 relative">
                      <input
                        type={showChannelKey[c.key] ? "text" : "password"}
                        value={channelTokens[c.key] || ""}
                        onChange={(e) => updateChannelToken(c.key, e.target.value)}
                        placeholder={c.placeholder}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 pr-10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => toggleShowChannelKey(c.key)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                      >
                        {showChannelKey[c.key] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <p className="text-xs text-zinc-600 mt-1.5">
                        {t(`channels.${c.channelKey}.howTo` as Parameters<typeof t>[0])} — <a href={c.docsUrl} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">{t("docsLink")}</a>
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-3 rounded-xl text-sm font-semibold text-zinc-300">{t("back")}</button>
              <button
                onClick={() => { analytics.onboardingStep(3); setStep(4); }}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors py-3 rounded-xl text-sm font-semibold text-white"
              >
                {t("continue")} <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 4 — AI Provider key ── */}
        {step === 4 && (
          <div className="glow-border rounded-2xl p-5 sm:p-8 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <Key className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">{t("step4Title")}</h2>
                <p className="text-zinc-500 text-sm">{t("step4Subtitle")}</p>
              </div>
            </div>

            {/* "What's an API key?" explainer */}
            <div className="bg-violet-500/5 border border-violet-500/15 rounded-xl p-4 mb-5">
              <p className="text-xs font-semibold text-violet-300 mb-1">💡 What&apos;s an API key?</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                It&apos;s your personal billing connection to the AI company — like a hotel key card that lets your agent use the AI. OpenAI gives new accounts <strong className="text-white">$5 free credits</strong>, enough for thousands of messages.
              </p>
              <p className="text-xs text-zinc-500 mt-2">Your key is encrypted and stored securely. We never share it or use it for anything other than running your agent.</p>
            </div>

            {/* Provider picker */}
            <div className="space-y-2.5 mb-5">
              {LLM_PROVIDERS.map((p) => (
                <button
                  key={p.key}
                  data-testid={`provider-${p.key}`}
                  onClick={() => { setLlmProvider(p.key); setLlmKey(""); }}
                  className={cn(
                    "w-full flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                    llmProvider === p.key ? p.activeColor : p.color + " hover:opacity-80"
                  )}
                >
                  <div className={cn(
                    "w-4 h-4 rounded-full border-2 shrink-0 transition-colors",
                    llmProvider === p.key ? "border-violet-400 bg-violet-400" : "border-zinc-600"
                  )} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{p.label}</span>
                      <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-zinc-400">{t(`llm.${p.badgeKey}.badge` as Parameters<typeof t>[0])}</span>
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">{t(`llm.${p.badgeKey}.desc` as Parameters<typeof t>[0])}</div>
                  </div>
                  <a
                    href={p.docsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="text-xs text-violet-400 hover:text-violet-300 shrink-0"
                  >
                    Get key ↗
                  </a>
                </button>
              ))}
            </div>

            {/* Key input */}
            {llmProvider && (
              <div className="space-y-2 mb-2">
                <div className="relative">
                  <input
                    type={showLlmKey ? "text" : "password"}
                    value={llmKey}
                    onChange={(e) => { setLlmKey(e.target.value); setLlmValidState("idle"); setLlmValidError(null); }}
                    placeholder={LLM_PROVIDERS.find((p) => p.key === llmProvider)?.placeholder ?? "Paste your API key"}
                    autoFocus
                    className={cn(
                      "w-full bg-white/5 border rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-zinc-600 focus:outline-none transition-colors font-mono",
                      llmValidState === "valid" ? "border-emerald-500 focus:border-emerald-400" :
                      llmValidState === "invalid" ? "border-red-500 focus:border-red-400" :
                      "border-white/10 focus:border-violet-500"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowLlmKey((v) => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                  >
                    {showLlmKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {llmValidState === "valid" && (
                  <p className="text-xs text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-3 py-2 flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 shrink-0" /> ✓ Valid key
                  </p>
                )}
                {llmValidState === "invalid" && (
                  <p className="text-xs text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-3 py-2">
                    ✗ {llmValidError ?? "Invalid key"} — double-check it
                  </p>
                )}
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(3)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-3 rounded-xl text-sm font-semibold text-zinc-300">{t("back")}</button>
              <button
                onClick={validateAndFinish}
                disabled={llmValidating || (llmProvider ? !llmKey.trim() : false)}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors py-3 rounded-xl text-sm font-semibold text-white"
              >
                {llmValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {llmValidating ? t("validating") : loading ? t("saving") : t("finishSetup")}
              </button>
            </div>
            <button
              onClick={() => finish()}
              disabled={loading || llmValidating}
              className="w-full mt-3 text-sm text-violet-400 hover:text-violet-300 transition-colors py-2.5 rounded-xl border border-violet-500/20 hover:border-violet-500/40 bg-violet-500/5 hover:bg-violet-500/10 disabled:opacity-40"
            >
              {t("trySandbox")} →
            </button>
          </div>
        )}

        {/* ── Step 5 — Launch ── */}
        {step === 5 && (
          <div className="glow-border rounded-2xl p-5 sm:p-8 bg-white/[0.02] text-center">
            <div className="w-20 h-20 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
              <Bot className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">You&apos;re all set! 🚀</h2>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              Your onboarding is complete. Your manager has been notified and will contact you soon to help with the next steps.
            </p>

            {/* Summary */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm"><span className="text-zinc-500">Business</span><span className="text-zinc-200">{business}</span></div>
              <div className="flex justify-between text-sm"><span className="text-zinc-500">Industry</span><span className="text-zinc-200">{industry}</span></div>
              <div className="flex justify-between text-sm"><span className="text-zinc-500">Use case</span><span className="text-zinc-200">{useCase ? t(`useCases.${useCase}.label` as Parameters<typeof t>[0]) : ""}</span></div>
              {selectedChannels.length > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Channels</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> 
                    {selectedChannels.map(k => CHANNEL_OPTIONS.find(c => c.key === k)?.label).filter(Boolean).join(", ")}
                  </span>
                </div>
              )}
              {llmProvider && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">AI provider</span>
                  <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {LLM_PROVIDERS.find((p) => p.key === llmProvider)?.label}</span>
                </div>
              )}
            </div>

            <button
              onClick={goToDashboard}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors py-4 rounded-xl text-base font-semibold text-white"
            >
              <Zap className="w-5 h-5" />
              Go to Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
