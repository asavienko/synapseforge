"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Zap, Loader2, Building2, Sparkles, CheckCircle2, ArrowRight,
  Key, MessageSquare, Bot, Eye, EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

const TOTAL_STEPS = 5;

const INDUSTRIES = [
  "SaaS / Software", "E-commerce", "Healthcare", "Finance",
  "Education", "Agency", "Real Estate", "Hospitality", "Other",
];

const USE_CASES = [
  { value: "customer-support", label: "Customer Support", desc: "Handle inquiries, FAQs, tickets", icon: "🎧" },
  { value: "sales-assistant",  label: "Sales Assistant",  desc: "Qualify leads, answer product questions", icon: "📈" },
  { value: "data-analyst",     label: "Data & Analytics", desc: "Query data, generate reports", icon: "📊" },
  { value: "internal-tools",   label: "Internal Automation", desc: "Automate workflows, internal helpdesk", icon: "⚙️" },
  { value: "content",          label: "Content Creation", desc: "Drafts, summaries, translations", icon: "✍️" },
  { value: "custom",           label: "Something else",   desc: "My manager will help me figure it out", icon: "💬" },
];

const LLM_PROVIDERS = [
  {
    key: "openai_api_key",
    label: "OpenAI",
    badge: "Most popular",
    desc: "GPT-4o, GPT-4 Turbo",
    placeholder: "sk-...",
    docsUrl: "https://platform.openai.com/api-keys",
    color: "border-emerald-500/40 bg-emerald-500/5",
    activeColor: "border-emerald-500 bg-emerald-500/10",
  },
  {
    key: "anthropic_api_key",
    label: "Anthropic",
    badge: "Claude",
    desc: "Claude Sonnet, Claude Haiku",
    placeholder: "sk-ant-...",
    docsUrl: "https://console.anthropic.com/settings/keys",
    color: "border-violet-500/40 bg-violet-500/5",
    activeColor: "border-violet-500 bg-violet-500/10",
  },
  {
    key: "openrouter_api_key",
    label: "OpenRouter",
    badge: "Multi-model",
    desc: "Access 200+ models incl. free tier",
    placeholder: "sk-or-...",
    docsUrl: "https://openrouter.ai/keys",
    color: "border-blue-500/40 bg-blue-500/5",
    activeColor: "border-blue-500 bg-blue-500/10",
  },
];

const CHANNEL_OPTIONS = [
  {
    key: "telegram_bot_token",
    label: "Telegram",
    desc: "Your AI responds to messages in Telegram",
    icon: "✈️",
    placeholder: "1234567890:AAFake...",
    howTo: "Create a bot via @BotFather, copy the token",
    docsUrl: "https://core.telegram.org/bots#6-botfather",
  },
  {
    key: "discord_bot_token",
    label: "Discord",
    desc: "Your AI joins and responds in Discord channels",
    icon: "🎮",
    placeholder: "MTI3NDU2NzA4...",
    howTo: "Create a bot at discord.com/developers, copy the Bot Token",
    docsUrl: "https://discord.com/developers/applications",
  },
  {
    key: "slack_app_token",
    label: "Slack",
    desc: "Your AI works inside your Slack workspace",
    icon: "💬",
    placeholder: "xapp-1-...",
    howTo: "Create a Slack app with Socket Mode enabled",
    docsUrl: "https://api.slack.com/apps",
  },
];

// ─── Progress bar ─────────────────────────────────────────────────────────────

function ProgressBar({ step, total }: { step: number; total: number }) {
  return (
    <div className="flex items-center gap-2 mb-10 justify-center">
      {Array.from({ length: total }, (_, i) => i + 1).map((s) => (
        <div key={s} className="flex items-center gap-2">
          <div className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all",
            step > s  ? "bg-violet-600 border-violet-600 text-white" :
            step === s ? "border-violet-500 text-violet-300 bg-violet-600/20" :
                         "border-zinc-700 text-zinc-600"
          )}>
            {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
          </div>
          {s < total && (
            <div className={cn("w-8 h-0.5 transition-all", step > s ? "bg-violet-600" : "bg-zinc-800")} />
          )}
        </div>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function OnboardingPage() {
  const router = useRouter();

  // Step state
  const [step, setStep] = useState(1);

  // Step 1 — Business
  const [business, setBusiness] = useState("");
  const [industry, setIndustry] = useState("");

  // Step 2 — Use case
  const [useCase, setUseCase] = useState("");

  // Step 3 — LLM provider
  const [llmProvider, setLlmProvider] = useState<string | null>(null);
  const [llmKey, setLlmKey] = useState("");
  const [showLlmKey, setShowLlmKey] = useState(false);

  // Step 4 — Channel (optional)
  const [channelProvider, setChannelProvider] = useState<string | null>(null);
  const [channelKey, setChannelKey] = useState("");
  const [showChannelKey, setShowChannelKey] = useState(false);

  // Submission
  const [loading, setLoading] = useState(false);
  const [instanceId, setInstanceId] = useState<string | null>(null);

  // ── Finish ───────────────────────────────────────────────────────────────

  async function finish() {
    setLoading(true);

    const credentials: Record<string, string> = {};
    if (llmProvider && llmKey.trim()) credentials[llmProvider] = llmKey.trim();
    if (channelProvider && channelKey.trim()) credentials[channelProvider] = channelKey.trim();

    const res = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business, industry, useCase, credentials }),
    });

    const data = await res.json();
    const id: string | null = data.instanceId ?? null;
    setInstanceId(id);
    setStep(5);
    setLoading(false);
  }

  // ── Step 5 → redirect ────────────────────────────────────────────────────

  function goToDeploy() {
    if (instanceId) {
      router.push(`/dashboard/instances/${instanceId}`);
    } else {
      router.push("/dashboard");
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-violet-400" />
            <span className="text-xl font-bold text-white tracking-tight">SynapseForge</span>
          </div>
        </div>

        <ProgressBar step={step} total={TOTAL_STEPS} />

        {/* ── Step 1 — Business ── */}
        {step === 1 && (
          <div className="glow-border rounded-2xl p-8 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Tell us about your business</h2>
                <p className="text-zinc-500 text-sm">Helps your manager prepare the right setup</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Business / company name</label>
                <input
                  type="text"
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  placeholder="Acme Corp"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors"
                >
                  <option value="">Select your industry</option>
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!business.trim() || !industry}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors py-3 rounded-xl text-sm font-semibold text-white"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* ── Step 2 — Use case ── */}
        {step === 2 && (
          <div className="glow-border rounded-2xl p-8 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">What do you need AI for?</h2>
                <p className="text-zinc-500 text-sm">Pick your primary use case — you can always add more</p>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-2.5">
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
                    <div className="text-sm font-medium">{uc.label}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{uc.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-3 rounded-xl text-sm font-semibold text-zinc-300">Back</button>
              <button
                onClick={() => setStep(3)}
                disabled={!useCase}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors py-3 rounded-xl text-sm font-semibold text-white"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* ── Step 3 — AI Provider key ── */}
        {step === 3 && (
          <div className="glow-border rounded-2xl p-8 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <Key className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Add your AI provider key</h2>
                <p className="text-zinc-500 text-sm">Powers your deployed agent</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 mb-5">
              Your key is encrypted and stored securely. We never share it or use it for anything other than running your agent.
            </p>

            {/* Provider picker */}
            <div className="space-y-2.5 mb-5">
              {LLM_PROVIDERS.map((p) => (
                <button
                  key={p.key}
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
                      <span className="text-xs px-1.5 py-0.5 rounded bg-white/10 text-zinc-400">{p.badge}</span>
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">{p.desc}</div>
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
              <div className="relative mb-2">
                <input
                  type={showLlmKey ? "text" : "password"}
                  value={llmKey}
                  onChange={(e) => setLlmKey(e.target.value)}
                  placeholder={LLM_PROVIDERS.find((p) => p.key === llmProvider)?.placeholder ?? "Paste your API key"}
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowLlmKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showLlmKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-3 rounded-xl text-sm font-semibold text-zinc-300">Back</button>
              <button
                onClick={() => setStep(4)}
                disabled={!llmProvider || !llmKey.trim()}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors py-3 rounded-xl text-sm font-semibold text-white"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={() => setStep(4)}
              className="w-full mt-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors py-2"
            >
              Skip for now — I&apos;ll add this later
            </button>
          </div>
        )}

        {/* ── Step 4 — Channel (optional) ── */}
        {step === 4 && (
          <div className="glow-border rounded-2xl p-8 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Connect a channel</h2>
                <p className="text-zinc-500 text-sm">Where should your AI live?</p>
              </div>
            </div>

            <p className="text-xs text-zinc-600 mb-5">
              Optional — your agent works in the web chat without this. Add a channel to let users talk to it on Telegram, Discord, or Slack.
            </p>

            <div className="space-y-2.5 mb-5">
              {CHANNEL_OPTIONS.map((c) => (
                <button
                  key={c.key}
                  onClick={() => { setChannelProvider(channelProvider === c.key ? null : c.key); setChannelKey(""); }}
                  className={cn(
                    "w-full flex items-start gap-3 p-4 rounded-xl border text-left transition-all",
                    channelProvider === c.key
                      ? "border-violet-500 bg-violet-600/10"
                      : "border-white/10 bg-white/[0.02] hover:border-white/20"
                  )}
                >
                  <span className="text-xl shrink-0 mt-0.5">{c.icon}</span>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-white">{c.label}</span>
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">{c.desc}</div>
                    {channelProvider === c.key && (
                      <div className="text-xs text-zinc-600 mt-1">{c.howTo} — <a href={c.docsUrl} target="_blank" rel="noopener noreferrer" className="text-violet-400 hover:text-violet-300">Docs ↗</a></div>
                    )}
                  </div>
                </button>
              ))}
            </div>

            {/* Token input */}
            {channelProvider && (
              <div className="relative mb-2">
                <input
                  type={showChannelKey ? "text" : "password"}
                  value={channelKey}
                  onChange={(e) => setChannelKey(e.target.value)}
                  placeholder={CHANNEL_OPTIONS.find((c) => c.key === channelProvider)?.placeholder ?? "Paste your token"}
                  autoFocus
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 pr-10 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors font-mono"
                />
                <button
                  type="button"
                  onClick={() => setShowChannelKey((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
                >
                  {showChannelKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(3)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-3 rounded-xl text-sm font-semibold text-zinc-300">Back</button>
              <button
                onClick={finish}
                disabled={loading || (!!channelProvider && !channelKey.trim())}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors py-3 rounded-xl text-sm font-semibold text-white"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Saving…" : "Finish setup →"}
              </button>
            </div>
            <button
              onClick={finish}
              disabled={loading}
              className="w-full mt-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors py-2 disabled:opacity-40"
            >
              Skip — I&apos;ll add a channel later
            </button>
          </div>
        )}

        {/* ── Step 5 — Launch ── */}
        {step === 5 && (
          <div className="glow-border rounded-2xl p-8 bg-white/[0.02] text-center">
            <div className="w-20 h-20 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
              <Bot className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">You&apos;re ready to launch! 🚀</h2>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              Your credentials are saved. One click deploys your AI agent to a dedicated cloud server — it&apos;ll be live in about 2 minutes.
            </p>

            {/* Summary */}
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm"><span className="text-zinc-500">Business</span><span className="text-zinc-200">{business}</span></div>
              <div className="flex justify-between text-sm"><span className="text-zinc-500">Use case</span><span className="text-zinc-200">{USE_CASES.find((u) => u.value === useCase)?.label}</span></div>
              {llmProvider && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">AI provider</span>
                  <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {LLM_PROVIDERS.find((p) => p.key === llmProvider)?.label}</span>
                </div>
              )}
              {channelProvider && channelKey && (
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Channel</span>
                  <span className="text-emerald-400 flex items-center gap-1"><CheckCircle2 className="w-3 h-3" /> {CHANNEL_OPTIONS.find((c) => c.key === channelProvider)?.label}</span>
                </div>
              )}
            </div>

            <button
              onClick={goToDeploy}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors py-4 rounded-xl text-base font-semibold text-white"
            >
              <Zap className="w-5 h-5" />
              Deploy my agent →
            </button>
            <button
              onClick={() => router.push("/dashboard")}
              className="w-full mt-2 text-xs text-zinc-600 hover:text-zinc-400 transition-colors py-2"
            >
              Go to dashboard instead
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
