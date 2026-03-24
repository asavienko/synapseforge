"use client"

import { useEffect, useRef, useState, ReactNode } from "react"

interface LazySectionProps {
  children: ReactNode
  className?: string
  threshold?: number
  rootMargin?: string
  fallback?: ReactNode
}

/**
 * Lazy loading wrapper for below-fold sections
 * Uses IntersectionObserver to load content only when visible
 */
export function LazySection({
  children,
  className = "",
  threshold = 0.1,
  rootMargin = "100px",
  fallback = null,
}: LazySectionProps) {
  const [isVisible, setIsVisible] = useState(false)
  const sectionRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const element = sectionRef.current
    if (!element) return

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
          observer.disconnect()
        }
      },
      {
        threshold,
        rootMargin,
      }
    )

    observer.observe(element)

    return () => observer.disconnect()
  }, [threshold, rootMargin])

  return (
    <div ref={sectionRef} className={className}>
      {isVisible ? children : fallback}
    </div>
  )
}

/**
 * Skeleton loader for lazy sections
 */
export function SectionSkeleton({ height = "400px" }: { height?: string }) {
  return (
    <div 
      className="animate-pulse bg-secondary/50 rounded-2xl"
      style={{ height }}
    />
  )
}
