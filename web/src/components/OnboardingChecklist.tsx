"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Check, X, Bot, Key, MessageSquare, Rocket, ChevronRight } from "lucide-react";

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
  const [isVisible, setIsVisible] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);

  useEffect(() => {
    // Check if user has dismissed the checklist
    const dismissed = localStorage.getItem("sf_onboarding_checklist_dismissed");
    if (!dismissed) {
      setIsVisible(true);
    }
  }, []);

  const handleDismiss = () => {
    localStorage.setItem("sf_onboarding_checklist_dismissed", "1");
    setIsDismissed(true);
    setTimeout(() => setIsVisible(false), 300);
  };

  const steps = [
    {
      id: "create",
      label: "Create your first AI instance",
      done: hasInstances,
      href: "/dashboard/instances",
      icon: Bot,
    },
    {
      id: "apikey",
      label: "Add your OpenAI API key",
      done: hasApiKey,
      href: instanceId ? `/dashboard/instances/${instanceId}` : "/dashboard/instances",
      icon: Key,
    },
    {
      id: "channel",
      label: "Connect a channel (Telegram, Discord)",
      done: hasChannel,
      href: instanceId ? `/dashboard/instances/${instanceId}` : "/dashboard/instances",
      icon: MessageSquare,
    },
    {
      id: "test",
      label: "Test your AI agent",
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
      className={`mb-8 p-6 bg-gradient-to-br from-violet-500/10 to-violet-600/5 border border-violet-500/20 rounded-2xl transition-all duration-300 ${
        isDismissed ? "opacity-0 scale-95" : "opacity-100 scale-100"
      }`}
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-white mb-1">Welcome to OpenHelix AI! 🎉</h2>
          <p className="text-sm text-zinc-400">
            Complete these steps to get your AI agent running
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-zinc-500 hover:text-white transition-colors"
          aria-label="Dismiss"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="text-zinc-400">
            {completedSteps} of {totalSteps} completed
          </span>
          <span className="text-violet-400 font-medium">{Math.round(progress)}%</span>
        </div>
        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
          <div
            className="h-full bg-violet-500 rounded-full transition-all duration-500"
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
              className={`flex items-center gap-4 p-3 rounded-xl transition-all ${
                step.done
                  ? "bg-emerald-500/10 border border-emerald-500/20"
                  : "bg-white/5 hover:bg-white/10 border border-transparent"
              }`}
            >
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                  step.done
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-violet-500/10 text-violet-400"
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
                <ChevronRight className="w-5 h-5 text-zinc-500 shrink-0" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}