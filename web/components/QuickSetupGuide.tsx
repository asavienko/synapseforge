"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, Circle, Bot, Key, MessageSquare, Rocket, X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface SetupStep {
  id: string;
  label: string;
  description: string;
  href: string;
  icon: React.ElementType;
  check: () => boolean;
}

interface QuickSetupGuideProps {
  instances: Array<{ id: string; status: string; provisionStatus?: string | null }>;
  credentials?: Array<{ key: string; value: string }>;
}

export function QuickSetupGuide({ instances, credentials = [] }: QuickSetupGuideProps) {
  const t = useTranslations("quickSetup");
  const [dismissed, setDismissed] = useState(false);
  const [hasSeen, setHasSeen] = useState(true);

  useEffect(() => {
    const seen = localStorage.getItem("synapseforge-setup-seen");
    if (!seen) {
      setHasSeen(false);
    }
  }, []);

  function dismiss() {
    setDismissed(true);
    localStorage.setItem("synapseforge-setup-seen", "true");
  }

  const steps: SetupStep[] = [
    {
      id: "instance",
      label: t("step1label"),
      description: t("step1desc"),
      href: "/dashboard/instances/new",
      icon: Bot,
      check: () => instances.length > 0,
    },
    {
      id: "credentials",
      label: t("step2label"),
      description: t("step2desc"),
      href: instances[0] ? `/dashboard/instances/${instances[0].id}` : "/dashboard/instances",
      icon: Key,
      check: () => credentials.some((c) =>
        ["openai_api_key", "anthropic_api_key", "openrouter_api_key"].includes(c.key)
      ),
    },
    {
      id: "test",
      label: t("step3label"),
      description: t("step3desc"),
      href: instances[0] ? `/dashboard/instances/${instances[0].id}/chat` : "/dashboard/instances",
      icon: MessageSquare,
      check: () => false, // Would need message count from API
    },
    {
      id: "deploy",
      label: t("step4label"),
      description: t("step4desc"),
      href: instances[0] ? `/dashboard/instances/${instances[0].id}/deploy` : "/dashboard/instances",
      icon: Rocket,
      check: () => false,
    },
  ];

  const completedSteps = steps.filter((s) => s.check()).length;
  const progress = (completedSteps / steps.length) * 100;

  if (dismissed || hasSeen || completedSteps === steps.length) return null;

  return (
    <div className="glow-border rounded-2xl bg-gradient-to-br from-violet-600/10 to-blue-600/10 border border-violet-500/20 p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">{t("title")}</h2>
          <p className="text-sm text-zinc-400">{t("subtitle")}</p>
        </div>
        <button
          onClick={dismiss}
          className="p-2 text-zinc-500 hover:text-white transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="h-2 bg-white/10 rounded-full mb-4 overflow-hidden">
        <div
          className="h-full bg-violet-500 rounded-full transition-all"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-2">
        {steps.map((step) => {
          const isComplete = step.check();
          const Icon = step.icon;

          return (
            <Link
              key={step.id}
              href={step.href}
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg transition-colors",
                isComplete
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : "bg-white/5 border border-white/10 hover:bg-white/[0.08]"
              )}
            >
              {isComplete ? (
                <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              ) : (
                <Circle className="w-5 h-5 text-zinc-500 shrink-0" />
              )}
              <div className="flex-1">
                <p className={cn(
                  "text-sm font-medium",
                  isComplete ? "text-emerald-400" : "text-white"
                )}>
                  {step.label}
                </p>
                <p className="text-xs text-zinc-500">{step.description}</p>
              </div>
              <Icon className="w-4 h-4 text-zinc-600 shrink-0" />
            </Link>
          );
        })}
      </div>
    </div>
  );
}
