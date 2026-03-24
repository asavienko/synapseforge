"use client";

import { useEffect, useRef } from "react";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  href?: string;
  read: boolean;
  createdAt: string;
}

/**
 * Hook to poll for new notifications and show toast alerts
 * for important events like provisioning completion.
 */
export function useNotificationPoller() {
  const shownRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    const checkNotifications = async () => {
      try {
        const res = await fetch("/api/notifications?limit=10&unreadOnly=true");
        if (!res.ok) return;
        
        const data = await res.json();
        const notifications: Notification[] = data.notifications ?? [];
        
        for (const n of notifications) {
          // Skip if already shown
          if (shownRef.current.has(n.id)) continue;
          
          // Only show recent notifications (within last 5 minutes)
          const createdAt = new Date(n.createdAt);
          const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
          if (createdAt < fiveMinutesAgo) continue;
          
          shownRef.current.add(n.id);
          
          // Show toast based on notification type
          if (n.type === "provision.ready" || n.type === "instance.provisioned") {
            toast.success(n.title, {
              description: n.body,
              duration: 10000,
              action: n.href ? {
                label: "Open →",
                onClick: () => window.location.href = n.href!,
              } : undefined,
            });
          } else if (n.type === "instance.down" || n.type === "provision.failed") {
            toast.error(n.title, {
              description: n.body,
              duration: 8000,
            });
          } else if (n.type === "instance.recovered") {
            toast.success(n.title, {
              description: n.body,
              duration: 6000,
            });
          }
        }
      } catch {
        // Silently fail - notifications are nice-to-have
      }
    };

    // Check immediately on mount
    checkNotifications();
    
    // Poll every 15 seconds
    const interval = setInterval(checkNotifications, 15_000);
    
    return () => clearInterval(interval);
  }, []);
}