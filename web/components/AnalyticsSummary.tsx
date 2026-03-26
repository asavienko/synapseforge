"use client";

import { useEffect, useState } from "react";
import { BarChart3, MessageSquare, Clock, TrendingUp, AlertCircle } from "lucide-react";
import { useTranslations } from "next-intl";

interface AnalyticsData {
  period: number;
  totalMessages: number;
  avgMessagesPerDay: number;
  avgResponseTime: number;
  dailyStats: Array<{ date: string; count: number }>;
  channelStats: Array<{ source: string; count: number }>;
}

interface AnalyticsSummaryProps {
  instanceId: string;
}

export function AnalyticsSummary({ instanceId }: AnalyticsSummaryProps) {
  const t = useTranslations("analyticsSummary");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instanceId]);

  async function loadAnalytics() {
    try {
      setLoading(true);
      const res = await fetch(`/api/instances/${instanceId}/analytics?days=7`);
      if (!res.ok) throw new Error("Failed to load analytics");
      const analyticsData = await res.json();
      setData(analyticsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{t("title")}</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-gray-200 dark:bg-white/10 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{t("analytics")}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>{t("failedLoad")}</span>
        </div>
      </div>
    );
  }

  const topChannel = data.channelStats[0];
  const responseSpeed = data.avgResponseTime < 5 ? t("fast") : data.avgResponseTime < 15 ? t("good") : t("slow");

  return (
    <div className="rounded-xl border border-gray-200 dark:border-white/10 bg-white dark:bg-white/[0.02] p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-semibold text-gray-900 dark:text-white">{t("title")}</span>
        </div>
        <button
          onClick={loadAnalytics}
          className="text-xs text-gray-500 dark:text-zinc-500 hover:text-gray-700 dark:text-zinc-300 transition-colors"
        >
          {t("refresh")}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white dark:bg-white/[0.03] p-3">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-500 text-xs mb-1">
            <MessageSquare className="w-3 h-3" />
            <span>{t("messages")}</span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{data.totalMessages.toLocaleString()}</div>
          <div className="text-xs text-gray-400 dark:text-zinc-600">{data.avgMessagesPerDay}{t("perDayAvg")}</div>
        </div>

        <div className="rounded-lg bg-white dark:bg-white/[0.03] p-3">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-500 text-xs mb-1">
            <Clock className="w-3 h-3" />
            <span>{t("avgResponse")}</span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">
            {data.avgResponseTime > 0 ? `${data.avgResponseTime}s` : "—"}
          </div>
          <div className="text-xs text-gray-400 dark:text-zinc-600">
            {data.avgResponseTime > 0 ? responseSpeed : "—"}
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-white/[0.03] p-3">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-500 text-xs mb-1">
            <TrendingUp className="w-3 h-3" />
            <span>{t("topChannel")}</span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white truncate">
            {topChannel ? topChannel.source : "—"}
          </div>
          <div className="text-xs text-gray-400 dark:text-zinc-600">
            {topChannel ? `${topChannel.count} ${t("msgs")}` : t("noData")}
          </div>
        </div>

        <div className="rounded-lg bg-white dark:bg-white/[0.03] p-3">
          <div className="flex items-center gap-1.5 text-gray-500 dark:text-zinc-500 text-xs mb-1">
            <BarChart3 className="w-3 h-3" />
            <span>{t("activeDays")}</span>
          </div>
          <div className="text-xl font-bold text-gray-900 dark:text-white">{data.dailyStats.length}</div>
          <div className="text-xs text-gray-400 dark:text-zinc-600">{t("ofLast7")}</div>
        </div>
      </div>
    </div>
  );
}
