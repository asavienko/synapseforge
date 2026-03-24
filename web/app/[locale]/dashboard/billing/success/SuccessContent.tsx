"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle2,
  Zap,
  ArrowRight,
  MessageSquare,
  Settings,
  Users,
  Sparkles,
  ExternalLink,
} from "lucide-react";
import { analytics } from "@/lib/analytics";

export function SuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [countdown, setCountdown] = useState(10);
  const plan = searchParams.get("plan") ?? "pro";

  useEffect(() => {
    // Track upgrade success
    analytics.upgradeCompleted(plan);

    // Auto-redirect countdown
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          router.push("/dashboard/instances");
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [plan, router]);

  const planName = plan === "enterprise" ? "Enterprise" : "Pro";
  const planColor = plan === "enterprise" ? "amber" : "violet";

  const nextSteps = [
    {
      icon: Settings,
      title: "Configure your instances",
      desc: "Set up unlimited instances with custom configurations",
      href: "/dashboard/instances",
      color: "violet",
    },
    {
      icon: MessageSquare,
      title: "Connect more channels",
      desc: "Add WhatsApp, Discord, Slack, and more",
      href: "/dashboard/instances",
      color: "emerald",
    },
    {
      icon: Users,
      title: "Invite your team",
      desc: "Share access with your team members",
      href: "/dashboard/settings",
      color: "blue",
    },
  ];

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Confetti-like background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-20 relative">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold mb-3">Welcome to {planName}!</h1>
          <p className="text-zinc-400">
            Your upgrade is complete. You now have access to all {planName} features.
          </p>
        </div>

        {/* What's New Card */}
        <div className={`glow-border rounded-2xl bg-${planColor}-500/5 border-${planColor}-500/20 p-6 mb-8`}>
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className={`w-5 h-5 text-${planColor}-400`} />
            <h2 className="font-semibold">What&apos;s new in {planName}</h2>
          </div>

          <ul className="space-y-3">
            {plan === "enterprise" ? (
              <>
                <li className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-zinc-300">Unlimited AI instances</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-zinc-300">4-hour SLA support response</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-zinc-300">Custom integrations & white-label options</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-zinc-300">Team training & dedicated manager team</span>
                </li>
              </>
            ) : (
              <>
                <li className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-zinc-300">Up to 3 AI instances (was 1)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-zinc-300">Priority 24-hour support</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-zinc-300">Advanced integrations (CRM, webhooks)</span>
                </li>
                <li className="flex items-start gap-3">
                  <Zap className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
                  <span className="text-sm text-zinc-300">99.9% uptime SLA</span>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* Next Steps */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-zinc-500 uppercase tracking-wider mb-4">
            Recommended next steps
          </h2>
          <div className="space-y-3">
            {nextSteps.map((step) => (
              <Link
                key={step.title}
                href={step.href}
                className="flex items-start gap-4 p-4 bg-white/5 border border-white/10 rounded-xl hover:bg-white/[0.08] hover:border-white/20 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-lg bg-${step.color}-500/10 border border-${step.color}-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <step.icon className={`w-5 h-5 text-${step.color}-400`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{step.title}</h3>
                    <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-sm text-zinc-500">{step.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard/instances"
            className="flex-1 flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors py-3 rounded-xl font-semibold"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 transition-colors py-3 rounded-xl font-medium text-zinc-300"
          >
            Book onboarding call
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Auto-redirect notice */}
        <p className="text-center text-sm text-zinc-600 mt-6">
          Redirecting to dashboard in {countdown} seconds...
        </p>
      </div>
    </div>
  );
}
