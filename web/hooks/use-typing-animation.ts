"use client"

import { useState, useEffect, useCallback } from "react"

interface UseTypingAnimationOptions {
  words: string[]
  typingSpeed?: number
  deletingSpeed?: number
  pauseDuration?: number
  loop?: boolean
}

interface UseTypingAnimationReturn {
  displayText: string
  currentWordIndex: number
  isTyping: boolean
  isDeleting: boolean
  isPaused: boolean
  reset: () => void
}

/**
 * Custom hook for typewriter text animation
 * Types out words one by one with configurable speeds
 */
export function useTypingAnimation({
  words,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseDuration = 2000,
  loop = true,
}: UseTypingAnimationOptions): UseTypingAnimationReturn {
  const [displayText, setDisplayText] = useState("")
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [isTyping, setIsTyping] = useState(true)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isPaused, setIsPaused] = useState(false)

  useEffect(() => {
    if (words.length === 0) return

    const currentWord = words[currentWordIndex]

    let timeout: NodeJS.Timeout

    if (isPaused) {
      // Pause before deleting
      timeout = setTimeout(() => {
        setIsPaused(false)
        setIsDeleting(true)
      }, pauseDuration)
    } else if (isTyping && !isDeleting) {
      // Typing phase
      if (displayText.length < currentWord.length) {
        timeout = setTimeout(() => {
          setDisplayText(currentWord.slice(0, displayText.length + 1))
        }, typingSpeed)
      } else {
        // Finished typing, start pause
        setIsTyping(false)
        setIsPaused(true)
      }
    } else if (isDeleting) {
      // Deleting phase
      if (displayText.length > 0) {
        timeout = setTimeout(() => {
          setDisplayText(displayText.slice(0, -1))
        }, deletingSpeed)
      } else {
        // Finished deleting, move to next word
        setIsDeleting(false)
        setIsTyping(true)
        
        if (loop || currentWordIndex < words.length - 1) {
          setCurrentWordIndex((prev) => (prev + 1) % words.length)
        }
      }
    }

    return () => clearTimeout(timeout)
  }, [
    displayText,
    currentWordIndex,
    isTyping,
    isDeleting,
    isPaused,
    words,
    typingSpeed,
    deletingSpeed,
    pauseDuration,
    loop,
  ])

  const reset = useCallback(() => {
    setDisplayText("")
    setCurrentWordIndex(0)
    setIsTyping(true)
    setIsDeleting(false)
    setIsPaused(false)
  }, [])

  return {
    displayText,
    currentWordIndex,
    isTyping,
    isDeleting,
    isPaused,
    reset,
  }
}
