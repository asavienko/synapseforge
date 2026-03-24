"use client";

import { useState, useEffect } from "react";
import { X, Megaphone, Sparkles } from "lucide-react";
import Link from "next/link";

interface Announcement {
  id: string;
  message: string;
  link?: string;
  linkText?: string;
  type?: "info" | "promo" | "feature";
  startDate?: string;
  endDate?: string;
}

// Default announcements - can be moved to API/database later
const DEFAULT_ANNOUNCEMENTS: Announcement[] = [
  {
    id: "launch-promo",
    message: "🚀 Launch special: Get 50% off your first month! Use code SYNAPSE50",
    link: "/dashboard/billing",
    linkText: "Upgrade now",
    type: "promo",
  },
];

export function AnnouncementBanner() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check localStorage for dismissed announcements
    const dismissedIds = JSON.parse(localStorage.getItem("dismissed-announcements") || "[]");
    
    // Find active announcement
    const active = DEFAULT_ANNOUNCEMENTS.find((a) => {
      if (dismissedIds.includes(a.id)) return false;
      if (a.startDate && new Date(a.startDate) > new Date()) return false;
      if (a.endDate && new Date(a.endDate) < new Date()) return false;
      return true;
    });

    setAnnouncement(active || null);
  }, []);

  function dismiss() {
    if (announcement) {
      const dismissedIds = JSON.parse(localStorage.getItem("dismissed-announcements") || "[]");
      dismissedIds.push(announcement.id);
      localStorage.setItem("dismissed-announcements", JSON.stringify(dismissedIds));
    }
    setDismissed(true);
  }

  if (!announcement || dismissed) return null;

  const bgColors = {
    info: "bg-blue-600/20 border-blue-500/30 text-blue-200",
    promo: "bg-violet-600/20 border-violet-500/30 text-violet-200",
    feature: "bg-emerald-600/20 border-emerald-500/30 text-emerald-200",
  };

  const Icon = announcement.type === "feature" ? Sparkles : announcement.type === "promo" ? Megaphone : Megaphone;

  return (
    <div className={`px-4 py-2.5 border-b ${bgColors[announcement.type || "info"]} relative`}>
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 text-sm">
        <Icon className="w-4 h-4 shrink-0" />
        <span>{announcement.message}</span>
        {announcement.link && (
          <Link
            href={announcement.link}
            className="font-medium underline underline-offset-2 hover:no-underline shrink-0"
          >
            {announcement.linkText || "Learn more"}
          </Link>
        )}
        <button
          onClick={dismiss}
          className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Dismiss announcement"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
