"use client";

import { useEffect } from "react";
import { getCalApi } from "@calcom/embed-react";
import { CalendarDays } from "lucide-react";

interface CalBookingButtonProps {
  calLink: string; // e.g. "john-smith/30min"
  label?: string;
  variant?: "default" | "compact" | "outline";
}

export function CalBookingButton({
  calLink,
  label = "Book a call",
  variant = "default",
}: CalBookingButtonProps) {
  useEffect(() => {
    (async function () {
      const cal = await getCalApi({ namespace: "openhelixai" });
      cal("ui", { hideEventTypeDetails: false, layout: "month_view" });
    })();
  }, []);

  const baseClasses = "flex items-center gap-2 transition-colors font-medium";
  const variants = {
    default:
      "bg-violet-600 hover:bg-violet-500 text-white px-4 py-2.5 rounded-xl text-sm",
    compact:
      "bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white px-3 py-2 rounded-xl text-sm",
    outline:
      "bg-violet-600/10 hover:bg-violet-600/20 border border-violet-500/30 text-violet-300 hover:text-violet-200 px-4 py-2.5 rounded-xl text-sm",
  };

  return (
    <button
      data-cal-namespace="openhelixai"
      data-cal-link={calLink}
      data-cal-config='{"layout":"month_view"}'
      className={`${baseClasses} ${variants[variant]}`}
    >
      <CalendarDays className="w-4 h-4 shrink-0" />
      <span>{label}</span>
    </button>
  );
}
