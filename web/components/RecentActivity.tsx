"use client";

import { useEffect, useState } from "react";
import { Activity, Bot, MessageSquare, Zap, AlertCircle, CheckCircle2 } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface ActivityItem {
  id: string;
  type: "message" | "instance_started" | "instance_stopped" | "health_alert" | "health_recovered";
  message: string;
  timestamp: string;
  instanceName?: string;
}

export function RecentActivity() {
  const t = useTranslations("recentActivity");
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchActivity();
  }, []);

  async function fetchActivity() {
    try {
      const res = await fetch("/api/user/activity");
      if (res.ok) {
        const data = await res.json();
        setActivities(data.activities ?? []);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="glow-border rounded-2xl bg-white dark:bg-white/[0.02] p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        </div>
        <div className="h-24 flex items-center justify-center">
          <div className="w-6 h-6 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="glow-border rounded-2xl bg-white dark:bg-white/[0.02] p-6">
        <div className="flex items-center gap-3 mb-4">
          <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          <h2 className="font-semibold text-gray-900 dark:text-white">Recent Activity</h2>
        </div>
        <div className="text-center py-8 text-gray-500 dark:text-zinc-500">
          <Zap className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No recent activity</p>
          <p className="text-xs">Your AI instances will show activity here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="glow-border rounded-2xl bg-white dark:bg-white/[0.02] p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Activity className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-gray-900 dark:text-white">{t("title")}</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-500">{t("last24h")}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {activities.slice(0, 5).map((activity) => (
          <div
            key={activity.id}
            className="flex items-start gap-3 p-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg"
          >
            <ActivityIcon type={activity.type} />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-700 dark:text-zinc-300">{activity.message}</p>
              {activity.instanceName && (
                <p className="text-xs text-gray-500 dark:text-zinc-500 mt-0.5">{activity.instanceName}</p>
              )}
              <p className="text-xs text-gray-400 dark:text-zinc-600 mt-1">
                {formatRelativeTime(activity.timestamp, t("justNow"))}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActivityIcon({ type }: { type: ActivityItem["type"] }) {
  const icons = {
    message: { icon: MessageSquare, color: "text-blue-400", bg: "bg-blue-500/20" },
    instance_started: { icon: Bot, color: "text-emerald-400", bg: "bg-emerald-500/20" },
    instance_stopped: { icon: Bot, color: "text-gray-500 dark:text-zinc-400", bg: "bg-zinc-500/20" },
    health_alert: { icon: AlertCircle, color: "text-red-400", bg: "bg-red-500/20" },
    health_recovered: { icon: CheckCircle2, color: "text-emerald-400", bg: "bg-emerald-500/20" },
  };

  const config = icons[type] ?? icons.message;
  const Icon = config.icon;

  return (
    <div className={cn("w-8 h-8 rounded-lg flex items-center justify-center shrink-0", config.bg)}>
      <Icon className={cn("w-4 h-4", config.color)} />
    </div>
  );
}

function formatRelativeTime(timestamp: string, justNow: string): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  
  if (minutes < 1) return justNow;
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}
