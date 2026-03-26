"use client";

import { useState } from "react";
import { CreditCard, Loader2 } from "lucide-react";

export function BillingPortalButton() {
  const [loading, setLoading] = useState(false);

  async function openBillingPortal() {
    setLoading(true);
    try {
      const res = await fetch("/api/billing/portal", {
        method: "POST",
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      }
    } catch {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={openBillingPortal}
      disabled={loading}
      className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-300 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 px-4 py-2.5 rounded-xl transition-colors disabled:opacity-50"
    >
      {loading ? (
        <Loader2 className="w-4 h-4 animate-spin" />
      ) : (
        <CreditCard className="w-4 h-4" />
      )}
      {loading ? "Opening..." : "Manage Billing"}
    </button>
  );
}