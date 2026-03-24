"use client"

import { useEffect, useState, useRef } from "react"

interface AnimatedCounterProps {
  value: string
  duration?: number
}

export function AnimatedCounter({ value, duration = 2000 }: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState("0")
  const [hasAnimated, setHasAnimated] = useState(false)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          animateValue()
        }
      },
      { threshold: 0.5 }
    )

    if (ref.current) {
      observer.observe(ref.current)
    }

    return () => observer.disconnect()
  }, [hasAnimated])

  const animateValue = () => {
    // Extract number and suffix (e.g., "50K+" -> 50, "K+")
    const match = value.match(/^([\d.]+)(.*)$/)
    if (!match) {
      setDisplayValue(value)
      return
    }

    const targetNum = parseFloat(match[1])
    const suffix = match[2]
    const startTime = performance.now()

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime
      const progress = Math.min(elapsed / duration, 1)
      
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4)
      const currentValue = targetNum * easeOutQuart

      if (targetNum % 1 === 0) {
        setDisplayValue(Math.floor(currentValue) + suffix)
      } else {
        setDisplayValue(currentValue.toFixed(1) + suffix)
      }

      if (progress < 1) {
        requestAnimationFrame(animate)
      } else {
        setDisplayValue(value)
      }
    }

    requestAnimationFrame(animate)
  }

  return <span ref={ref}>{displayValue}</span>
}
