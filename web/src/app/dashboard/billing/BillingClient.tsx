"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Zap, CreditCard, CheckCircle2, Loader2, ArrowUpRight, Shield, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    key: "free",
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Get started with one AI instance and a dedicated manager.",
    features: [
      "1 AI instance",
      "Manager assigned",
      "In-app messaging",
      "Community support",
    ],
    cta: "Current plan",
    highlight: false,
  },
  {
    key: "pro",
    name: "Pro",
    price: "$49",
    period: "/ month",
    description: "Full-service AI management with priority support.",
    features: [
      "Up to 3 AI instances",
      "Dedicated human manager",
      "24h response time",
      "Weekly check-ins",
      "Custom configurations",
      "CRM & Slack integrations",
      "99% uptime SLA",
    ],
    cta: "Upgrade to Pro",
    highlight: true,
  },
  {
    key: "enterprise",
    name: "Enterprise",
    price: "$299",
    period: "/ month",
    description: "Unlimited AI with a dedicated team and full SLA.",
    features: [
      "Unlimited AI instances",
      "Dedicated manager team",
      "4h response SLA",
      "Custom integrations",
      "Team training",
      "Monthly strategy calls",
      "White-label option",
    ],
    cta: "Upgrade to Enterprise",
    highlight: false,
  },
];

interface Props {
  plan: string;
  hasSubscription: boolean;
  periodEnd: string | null;
}

export function BillingClient({ plan, hasSubscription, periodEnd }: Props) {
  const params = useSearchParams();
  const success = params.get("success") === "1";
  const cancelled = params.get("cancelled") === "1";
  const [loading, setLoading] = useState<string | null>(null);

  async function handleUpgrade(planKey: string) {
    setLoading(planKey);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planKey }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.assign(data.url);
    } else {
      setLoading(null);
      alert(data.error || "Something went wrong.");
    }
  }

  async function handlePortal() {
    setLoading("portal");
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(null);
      alert(data.error || "Something went wrong.");
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">Billing & Plans</h1>
        <p className="text-zinc-400 mt-1">Manage your subscription and plan.</p>
      </div>

      {/* Success / cancel banners */}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mb-6">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-300">Payment successful! Your plan has been upgraded.</p>
        </div>
      )}
      {cancelled && (
        <div className="flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 mb-6">
          <p className="text-sm text-zinc-400">Checkout was cancelled. No charges were made.</p>
        </div>
      )}

      {/* Current plan card */}
      <div className="glow-border rounded-2xl p-6 bg-white/[0.02] mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Current Plan</span>
            </div>
            <div className="text-xl font-bold text-white capitalize">{plan}</div>
            {periodEnd && (
              <div className="flex items-center gap-1.5 mt-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-sm text-zinc-400">
                  Renews {new Date(periodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
                </span>
              </div>
            )}
          </div>
          {hasSubscription && (
            <button
              onClick={handlePortal}
              disabled={loading === "portal"}
              className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors px-4 py-2 rounded-xl text-sm font-medium text-zinc-300 disabled:opacity-50"
            >
              {loading === "portal" ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpRight className="w-4 h-4" />}
              Manage subscription
            </button>
          )}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((p) => {
          const isCurrent = p.key === plan;
          return (
            <div
              key={p.key}
              className={cn(
                "relative rounded-2xl p-6 border transition-all",
                p.highlight
                  ? "border-violet-500/50 bg-violet-600/5"
                  : "border-white/10 bg-white/[0.02]"
              )}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Zap className="w-3 h-3" /> Most popular
                  </span>
                </div>
              )}

              <div className="mb-4">
                <div className="text-sm font-semibold text-zinc-300 mb-1">{p.name}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{p.price}</span>
                  <span className="text-zinc-500 text-sm">{p.period}</span>
                </div>
                <p className="text-xs text-zinc-500 mt-2">{p.description}</p>
              </div>

              <ul className="space-y-2 mb-6">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-zinc-400">
                    <CheckCircle2 className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/10 text-sm text-zinc-500 font-medium">
                  <Shield className="w-4 h-4" /> Current plan
                </div>
              ) : p.key === "free" ? (
                <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/10 text-sm text-zinc-600 font-medium">
                  Downgrade via support
                </div>
              ) : (
                <button
                  onClick={() => handleUpgrade(p.key)}
                  disabled={!!loading}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors disabled:opacity-50",
                    p.highlight
                      ? "bg-violet-600 hover:bg-violet-500 text-white"
                      : "bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200"
                  )}
                >
                  {loading === p.key ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {p.cta}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Annual note */}
      <p className="text-xs text-zinc-600 mt-6 text-center">
        Annual plans available — 2 months free. Contact your manager or{" "}
        <a href="mailto:hello@synapseforge.ai" className="text-violet-400 hover:text-violet-300 transition-colors">
          hello@synapseforge.ai
        </a>{" "}
        to set up.
      </p>
    </div>
  );
}
