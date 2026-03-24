"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAnalytics } from "@/components/AnalyticsProvider";

/**
 * PageTracker - Client component that tracks page views in the dashboard
 * Place this in the dashboard layout to track navigation
 */
export function PageTracker() {
  const pathname = usePathname();
  const { track } = useAnalytics();

  useEffect(() => {
    // Track page view when pathname changes
    track("page_view", {
      page: pathname,
      section: "dashboard",
    });
  }, [pathname, track]);

  return null; // This component doesn't render anything
}