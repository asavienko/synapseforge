"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  Zap,
  CreditCard,
  CheckCircle2,
  Loader2,
  ArrowUpRight,
  Shield,
  Clock,
  Mail,
  AlertCircle,
  X,
  AlertTriangle,
} from "lucide-react";
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
      "Telegram & WhatsApp integration",
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

type CancelReasonKey =
  | "tooExpensive"
  | "missingFeature"
  | "notUsing"
  | "betterSolution"
  | "justTesting";

const CANCEL_REASON_KEYS: CancelReasonKey[] = [
  "tooExpensive",
  "missingFeature",
  "notUsing",
  "betterSolution",
  "justTesting",
];

export function BillingClient({ plan, hasSubscription, periodEnd }: Props) {
  const params = useSearchParams();
  const success = params.get("success") === "1" || params.get("success") === "true";
  const cancelled = params.get("cancelled") === "1";
  const [loading, setLoading] = useState<string | null>(null);
  const [billingError, setBillingError] = useState<string | null>(null);
  const [showContactUpgrade, setShowContactUpgrade] = useState(false);

  // Cancellation survey state
  const [showCancelSurvey, setShowCancelSurvey] = useState(false);
  const [cancelReason, setCancelReason] = useState<CancelReasonKey | "">("");
  const [cancelFeedback, setCancelFeedback] = useState("");
  const [surveySubmitting, setSurveySubmitting] = useState(false);

  const tb = useTranslations("dashboard.billing");
  const tp = useTranslations("pricing");

  async function handleUpgrade(planKey: string) {
    setBillingError(null);
    setLoading(planKey);
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planKey }),
    });
    const data = await res.json();
    setLoading(null);
    if (data.url) {
      window.location.href = data.url;
    } else if (data.stripeUnavailable) {
      setShowContactUpgrade(true);
    } else {
      setBillingError(data.error || "Something went wrong. Please try again.");
    }
  }

  async function handlePortal() {
    // If user is on a paid plan and clicking manage, intercept with survey first
    if (plan !== "free" && hasSubscription) {
      setShowCancelSurvey(true);
      return;
    }
    await openPortal();
  }

  async function openPortal() {
    setBillingError(null);
    setLoading("portal");
    const res = await fetch("/api/billing/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) {
      window.location.href = data.url;
    } else {
      setLoading(null);
      setBillingError(data.error || "Something went wrong. Please try again.");
    }
  }

  async function handleSurveySubmit() {
    if (!cancelReason) return;
    setSurveySubmitting(true);
    try {
      await fetch("/api/feedback/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: cancelReason, feedback: cancelFeedback }),
      });
    } catch {
      // Don't block even if this fails
    }
    setSurveySubmitting(false);
    setShowCancelSurvey(false);
    await openPortal();
  }

  return (
    <div className="p-6 md:p-8 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{tb("title")}</h1>
        <p className="text-zinc-400 mt-1">{tb("subtitle")}</p>
      </div>

      {/* Billing error banner — replaces the browser alert() */}
      {billingError && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300 flex-1">{billingError}</p>
          <button onClick={() => setBillingError(null)} className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Rich upgrade success banner */}
      {success && (
        <div className="mb-6 glow-border rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-6 flex items-start gap-4">
          <div className="text-3xl">🎉</div>
          <div>
            <h3 className="text-lg font-semibold text-white mb-1">{tb("upgradeSuccess")}</h3>
            <p className="text-sm text-zinc-400">{tb("upgradeSuccessDesc")}</p>
            <div className="flex flex-wrap gap-3 mt-4">
              {([tb("unlockInstances"), tb("unlockPriority"), tb("unlockSupport")] as string[]).map(
                (feature) => (
                  <div
                    key={feature}
                    className="flex items-center gap-1.5 text-sm text-emerald-300"
                  >
                    <span>✓</span> {feature}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}

      {/* Cancel banner */}
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
            <p className="text-sm font-medium text-red-300">{tb("subscriptionExpired")}</p>
            <p className="text-xs text-red-400/80 mt-0.5">
              {tb("subscriptionExpiredDesc", { plan, date: new Date(periodEnd).toLocaleDateString() })}
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
                  {tb("renews")}{" "}
                  {new Date(periodEnd).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
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
              {loading === "portal" ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <ArrowUpRight className="w-4 h-4" />
              )}
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
                <button
                  onClick={() => setShowCancelSurvey(true)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/10 text-sm text-zinc-600 font-medium hover:text-zinc-400 hover:border-white/20 transition-colors"
                >
                  {tb("downgradeViaSupport")}
                </button>
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
        <a
          href={`mailto:${tb("annualNoteEmail")}`}
          className="text-violet-400 hover:text-violet-300 transition-colors"
        >
          {tb("annualNoteEmail")}
        </a>{" "}
        {tb("annualNoteSetup")}
      </p>

      {/* Cancellation survey modal */}
      {showCancelSurvey && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-md glow-border rounded-2xl bg-[#111113] p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{tb("cancelTitle")}</h2>
                <p className="text-sm text-zinc-400 mt-1">{tb("cancelDesc")}</p>
              </div>
              <button
                onClick={() => setShowCancelSurvey(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors ml-4 shrink-0"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2 mb-4">
              {CANCEL_REASON_KEYS.map((key) => (
                <label
                  key={key}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors",
                    cancelReason === key
                      ? "border-violet-500/50 bg-violet-500/10"
                      : "border-white/10 bg-white/[0.02] hover:bg-white/5"
                  )}
                >
                  <input
                    type="radio"
                    name="cancelReason"
                    value={key}
                    checked={cancelReason === key}
                    onChange={() => setCancelReason(key)}
                    className="accent-violet-500"
                  />
                  <span className="text-sm text-zinc-300">{tb(`cancelReasons.${key}` as Parameters<typeof tb>[0])}</span>
                </label>
              ))}
            </div>

            <textarea
              value={cancelFeedback}
              onChange={(e) => setCancelFeedback(e.target.value)}
              placeholder={tb("cancelFeedbackPlaceholder")}
              rows={3}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors text-sm resize-none mb-4"
            />

            <div className="flex gap-3">
              <button
                onClick={() => setShowCancelSurvey(false)}
                className="flex-1 py-2.5 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 text-sm font-medium text-zinc-300 transition-colors"
              >
                {tb("cancelKeepPlan")}
              </button>
              <button
                onClick={handleSurveySubmit}
                disabled={!cancelReason || surveySubmitting}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-red-600/80 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium text-white transition-colors"
              >
                {surveySubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {tb("cancelSubmit")}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Contact-to-upgrade modal (shown when Stripe is not yet configured) ── */}
      {showContactUpgrade && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={(e) => e.target === e.currentTarget && setShowContactUpgrade(false)}
        >
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-7 w-full max-w-md">
            <button
              onClick={() => setShowContactUpgrade(false)}
              className="absolute top-4 right-4 text-zinc-600 hover:text-zinc-300 transition-colors text-lg leading-none"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="text-3xl mb-3">🙌</div>
              <h2 className="text-lg font-bold text-white mb-2">Let&apos;s get you set up</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Online checkout is coming soon. In the meantime, book a quick call and we&apos;ll
                activate your plan manually — usually within 24 hours.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href="https://cal.com/synapseforge/setup"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm rounded-xl transition-colors"
              >
                📅 Book a 15-min setup call
              </a>
              <a
                href="/contact"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-medium text-sm rounded-xl transition-colors"
              >
                ✉️ Send us a message
              </a>
            </div>

            <p className="text-center text-xs text-zinc-600 mt-5">
              Questions? Email us at{" "}
              <a href="mailto:hello@synapseforge.ai" className="text-violet-400 hover:text-violet-300">
                hello@synapseforge.ai
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
