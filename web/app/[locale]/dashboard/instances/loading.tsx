import { Loader2 } from "lucide-react";

export default function InstancesLoading() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-blue-600 dark:text-blue-400 animate-spin" />
        <p className="text-zinc-500 text-sm">Loading instances...</p>
      </div>
    </div>
  );
}