"use client";

import { useEffect, useState } from "react";
import { Loader2, MessageSquare, CheckCircle, Archive, Mail } from "lucide-react";

interface FeedbackItem {
  id: string;
  message: string;
  userEmail?: string;
  userId?: string;
  status: "new" | "read" | "resolved" | "archived";
  createdAt: string;
}

export default function AdminFeedbackPage() {
  const [feedback, setFeedback] = useState<FeedbackItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFeedback = async () => {
      try {
        const res = await fetch("/api/admin/feedback");
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        setFeedback(data.feedback ?? []);
      } catch {
        setError("Failed to load feedback");
      } finally {
        setLoading(false);
      }
    };

    fetchFeedback();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">User Feedback</h2>
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <MessageSquare className="w-4 h-4" />
          {feedback.length} submissions
        </div>
      </div>

      {feedback.length === 0 ? (
        <div className="p-12 text-center border border-white/5 rounded-xl bg-white/[0.02]">
          <MessageSquare className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-white mb-2">No feedback yet</h3>
          <p className="text-zinc-500 text-sm max-w-md mx-auto">
            User feedback will appear here once submitted through the dashboard widget.
            Make sure the Feedback model is migrated to the database.
          </p>
          <div className="mt-4 p-3 bg-white/5 rounded-lg text-xs text-zinc-500 font-mono">
            npx prisma migrate dev --name add_feedback_model
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {feedback.map((item) => (
            <div
              key={item.id}
              className="p-4 border border-white/5 rounded-xl bg-white/[0.02] hover:bg-white/[0.04] transition-colors"
            >
              <p className="text-white mb-3">{item.message}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3 text-zinc-500">
                  {item.userEmail && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {item.userEmail}
                    </span>
                  )}
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    item.status === "new"
                      ? "bg-violet-500/10 text-violet-400"
                      : item.status === "resolved"
                      ? "bg-emerald-500/10 text-emerald-400"
                      : "bg-zinc-500/10 text-zinc-400"
                  }`}
                >
                  {item.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}