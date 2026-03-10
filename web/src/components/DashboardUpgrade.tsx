"use client";

import { useRouter } from "next/navigation";
import { ArrowUpRight } from "lucide-react";

export function DashboardUpgrade({ currentPlan }: { currentPlan: string; hasManager?: boolean }) {
  const router = useRouter();

  if (currentPlan !== "free") return null;

  return (
    <button
      onClick={() => router.push("/dashboard/billing")}
      className="text-xs text-violet-400 hover:text-violet-300 transition-colors flex items-center gap-1 mt-0.5"
    >
      Upgrade plan <ArrowUpRight className="w-3 h-3" />
    </button>
  );
}
