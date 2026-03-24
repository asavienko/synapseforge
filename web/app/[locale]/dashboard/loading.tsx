import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Header skeleton */}
      <div className="h-16 border-b border-white/10 bg-[#0a0a0f]/80 backdrop-blur-xl sticky top-0 z-40">
        <div className="h-full px-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse" />
            <div className="w-32 h-4 rounded bg-white/10 animate-pulse" />
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
            <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
          </div>
        </div>
      </div>

      {/* Main content skeleton */}
      <div className="p-4 pt-14 md:p-8 md:pt-6 max-w-7xl mx-auto">
        {/* Title skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="w-48 h-8 rounded-lg bg-white/10 animate-pulse" />
          <div className="w-32 h-10 rounded-lg bg-white/10 animate-pulse" />
        </div>

        {/* Quick setup skeleton */}
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-white/10 animate-pulse" />
            <div className="flex-1">
              <div className="w-40 h-5 rounded bg-white/10 animate-pulse mb-2" />
              <div className="w-64 h-4 rounded bg-white/10 animate-pulse" />
            </div>
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-white/[0.03]">
                <div className="w-5 h-5 rounded-full bg-white/10 animate-pulse" />
                <div className="flex-1 h-4 rounded bg-white/10 animate-pulse" />
              </div>
            ))}
          </div>
        </div>

        {/* Stats grid skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="rounded-xl border border-white/10 bg-white/[0.02] p-4"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse" />
                <div className="w-16 h-4 rounded bg-white/10 animate-pulse" />
              </div>
              <div className="w-24 h-6 rounded bg-white/10 animate-pulse mb-1" />
              <div className="w-32 h-3 rounded bg-white/10 animate-pulse" />
            </div>
          ))}
        </div>

        {/* Content grid skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="w-32 h-5 rounded bg-white/10 animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse" />
                  <div className="flex-1">
                    <div className="w-full h-4 rounded bg-white/10 animate-pulse mb-1" />
                    <div className="w-2/3 h-3 rounded bg-white/10 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4">
            <div className="w-32 h-5 rounded bg-white/10 animate-pulse mb-4" />
            <div className="space-y-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 animate-pulse" />
                  <div className="flex-1">
                    <div className="w-full h-4 rounded bg-white/10 animate-pulse mb-1" />
                    <div className="w-2/3 h-3 rounded bg-white/10 animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
