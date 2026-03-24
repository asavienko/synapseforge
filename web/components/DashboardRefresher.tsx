"use client";

/**
 * Invisible client component that keeps dashboard stats live.
 * - Polls every 30s via router.refresh() (re-runs the server component)
 * - Also refreshes on window focus (user returns to tab after checking something)
 *
 * Drop inside any server-rendered dashboard page to get live data for free.
 */
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function DashboardRefresher({ intervalMs = 30_000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const refresh = () => router.refresh();

    const interval = setInterval(refresh, intervalMs);
    window.addEventListener("focus", refresh);

    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", refresh);
    };
  }, [router, intervalMs]);

  return null;
}
