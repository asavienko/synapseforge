"use client";

import { useEffect, useState } from "react";
import { BarChart3, MessageSquare, Clock, TrendingUp, AlertCircle } from "lucide-react";

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
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadAnalytics();
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
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-white">Analytics (7 days)</span>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 rounded-lg bg-white/10 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-white">Analytics</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <AlertCircle className="w-4 h-4" />
          <span>Failed to load analytics</span>
        </div>
      </div>
    );
  }

  const topChannel = data.channelStats[0];

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-4 h-4 text-violet-400" />
          <span className="text-sm font-semibold text-white">Analytics (7 days)</span>
        </div>
        <button
          onClick={loadAnalytics}
          className="text-xs text-zinc-500 hover:text-zinc-300 transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-white/[0.03] p-3">
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
            <MessageSquare className="w-3 h-3" />
            <span>Messages</span>
          </div>
          <div className="text-xl font-bold text-white">{data.totalMessages.toLocaleString()}</div>
          <div className="text-xs text-zinc-600">{data.avgMessagesPerDay}/day avg</div>
        </div>

        <div className="rounded-lg bg-white/[0.03] p-3">
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
            <Clock className="w-3 h-3" />
            <span>Avg Response</span>
          </div>
          <div className="text-xl font-bold text-white">
            {data.avgResponseTime > 0 ? `${data.avgResponseTime}s` : "—"}
          </div>
          <div className="text-xs text-zinc-600">
            {data.avgResponseTime < 5 ? "Fast ⚡" : data.avgResponseTime < 15 ? "Good" : "Slow"}
          </div>
        </div>

        <div className="rounded-lg bg-white/[0.03] p-3">
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
            <TrendingUp className="w-3 h-3" />
            <span>Top Channel</span>
          </div>
          <div className="text-xl font-bold text-white truncate">
            {topChannel ? topChannel.source : "—"}
          </div>
          <div className="text-xs text-zinc-600">
            {topChannel ? `${topChannel.count} msgs` : "No data"}
          </div>
        </div>

        <div className="rounded-lg bg-white/[0.03] p-3">
          <div className="flex items-center gap-1.5 text-zinc-500 text-xs mb-1">
            <BarChart3 className="w-3 h-3" />
            <span>Active Days</span>
          </div>
          <div className="text-xl font-bold text-white">{data.dailyStats.length}</div>
          <div className="text-xs text-zinc-600">of last 7 days</div>
        </div>
      </div>
    </div>
  );
}
