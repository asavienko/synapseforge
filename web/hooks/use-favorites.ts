"use client"

import { useState, useCallback, useEffect } from "react"

interface UseFavoritesOptions {
  storageKey?: string
  persistToStorage?: boolean
}

interface UseFavoritesReturn {
  favorites: Set<string>
  isFavorite: (id: string) => boolean
  toggleFavorite: (id: string) => void
  addFavorite: (id: string) => void
  removeFavorite: (id: string) => void
  clearFavorites: () => void
  favoritesCount: number
}

/**
 * Custom hook for managing favorites with optional localStorage persistence
 */
export function useFavorites({
  storageKey = "favorites",
  persistToStorage = false,
}: UseFavoritesOptions = {}): UseFavoritesReturn {
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  // Load from localStorage on mount
  useEffect(() => {
    if (persistToStorage && typeof window !== "undefined") {
      try {
        const stored = localStorage.getItem(storageKey)
        if (stored) {
          const parsed = JSON.parse(stored)
          if (Array.isArray(parsed)) {
            setFavorites(new Set(parsed))
          }
        }
      } catch (e) {
        console.error("Failed to load favorites from storage:", e)
      }
    }
  }, [storageKey, persistToStorage])

  // Save to localStorage when favorites change
  useEffect(() => {
    if (persistToStorage && typeof window !== "undefined") {
      try {
        localStorage.setItem(storageKey, JSON.stringify([...favorites]))
      } catch (e) {
        console.error("Failed to save favorites to storage:", e)
      }
    }
  }, [favorites, storageKey, persistToStorage])

  const isFavorite = useCallback(
    (id: string) => favorites.has(id),
    [favorites]
  )

  const toggleFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const addFavorite = useCallback((id: string) => {
    setFavorites((prev) => new Set(prev).add(id))
  }, [])

  const removeFavorite = useCallback((id: string) => {
    setFavorites((prev) => {
      const next = new Set(prev)
      next.delete(id)
      return next
    })
  }, [])

  const clearFavorites = useCallback(() => {
    setFavorites(new Set())
  }, [])

  return {
    favorites,
    isFavorite,
    toggleFavorite,
    addFavorite,
    removeFavorite,
    clearFavorites,
    favoritesCount: favorites.size,
  }
}
