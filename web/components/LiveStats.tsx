"use client";

import { useEffect, useState } from "react";
import { Users, Server, MessageSquare } from "lucide-react";
import { useTranslations } from "next-intl";

interface Stats {
  users: { total: number };
  instances: { total: number; active: number };
  messages: { total: number; last24h: number };
}

function formatNumber(num: number): string {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
}

export function LiveStats() {
  const t = useTranslations("liveStats");
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/stats");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        // Silently fail - stats are nice-to-have
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading || !stats || stats.users.total === 0) {
    return null; // Don't show anything if stats aren't available yet
  }

  const items = [
    {
      icon: Users,
      value: formatNumber(stats.users.total),
      label: t("users"),
    },
    {
      icon: Server,
      value: formatNumber(stats.instances.total),
      label: t("instances"),
    },
    {
      icon: MessageSquare,
      value: formatNumber(stats.messages.total),
      label: t("messages"),
    },
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
      {items.map((item) => (
        <div key={item.label} className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center">
            <item.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">{item.value}</div>
            <div className="text-sm text-gray-500 dark:text-zinc-500">{item.label}</div>
          </div>
        </div>
      ))}
    </div>
  );
}
