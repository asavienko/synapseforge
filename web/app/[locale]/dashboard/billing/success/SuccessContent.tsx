"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("dashboard.billing.successPage");

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

  const isEnterprise = plan === "enterprise";
  const planName = isEnterprise ? t("welcomeEnterprise") : t("welcomePro");
  const planColor = isEnterprise ? "amber" : "blue";

  const nextSteps = [
    {
      icon: Settings,
      title: t("configureInstances"),
      desc: t("configureInstancesDesc"),
      href: "/dashboard/instances",
      color: "blue",
    },
    {
      icon: MessageSquare,
      title: t("connectChannels"),
      desc: t("connectChannelsDesc"),
      href: "/dashboard/instances",
      color: "emerald",
    },
    {
      icon: Users,
      title: t("inviteTeam"),
      desc: t("inviteTeamDesc"),
      href: "/dashboard/settings",
      color: "blue",
    },
  ];

  const enterpriseFeatures = [
    t("unlimitedInstances"),
    t("slaSupport"),
    t("customIntegrations"),
    t("teamTraining"),
  ];

  const proFeatures = [
    t("threeInstances"),
    t("prioritySupport"),
    t("advancedIntegrations"),
    t("uptimeSla"),
  ];

  const features = isEnterprise ? enterpriseFeatures : proFeatures;

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-white">
      {/* Confetti-like background effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-600/10 rounded-full blur-[120px]" />
      </div>

      <div className="max-w-2xl mx-auto px-4 py-20 relative">
        {/* Success Icon */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6">
            <CheckCircle2 className="w-10 h-10 text-emerald-400" />
          </div>
          <h1 className="text-3xl font-bold mb-3">{planName}</h1>
          <p className="text-gray-500 dark:text-zinc-400">
            {t("upgradeComplete", { plan: isEnterprise ? "Enterprise" : "Pro" })}
          </p>
        </div>

        {/* What's New Card */}
        <div className={`glow-border rounded-2xl bg-${planColor}-500/5 border-${planColor}-500/20 p-6 mb-8`}>
          <div className="flex items-center gap-3 mb-4">
            <Sparkles className={`w-5 h-5 text-${planColor}-400`} />
            <h2 className="font-semibold">{t("whatsNew", { plan: isEnterprise ? "Enterprise" : "Pro" })}</h2>
          </div>

          <ul className="space-y-3">
            {features.map((feature, index) => (
              <li key={index} className="flex items-start gap-3">
                <Zap className={`w-4 h-4 text-${planColor}-400 mt-0.5 shrink-0`} />
                <span className="text-sm text-gray-700 dark:text-zinc-300">{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Next Steps */}
        <div className="mb-8">
          <h2 className="text-sm font-semibold text-gray-500 dark:text-zinc-500 uppercase tracking-wider mb-4">
            {t("nextSteps")}
          </h2>
          <div className="space-y-3">
            {nextSteps.map((step) => (
              <Link
                key={step.title}
                href={step.href}
                className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl hover:bg-white/[0.08] hover:border-white/20 transition-colors group"
              >
                <div className={`w-10 h-10 rounded-lg bg-${step.color}-500/10 border border-${step.color}-500/20 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform`}>
                  <step.icon className={`w-5 h-5 text-${step.color}-400`} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium">{step.title}</h3>
                    <ArrowRight className="w-4 h-4 text-gray-400 dark:text-zinc-600 group-hover:text-zinc-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-zinc-500">{step.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/dashboard/instances"
            className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-600 transition-colors py-3 rounded-xl font-semibold"
          >
            {t("goToDashboard")}
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href="/contact"
            className="flex items-center justify-center gap-2 bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 border border-gray-200 dark:border-white/10 transition-colors py-3 rounded-xl font-medium text-gray-700 dark:text-zinc-300"
          >
            {t("bookOnboarding")}
            <ExternalLink className="w-4 h-4" />
          </Link>
        </div>

        {/* Auto-redirect notice */}
        <p className="text-center text-sm text-gray-400 dark:text-zinc-600 mt-6">
          {t("redirecting", { count: countdown })}
        </p>
      </div>
    </div>
  );
}
