"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AlertTriangle, X } from "lucide-react";
import { useTranslations } from "next-intl";

interface UsageWarning {
  type: "messages" | "instances" | "sandbox";
  message: string;
  percentage: number;
  action?: { label: string; href: string };
}

export function UsageWarningBanner() {
  const t = useTranslations("usageWarning");
  const [warnings, setWarnings] = useState<UsageWarning[]>([]);
  const [dismissed, setDismissed] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/user/usage-status")
      .then((r) => r.json())
      .then((data) => {
        const w: UsageWarning[] = [];

        // Check sandbox usage
        if (data.sandbox?.active && data.sandbox?.limit > 0) {
          const pct = (data.sandbox.used / data.sandbox.limit) * 100;
          if (pct >= 80) {
            w.push({
              type: "sandbox",
              message: pct >= 100
                ? t("sandboxLimit")
                : t("sandboxUsage", { used: data.sandbox.used, limit: data.sandbox.limit }),
              percentage: pct,
              action: { label: t("setupCredentials"), href: "/dashboard/instances" },
            });
          }
        }

        // Check monthly message usage
        if (data.messages?.limit > 0 && data.messages?.limit !== Infinity) {
          const pct = (data.messages.used / data.messages.limit) * 100;
          if (pct >= 80) {
            w.push({
              type: "messages",
              message: pct >= 100
                ? t("messagesLimit")
                : t("messagesUsage", { used: data.messages.used, limit: data.messages.limit }),
              percentage: pct,
              action: { label: t("upgrade"), href: "/dashboard/billing" },
            });
          }
        }

        // Check instance limit
        if (data.instances?.limit > 0 && data.instances?.limit !== Infinity) {
          const pct = (data.instances.used / data.instances.limit) * 100;
          if (pct >= 80) {
            w.push({
              type: "instances",
              message: pct >= 100
                ? t("instancesLimit")
                : t("instancesUsage", { used: data.instances.used, limit: data.instances.limit }),
              percentage: pct,
              action: { label: t("upgrade"), href: "/dashboard/billing" },
            });
          }
        }

        setWarnings(w);
      })
      .catch(() => {
        // Silently fail — this is a nice-to-have, not critical
      });
  }, []);

  const visibleWarnings = warnings.filter((w) => !dismissed.includes(w.type));
  if (visibleWarnings.length === 0) return null;

  return (
    <div className="space-y-2 px-4 pt-4">
      {visibleWarnings.map((warning) => (
        <div
          key={warning.type}
          className={`rounded-xl px-4 py-3 flex items-center gap-3 ${
            warning.percentage >= 100
              ? "bg-red-500/10 border border-red-500/20 text-red-400"
              : "bg-amber-500/10 border border-amber-500/20 text-amber-400"
          }`}
        >
          <AlertTriangle className="w-5 h-5 shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{warning.message}</p>
          </div>
          {warning.action && (
            <Link
              href={warning.action.href}
              className={`text-sm font-medium shrink-0 transition-colors ${
                warning.percentage >= 100
                  ? "text-red-300 hover:text-red-200"
                  : "text-amber-300 hover:text-amber-200"
              }`}
            >
              {warning.action.label}
            </Link>
          )}
          <button
            onClick={() => setDismissed((d) => [...d, warning.type])}
            className="text-zinc-500 hover:text-zinc-400 transition-colors shrink-0"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ))}
    </div>
  );
}