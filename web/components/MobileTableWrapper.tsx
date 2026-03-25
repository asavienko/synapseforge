"use client";

import { useRef, useState, useEffect, ReactNode } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface MobileTableWrapperProps {
  children: ReactNode;
  className?: string;
  cardView?: boolean;
  cardViewBreakpoint?: number;
}

/**
 * MobileTableWrapper - Responsive table wrapper with scroll hints
 * 
 * Features:
 * - Horizontal scroll with visual fade indicators on edges
 * - Optional card view for mobile breakpoints
 * - Touch-friendly scrolling
 * - Accessibility announcements for scroll state
 */
export function MobileTableWrapper({
  children,
  className,
  cardView = false,
  cardViewBreakpoint = 640,
}: MobileTableWrapperProps) {
  const t = useTranslations("analyticsSummary");
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check scroll position and update indicators
  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;

    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1); // -1 for rounding
  };

  // Handle resize and initial check
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < cardViewBreakpoint);
    };

    checkMobile();
    checkScroll();

    window.addEventListener("resize", checkMobile);
    
    const el = scrollRef.current;
    if (el) {
      el.addEventListener("scroll", checkScroll);
      // Recheck after content loads
      const timer = setTimeout(checkScroll, 100);
      return () => {
        window.removeEventListener("resize", checkMobile);
        el.removeEventListener("scroll", checkScroll);
        clearTimeout(timer);
      };
    }

    return () => window.removeEventListener("resize", checkMobile);
  }, [cardViewBreakpoint]);

  // If card view is enabled and we're on mobile, render differently
  if (cardView && isMobile) {
    return (
      <div className={cn("space-y-3", className)}>
        {children}
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Scroll container with fade indicators */}
      <div
        ref={scrollRef}
        className={cn(
          "overflow-x-auto scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0",
          canScrollLeft && "can-scroll-left",
          canScrollRight && "can-scroll-right",
          className
        )}
        style={{
          maskImage: canScrollLeft || canScrollRight 
            ? `linear-gradient(to right, 
                ${canScrollLeft ? 'transparent' : 'black'} 0%, 
                black 24px, 
                black calc(100% - 24px), 
                ${canScrollRight ? 'transparent' : 'black'} 100%)`
            : undefined,
          WebkitMaskImage: canScrollLeft || canScrollRight
            ? `linear-gradient(to right, 
                ${canScrollLeft ? 'transparent' : 'black'} 0%, 
                black 24px, 
                black calc(100% - 24px), 
                ${canScrollRight ? 'transparent' : 'black'} 100%)`
            : undefined,
        }}
      >
        {children}
      </div>
      
      {/* Visual scroll hint for mobile */}
      <div className="sm:hidden flex justify-center mt-2">
        <div className="flex items-center gap-1 text-xs text-zinc-600">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" transform="rotate(90 12 12)" />
          </svg>
          <span>{t("swipeMore")}</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 9l4-4 4 4m0 6l-4 4-4-4" transform="rotate(-90 12 12)" />
          </svg>
        </div>
      </div>
    </div>
  );
}

/**
 * MobileCardView - Converts table rows to cards on mobile
 * 
 * Usage: Wrap table content with this to show cards on mobile
 * instead of a horizontally scrolling table
 */
interface MobileCardViewProps {
  headers: { key: string; label: string }[];
  rows: Record<string, ReactNode>[];
  breakpoint?: number;
}

export function MobileCardView({ headers, rows, breakpoint = 640 }: MobileCardViewProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < breakpoint);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [breakpoint]);

  if (!isMobile) {
    return (
      <table className="w-full text-sm">
        <thead>
          <tr className="text-xs text-zinc-500 border-b border-white/5">
            {headers.map((h) => (
              <th key={h.key} className="text-left px-5 py-2">{h.label}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-white/5">
          {rows.map((row, i) => (
            <tr key={i} className="hover:bg-white/[0.02]">
              {headers.map((h) => (
                <td key={h.key} className="px-5 py-2.5">{row[h.key]}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Card view for mobile
  return (
    <div className="space-y-3">
      {rows.map((row, i) => (
        <div 
          key={i} 
          className="glow-border rounded-xl p-4 bg-white/[0.02] space-y-2"
        >
          {headers.map((h) => (
            <div key={h.key} className="flex justify-between items-start gap-3">
              <span className="text-xs text-zinc-500 uppercase tracking-wider">{h.label}</span>
              <span className="text-sm text-zinc-300 text-right">{row[h.key]}</span>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}
