"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";

interface AdminErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function AdminError({ error, reset }: AdminErrorProps) {
  useEffect(() => {
    console.error("[Admin Error]", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-red-400" />
        </div>

        <h1 className="text-xl font-bold text-white mb-2">Admin Panel Error</h1>
        <p className="text-zinc-400 text-sm mb-6">
          Something went wrong loading the admin panel.
        </p>

        {process.env.NODE_ENV === "development" && (
          <div className="mb-6 p-4 bg-white/5 rounded-lg text-left overflow-auto">
            <pre className="text-xs text-red-400 font-mono">{error.message}</pre>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            onClick={reset}
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-lg font-semibold text-white"
          >
            <RefreshCw className="w-4 h-4" />
            Try again
          </button>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 hover:bg-white/[0.03] transition-colors px-6 py-3 rounded-lg font-semibold text-zinc-300"
          >
            <Home className="w-4 h-4" />
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}