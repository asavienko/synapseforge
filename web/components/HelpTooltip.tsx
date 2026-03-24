"use client";

import { useState } from "react";
import { HelpCircle, X } from "lucide-react";

interface HelpTooltipProps {
  title: string;
  description: string;
}

export function HelpTooltip({ title, description }: HelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="text-zinc-500 hover:text-violet-400 transition-colors"
        aria-label="Help"
      >
        <HelpCircle className="w-4 h-4" />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute z-50 w-64 p-4 bg-[#1a1a1f] border border-white/10 rounded-xl shadow-xl -right-2 top-8">
            <div className="flex items-start justify-between mb-2">
              <h4 className="font-medium text-white">{title}</h4>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-zinc-400">{description}</p>
          </div>
        </>
      )}
    </div>
  );
}