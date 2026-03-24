"use client";

import { useState, useEffect } from "react";

export function SubscribeSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [isSubscribed, setIsSubscribed] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const subscribed = localStorage.getItem("changelog-subscribed");
    if (subscribed === "true") {
      setIsSubscribed(true);
      setStatus("success");
      setMessage("You're subscribed to updates!");
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === "loading") return;

    setStatus("loading");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Store in localStorage for now (will be replaced with API call once DB migration is done)
    localStorage.setItem("changelog-subscribed", "true");
    localStorage.setItem("changelog-email", email);
    
    setStatus("success");
    setMessage("Subscribed successfully! You'll receive updates about new features.");
    setEmail("");
    setIsSubscribed(true);
  }

  if (isSubscribed) {
    return (
      <div className="mt-16 p-8 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">You&apos;re subscribed!</h3>
            <p className="text-sm text-zinc-400">{message}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-16 p-8 bg-white/[0.02] border border-white/10 rounded-2xl">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-2">Stay updated</h3>
          <p className="text-sm text-zinc-400">
            Get notified about new features and improvements.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 max-w-md">
          <div className="flex gap-3">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              disabled={status === "loading"}
              className="flex-1 bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={status === "loading" || !email}
              className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors px-5 py-2.5 rounded-lg text-sm font-medium text-white whitespace-nowrap"
            >
              {status === "loading" ? "Subscribing..." : "Subscribe"}
            </button>
          </div>
          {status === "error" && (
            <p className="text-xs mt-2 text-red-400">{message}</p>
          )}
        </form>
      </div>
    </div>
  );
}
