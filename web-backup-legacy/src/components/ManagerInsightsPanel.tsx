"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Lightbulb, Calendar, DollarSign, MessageSquare, Loader2, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Insight {
  id: string;
  type: "unanswered" | "complaint" | "booking" | "pricing" | "faq" | "other";
  severity: "high" | "medium" | "low";
  clientId: string;
  clientName: string;
  instanceId: string;
  instanceName: string;
  message: string;
  suggestedAction: string;
  createdAt: string;
}

interface InsightsSummary {
  total: number;
  highPriority: number;
  mediumPriority: number;
  unanswered: number;
  complaints: number;
  bookings: number;
  pricing: number;
}

const typeConfig: Record<
  string,
  { icon: React.ElementType; label: string; color: string; bgColor: string }
> = {
  unanswered: {
    icon: Lightbulb,
    label: "Knowledge Gap",
    color: "text-violet-400",
    bgColor: "bg-violet-500/10 border-violet-500/20",
  },
  complaint: {
    icon: AlertCircle,
    label: "Complaint",
    color: "text-red-400",
    bgColor: "bg-red-500/10 border-red-500/20",
  },
  booking: {
    icon: Calendar,
    label: "Booking Intent",
    color: "text-emerald-400",
    bgColor: "bg-emerald-500/10 border-emerald-500/20",
  },
  pricing: {
    icon: DollarSign,
    label: "Pricing Question",
    color: "text-amber-400",
    bgColor: "bg-amber-500/10 border-amber-500/20",
  },
};

export function ManagerInsightsPanel() {
  const [insights, setInsights] = useState<Insight[]>([]);
  const [summary, setSummary] = useState<InsightsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadInsights();
  }, []);

  async function loadInsights() {
    try {
      const res = await fetch("/api/manager/insights");
      if (!res.ok) throw new Error("Failed to load insights");
      const data = await res.json();
      setInsights(data.insights ?? []);
      setSummary(data.summary ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load");
    } finally {
      setLoading(false);
    }
  }

  function dismissInsight(id: string) {
    setDismissed((prev) => new Set(prev).add(id));
  }

  const visibleInsights = insights.filter((i) => !dismissed.has(i.id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg p-4">
        {error}
      </div>
    );
  }

  if (visibleInsights.length === 0) {
    return (
      <div className="text-center py-8">
        <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
        <p className="text-zinc-400 text-sm">No insights in the last 24 hours</p>
        <p className="text-zinc-600 text-xs mt-1">We&apos;ll notify you when something needs attention</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <SummaryCard
            label="Knowledge Gaps"
            value={summary.unanswered}
            color="violet"
          />
          <SummaryCard
            label="Complaints"
            value={summary.complaints}
            color="red"
          />
          <SummaryCard
            label="Booking Intents"
            value={summary.bookings}
            color="emerald"
          />
          <SummaryCard
            label="Pricing Questions"
            value={summary.pricing}
            color="amber"
          />
        </div>
      )}

      {/* Insights List */}
      <div className="space-y-3">
        {visibleInsights.slice(0, 10).map((insight) => {
          const config = typeConfig[insight.type] ?? typeConfig.other;
          const Icon = config.icon;

          return (
            <div
              key={insight.id}
              className={cn(
                "rounded-xl border p-4 transition-colors",
                config.bgColor
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn("mt-0.5", config.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-xs font-semibold uppercase tracking-wider", config.color)}>
                      {config.label}
                    </span>
                    {insight.severity === "high" && (
                      <span className="text-xs bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded">
                        High Priority
                      </span>
                    )}
                  </div>

                  <div className="text-sm text-white font-medium mb-1">
                    {insight.clientName} — {insight.instanceName}
                  </div>

                  <div className="text-sm text-zinc-400 mb-2 line-clamp-2">
                    &ldquo;{insight.message}&rdquo;
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-500">
                    <Lightbulb className="w-3.5 h-3.5" />
                    <span>{insight.suggestedAction}</span>
                  </div>
                </div>

                <button
                  onClick={() => dismissInsight(insight.id)}
                  className="text-zinc-600 hover:text-zinc-400 transition-colors"
                  title="Dismiss"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {visibleInsights.length > 10 && (
        <p className="text-center text-xs text-zinc-600">
          +{visibleInsights.length - 10} more insights
        </p>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "violet" | "red" | "emerald" | "amber";
}) {
  const colorClasses = {
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <div className={cn("rounded-xl border p-3 text-center", colorClasses[color])}>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-xs opacity-80">{label}</div>
    </div>
  );
}
