"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Zap, Loader2, Building2, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const INDUSTRIES = ["SaaS / Software", "E-commerce", "Healthcare", "Finance", "Education", "Agency", "Real Estate", "Hospitality", "Other"];
const USE_CASES = [
  { value: "customer-support", label: "Customer Support", desc: "Handle inquiries, FAQs, tickets" },
  { value: "sales-assistant", label: "Sales Assistant", desc: "Qualify leads, answer product questions" },
  { value: "data-analyst", label: "Data & Analytics", desc: "Query data, generate reports" },
  { value: "internal-tools", label: "Internal Automation", desc: "Automate workflows, internal helpdesk" },
  { value: "content", label: "Content Creation", desc: "Drafts, summaries, translations" },
  { value: "custom", label: "Something else", desc: "My manager will help me figure it out" },
];

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [business, setBusiness] = useState("");
  const [industry, setIndustry] = useState("");
  const [useCase, setUseCase] = useState("");
  const [loading, setLoading] = useState(false);

  async function finish() {
    setLoading(true);
    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ business, industry, useCase }),
    });
    router.push("/dashboard");
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-violet-400" />
            <span className="text-xl font-bold text-white tracking-tight">SynapseForge</span>
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-10 justify-center">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all",
                step > s ? "bg-violet-600 border-violet-600 text-white" :
                step === s ? "border-violet-500 text-violet-300 bg-violet-600/20" :
                "border-zinc-700 text-zinc-600"
              )}>
                {step > s ? <CheckCircle2 className="w-4 h-4" /> : s}
              </div>
              {s < 3 && <div className={cn("w-12 h-0.5 transition-all", step > s ? "bg-violet-600" : "bg-zinc-800")} />}
            </div>
          ))}
        </div>

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

        {/* Step 2 — Use case */}
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
            <div className="grid grid-cols-1 gap-3">
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
                  <div className={cn("w-4 h-4 rounded-full border-2 shrink-0 mt-0.5 transition-colors", useCase === uc.value ? "border-violet-400 bg-violet-400" : "border-zinc-600")} />
                  <div>
                    <div className="text-sm font-medium">{uc.label}</div>
                    <div className="text-xs text-zinc-500 mt-0.5">{uc.desc}</div>
                  </div>
                </button>
              ))}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setStep(1)} className="flex-1 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-3 rounded-xl text-sm font-semibold text-zinc-300">
                Back
              </button>
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

        {/* Step 3 — Confirmation */}
        {step === 3 && (
          <div className="glow-border rounded-2xl p-8 bg-white/[0.02] text-center">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-8 h-8 text-violet-400" />
            </div>
            <h2 className="text-xl font-bold text-white mb-2">You're all set! ⚡</h2>
            <p className="text-zinc-400 text-sm mb-6 leading-relaxed">
              A dedicated manager will review your setup and reach out shortly. They'll help configure your AI instance for <strong className="text-zinc-200">{business}</strong>.
            </p>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 mb-6 text-left space-y-2">
              <div className="flex justify-between text-sm"><span className="text-zinc-500">Business</span><span className="text-zinc-200">{business}</span></div>
              <div className="flex justify-between text-sm"><span className="text-zinc-500">Industry</span><span className="text-zinc-200">{industry}</span></div>
              <div className="flex justify-between text-sm"><span className="text-zinc-500">Use case</span><span className="text-zinc-200">{USE_CASES.find((u) => u.value === useCase)?.label}</span></div>
            </div>
            <button
              onClick={finish}
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors py-3 rounded-xl text-sm font-semibold text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Go to Dashboard →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
