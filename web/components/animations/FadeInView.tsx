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

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          if (once && ref.current) {
            observer.unobserve(ref.current);
          }
        } else if (!once) {
          setIsVisible(false);
        }
      },
      { threshold }
    );

    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [threshold, once]);

  const directionStyles = {
    up: "translate-y-8",
    down: "-translate-y-8",
    left: "translate-x-8",
    right: "-translate-x-8",
    none: "",
  };

  return (
    <div
      ref={ref}
      className={`transition-all ${className}`}
      style={{
        opacity: isVisible ? 1 : 0,
        transform: isVisible ? "translate(0, 0)" : undefined,
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
