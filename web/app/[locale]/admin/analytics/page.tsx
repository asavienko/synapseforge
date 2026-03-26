"use client";

import { useEffect, useState } from "react";
import { Loader2, Users, Server, MessageSquare, DollarSign, RefreshCw } from "lucide-react";

interface AnalyticsData {
  users: {
    total: number;
    newToday: number;
    newThisMonth: number;
    byPlan: { plan: string; count: number }[];
  };
  instances: {
    total: number;
    active: number;
    byStatus: Record<string, number>;
  };
  messages: {
    total: number;
    today: number;
    thisMonth: number;
  };
  trends: {
    signupsByDay: { date: string; count: number }[];
  };
  events?: {
    topEvents: { event: string; count: number }[];
  };
  revenue?: {
    checkoutStarted: number;
    checkoutCompleted: number;
    conversionRate: number;
  };
  generatedAt: string;
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

function timeAgo(date: string): string {
  const seconds = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
}) {
  return (
    <div className="p-6 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-zinc-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
          {subtitle && <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">{subtitle}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (!res.ok) throw new Error("Failed to fetch");
      const json = await res.json();
      setData(json);
      setError(null);
    } catch {
      setError("Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      fetchAnalytics();
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
        {error || "Failed to load analytics"}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Platform Analytics</h2>
        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-zinc-500" title={new Date(data.generatedAt).toLocaleString()}>
            {timeAgo(data.generatedAt)}
          </span>
          <button
            onClick={fetchAnalytics}
            disabled={loading}
            className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 dark:bg-white/5 hover:bg-gray-200 dark:bg-white/10 disabled:opacity-50 rounded-lg text-sm text-gray-700 dark:text-zinc-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </button>
        </div>
      </div>

      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Users"
          value={formatNumber(data.users.total)}
          subtitle={`+${data.users.newToday} today`}
          icon={Users}
        />
        <StatCard
          title="Paid Users"
          value={formatNumber(data.users.byPlan.filter((p) => p.plan !== 'free').reduce((acc, p) => acc + p.count, 0))}
          subtitle={`${Math.round((data.users.byPlan.filter((p) => p.plan !== 'free').reduce((acc, p) => acc + p.count, 0) / data.users.total) * 100)}% of total`}
          icon={DollarSign}
        />
        <StatCard
          title="AI Instances"
          value={formatNumber(data.instances.total)}
          subtitle={`${data.instances.active} active`}
          icon={Server}
        />
        <StatCard
          title="Total Messages"
          value={formatNumber(data.messages.total)}
          subtitle={`+${formatNumber(data.messages.today)} today`}
          icon={MessageSquare}
        />
      </div>

      {/* Revenue Metrics */}
      {data.revenue && (
        <div className="p-6 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Revenue Metrics (Last 30 Days)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-zinc-500 mb-1">Checkouts Started</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{data.revenue.checkoutStarted}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-zinc-500 mb-1">Checkouts Completed</p>
              <p className="text-2xl font-bold text-emerald-400">{data.revenue.checkoutCompleted}</p>
            </div>
            <div className="p-4 bg-gray-50 dark:bg-white/5 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-zinc-500 mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{data.revenue.conversionRate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Users by Plan */}
      <div className="p-6 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Users by Plan</h3>
        <div className="space-y-3">
          {data.users.byPlan.map((plan) => (
            <div key={plan.plan} className="flex items-center justify-between">
              <span className="text-gray-500 dark:text-zinc-400 capitalize">{plan.plan}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${(plan.count / data.users.total) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-gray-700 dark:text-zinc-300 w-12 text-right">
                  {plan.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instances by Status */}
      <div className="p-6 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Instances by Status</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(data.instances.byStatus).map(([status, count]) => (
            <div
              key={status}
              className="flex items-center gap-2 px-4 py-2 bg-gray-50 dark:bg-white/5 rounded-lg"
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  status === "running"
                    ? "bg-emerald-500"
                    : status === "stopped"
                    ? "bg-amber-500"
                    : "bg-zinc-500"
                }`}
              />
              <span className="text-sm text-gray-700 dark:text-zinc-300 capitalize">{status}</span>
              <span className="text-sm text-gray-500 dark:text-zinc-500">({count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Events */}
      {data.events?.topEvents && data.events.topEvents.length > 0 && (
        <div className="p-6 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Top Events (Last 30 Days)</h3>
          <div className="space-y-3">
            {data.events.topEvents.map((evt) => (
              <div key={evt.event} className="flex items-center justify-between">
                <span className="text-gray-500 dark:text-zinc-400 font-mono text-sm">{evt.event}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${(evt.count / (data.events?.topEvents[0]?.count || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-gray-700 dark:text-zinc-300 w-12 text-right">
                    {formatNumber(evt.count)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Signups */}
      <div className="p-6 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Daily Signups (Last 30 Days)</h3>
        <div className="flex items-end gap-1 h-32">
          {data.trends.signupsByDay.slice(-30).map((day) => {
            const maxCount = Math.max(...data.trends.signupsByDay.map((d) => d.count), 1);
            const height = (day.count / maxCount) * 100;
            return (
              <div
                key={day.date}
                className="flex-1 bg-blue-500/20 hover:bg-blue-600/40 transition-colors rounded-t"
                style={{ height: `${Math.max(height, 5)}%` }}
                title={`${day.date}: ${day.count} signups`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-zinc-500">
          <span>{data.trends.signupsByDay[0]?.date}</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}