"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ArrowUpRight, AlertTriangle } from "lucide-react";

interface PlanUsageProps {
  plan: string;
  instanceCount: number;
  instanceLimit: number | null;
  messageCount?: number;
  messageLimit?: number | null;
}

export function PlanUsageCard({
  plan,
  instanceCount,
  instanceLimit,
  messageCount = 0,
  messageLimit = null,
}: PlanUsageProps) {
  const t = useTranslations("dashboard.planUsage");

  const instancePct = instanceLimit ? Math.min(100, (instanceCount / instanceLimit) * 100) : 0;
  const messagePct = messageLimit ? Math.min(100, (messageCount / messageLimit) * 100) : 0;

  const isInstanceNearLimit = instanceLimit && instanceCount >= instanceLimit * 0.8;
  const isMessageNearLimit = messageLimit && messageCount >= messageLimit * 0.8;
  const shouldShowUpgrade = isInstanceNearLimit || isMessageNearLimit || plan === "free";

  return (
    <div className="glow-border rounded-2xl p-5 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{t("title") || "Plan Usage"}</h3>
          <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">
            {t("currentPlan") || "Current plan:"} <span className="text-gray-700 dark:text-zinc-300 capitalize">{plan}</span>
          </p>
        </div>
        {shouldShowUpgrade && (
          <Link
            href="/dashboard/billing"
            className="flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-300 bg-blue-500/10 hover:bg-blue-600/20 px-2.5 py-1 rounded-lg transition-colors"
          >
            {t("upgrade") || "Upgrade"}
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        )}
      </div>

      {/* Instance Usage */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-xs mb-1.5">
          <span className="text-gray-500 dark:text-zinc-400">{t("instances") || "Instances"}</span>
          <span className={isInstanceNearLimit ? "text-amber-400" : "text-gray-500 dark:text-zinc-500"}>
            {instanceCount} / {instanceLimit ?? "∞"}
          </span>
        </div>
        <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${
              isInstanceNearLimit ? "bg-amber-500" : "bg-blue-500"
            }`}
            style={{ width: `${instanceLimit ? instancePct : 0}%` }}
          />
        </div>
        {isInstanceNearLimit && (
          <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-amber-400">
            <AlertTriangle className="w-3 h-3" />
            {t("nearInstanceLimit") || "Approaching instance limit"}
          </div>
        )}
      </div>

      {/* Message Usage */}
      {messageLimit && (
        <div className="mb-2">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-gray-500 dark:text-zinc-400">{t("messages") || "Messages"}</span>
            <span className={isMessageNearLimit ? "text-amber-400" : "text-gray-500 dark:text-zinc-500"}>
              {messageCount.toLocaleString()} / {messageLimit.toLocaleString()}
            </span>
          </div>
          <div className="w-full h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${
                isMessageNearLimit ? "bg-amber-500" : "bg-blue-500"
              }`}
              style={{ width: `${messagePct}%` }}
            />
          </div>
          {isMessageNearLimit && (
            <div className="flex items-center gap-1.5 mt-1.5 text-[11px] text-amber-400">
              <AlertTriangle className="w-3 h-3" />
              {t("nearMessageLimit") || "Approaching message limit"}
            </div>
          )}
        </div>
      )}

      {/* Free plan CTA */}
      {plan === "free" && (
        <div className="mt-4 p-3 bg-blue-500/5 border border-blue-500/20 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-zinc-400 mb-2">
            {t("freePlanUpgradePrompt") || "Upgrade to unlock more instances and premium features."}
          </p>
          <Link
            href="/dashboard/billing"
            className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-300 transition-colors"
          >
            {t("viewPlans") || "View plans"}
            <ArrowUpRight className="w-3 h-3" />
          </Link>
        </div>
      )}
    </div>
  );
}