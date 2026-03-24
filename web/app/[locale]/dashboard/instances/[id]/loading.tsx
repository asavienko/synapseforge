import { Loader2 } from "lucide-react";

export default function InstanceDetailLoading() {
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

      <div className="p-6 pt-14 md:p-8 md:pt-6 max-w-7xl mx-auto">
        {/* Instance header skeleton */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/10 animate-pulse" />
            <div>
              <div className="w-48 h-6 rounded bg-white/10 animate-pulse mb-2" />
              <div className="w-24 h-4 rounded bg-white/10 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-24 h-10 rounded-lg bg-white/10 animate-pulse" />
            <div className="w-24 h-10 rounded-lg bg-white/10 animate-pulse" />
          </div>
        </div>

        {/* Tabs skeleton */}
        <div className="flex items-center gap-1 mb-6 border-b border-white/10">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="w-24 h-10 rounded-t-lg bg-white/10 animate-pulse mx-1"
            />
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Main content area */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="w-32 h-5 rounded bg-white/10 animate-pulse mb-6" />
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-white/10 animate-pulse" />
                    <div className="flex-1">
                      <div className="w-full h-4 rounded bg-white/10 animate-pulse mb-2" />
                      <div className="w-2/3 h-3 rounded bg-white/10 animate-pulse" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Secondary content area */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="w-40 h-5 rounded bg-white/10 animate-pulse mb-6" />
              <div className="h-64 rounded-xl bg-white/10 animate-pulse" />
            </div>
          </div>

          <div className="lg:col-span-1 space-y-6">
            {/* Sidebar */}
            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="w-24 h-5 rounded bg-white/10 animate-pulse mb-6" />
              <div className="space-y-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-12 rounded-lg bg-white/10 animate-pulse" />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
              <div className="w-32 h-5 rounded bg-white/10 animate-pulse mb-6" />
              <div className="space-y-4">
                {[1, 2].map((i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white/10 animate-pulse" />
                    <div className="flex-1 h-4 rounded bg-white/10 animate-pulse" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
