"use client";

import { useNotificationPoller } from "@/hooks/useNotificationPoller";

/**
 * Client component that mounts the notification poller hook.
 * Must be used inside a client component boundary.
 */
export function NotificationPoller() {
  useNotificationPoller();
  return null; // This component doesn't render anything
}