"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import type { RepeatMode } from "@/types"

interface UseAudioPlayerOptions {
  duration: string | number
  lyricsCount?: number
  onSongEnd?: () => void
}

interface UseAudioPlayerReturn {
  isPlaying: boolean
  currentTime: number
  totalDuration: number
  currentLyricIndex: number
  progress: number
  formattedCurrentTime: string
  formattedDuration: string
  volume: number
  playbackSpeed: number
  repeatMode: RepeatMode
  repeatCount: number
  currentRepeat: number
  play: () => void
  pause: () => void
  toggle: () => void
  seek: (time: number) => void
  setVolume: (volume: number) => void
  setPlaybackSpeed: (speed: number) => void
  setRepeatMode: (mode: RepeatMode) => void
  setRepeatCount: (count: number) => void
  reset: () => void
}

/**
 * Parse duration string (mm:ss) to seconds
 */
function parseDuration(duration: string | number): number {
  if (typeof duration === "number") return duration
  const [minutes, seconds] = duration.split(":").map(Number)
  return minutes * 60 + seconds
}

/**
 * Format seconds to mm:ss
 */
function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60)
  const secs = Math.floor(seconds % 60)
  return `${mins}:${secs.toString().padStart(2, "0")}`
}

/**
 * Custom hook for audio playback logic
 * Handles play/pause, seeking, volume, speed, repeat modes
 */
export function useAudioPlayer({
  duration,
  lyricsCount = 1,
  onSongEnd,
}: UseAudioPlayerOptions): UseAudioPlayerReturn {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolumeState] = useState(80)
  const [playbackSpeed, setPlaybackSpeedState] = useState(1)
  const [repeatMode, setRepeatModeState] = useState<RepeatMode>("off")
  const [repeatCount, setRepeatCountState] = useState(1)
  const [currentRepeat, setCurrentRepeat] = useState(0)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const totalDuration = parseDuration(duration)

  // Calculate progress percentage
  const progress = totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0

  // Calculate current lyric index based on time
  const lyricDuration = lyricsCount > 0 ? totalDuration / lyricsCount : totalDuration
  const currentLyricIndex = Math.min(
    Math.floor(currentTime / lyricDuration),
    Math.max(0, lyricsCount - 1)
  )

  // Handle song end
  const handleSongEnd = useCallback(() => {
    if (repeatMode === "one") {
      setCurrentTime(0)
      setIsPlaying(true)
    } else if (repeatMode === "count") {
      if (currentRepeat < repeatCount - 1) {
        setCurrentRepeat((prev) => prev + 1)
        setCurrentTime(0)
        setIsPlaying(true)
      } else {
        setCurrentRepeat(0)
        setIsPlaying(false)
        setCurrentTime(0)
        onSongEnd?.()
      }
    } else {
      setIsPlaying(false)
      setCurrentTime(0)
      onSongEnd?.()
    }
  }, [repeatMode, repeatCount, currentRepeat, onSongEnd])

  // Playback interval
  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            handleSongEnd()
            return 0
          }
          return prev + 0.1 * playbackSpeed
        })
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, totalDuration, playbackSpeed, handleSongEnd])

  // Control functions
  const play = useCallback(() => setIsPlaying(true), [])
  const pause = useCallback(() => setIsPlaying(false), [])
  const toggle = useCallback(() => setIsPlaying((prev) => !prev), [])

  const seek = useCallback((time: number) => {
    setCurrentTime(Math.max(0, Math.min(time, totalDuration)))
  }, [totalDuration])

  const setVolume = useCallback((vol: number) => {
    setVolumeState(Math.max(0, Math.min(100, vol)))
  }, [])

  const setPlaybackSpeed = useCallback((speed: number) => {
    setPlaybackSpeedState(speed)
  }, [])

  const setRepeatMode = useCallback((mode: RepeatMode) => {
    setRepeatModeState(mode)
    setCurrentRepeat(0)
  }, [])

  const setRepeatCount = useCallback((count: number) => {
    setRepeatCountState(Math.max(1, count))
  }, [])

  const reset = useCallback(() => {
    setCurrentTime(0)
    setIsPlaying(false)
    setCurrentRepeat(0)
  }, [])

  return {
    isPlaying,
    currentTime,
    totalDuration,
    currentLyricIndex,
    progress,
    formattedCurrentTime: formatTime(currentTime),
    formattedDuration: formatTime(totalDuration),
    volume,
    playbackSpeed,
    repeatMode,
    repeatCount,
    currentRepeat,
    play,
    pause,
    toggle,
    seek,
    setVolume,
    setPlaybackSpeed,
    setRepeatMode,
    setRepeatCount,
    reset,
  }
}
