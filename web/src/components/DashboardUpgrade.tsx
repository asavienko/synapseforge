"use client";

import { useState } from "react";
import { ArrowUpRight, Loader2, Check } from "lucide-react";

export function DashboardUpgrade({ currentPlan }: { currentPlan: string; hasManager?: boolean }) {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  if (currentPlan !== "free") return null;

  async function requestUpgrade() {
    setLoading(true);
    setError("");
    const res = await fetch("/api/upgrade", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ requestedPlan: "pro" }),
    });
    setLoading(false);
    if (res.ok) {
      setSent(true);
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error ?? "Failed to send request");
    }
  }

  if (sent) {
    return (
      <span className="text-xs text-emerald-400 flex items-center gap-1 mt-0.5">
        <Check className="w-3 h-3" /> Upgrade request sent!
      </span>
    );
  }

  return (
    <div>
      <button
        onClick={requestUpgrade}
        disabled={loading}
        className="text-xs text-violet-400 hover:text-violet-300 disabled:opacity-50 transition-colors flex items-center gap-1 mt-0.5"
      >
        {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <ArrowUpRight className="w-3 h-3" />}
        {loading ? "Sending…" : "Request upgrade to Pro"}
      </button>
      {error && <p className="text-xs text-red-400 mt-1">{error}</p>}
    </div>
  );
}
