"use client";

import { useEffect, useState } from "react";
import { BarChart3, MessageSquare, Clock, TrendingUp } from "lucide-react";

interface AnalyticsData {
  period: number;
  totalMessages: number;
  avgMessagesPerDay: number;
  avgResponseTime: number;
  dailyStats: Array<{ date: string; count: number }>;
  channelStats: Array<{ source: string; count: number }>;
}

interface AnalyticsTabProps {
  instanceId: string;
}

export function AnalyticsTab({ instanceId }: AnalyticsTabProps) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState(7);

  useEffect(() => {
    fetch(`/api/instances/${instanceId}/analytics?days=${period}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to fetch analytics:", err);
        setLoading(false);
      });
  }, [instanceId, period]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-zinc-500">
        Failed to load analytics
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    if (seconds < 60) return `${Math.round(seconds)}s`;
    return `${Math.round(seconds / 60)}m`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-6">
      {/* Period Selector */}
      <div className="flex gap-2">
        {[7, 30, 90].map((days) => (
          <button
            key={days}
            onClick={() => setPeriod(days)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              period === days
                ? "bg-blue-600 text-white"
                : "bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-zinc-400 hover:bg-gray-200 dark:bg-white/10"
            }`}
          >
            Last {days} days
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <StatCard
          icon={MessageSquare}
          label="Total Messages"
          value={data.totalMessages}
        />
        <StatCard
          icon={BarChart3}
          label="Avg Messages/Day"
          value={data.avgMessagesPerDay}
        />
        <StatCard
          icon={Clock}
          label="Avg Response Time"
          value={formatTime(data.avgResponseTime)}
        />
      </div>

      {/* Daily Chart */}
      {data.dailyStats.length > 0 && (
        <div className="glow-border rounded-2xl bg-white dark:bg-white/[0.02] overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-white/5">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h3 className="font-semibold">Daily Activity</h3>
            </div>
          </div>
          <div className="p-4">
            <div className="flex items-end gap-1 h-32">
              {data.dailyStats.map((day, i) => {
                const max = Math.max(...data.dailyStats.map((d) => d.count));
                const height = max > 0 ? (day.count / max) * 100 : 0;
                return (
                  <div
                    key={i}
                    className="flex-1 flex flex-col items-center gap-1"
                  >
                    <div
                      className="w-full bg-blue-600/50 rounded-t"
                      style={{ height: `${height}%` }}
                      title={`${formatDate(day.date)}: ${day.count} messages`}
                    />
                    <span className="text-[10px] text-gray-500 dark:text-zinc-500">
                      {new Date(day.date).getDate()}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Channel Breakdown */}
      {data.channelStats.length > 0 && (
        <div className="glow-border rounded-2xl bg-white dark:bg-white/[0.02] overflow-hidden">
          <div className="p-4 border-b border-gray-200 dark:border-white/5">
            <h3 className="font-semibold">Channel Breakdown</h3>
          </div>
          <div className="p-4 space-y-3">
            {data.channelStats.map((channel) => {
              const total = data.channelStats.reduce((a, b) => a + b.count, 0);
              const percentage = Math.round((channel.count / total) * 100);
              return (
                <div key={channel.source} className="flex items-center gap-3">
                  <span className="w-20 text-sm text-gray-500 dark:text-zinc-400 capitalize">
                    {channel.source}
                  </span>
                  <div className="flex-1 h-2 bg-gray-200 dark:bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-16 text-sm text-right">
                    {channel.count} ({percentage}%)
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof MessageSquare;
  label: string;
  value: string | number;
}) {
  return (
    <div className="glow-border rounded-xl bg-white dark:bg-white/[0.02] p-4">
      <div className="flex items-center gap-3 mb-2">
        <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <Icon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
        </div>
        <span className="text-xs text-gray-500 dark:text-zinc-500">{label}</span>
      </div>
      <div className="text-2xl font-bold">{value}</div>
    </div>
  );
}
