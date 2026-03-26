"use client";

import { useState } from "react";
import { MessageSquare, X, Send, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useAnalytics } from "@/components/AnalyticsProvider";

export function FeedbackButton() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { track } = useAnalytics();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (res.ok) {
        toast.success("Feedback sent! Thank you.");
        setMessage("");
        setIsOpen(false);
        track("feedback_submitted", { length: message.length });
      } else {
        throw new Error("Failed to send");
      }
    } catch {
      toast.error("Failed to send feedback. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      {/* Floating button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-blue-600 hover:bg-blue-600 rounded-full shadow-lg shadow-violet-500/20 flex items-center justify-center transition-all hover:scale-105"
          aria-label="Send feedback"
        >
          <MessageSquare className="w-6 h-6 text-white" />
        </button>
      )}

      {/* Feedback form modal */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 w-80 bg-white dark:bg-[#0a0a0f] border border-gray-200 dark:border-white/10 rounded-2xl shadow-2xl overflow-hidden">
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5">
            <h3 className="font-semibold text-gray-900 dark:text-white">Send Feedback</h3>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 dark:text-zinc-500 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-4">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="What's on your mind? Report a bug or suggest a feature..."
              className="w-full h-32 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-lg p-3 text-sm text-gray-900 dark:text-white placeholder:text-zinc-500 resize-none focus:outline-none focus:border-blue-500/50"
              disabled={submitting}
            />

            <div className="flex items-center justify-between mt-4">
              <p className="text-xs text-gray-500 dark:text-zinc-500">We read every message</p>
              <button
                type="submit"
                disabled={!message.trim() || submitting}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-4 py-2 rounded-lg text-sm font-medium text-gray-900 dark:text-white"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    Send
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </>
  );
}