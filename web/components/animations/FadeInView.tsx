"use client";

import { useEffect, useRef, useState } from "react";

interface FadeInViewProps {
  children: React.ReactNode;
  className?: string;
  direction?: "up" | "down" | "left" | "right" | "none";
  delay?: number;
  duration?: number;
  threshold?: number;
  once?: boolean;
  blur?: boolean;
}

export function FadeInView({
  children,
  className = "",
  direction = "up",
  delay = 0,
  duration = 800,
  threshold = 0.1,
  once = true,
  blur = false,
}: FadeInViewProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Respect prefers-reduced-motion — show immediately
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setPrefersReducedMotion(true);
      setIsVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once) {
            observer.unobserve(el);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, once]);

  // When reduced motion is preferred, render without animation wrapper styles
  if (prefersReducedMotion) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div
      ref={ref}
      className={`transition-all ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        filter: blur && !isVisible ? "blur(10px)" : "blur(0px)",
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        ...((!isVisible && direction === "up") && { transform: "translateY(30px)" }),
        ...((!isVisible && direction === "down") && { transform: "translateY(-30px)" }),
        ...((!isVisible && direction === "left") && { transform: "translateX(-40px)" }),
        ...((!isVisible && direction === "right") && { transform: "translateX(40px)" }),
        ...(isVisible && { transform: "translate(0, 0)" }),
      }}
    >
      {children}
    </div>
  );
}
