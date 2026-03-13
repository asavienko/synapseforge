"use client";
import * as Sentry from "@sentry/nextjs";
import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950">
      <div className="text-center max-w-md mx-auto p-8">
        <div className="text-5xl mb-6">⚡</div>
        <h2 className="text-white text-xl font-semibold mb-3">Something went wrong</h2>
        <p className="text-zinc-500 text-sm mb-6">
          An unexpected error occurred. Our team has been notified automatically.
        </p>
        <button
          onClick={reset}
          className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-500 transition-colors text-sm"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
