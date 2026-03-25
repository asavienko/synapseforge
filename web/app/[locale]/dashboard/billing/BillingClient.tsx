"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import {
  ArrowUpRight,
  Clock,
  Mail,
  AlertTriangle,
  Sparkles,
} from "lucide-react";
import {
  RocketLaunchIcon,
  ShieldCheckIcon,
  CheckIcon,
  CloseIcon,
  LoadingIcon,
  BillingIcon,
  RefreshIcon,
  WarningIcon,
} from "@/components/icons/BrandIcons";
import { cn } from "@/lib/utils";

import { useAnalytics } from "@/components/AnalyticsProvider";

// Plans — matches landing page and pricing page
const PLANS = [
  {
    key: "free",
    price: "$0",
    features: ["1 AI agent instance", "Community support", "Telegram & WhatsApp integration"],
    highlight: false,
  },
  {
    key: "pro",
    price: "$49",
    features: ["Up to 3 AI instances", "Dedicated human manager", "24h response time", "Custom model config", "Telegram & WhatsApp integration", "99% uptime SLA"],
    highlight: true,
  },
  {
    key: "enterprise",
    price: "$299",
    features: ["Unlimited AI instances", "Dedicated manager team", "4h response SLA", "Custom integrations & webhooks", "White-label option", "Team onboarding & training"],
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
  const [contactUpgradeReason, setContactUpgradeReason] = useState<"stripe" | "managed" | null>(null);
  // Cancellation survey state
  const [showCancelSurvey, setShowCancelSurvey] = useState(false);
  const [cancelReason, setCancelReason] = useState<CancelReasonKey | "">("");
  const [cancelFeedback, setCancelFeedback] = useState("");
  const [surveySubmitting, setSurveySubmitting] = useState(false);

  const tb = useTranslations("dashboard.billing");
  const tp = useTranslations("pricing");
  const { track } = useAnalytics();
  const router = useRouter();

  // Redirect to dedicated success page on upgrade
  useEffect(() => {
    if (success) {
      router.push(`/dashboard/billing/success?plan=${plan}`);
    }
  }, [success, plan, router]);

  // Track successful checkout
  useEffect(() => {
    if (success) {
      track("checkout_completed", { plan });
    }
    if (cancelled) {
      track("checkout_cancelled", { plan });
    }
  }, [success, cancelled, plan, track]);

  // Check if current plan is managed
  const isManagedPlan = plan.startsWith("managed_");
  // Check if current plan is legacy
  const isLegacyPlan = ["pro", "enterprise"].includes(plan);

  async function handleUpgrade(planKey: string) {
    setBillingError(null);
    setLoading(planKey);
    track("checkout_started", { plan: planKey, currentPlan: plan });
    const res = await fetch("/api/billing/checkout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ plan: planKey }),
    });
    const data = await res.json();
    setLoading(null);
    if (data.url) {
      track("checkout_redirected", { plan: planKey });
      window.location.assign(data.url);
    } else if (data.managedPlanContact || data.stripeUnavailable) {
      // Record upgrade intent — non-blocking
      track("checkout_managed_plan_contact", { plan: planKey, reason: data.managedPlanContact ? "managed" : "stripe_unavailable" });
      fetch("/api/upgrade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ requestedPlan: planKey, note: "Initiated upgrade — awaiting manual activation" }),
      }).catch(console.error);
      setContactUpgradeReason(data.managedPlanContact ? "managed" : "stripe");
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

  const getPlanName = (key: string) => {
    // Try new translation keys first, fall back to legacy
    const name = tp(`${key}.name` as Parameters<typeof tp>[0]);
    // If it returns the key itself, format it nicely
    if (name === `${key}.name`) {
      return key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }
    return name;
  };



  return (
    <div className="pt-14 md:pt-0 p-4 md:p-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-white">{tb("title")}</h1>
        <p className="text-zinc-400 mt-1">{tb("subtitle")}</p>
      </div>

      {/* Billing error banner */}
      {billingError && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 mb-6">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <p className="text-sm text-red-300 flex-1">{billingError}</p>
          <button onClick={() => setBillingError(null)} className="text-zinc-500 hover:text-zinc-300 transition-colors shrink-0">
            <CloseIcon className="w-4 h-4" />
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
          <WarningIcon className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
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
              <BillingIcon className="w-4 h-4 text-violet-400" />
              <span className="text-xs text-zinc-500 uppercase tracking-wider">{tb("currentPlan")}</span>
              {isManagedPlan && (
                <span className="ml-2 text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full">
                  Managed
                </span>
              )}
              {isLegacyPlan && (
                <span className="ml-2 text-xs bg-amber-500/20 text-amber-400 px-2 py-0.5 rounded-full">
                  Legacy
                </span>
              )}
            </div>
            <div className="text-xl font-bold text-white capitalize">{getPlanName(plan)}</div>
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
                <LoadingIcon className="w-4 h-4" />
              ) : (
                <ArrowUpRight className="w-4 h-4" />
              )}
              {tb("manageSubscription")}
            </button>
          )}
        </div>
      </div>

      {/* Plan cards — matches landing page and pricing page */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {PLANS.map((p) => {
          const isCurrent = p.key === plan;
          const planName = getPlanName(p.key);

          return (
            <div
              key={p.key}
              className={cn(
                "relative rounded-2xl p-5 border transition-all flex flex-col",
                p.highlight
                  ? "border-violet-500/50 bg-violet-600/5"
                  : "border-white/10 bg-white/[0.02]"
              )}
            >
              {p.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-violet-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> {tb("mostPopular")}
                  </span>
                </div>
              )}

              <div className="mb-4">
                <div className="text-sm font-semibold text-zinc-300 mb-1">{planName}</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-bold text-white">{p.price}</span>
                  <span className="text-zinc-500 text-sm">/mo</span>
                </div>
              </div>

              <ul className="space-y-2 mb-6 flex-1">
                {p.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-xs text-zinc-400">
                    <CheckIcon className="w-3.5 h-3.5 text-violet-400 shrink-0 mt-0.5" />
                    {f}
                  </li>
                ))}
              </ul>

              {isCurrent ? (
                <div className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/10 text-sm text-zinc-500 font-medium">
                  <ShieldCheckIcon className="w-4 h-4" /> {tb("currentPlan")}
                </div>
              ) : p.key === "free" ? (
                <button
                  onClick={() => setShowCancelSurvey(true)}
                  className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-white/10 text-sm text-zinc-600 font-medium hover:text-zinc-400 hover:border-white/20 transition-colors"
                >
                  {tb("downgradeViaSupport")}
                </button>
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
                  {loading === p.key ? <LoadingIcon className="w-4 h-4" /> : null}
                  {p.key === "enterprise" ? <><Mail className="w-4 h-4" /> Contact Sales</> : "Upgrade"}
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Support Add-on info */}
      <div className="mt-8 p-4 rounded-xl bg-white/[0.02] border border-white/10">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-medium text-white">Support Hours Add-on</span>
        </div>
        <p className="text-xs text-zinc-400">
          Purchase additional support hours at $100/hour, or bundled at $50/hour with managed plans.
          {" "}
          <a href="mailto:hello@openhelixai.com" className="text-violet-400 hover:text-violet-300">
            Contact us to add support hours.
          </a>
        </p>
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
          <div className="w-full max-w-sm sm:max-w-md glow-border rounded-2xl bg-[#111113] p-5 sm:p-6">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white">{tb("cancelTitle")}</h2>
                <p className="text-sm text-zinc-400 mt-1">{tb("cancelDesc")}</p>
              </div>
              <button
                onClick={() => setShowCancelSurvey(false)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors ml-4 shrink-0"
              >
                <CloseIcon className="w-5 h-5" />
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
                {surveySubmitting ? <LoadingIcon className="w-4 h-4" /> : null}
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
          <div className="bg-[#111118] border border-white/10 rounded-2xl p-5 sm:p-7 w-full max-w-sm sm:max-w-md relative">
            <button
              onClick={() => setShowContactUpgrade(false)}
              className="absolute top-4 right-4 text-zinc-600 hover:text-zinc-300 transition-colors text-lg leading-none"
            >
              ✕
            </button>

            <div className="text-center mb-6">
              <div className="text-3xl mb-3">💳</div>
              <h2 className="text-lg font-bold text-white mb-2">Complete Your Upgrade</h2>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Our payment system is temporarily unavailable. Book a quick setup call 
                and we&apos;ll activate your plan right away — usually within a few hours.
              </p>
            </div>

            <div className="space-y-3">
              <a
                href="https://cal.com/openhelixai/setup"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 w-full py-3 bg-violet-600 hover:bg-violet-500 text-white font-semibold text-sm rounded-xl transition-colors"
              >
                📅 Book a 15-min setup call
              </a>
              <Link
                href="/contact"
                className="flex items-center justify-center gap-2 w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-medium text-sm rounded-xl transition-colors"
              >
                ✉️ Send us a message
              </Link>
            </div>

            <p className="text-center text-xs text-zinc-600 mt-5">
              Questions? Email us at{" "}
              <a href="mailto:hello@openhelixai.com" className="text-violet-400 hover:text-violet-300">
                hello@openhelixai.com
              </a>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
