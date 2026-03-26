"use client";

import { useEffect, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { 
  ChevronDown, 
  ChevronUp, 
  MessageSquare, 
  HelpCircle, 
  TrendingUp, 
  TrendingDown,
  Minus,
  Loader2,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface IntentBreakdown {
  booking: number;
  pricing: number;
  complaint: number;
  faq: number;
  out_of_scope: number;
  other: number;
}

interface UnansweredQuestion {
  id: string;
  content: string;
  createdAt: string;
}

interface IntentTrend {
  intent: string;
  currentWeek: number;
  previousWeek: number;
  change: number;
}

interface InsightsData {
  intentBreakdown: IntentBreakdown;
  totalMessages: number;
  answeredCount: number;
  unansweredCount: number;
  recentUnanswered: UnansweredQuestion[];
  intentTrends: IntentTrend[];
  conversationQuality: number;
}

interface ConversationInsightsProps {
  instanceId: string;
}

const INTENT_COLORS: Record<string, string> = {
  booking: "bg-emerald-500",
  pricing: "bg-blue-500",
  complaint: "bg-red-500",
  faq: "bg-blue-500",
  out_of_scope: "bg-amber-500",
  other: "bg-zinc-500",
};

const INTENT_LABELS: Record<string, string> = {
  booking: "Booking",
  pricing: "Pricing",
  complaint: "Complaint",
  faq: "FAQ",
  out_of_scope: "Out of Scope",
  other: "Other",
};

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "yesterday";
  return `${diffDays}d ago`;
}

function getTrendIcon(change: number) {
  if (change > 0) return <TrendingUp className="w-3 h-3" />;
  if (change < 0) return <TrendingDown className="w-3 h-3" />;
  return <Minus className="w-3 h-3" />;
}

function getTrendColor(change: number): string {
  if (change > 0) return "text-emerald-400";
  if (change < 0) return "text-red-400";
  return "text-gray-500 dark:text-zinc-400";
}

export function ConversationInsights({ instanceId }: ConversationInsightsProps) {
  const t = useTranslations("insights");
  const [data, setData] = useState<InsightsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showUnanswered, setShowUnanswered] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const loadInsights = useCallback(async () => {
    try {
      const res = await fetch(`/api/instances/${instanceId}/insights`);
      if (!res.ok) {
        throw new Error("Failed to load insights");
      }
      const insightsData = await res.json();
      setData(insightsData);
      setLastUpdated(new Date());
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [instanceId]);

  // Initial load
  useEffect(() => {
    loadInsights();
  }, [loadInsights]);

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      loadInsights();
    }, 30000);
    return () => clearInterval(interval);
  }, [loadInsights]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 text-gray-500 dark:text-zinc-500 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center gap-3 text-red-400 py-8">
        <AlertCircle className="w-5 h-5" />
        <span>{error}</span>
      </div>
    );
  }

  if (!data || data.totalMessages === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-zinc-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-30" />
        <p>{t("empty")}</p>
      </div>
    );
  }

  // Calculate max value for bar chart scaling
  const maxIntentCount = Math.max(...Object.values(data.intentBreakdown), 1);

  // Calculate unanswered trend (if we have previous data, we'd compare)
  const unansweredTrend = data.unansweredCount > 0 
    ? Math.round((data.unansweredCount / data.totalMessages) * 100) 
    : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{t("title")}</h2>
        <span className="text-xs text-gray-500 dark:text-zinc-500">
          Updated {formatRelativeTime(lastUpdated.toISOString())}
        </span>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Conversation Quality */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 text-sm mb-2">
            <MessageSquare className="w-4 h-4" />
            {t("quality")}
          </div>
          <div className="flex items-end gap-2">
            <span className={cn(
              "text-3xl font-bold",
              data.conversationQuality >= 80 ? "text-emerald-400" : 
              data.conversationQuality >= 60 ? "text-amber-400" : "text-red-400"
            )}>
              {data.conversationQuality}%
            </span>
            <span className="text-gray-500 dark:text-zinc-500 text-sm mb-1">
              answered
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
            {data.answeredCount} / {data.totalMessages} messages
          </div>
        </div>

        {/* Unanswered Questions */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 text-sm mb-2">
            <HelpCircle className="w-4 h-4" />
            {t("unanswered")}
          </div>
          <div className="flex items-end gap-2">
            <span className={cn(
              "text-3xl font-bold",
              data.unansweredCount === 0 ? "text-emerald-400" : 
              data.unansweredCount < 5 ? "text-amber-400" : "text-red-400"
            )}>
              {data.unansweredCount}
            </span>
            <span className="text-gray-500 dark:text-zinc-500 text-sm mb-1">
              {unansweredTrend > 0 && `(${unansweredTrend}%)`}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
            {data.unansweredCount === 0 
              ? "All questions answered" 
              : `${data.unansweredCount} need attention`}
          </div>
        </div>

        {/* Total Messages */}
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <div className="flex items-center gap-2 text-gray-500 dark:text-zinc-400 text-sm mb-2">
            <MessageSquare className="w-4 h-4" />
            Total Messages
          </div>
          <div className="flex items-end gap-2">
            <span className="text-3xl font-bold text-gray-900 dark:text-white">
              {data.totalMessages.toLocaleString()}
            </span>
          </div>
          <div className="text-xs text-gray-500 dark:text-zinc-500 mt-1">
            All time conversations
          </div>
        </div>
      </div>

      {/* Intent Breakdown */}
      <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl p-4">
        <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">{t("intentBreakdown")}</h3>
        <div className="space-y-3">
          {Object.entries(data.intentBreakdown)
            .filter(([_, count]) => count > 0)
            .sort(([_, a], [__, b]) => b - a)
            .map(([intent, count]) => {
              const percentage = Math.round((count / data.totalMessages) * 100);
              const barWidth = `${(count / maxIntentCount) * 100}%`;
              
              return (
                <div key={intent} className="flex items-center gap-3">
                  <div className="w-24 text-sm text-gray-500 dark:text-zinc-400 shrink-0">
                    {INTENT_LABELS[intent] || intent}
                  </div>
                  <div className="flex-1 h-6 bg-gray-50 dark:bg-white/5 rounded-full overflow-hidden">
                    <div
                      className={cn("h-full rounded-full transition-all duration-500", INTENT_COLORS[intent] || "bg-zinc-500")}
                      style={{ width: barWidth }}
                    />
                  </div>
                  <div className="w-16 text-right text-sm text-gray-700 dark:text-zinc-300 shrink-0">
                    {count} <span className="text-gray-500 dark:text-zinc-500">({percentage}%)</span>
                  </div>
                </div>
              );
            })}
        </div>
      </div>

      {/* Intent Trends */}
      {data.intentTrends.length > 0 && (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl p-4">
          <h3 className="text-sm font-medium text-gray-900 dark:text-white mb-4">Trending Intents (Last 7 Days)</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
            {data.intentTrends.map((trend) => (
              <div 
                key={trend.intent} 
                className="bg-gray-50 dark:bg-white/5 rounded-lg p-3 text-center"
              >
                <div className="text-xs text-gray-500 dark:text-zinc-400 mb-1">
                  {INTENT_LABELS[trend.intent] || trend.intent}
                </div>
                <div className="text-lg font-semibold text-gray-900 dark:text-white">
                  {trend.currentWeek}
                </div>
                <div className={cn("flex items-center justify-center gap-1 text-xs mt-1", getTrendColor(trend.change))}>
                  {getTrendIcon(trend.change)}
                  {trend.change > 0 ? "+" : ""}{trend.change}%
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent Unanswered Questions */}
      {data.recentUnanswered.length > 0 && (
        <div className="bg-white dark:bg-white/[0.03] border border-gray-200 dark:border-white/10 rounded-xl overflow-hidden">
          <button
            onClick={() => setShowUnanswered(!showUnanswered)}
            className="w-full flex items-center justify-between p-4 hover:bg-white dark:bg-white/[0.02] transition-colors"
          >
            <div className="flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-amber-400" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {t("recentUnanswered")} <span className="text-gray-500 dark:text-zinc-500">({data.recentUnanswered.length})</span>
              </span>
            </div>
            {showUnanswered ? (
              <ChevronUp className="w-4 h-4 text-gray-500 dark:text-zinc-500" />
            ) : (
              <ChevronDown className="w-4 h-4 text-gray-500 dark:text-zinc-500" />
            )}
          </button>
          
          {showUnanswered && (
            <div className="border-t border-gray-200 dark:border-white/10 divide-y divide-white/10">
              {data.recentUnanswered.map((question) => (
                <div key={question.id} className="p-4 hover:bg-white dark:bg-white/[0.02] transition-colors">
                  <p className="text-sm text-gray-700 dark:text-zinc-300 mb-1 line-clamp-2">
                    {question.content}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-zinc-500">
                    {formatRelativeTime(question.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
