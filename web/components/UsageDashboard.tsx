"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { BarChart3, Bot, MessageSquare, Zap, Calendar, AlertTriangle } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface UsageData {
  plan: string;
  messagesUsed: number;
  messagesLimit: number;
  instancesUsed: number;
  instancesLimit: number;
  apiCallsUsed: number;
  apiCallsLimit: number;
  periodStart: string;
  periodEnd: string;
  daysRemaining: number;
}

export function UsageDashboard() {
  const t = useTranslations("usageDashboard");
  const [usage, setUsage] = useState<UsageData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsage();
  }, []);

  async function fetchUsage() {
    try {
      const res = await fetch("/api/user/usage");
      if (res.ok) {
        const data = await res.json();
        setUsage(data);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="glow-border rounded-2xl bg-white/[0.02] p-6 mb-6">
        <div className="flex items-center gap-3 mb-6">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <h2 className="font-semibold text-white">Usage</h2>
        </div>
        <div className="h-32 flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (!usage) {
    return null;
  }

  const messagePercent = Math.min((usage.messagesUsed / usage.messagesLimit) * 100, 100);
  const instancePercent = Math.min((usage.instancesUsed / usage.instancesLimit) * 100, 100);
  const apiPercent = Math.min((usage.apiCallsUsed / usage.apiCallsLimit) * 100, 100);

  const isNearLimit = messagePercent >= 80 || instancePercent >= 80 || apiPercent >= 80;

  return (
    <section className="glow-border rounded-2xl bg-white/[0.02] p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center">
            <BarChart3 className="w-5 h-5 text-emerald-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Usage This Month</h2>
            <p className="text-sm text-zinc-500">{usage.daysRemaining} days remaining</p>
          </div>
        </div>
        
        {isNearLimit && (
          <div className="flex items-center gap-2 text-amber-400 text-sm">
            <AlertTriangle className="w-4 h-4" />
            <span className="hidden sm:inline">Approaching limit</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <UsageCard
          icon={MessageSquare}
          label={t("messages")}
          used={usage.messagesUsed}
          limit={usage.messagesLimit}
          percent={messagePercent}
          color="blue"
        />
        
        <UsageCard
          icon={Bot}
          label={t("instances")}
          used={usage.instancesUsed}
          limit={usage.instancesLimit}
          percent={instancePercent}
          color="violet"
        />
        
        <UsageCard
          icon={Zap}
          label={t("apiCalls")}
          used={usage.apiCallsUsed}
          limit={usage.apiCallsLimit}
          percent={apiPercent}
          color="amber"
        />
      </div>

      <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 text-zinc-500">
          <Calendar className="w-4 h-4" />
          <span>
            Period: {new Date(usage.periodStart).toLocaleDateString()} - {new Date(usage.periodEnd).toLocaleDateString()}
          </span>
        </div>
        <Link
          href="/dashboard/billing"
          className="text-violet-400 hover:text-violet-300 transition-colors"
        >
          Upgrade plan →
        </Link>
      </div>
    </section>
  );
}

function UsageCard({
  icon: Icon,
  label,
  used,
  limit,
  percent,
  color,
}: {
  icon: React.ElementType;
  label: string;
  used: number;
  limit: number;
  percent: number;
  color: "blue" | "violet" | "amber";
}) {
  const colorClasses = {
    blue: "bg-blue-500",
    violet: "bg-violet-500",
    amber: "bg-amber-500",
  };

  const isHigh = percent >= 80;
  const isMedium = percent >= 50;

  return (
    <div className="p-4 bg-white/5 border border-white/10 rounded-xl">
      <div className="flex items-center gap-3 mb-3">
        <div className={cn(
          "w-8 h-8 rounded-lg flex items-center justify-center",
          color === "blue" && "bg-blue-500/20",
          color === "violet" && "bg-violet-500/20",
          color === "amber" && "bg-amber-500/20"
        )}>
          <Icon className={cn(
            "w-4 h-4",
            color === "blue" && "text-blue-400",
            color === "violet" && "text-violet-400",
            color === "amber" && "text-amber-400"
          )} />
        </div>
        <span className="text-sm text-zinc-400">{label}</span>
      </div>

      <div className="mb-2">
        <span className="text-2xl font-bold text-white">{used.toLocaleString()}</span>
        <span className="text-zinc-500 text-sm"> / {limit === -1 ? "∞" : limit.toLocaleString()}</span>
      </div>

      <div className="h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={cn(
            "h-full rounded-full transition-all",
            colorClasses[color],
            isHigh && "bg-red-500"
          )}
          style={{ width: `${percent}%` }}
        />
      </div>

      <p className={cn(
        "text-xs mt-2",
        isHigh ? "text-red-400" : isMedium ? "text-amber-400" : "text-zinc-500"
      )}>
        {percent.toFixed(0)}% used
        {isHigh && " — Consider upgrading"}
      </p>
    </div>
  );
}
