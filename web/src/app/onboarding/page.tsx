"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader2, Building2, Sparkles, CheckCircle2, ArrowRight, MessageSquare, Bot, ArrowLeft, Bell } from "lucide-react";
import { cn } from "@/lib/utils";

const INDUSTRIES = ["SaaS / Software", "E-commerce", "Healthcare", "Finance", "Education", "Agency", "Real Estate", "Hospitality", "Other"];

const COMPANY_SIZES = [
  { value: "solo", label: "Just me" },
  { value: "2-10", label: "2-10 employees" },
  { value: "11-50", label: "11-50 employees" },
  { value: "51-200", label: "51-200 employees" },
  { value: "200+", label: "200+ employees" },
];

const CHANNELS = [
  { value: "telegram", label: "Telegram", icon: "📱" },
  { value: "whatsapp", label: "WhatsApp", icon: "💬" },
  { value: "slack", label: "Slack", icon: "💼" },
  { value: "discord", label: "Discord", icon: "🎮" },
  { value: "email", label: "Email", icon: "📧" },
  { value: "sms", label: "SMS", icon: "📩" },
  { value: "web", label: "Web Widget", icon: "🌐" },
];

const API_PREFERENCES = [
  { value: "openai", label: "OpenAI", desc: "GPT-4o, GPT-4 Turbo", recommended: true },
  { value: "anthropic", label: "Anthropic", desc: "Claude 3.5 Sonnet, Claude 3 Opus" },
  { value: "openrouter", label: "OpenRouter", desc: "Access to multiple models" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [checkingOnboarding, setCheckingOnboarding] = useState(true);
  
  // Form state
  const [business, setBusiness] = useState("");
  const [industry, setIndustry] = useState("");
  const [companySize, setCompanySize] = useState("");
  const [useCase, setUseCase] = useState("");
  const [selectedChannels, setSelectedChannels] = useState<string[]>([]);
  const [apiPreference, setApiPreference] = useState("");

  // Check if onboarding is already completed
  useEffect(() => {
    async function checkOnboardingStatus() {
      try {
        const res = await fetch("/api/onboarding/status");
        if (res.ok) {
          const data = await res.json();
          if (data.onboardingDone) {
            router.push("/dashboard");
          }
        }
      } catch (error) {
        console.error("Failed to check onboarding status:", error);
      } finally {
        setCheckingOnboarding(false);
      }
    }
    checkOnboardingStatus();
  }, [router]);

  function toggleChannel(channel: string) {
    setSelectedChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  }

  async function finish() {
    setLoading(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          business, 
          industry, 
          companySize,
          useCase,
          channels: selectedChannels,
          apiPreference,
        }),
      });

      if (res.ok) {
        setStep(5); // Show success page
      } else {
        console.error("Onboarding failed");
        setLoading(false);
      }
    } catch (error) {
      console.error("Onboarding error:", error);
      setLoading(false);
    }
  }

  function goToDashboard() {
    router.push("/dashboard");
  }

  if (checkingOnboarding) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-violet-400" />
            <span className="text-xl font-bold text-white tracking-tight">SynapseForge</span>
          </div>
        </div>

        {/* Progress */}
        {step < 5 && (
          <div className="flex items-center gap-2 mb-8 justify-center">
            {[1, 2, 3, 4].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all",
                  step > s ? "bg-violet-600 border-violet-600 text-white" :
                  step === s ? "border-violet-500 text-violet-300 bg-violet-600/20" :
                  "border-zinc-700 text-zinc-600"
                )}>
                  {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
                </div>
                {s < 4 && <div className={cn("w-8 h-0.5 transition-all", step > s ? "bg-violet-600" : "bg-zinc-800")} />}
              </div>
            ))}
          </div>
        )}

        {/* Step 1 — Business info */}
        {step === 1 && (
          <div className="glow-border rounded-2xl p-8 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Tell us about your business</h2>
                <p className="text-zinc-500 text-sm">This helps your manager prepare the right setup</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Business / company name</label>
                <input
                  type="text"
                  value={business}
                  onChange={(e) => setBusiness(e.target.value)}
                  placeholder="Acme Inc."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Industry</label>
                <select
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-zinc-200 focus:outline-none focus:border-violet-500 transition-colors [&>option]:bg-zinc-900"
                >
                  <option value="">Select your industry</option>
                  {INDUSTRIES.map((i) => <option key={i} value={i}>{i}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Company size</label>
                <div className="grid grid-cols-2 gap-2">
                  {COMPANY_SIZES.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setCompanySize(size.value)}
                      className={cn(
                        "px-3 py-2.5 rounded-xl text-sm border transition-all text-left",
                        companySize === size.value
                          ? "border-violet-500 bg-violet-600/10 text-white"
                          : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20"
                      )}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-2">Use case (optional)</label>
                <textarea
                  value={useCase}
                  onChange={(e) => setUseCase(e.target.value)}
                  placeholder="Describe what you'd like to use AI for..."
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 transition-colors resize-none"
                />
              </div>
            </div>
            <button
              onClick={() => setStep(2)}
              disabled={!business.trim() || !industry || !companySize}
              className="mt-6 w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors py-3 rounded-xl text-sm font-semibold text-white"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Step 2 — Channels */}
        {step === 2 && (
          <div className="glow-border rounded-2xl p-8 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <MessageSquare className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Where do you want your AI?</h2>
                <p className="text-zinc-500 text-sm">Select the channels you want to integrate with</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {CHANNELS.map((channel) => (
                <button
                  key={channel.value}
                  onClick={() => toggleChannel(channel.value)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border text-left transition-all",
                    selectedChannels.includes(channel.value)
                      ? "border-violet-500 bg-violet-600/10 text-white"
                      : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                  )}
                >
                  <span className="text-xl">{channel.icon}</span>
                  <span className="text-sm font-medium">{channel.label}</span>
                  {selectedChannels.includes(channel.value) && (
                    <CheckCircle2 className="w-4 h-4 text-violet-400 ml-auto" />
                  )}
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-3 rounded-xl text-sm font-semibold text-zinc-300">
                Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={selectedChannels.length === 0}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors py-3 rounded-xl text-sm font-semibold text-white"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3 — API Preference */}
        {step === 3 && (
          <div className="glow-border rounded-2xl p-8 bg-white/[0.02]">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center">
                <Bot className="w-5 h-5 text-violet-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Choose your AI provider</h2>
                <p className="text-zinc-500 text-sm">Which LLM provider do you prefer?</p>
              </div>
            </div>
            <div className="space-y-3">
              {API_PREFERENCES.map((api) => (
                <button
                  key={api.value}
                  onClick={() => setApiPreference(api.value)}
                  className={cn(
                    "w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all",
                    apiPreference === api.value
                      ? "border-violet-500 bg-violet-600/10 text-white"
                      : "border-white/10 bg-white/[0.02] text-zinc-400 hover:border-white/20 hover:text-zinc-200"
                  )}
                >
                  <div className={cn(
                    "w-5 h-5 rounded-full border-2 shrink-0 transition-colors",
                    apiPreference === api.value ? "border-violet-400 bg-violet-400" : "border-zinc-600"
                  )} />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{api.label}</span>
                      {api.recommended && (
                        <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 text-xs rounded-full">Recommended</span>
                      )}
                    </div>
                    <div className="text-xs text-zinc-500 mt-0.5">{api.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(2)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-3 rounded-xl text-sm font-semibold text-zinc-300">
                Back
              </button>
              <button
                onClick={() => setStep(4)}
                disabled={!apiPreference}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-40 transition-colors py-3 rounded-xl text-sm font-semibold text-white"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4 — Confirmation */}
        {step === 4 && (
          <div className="glow-border rounded-2xl p-8 bg-white/[0.02]">
            <div className="text-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-violet-400" />
              </div>
              <h2 className="text-xl font-bold text-white mb-2">Ready to deploy your AI?</h2>
              <p className="text-zinc-400 text-sm">Review your setup before we create your instance</p>
            </div>
            
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-6 space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Business</span>
                <span className="text-zinc-200">{business}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Industry</span>
                <span className="text-zinc-200">{industry}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Company size</span>
                <span className="text-zinc-200">{COMPANY_SIZES.find(s => s.value === companySize)?.label}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Channels</span>
                <span className="text-zinc-200">{selectedChannels.map(c => CHANNELS.find(ch => ch.value === c)?.label).join(", ")}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">AI Provider</span>
                <span className="text-zinc-200">{API_PREFERENCES.find(a => a.value === apiPreference)?.label}</span>
              </div>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep(3)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-3 rounded-xl text-sm font-semibold text-zinc-300">
                Back
              </button>
              <button
                onClick={finish}
                disabled={loading}
                className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors py-3 rounded-xl text-sm font-semibold text-white"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                Complete Setup
              </button>
            </div>
          </div>
        )}

        {/* Step 5 — Success */}
        {step === 5 && (
          <div className="glow-border rounded-2xl p-8 bg-white/[0.02] text-center">
            <div className="w-20 h-20 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
              <Bell className="w-10 h-10 text-emerald-400" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">You&apos;re all set! 🎉</h2>
            <p className="text-zinc-400 mb-2">Your dedicated manager will reach out within 24 hours.</p>
            <p className="text-zinc-500 text-sm mb-8">
              They&apos;ll help you set up your AI assistant for <strong className="text-zinc-300">{business}</strong> and answer any questions.
            </p>
            
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 mb-8">
              <div className="flex items-center justify-center gap-2 text-violet-300 text-sm mb-1">
                <Sparkles className="w-4 h-4" />
                <span className="font-medium">What&apos;s next?</span>
              </div>
              <p className="text-zinc-400 text-sm">
                Your manager will help you connect your chosen channels and configure your AI.
              </p>
            </div>

            <button
              onClick={goToDashboard}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors py-3 rounded-xl text-sm font-semibold text-white"
            >
              Go to Dashboard <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
