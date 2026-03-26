"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, X, Bot, Key, MessageSquare, Rocket, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useAnalytics } from "@/components/AnalyticsProvider";

interface OnboardingChecklistProps {
  hasInstances: boolean;
  hasApiKey: boolean;
  hasChannel: boolean;
  instanceId?: string;
}

export function OnboardingChecklist({
  hasInstances,
  hasApiKey,
  hasChannel,
  instanceId,
}: OnboardingChecklistProps) {
  const t = useTranslations("onboardingChecklist");
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const { track } = useAnalytics();

  useEffect(() => {
    // Check if user has dismissed the checklist
    const dismissed = localStorage.getItem("sf_onboarding_checklist_dismissed");
    if (!dismissed) {
      setIsVisible(true);
      track("onboarding_checklist_shown", {
        hasInstances,
        hasApiKey,
        hasChannel,
        completedSteps: [hasInstances, hasApiKey, hasChannel].filter(Boolean).length,
      });
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("sf_onboarding_checklist_dismissed", "1");
    setIsDismissed(true);
    setTimeout(() => setIsVisible(false), 300);
    track("onboarding_checklist_dismissed", {
      completedSteps: [hasInstances, hasApiKey, hasChannel].filter(Boolean).length,
    });
  };

  const steps = [
    {
      id: "create",
      label: t("step1"),
      done: hasInstances,
      href: "/dashboard/instances",
      icon: Bot,
    },
    {
      id: "apikey",
      label: t("step2"),
      done: hasApiKey,
      href: instanceId ? `/dashboard/instances/${instanceId}` : "/dashboard/instances",
      icon: Key,
    },
    {
      id: "channel",
      label: t("step3"),
      done: hasChannel,
      href: instanceId ? `/dashboard/instances/${instanceId}` : "/dashboard/instances",
      icon: MessageSquare,
    },
    {
      id: "test",
      label: t("step4"),
      done: hasInstances && hasApiKey,
      href: instanceId ? `/dashboard/instances/${instanceId}` : "/dashboard/instances",
      icon: Rocket,
    },
  ];

  const completedSteps = steps.filter((s) => s.done).length;
  const totalSteps = steps.length;
  const progress = (completedSteps / totalSteps) * 100;

  // Hide if all steps completed
  if (completedSteps === totalSteps) return null;

  if (!isVisible) return null;

  return (
    <div
      className={`mb-8 p-6 bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-blue-500/20 rounded-2xl transition-all duration-300 ${
        isDismissed ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{t("title")}</h2>
          <p className="text-sm text-gray-500 dark:text-zinc-400">{t("subtitle")}</p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-500 dark:text-zinc-500 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-gray-500 dark:text-zinc-400">
            {t("progress", { completed: completedSteps, total: totalSteps })}
          </span>
          <span className="text-blue-600 dark:text-blue-400 font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-3">
        {steps.map((step) => {
          const Icon = step.icon;
          return (
            <Link
              key={step.id}
              href={step.href}
              onClick={() => track("onboarding_checklist_step_clicked", { stepId: step.id, stepLabel: step.label, done: step.done })}
              className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                step.done
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : "bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 border border-transparent"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  step.done
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                }`}
              >
                {step.done ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <Icon className="w-5 h-5" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p
                  className={`font-medium truncate ${
                    step.done ? "text-emerald-300 line-through" : "text-white"
                  }`}
                >
                  {step.label}
                </p>
              </div>

              {!step.done && (
                <ChevronRight className="w-5 h-5 text-gray-500 dark:text-zinc-500 shrink-0" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}