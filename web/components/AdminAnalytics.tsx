"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { Users, Server, TrendingUp, DollarSign, Loader2, AlertCircle, UserPlus } from "lucide-react";

interface AnalyticsData {
  usersByPlan: Array<{ plan: string; count: number }>;
  instancesByStatus: Array<{ status: string; count: number }>;
  healthStatus: Array<{ status: string; count: number }>;
  mrr: number;
  totalUsers: number;
  recentSignups: number;
  weeklySignups: number;
  usersNeedingManager: number;
  recentActivity: Array<{
    id: string;
    event: string;
    details: string | null;
    createdAt: string;
    instanceName: string | null;
    userName: string | null;
    userEmail: string | null;
  }>;
}

const COLORS = ["#8b5cf6", "#10b981", "#f59e0b", "#ef4444", "#3b82f6", "#ec4899"];

export function AdminAnalytics() {
  const t = useTranslations("admin.analytics");
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const res = await fetch("/api/admin/analytics");
        if (!res.ok) throw new Error("Failed to fetch");
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
      } finally {
        setLoading(false);
      }
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-6 h-6 text-zinc-600 animate-spin" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex items-center gap-2 text-red-400">
        <AlertCircle className="w-5 h-5" />
        <span>{error || "Failed to load"}</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glow-border rounded-2xl p-4 bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-violet-500/10 rounded-lg">
              <Users className="w-4 h-4 text-violet-400" />
            </div>
            <span className="text-xs text-zinc-500">{t("totalUsers") || "Total Users"}</span>
          </div>
          <div className="text-2xl font-bold text-white">{data.totalUsers}</div>
          <div className="text-xs text-emerald-400 mt-1">
            +{data.weeklySignups} this week
          </div>
        </div>

        <div className="glow-border rounded-2xl p-4 bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <span className="text-xs text-zinc-500">{t("mrr") || "MRR"}</span>
          </div>
          <div className="text-2xl font-bold text-white">${data.mrr.toLocaleString()}</div>
          <div className="text-xs text-zinc-500 mt-1">
            {t("monthlyRecurring") || "Monthly recurring"}
          </div>
        </div>

        <div className="glow-border rounded-2xl p-4 bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-500/10 rounded-lg">
              <Server className="w-4 h-4 text-blue-400" />
            </div>
            <span className="text-xs text-zinc-500">{t("instances") || "Instances"}</span>
          </div>
          <div className="text-2xl font-bold text-white">
            {data.instancesByStatus.reduce((sum, s) => sum + s.count, 0)}
          </div>
          <div className="text-xs text-zinc-500 mt-1">
            {data.instancesByStatus.find((s) => s.status === "running")?.count || 0} running
          </div>
        </div>

        <div className="glow-border rounded-2xl p-4 bg-white/[0.02] border border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-amber-500/10 rounded-lg">
              <UserPlus className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-xs text-zinc-500">{t("needManager") || "Need Manager"}</span>
          </div>
          <div className="text-2xl font-bold text-white">{data.usersNeedingManager}</div>
          <div className="text-xs text-amber-400 mt-1">
            {t("unassignedUsers") || "Unassigned users"}
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Users by Plan */}
        <div className="glow-border rounded-2xl p-5 bg-white/[0.02] border border-white/5">
          <h3 className="text-sm font-semibold text-white mb-4">{t("usersByPlan") || "Users by Plan"}</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.usersByPlan}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis
                  dataKey="plan"
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <YAxis
                  tick={{ fill: "#71717a", fontSize: 10 }}
                  axisLine={{ stroke: "rgba(255,255,255,0.1)" }}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
                <Bar dataKey="count" fill="#8b5cf6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Instance Health */}
        <div className="glow-border rounded-2xl p-5 bg-white/[0.02] border border-white/5">
          <h3 className="text-sm font-semibold text-white mb-4">{t("instanceHealth") || "Instance Health"}</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.healthStatus}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="count"
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {data.healthStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(0,0,0,0.9)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "8px",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="glow-border rounded-2xl p-5 bg-white/[0.02] border border-white/5">
        <h3 className="text-sm font-semibold text-white mb-4">{t("recentActivity") || "Recent Activity"}</h3>
        <div className="space-y-2">
          {data.recentActivity.length === 0 ? (
            <div className="text-zinc-500 text-sm">{t("noActivity") || "No recent activity"}</div>
          ) : (
            data.recentActivity.map((activity) => (
              <div
                key={activity.id}
                className="flex items-center justify-between py-2 px-3 bg-white/5 rounded-lg"
              >
                <div className="min-w-0">
                  <div className="text-sm text-zinc-300">
                    {activity.event.replace(/_/g, " ")}
                  </div>
                  {activity.instanceName && (
                    <div className="text-xs text-zinc-500">
                      {activity.instanceName} · {activity.userName}
                    </div>
                  )}
                </div>
                <div className="text-xs text-zinc-500 shrink-0">
                  {new Date(activity.createdAt).toLocaleString()}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}