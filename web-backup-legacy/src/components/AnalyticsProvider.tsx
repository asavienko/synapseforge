"use client";

import { createContext, useContext, useCallback, ReactNode } from "react";

interface AnalyticsContextType {
  track: (event: string, properties?: Record<string, unknown>) => void;
  pageView: (page: string) => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export function AnalyticsProvider({ children }: { children: ReactNode }) {
  const track = useCallback((event: string, properties?: Record<string, unknown>) => {
    // Log to console in development
    if (process.env.NODE_ENV === "development") {
      console.log("[Analytics]", event, properties);
    }

    // Send to analytics endpoint
    try {
      fetch("/api/analytics/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event,
          properties,
          timestamp: new Date().toISOString(),
          url: window.location.href,
          userAgent: navigator.userAgent,
        }),
        // Fire and forget - don't wait for response
        keepalive: true,
      }).catch(() => {
        // Silently fail - analytics shouldn't break the app
      });
    } catch {
      // Silently fail
    }
  }, []);

  const pageView = useCallback((page: string) => {
    track("page_view", { page, url: window.location.href });
  }, [track]);

  return (
    <AnalyticsContext.Provider value={{ track, pageView }}>
      {children}
    </AnalyticsContext.Provider>
  );
}

export function useAnalytics() {
  const context = useContext(AnalyticsContext);
  if (!context) {
    // Return no-op functions if provider not available
    return {
      track: () => {},
      pageView: () => {},
    };
  }
  return context;
}