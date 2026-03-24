"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import {
  Lightbulb,
  Plus,
  X,
  AlertCircle,
  TrendingUp,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface KBSuggestion {
  id: string;
  question: string;
  suggestedAnswer: string;
  category: string;
  priority: "high" | "medium" | "low";
  frequency: number;
}

interface KnowledgeSuggestionsProps {
  instanceId: string;
}

export function KnowledgeSuggestions({ instanceId }: KnowledgeSuggestionsProps) {
  const t = useTranslations("knowledge");
  const [suggestions, setSuggestions] = useState<KBSuggestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadSuggestions();
  }, [instanceId]);

  async function loadSuggestions() {
    try {
      setLoading(true);
      const res = await fetch(`/api/instances/${instanceId}/knowledge/suggestions`);
      if (!res.ok) throw new Error("Failed to load suggestions");
      const data = await res.json();
      setSuggestions(data.suggestions);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }

  async function addToKnowledgeBase(suggestion: KBSuggestion) {
    try {
      setAdding(suggestion.id);
      
      // Call the knowledge base API to add this Q&A pair
      const res = await fetch(`/api/instances/${instanceId}/knowledge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: suggestion.question.slice(0, 100),
          content: `${suggestion.question}\n\n${suggestion.suggestedAnswer}`,
          source: "suggestion",
          category: suggestion.category,
        }),
      });

      if (!res.ok) throw new Error("Failed to add to knowledge base");

      // Mark as added
      setAdded((prev) => new Set([...prev, suggestion.id]));
    } catch (err) {
      console.error("Error adding to KB:", err);
    } finally {
      setAdding(null);
    }
  }

  function dismissSuggestion(id: string) {
    setSuggestions((prev) => prev.filter((s) => s.id !== id));
  }

  if (loading) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white">{t("suggestions.title")}</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white">{t("suggestions.title")}</h3>
        </div>
        <div className="flex items-center gap-2 text-red-400">
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm">{error}</span>
        </div>
      </div>
    );
  }

  if (suggestions.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
        <div className="flex items-center gap-3 mb-4">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <h3 className="font-semibold text-white">{t("suggestions.title")}</h3>
        </div>
        <div className="text-center py-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
          <p className="text-zinc-400 text-sm">{t("suggestions.allCaughtUp")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 bg-amber-500/10 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Lightbulb className="w-5 h-5 text-amber-400" />
          <div>
            <h3 className="font-semibold text-white">{t("suggestions.title")}</h3>
            <p className="text-xs text-zinc-400">
              {t("suggestions.subtitle", { count: suggestions.length })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <TrendingUp className="w-4 h-4 text-emerald-400" />
          <span className="text-xs text-emerald-400">
            {suggestions.reduce((sum, s) => sum + s.frequency, 0)} {t("suggestions.questionsAsked")}
          </span>
        </div>
      </div>

      <div className="divide-y divide-white/5 max-h-96 overflow-y-auto">
        {suggestions.map((suggestion) => (
          <div
            key={suggestion.id}
            className={cn(
              "p-4 transition-colors",
              added.has(suggestion.id) ? "bg-emerald-500/5" : "hover:bg-white/[0.02]"
            )}
          >
            <div className="flex items-start justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    "text-xs px-2 py-0.5 rounded-full",
                    suggestion.priority === "high"
                      ? "bg-red-500/10 text-red-400"
                      : suggestion.priority === "medium"
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-blue-500/10 text-blue-400"
                  )}
                >
                  {suggestion.priority === "high"
                    ? t("suggestions.highPriority")
                    : suggestion.priority === "medium"
                    ? t("suggestions.mediumPriority")
                    : t("suggestions.lowPriority")}
                </span>
                <span className="text-xs bg-violet-500/10 text-violet-300 px-2 py-0.5 rounded-full">
                  {suggestion.category}
                </span>
                {suggestion.frequency > 1 && (
                  <span className="text-xs text-zinc-500">
                    {suggestion.frequency}x
                  </span>
                )}
              </div>
              <button
                onClick={() => dismissSuggestion(suggestion.id)}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-sm text-zinc-300 mb-2">&ldquo;{suggestion.question}&rdquo;...</p>

            <div className="bg-black/20 rounded-lg p-3 mb-3">
              <p className="text-xs text-zinc-400 mb-1">{t("suggestions.suggestedAnswer")}:</p>
              <p className="text-sm text-zinc-300">{suggestion.suggestedAnswer}</p>
            </div>

            {added.has(suggestion.id) ? (
              <div className="flex items-center gap-2 text-emerald-400 text-sm">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t("suggestions.added")}</span>
              </div>
            ) : (
              <button
                onClick={() => addToKnowledgeBase(suggestion)}
                disabled={adding === suggestion.id}
                className="flex items-center gap-2 text-sm bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed text-white px-3 py-1.5 rounded-lg transition-colors"
              >
                {adding === suggestion.id ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{t("suggestions.adding")}</span>
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    <span>{t("suggestions.addToKB")}</span>
                  </>
                )}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
