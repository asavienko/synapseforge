"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Bell, Check, ExternalLink, Loader2 } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  href: string | null;
  read: boolean;
  createdAt: string;
}

const TYPE_ICONS: Record<string, string> = {
  "instance.down": "🔴",
  "manager.message": "💬",
  milestone: "🎉",
  "provision.ready": "⚡",
  "instance.deployed": "🚀",
};

function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export function NotificationCenter() {
  const t = useTranslations("notifications");
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Poll unread count every 30s when closed
  const fetchUnreadCount = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {
      // silently fail
    }
  }, []);

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications ?? []);
        setUnreadCount(data.unreadCount ?? 0);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  // Initial fetch + polling while closed
  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(() => {
      if (!open) fetchUnreadCount();
    }, 30_000);
    return () => clearInterval(interval);
  }, [open, fetchUnreadCount]);

  // Fetch on open
  useEffect(() => {
    if (open) fetchNotifications();
  }, [open, fetchNotifications]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function markRead(id: string) {
    await fetch(`/api/notifications/${id}/read`, { method: "PATCH" });
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function markAllRead() {
    await fetch("/api/notifications/read-all", { method: "PATCH" });
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  }

  const badgeLabel = unreadCount > 9 ? "9+" : unreadCount.toString();

  return (
    <div className="relative" ref={ref}>
      <button
        aria-label={t("bellLabel")}
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-violet-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center leading-none">
            {badgeLabel}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 z-50 bg-[#13131a] border border-white/10 rounded-xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/5">
            <span className="text-sm font-semibold text-white">{t("title")}</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                {t("markAllRead")}
              </button>
            )}
          </div>

          {/* Body */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-white/5">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="w-5 h-5 text-violet-400 animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2 text-zinc-500">
                <Bell className="w-8 h-8 opacity-30" />
                <span className="text-sm">{t("empty")}</span>
              </div>
            ) : (
              notifications.map((n) => {
                const icon = TYPE_ICONS[n.type] ?? "🔔";
                const content = (
                  <div
                    className={`flex gap-3 px-4 py-3 hover:bg-white/5 transition-colors ${
                      !n.read ? "bg-violet-500/5" : ""
                    }`}
                  >
                    <span className="text-lg leading-none mt-0.5 shrink-0">{icon}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="text-sm font-medium text-white leading-tight line-clamp-1">
                          {n.title}
                        </p>
                        <div className="flex items-center gap-1 shrink-0">
                          {n.href && (
                            <ExternalLink className="w-3 h-3 text-zinc-500" />
                          )}
                          {!n.read && (
                            <button
                              title={t("markRead")}
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                markRead(n.id);
                              }}
                              className="text-violet-400 hover:text-violet-300 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      {n.body && (
                        <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2">{n.body}</p>
                      )}
                      <p className="text-[10px] text-zinc-600 mt-1">{relativeTime(n.createdAt)}</p>
                    </div>
                  </div>
                );

                return n.href ? (
                  <Link
                    key={n.id}
                    href={n.href}
                    onClick={() => {
                      if (!n.read) markRead(n.id);
                      setOpen(false);
                    }}
                    className="block"
                  >
                    {content}
                  </Link>
                ) : (
                  <div key={n.id}>{content}</div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
