"use client"

import { useState, useMemo, useCallback } from "react"
import type { Song, SortOption } from "@/types"

interface UseFilterOptions<T> {
  items: T[]
  initialFilters?: Record<string, string>
  filterFn?: (item: T, filters: Record<string, string>, searchQuery: string) => boolean
  sortFn?: (items: T[], sortOption: SortOption) => T[]
}

interface UseFilterReturn<T> {
  filteredItems: T[]
  filters: Record<string, string>
  searchQuery: string
  sortBy: SortOption
  setFilter: (key: string, value: string) => void
  setSearchQuery: (query: string) => void
  setSortBy: (sort: SortOption) => void
  resetFilters: () => void
  activeFilterCount: number
}

const ALL_FILTER = "All"

/**
 * Default filter function for Song items
 */
function defaultSongFilter(
  song: Song,
  filters: Record<string, string>,
  searchQuery: string
): boolean {
  const matchesLanguage =
    !filters.language || filters.language === ALL_FILTER || song.language === filters.language
  const matchesTopic =
    !filters.topic || filters.topic === ALL_FILTER || song.topic === filters.topic
  const matchesStyle =
    !filters.style || filters.style === ALL_FILTER || song.style === filters.style
  const matchesSearch =
    !searchQuery ||
    song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    song.words.some((word) => word.toLowerCase().includes(searchQuery.toLowerCase()))

  return matchesLanguage && matchesTopic && matchesStyle && matchesSearch
}

/**
 * Default sort function for Song items
 */
function defaultSongSort(songs: Song[], sortBy: SortOption): Song[] {
  const sorted = [...songs]

  switch (sortBy) {
    case "newest":
      return sorted.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )
    case "oldest":
      return sorted.sort(
        (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )
    case "popular":
      return sorted.sort((a, b) => b.likes - a.likes)
    case "duration":
      const parseDuration = (d: string) => {
        const [m, s] = d.split(":").map(Number)
        return m * 60 + s
      }
      return sorted.sort(
        (a, b) => parseDuration(a.duration) - parseDuration(b.duration)
      )
    default:
      return sorted
  }
}

/**
 * Custom hook for filtering and sorting lists
 * Provides reusable filter state and logic
 */
export function useFilter<T = Song>({
  items,
  initialFilters = {},
  filterFn,
  sortFn,
}: UseFilterOptions<T>): UseFilterReturn<T> {
  const [filters, setFilters] = useState<Record<string, string>>(initialFilters)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<SortOption>("newest")

  const setFilter = useCallback((key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }, [])

  const resetFilters = useCallback(() => {
    setFilters(initialFilters)
    setSearchQuery("")
    setSortBy("newest")
  }, [initialFilters])

  // Count active filters (excluding "All" values)
  const activeFilterCount = useMemo(() => {
    return Object.values(filters).filter((v) => v && v !== ALL_FILTER).length +
      (searchQuery ? 1 : 0)
  }, [filters, searchQuery])

  // Apply filters and sorting
  const filteredItems = useMemo(() => {
    // Use provided filter function or default
    const filter = filterFn || (defaultSongFilter as unknown as (item: T, filters: Record<string, string>, searchQuery: string) => boolean)
    const sort = sortFn || (defaultSongSort as unknown as (items: T[], sortOption: SortOption) => T[])

    const filtered = items.filter((item) => filter(item, filters, searchQuery))
    return sort(filtered, sortBy)
  }, [items, filters, searchQuery, sortBy, filterFn, sortFn])

  return {
    filteredItems,
    filters,
    searchQuery,
    sortBy,
    setFilter,
    setSearchQuery,
    setSortBy,
    resetFilters,
    activeFilterCount,
  }
}
