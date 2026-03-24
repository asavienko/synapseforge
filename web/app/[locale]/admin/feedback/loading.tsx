import { Loader2 } from "lucide-react";

export default function AdminFeedbackLoading() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        <p className="text-zinc-500 text-sm">Loading feedback...</p>
      </div>
    </div>
  );
}