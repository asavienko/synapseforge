"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";

interface DashboardErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  const t = useTranslations("errors");

  useEffect(() => {
    console.error("[Dashboard Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>

        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
          {t("dashboardError", { defaultValue: "Something went wrong" })}
        </h1>
        <p className="text-gray-500 dark:text-zinc-400 text-sm mb-6">
          {t("dashboardErrorDesc", { defaultValue: "We encountered an error loading the dashboard. Please try again." })}
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-lg text-left overflow-auto">
            <pre className="text-xs text-red-400 font-mono">{error.message}</pre>
            {error.digest && (
              <p className="text-xs text-gray-500 dark:text-zinc-500 mt-2">Error ID: {error.digest}</p>
            )}
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-600 transition-colors px-6 py-3 rounded-lg font-semibold text-gray-900 dark:text-white"
          >
            <RefreshCw className="w-4 h-4" />
            {t("tryAgain", { defaultValue: "Try again" })}
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:border-white/20 hover:bg-white dark:bg-white/[0.03] transition-colors px-6 py-3 rounded-lg font-semibold text-gray-700 dark:text-zinc-300"
          >
            <Home className="w-4 h-4" />
            {t("goToDashboard", { defaultValue: "Go to dashboard" })}
          </Link>
        </div>
      </div>
    </div>
  );
}
