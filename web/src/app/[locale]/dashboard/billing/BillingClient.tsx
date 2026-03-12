"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Zap, CreditCard, CheckCircle2, Loader2, ArrowUpRight, Shield, Clock, Mail, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    key: "free",
    features: [
      "1 AI instance",
      "Manager assigned",
      "In-app messaging",
      "Community support",
    ],
    highlight: false,
  },
  {
    key: "pro",
    features: [
      "Up to 3 AI instances",
      "Dedicated human manager",
      "24h response time",
      "Weekly check-ins",
      "Custom configurations",
      "CRM & Slack integrations",
      "99% uptime SLA",
    ],
    highlight: true,
  },
  {
    key: "enterprise",
    features: [
      "Unlimited AI instances",
      "Dedicated manager team",
      "4h response SLA",
      "Custom integrations",
      "Team training",
      "Monthly strategy calls",
      "White-label option",
    ],
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

  const tb = useTranslations("dashboard.billing");
  const tp = useTranslations("pricing");

  async function handleUpgrade(planKey: string) {
    setLoading(planKey);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planKey }),
    });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
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
        <h1 className="text-2xl font-bold text-white">{tb("title")}</h1>
        <p className="text-zinc-400 mt-1">{tb("subtitle")}</p>
      </div>

      {/* Success / cancel banners */}
      {success && (
        <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-4 py-3 mb-6">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <p className="text-sm text-emerald-300">{tb("success")}</p>
        </div>
      )}
      {cancelled && (
        <div className="flex items-center gap-3 bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 mb-6">
          <p className="text-sm text-zinc-400">{tb("cancelled")}</p>
        </div>
      )}

      {/* Expired subscription warning */}
      {periodEnd && plan !== "free" && new Date(periodEnd) < new Date() && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
          <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-300">Subscription expired</p>
            <p className="text-xs text-red-400/80 mt-0.5">
              Your {plan} subscription expired on {new Date(periodEnd).toLocaleDateString()}. 
              Instances exceeding the free plan limit have been paused. Renew to restore access.
            </p>
          </div>
        </div>
      )}

      {/* Current plan card */}
      <div className="glow-border rounded-2xl p-6 bg-white/[0.02] mb-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <CreditCard className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-zinc-500 uppercase tracking-wider">{tb("currentPlan")}</span>
            </div>
            <div className="text-xl font-bold text-white capitalize">{plan}</div>
            {periodEnd && (
              <div className="flex items-center gap-1.5 mt-1">
                <Clock className="w-3.5 h-3.5 text-zinc-500" />
                <span className="text-sm text-zinc-400">
                  {tb("renews")} {new Date(periodEnd).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
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
              {tb("manageSubscription")}
            </button>
          )}
        </div>
      </div>

      {/* Plan cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {PLANS.map((p) => {
          const isCurrent = p.key === plan;
          const planName = tp(`${p.key}.name` as Parameters<typeof tp>[0]);
          const planPrice = tp(`${p.key}.price` as Parameters<typeof tp>[0]);
          const planPeriod = tp(`${p.key}.period` as Parameters<typeof tp>[0]);
          const planDesc = tp(`${p.key}.desc` as Parameters<typeof tp>[0]);
          const planCta = tp(`${p.key}.cta` as Parameters<typeof tp>[0]);

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
                    <Zap className="w-3 h-3" /> {tb("mostPopular")}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <div className="text-sm font-semibold text-zinc-300 mb-1">{planName}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-white">{planPrice}</span>
                  {planPeriod && <span className="text-zinc-500 text-sm">{planPeriod}</span>}
                </div>
                <p className="text-xs text-zinc-500 mt-2">{planDesc}</p>
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
                  <Shield className="w-4 h-4" /> {tb("currentPlan")}
                </div>
              ) : p.key === "free" ? (
                <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/10 text-sm text-zinc-600 font-medium">
                  {tb("downgradeViaSupport")}
                </div>
              ) : p.key === "enterprise" ? (
                <a
                  href="mailto:hello@synapseforge.ai"
                  className={cn(
                    "w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-colors",
                    "bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-200"
                  )}
                >
                  <Mail className="w-4 h-4" />
                  {planCta}
                </a>
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
                  {planCta}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Annual note */}
      <p className="text-xs text-zinc-600 mt-6 text-center">
        {tb("annualNote")}{" "}
        <a href={`mailto:${tb("annualNoteEmail")}`} className="text-violet-400 hover:text-violet-300 transition-colors">
          {tb("annualNoteEmail")}
        </a>{" "}
        {tb("annualNoteSetup")}
      </p>
    </div>
  );
}
