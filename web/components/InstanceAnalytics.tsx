"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
} from "recharts";
import { Loader2, TrendingUp, MessageSquare, Clock, AlertCircle } from "lucide-react";

interface DailyStats {
  date: string;
  requests: number;
  errors: number;
  avgLatency: number;
}

interface InstanceAnalyticsProps {
  instanceId?: string; // If not provided, shows aggregate for all user instances
}

export function InstanceAnalytics({ instanceId }: InstanceAnalyticsProps) {
  const t = useTranslations("dashboard.analytics");
  const [period, setPeriod] = useState<7 | 30>(7);
  const [data, setData] = useState<DailyStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      setLoading(true);
      setError(null);
      try {
        const url = instanceId
          ? `/api/instances/${instanceId}/analytics?days=${period}`
          : `/api/user/analytics?days=${period}`;
        const res = await fetch(url);
        if (!res.ok) throw new Error("Failed to fetch analytics");
        const json = await res.json();
        setData(json.data ?? []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, [instanceId, period]);

  // Calculate summary stats
  const totalRequests = data.reduce((sum, d) => sum + d.requests, 0);
  const totalErrors = data.reduce((sum, d) => sum + d.errors, 0);
  const avgLatency = data.length > 0
    ? Math.round(data.reduce((sum, d) => sum + d.avgLatency, 0) / data.length)
    : 0;
  const errorRate = totalRequests > 0 ? ((totalErrors / totalRequests) * 100).toFixed(1) : "0";

  if (loading) {
    return (
      <div className="glow-border rounded-2xl p-6 bg-white/[0.02] border border-white/5 flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glow-border rounded-2xl p-6 bg-white/[0.02] border border-white/5">
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-5 h-5" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="glow-border rounded-2xl p-5 bg-white/[0.02] border border-white/5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-violet-400" />
            {t("title") || "Usage Analytics"}
          </h3>
          <p className="text-xs text-zinc-500 mt-0.5">
            {t("subtitle") || `Last ${period} days activity`}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setPeriod(7)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              period === 7
                ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                : "text-zinc-500 hover:text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/10"
            }`}
          >
            7d
          </button>
          <button
            onClick={() => setPeriod(30)}
            className={`text-xs px-3 py-1.5 rounded-lg transition-colors ${
              period === 30
                ? "bg-violet-500/20 text-violet-400 border border-violet-500/30"
                : "text-zinc-500 hover:text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/10"
            }`}
          >
            30d
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase tracking-wider mb-1">
            <MessageSquare className="w-3 h-3" />
            {t("requests") || "Requests"}
          </div>
          <div className="text-lg font-bold text-white">{totalRequests.toLocaleString()}</div>
        </div>
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase tracking-wider mb-1">
            <Clock className="w-3 h-3" />
            {t("avgLatency") || "Avg Latency"}
          </div>
          <div className="text-lg font-bold text-white">{avgLatency}ms</div>
        </div>
        <div className="p-3 bg-white/5 rounded-xl border border-white/5">
          <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] uppercase tracking-wider mb-1">
            <AlertCircle className="w-3 h-3" />
            {t("errorRate") || "Error Rate"}
          </div>
          <div className={`text-lg font-bold ${Number(errorRate) > 5 ? "text-red-400" : "text-emerald-400"}`}>
            {errorRate}%
          </div>
        </div>
      </div>

      {/* Chart */}
      {data.length === 0 ? (
        <div className="text-center py-12 text-zinc-500 text-sm">
          {t("noData") || "No usage data available yet."}
        </div>
      ) : (
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorRequests" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis
                dataKey="date"
                tick={{ fill: "#71717a", fontSize: 10 }}
                tickFormatter={(value) => {
                  const date = new Date(value);
                  return `${date.getMonth() + 1}/${date.getDate()}`;
                }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
              />
              <YAxis
                tick={{ fill: "#71717a", fontSize: 10 }}
                axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                tickFormatter={(value) => value >= 1000 ? `${(value / 1000).toFixed(1)}k` : value}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(0,0,0,0.9)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                labelStyle={{ color: "#a1a1aa" }}
                itemStyle={{ color: "#e4e4e7" }}
                formatter={(value: number) => [value.toLocaleString(), "Requests"]}
                labelFormatter={(label) => new Date(label).toLocaleDateString()}
              />
              <Area
                type="monotone"
                dataKey="requests"
                stroke="#8b5cf6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorRequests)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}