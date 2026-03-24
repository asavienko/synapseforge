"use client";

import { useEffect } from "react";
import { AlertCircle, RefreshCw, Home } from "lucide-react";
import Link from "next/link";
import { Zap } from "lucide-react";

interface RootErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function RootError({ error, reset }: RootErrorProps) {
  useEffect(() => {
    console.error("[Root Error]", error);
  }, [error]);

  return (
    <html lang="en">
      <body className="min-h-screen bg-[#0a0a0f] flex items-center justify-center px-4">
        <div className="w-full max-w-md text-center">
          {/* Logo */}
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <Zap className="w-6 h-6 text-violet-400" />
            <span className="font-bold text-lg tracking-tight text-white">OpenHelix AI</span>
          </Link>

          {/* Error Icon */}
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-6">
            <AlertCircle className="w-8 h-8 text-red-400" />
          </div>

          {/* Title */}
          <h1 className="text-xl font-bold text-white mb-2">
            Something went wrong
          </h1>
          <p className="text-zinc-400 text-sm mb-6">
            We encountered an unexpected error. Please try again.
          </p>

          {/* Error Details (dev only) */}
          {process.env.NODE_ENV === "development" && (
            <div className="mb-6 p-4 bg-white/5 rounded-lg text-left overflow-auto">
              <pre className="text-xs text-red-400 font-mono">{error.message}</pre>
              {error.digest && (
                <p className="text-xs text-zinc-500 mt-2">Error ID: {error.digest}</p>
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={reset}
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-lg font-semibold text-white"
            >
              <RefreshCw className="w-4 h-4" />
              Try again
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 hover:bg-white/[0.03] transition-colors px-6 py-3 rounded-lg font-semibold text-zinc-300"
            >
              <Home className="w-4 h-4" />
              Go home
            </Link>
          </div>
        </div>
      </body>
    </html>
  );
}