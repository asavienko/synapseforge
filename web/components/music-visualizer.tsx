"use client"

import { useEffect, useState } from "react"

interface MusicVisualizerProps {
  isPlaying?: boolean
  barCount?: number
  className?: string
}

export function MusicVisualizer({ isPlaying = true, barCount = 12, className = "" }: MusicVisualizerProps) {
  const [heights, setHeights] = useState<number[]>(Array(barCount).fill(20))

  useEffect(() => {
    if (!isPlaying) {
      setHeights(Array(barCount).fill(20))
      return
    }

    const interval = setInterval(() => {
      setHeights(prev => 
        prev.map(() => Math.random() * 80 + 20)
      )
    }, 100)

    return () => clearInterval(interval)
  }, [isPlaying, barCount])

  return (
    <div className={`flex items-end justify-center gap-1 ${className}`}>
      {heights.map((height, i) => (
        <div
          key={i}
          className="w-1.5 rounded-full bg-gradient-to-t from-primary to-accent transition-all duration-100"
          style={{ height: `${height}%` }}
        />
      ))}
    </div>
  )
}
