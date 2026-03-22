"use client";

import { useEffect, useState } from "react";
import { Loader2, Users, Server, MessageSquare, TrendingUp, DollarSign } from "lucide-react";

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
    <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-zinc-500 mb-1">{title}</p>
          <p className="text-3xl font-bold text-white">{value}</p>
          {subtitle && <p className="text-sm text-zinc-400 mt-1">{subtitle}</p>}
        </div>
        <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
          <Icon className="w-5 h-5 text-violet-400" />
        </div>
      </div>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/admin/analytics");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch {
        setError("Failed to load analytics");
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
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
        <span className="text-sm text-zinc-500">
          Last updated: {new Date(data.generatedAt).toLocaleTimeString()}
        </span>
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
        <StatCard
          title="New Users (30d)"
          value={formatNumber(data.users.newThisMonth)}
          subtitle="Last 30 days"
          icon={TrendingUp}
        />
      </div>

      {/* Revenue Metrics */}
      {data.revenue && (
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Revenue Metrics (Last 30 Days)</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-zinc-500 mb-1">Checkouts Started</p>
              <p className="text-2xl font-bold text-white">{data.revenue.checkoutStarted}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-zinc-500 mb-1">Checkouts Completed</p>
              <p className="text-2xl font-bold text-emerald-400">{data.revenue.checkoutCompleted}</p>
            </div>
            <div className="p-4 bg-white/5 rounded-lg">
              <p className="text-sm text-zinc-500 mb-1">Conversion Rate</p>
              <p className="text-2xl font-bold text-violet-400">{data.revenue.conversionRate}%</p>
            </div>
          </div>
        </div>
      )}

      {/* Users by Plan */}
      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Users by Plan</h3>
        <div className="space-y-3">
          {data.users.byPlan.map((plan) => (
            <div key={plan.plan} className="flex items-center justify-between">
              <span className="text-zinc-400 capitalize">{plan.plan}</span>
              <div className="flex items-center gap-3">
                <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-violet-500 rounded-full"
                    style={{
                      width: `${(plan.count / data.users.total) * 100}%`,
                    }}
                  />
                </div>
                <span className="text-sm text-zinc-300 w-12 text-right">
                  {plan.count}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Instances by Status */}
      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Instances by Status</h3>
        <div className="flex flex-wrap gap-4">
          {Object.entries(data.instances.byStatus).map(([status, count]) => (
            <div
              key={status}
              className="flex items-center gap-2 px-4 py-2 bg-white/5 rounded-lg"
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
              <span className="text-sm text-zinc-300 capitalize">{status}</span>
              <span className="text-sm text-zinc-500">({count})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Top Events */}
      {data.events?.topEvents && data.events.topEvents.length > 0 && (
        <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
          <h3 className="text-lg font-semibold mb-4">Top Events (Last 30 Days)</h3>
          <div className="space-y-3">
            {data.events.topEvents.map((evt) => (
              <div key={evt.event} className="flex items-center justify-between">
                <span className="text-zinc-400 font-mono text-sm">{evt.event}</span>
                <div className="flex items-center gap-3">
                  <div className="w-32 h-2 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{
                        width: `${(evt.count / (data.events?.topEvents[0]?.count || 1)) * 100}%`,
                      }}
                    />
                  </div>
                  <span className="text-sm text-zinc-300 w-12 text-right">
                    {formatNumber(evt.count)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Signups */}
      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl">
        <h3 className="text-lg font-semibold mb-4">Daily Signups (Last 30 Days)</h3>
        <div className="flex items-end gap-1 h-32">
          {data.trends.signupsByDay.slice(-30).map((day) => {
            const maxCount = Math.max(...data.trends.signupsByDay.map((d) => d.count), 1);
            const height = (day.count / maxCount) * 100;
            return (
              <div
                key={day.date}
                className="flex-1 bg-violet-500/20 hover:bg-violet-500/40 transition-colors rounded-t"
                style={{ height: `${Math.max(height, 5)}%` }}
                title={`${day.date}: ${day.count} signups`}
              />
            );
          })}
        </div>
        <div className="flex justify-between mt-2 text-xs text-zinc-500">
          <span>{data.trends.signupsByDay[0]?.date}</span>
          <span>Today</span>
        </div>
      </div>
    </div>
  );
}