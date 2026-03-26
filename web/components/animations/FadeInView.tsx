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
  const [isReady, setIsReady] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // In Cypress / test environment — show immediately, no animations
    if (typeof window !== "undefined" && "Cypress" in window) {
      setPrefersReducedMotion(true);
      setIsVisible(true);
      return;
    }

    // Respect prefers-reduced-motion — show immediately
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (mq.matches) {
      setPrefersReducedMotion(true);
      setIsVisible(true);
      return;
    }

    const el = ref.current;
    if (!el) return;

    // Check if element is already in the viewport before hiding it.
    // This prevents a flash where visible content disappears briefly.
    const rect = el.getBoundingClientRect();
    const inViewport =
      rect.top < window.innerHeight && rect.bottom > 0 &&
      rect.left < window.innerWidth && rect.right > 0;

    if (inViewport) {
      // Already visible — skip the animation entirely
      setIsVisible(true);
      setIsReady(true);
      return;
    }

    // Element is off-screen — safe to hide it and animate on scroll
    setIsReady(true);

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

  // Before JS mounts (isReady=false), elements are fully visible (good for SEO/SSR)
  // After JS mounts, they get hidden until scrolled into view
  const shouldAnimate = isReady && !isVisible;

  return (
    <div
      ref={ref}
      className={`transition-all ${className}`}
      style={{
        opacity: shouldAnimate ? 0 : 1,
        filter: blur && shouldAnimate ? "blur(10px)" : "blur(0px)",
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
        ...((shouldAnimate && direction === "up") && { transform: "translateY(30px)" }),
        ...((shouldAnimate && direction === "down") && { transform: "translateY(-30px)" }),
        ...((shouldAnimate && direction === "left") && { transform: "translateX(-40px)" }),
        ...((shouldAnimate && direction === "right") && { transform: "translateX(40px)" }),
        ...(!shouldAnimate && { transform: "translate(0, 0)" }),
      }}
    >
      {children}
    </div>
  );
}
