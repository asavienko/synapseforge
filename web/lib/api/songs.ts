import type { Song, UserSong, ApiResponse, PaginatedResponse } from "@/types"
import { SAMPLE_SONGS, RECENT_USER_SONGS } from "@/data"

/**
 * Songs API Layer
 * 
 * This module provides an abstraction layer for song-related operations.
 * Currently uses mock data, but designed for easy integration with a real backend.
 * 
 * To connect to a real backend:
 * 1. Replace the mock implementations with actual fetch calls
 * 2. Update the base URL in the fetch calls
 * 3. Add authentication headers as needed
 */

// Simulated network delay for development
const MOCK_DELAY = 300

async function delay(ms: number = MOCK_DELAY): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ===========================================
// Community/Library Songs
// ===========================================

/**
 * Fetch all community songs
 */
export async function getSongs(): Promise<ApiResponse<Song[]>> {
  await delay()
  
  return {
    success: true,
    data: SAMPLE_SONGS,
  }
}

/**
 * Fetch songs with pagination
 */
export async function getSongsPaginated(
  page: number = 1,
  pageSize: number = 10
): Promise<PaginatedResponse<Song>> {
  await delay()
  
  const startIndex = (page - 1) * pageSize
  const endIndex = startIndex + pageSize
  const paginatedSongs = SAMPLE_SONGS.slice(startIndex, endIndex)

  return {
    data: paginatedSongs,
    total: SAMPLE_SONGS.length,
    page,
    pageSize,
    hasMore: endIndex < SAMPLE_SONGS.length,
  }
}

/**
 * Fetch a single song by ID
 */
export async function getSongById(id: string): Promise<ApiResponse<Song | null>> {
  await delay()
  
  const song = SAMPLE_SONGS.find((s) => s.id === id) || null

  return {
    success: !!song,
    data: song,
    error: song ? undefined : "Song not found",
  }
}

/**
 * Search songs by query
 */
export async function searchSongs(query: string): Promise<ApiResponse<Song[]>> {
  await delay()
  
  const lowercaseQuery = query.toLowerCase()
  const results = SAMPLE_SONGS.filter(
    (song) =>
      song.title.toLowerCase().includes(lowercaseQuery) ||
      song.words.some((word) => word.toLowerCase().includes(lowercaseQuery)) ||
      song.language.toLowerCase().includes(lowercaseQuery)
  )

  return {
    success: true,
    data: results,
  }
}

/**
 * Like a song
 */
export async function likeSong(id: string): Promise<ApiResponse<{ likes: number }>> {
  await delay()
  
  const song = SAMPLE_SONGS.find((s) => s.id === id)
  if (!song) {
    return {
      success: false,
      data: { likes: 0 },
      error: "Song not found",
    }
  }

  // In a real app, this would update the database
  // For now, just return the incremented count
  return {
    success: true,
    data: { likes: song.likes + 1 },
  }
}

// ===========================================
// User Songs
// ===========================================

/**
 * Fetch user's personal songs
 */
export async function getUserSongs(userId?: string): Promise<ApiResponse<UserSong[]>> {
  await delay()
  
  // In a real app, this would filter by userId
  return {
    success: true,
    data: RECENT_USER_SONGS,
  }
}

/**
 * Create a new user song
 */
export async function createUserSong(
  songData: Omit<UserSong, "id" | "lastPlayed">
): Promise<ApiResponse<UserSong>> {
  await delay()
  
  const newSong: UserSong = {
    ...songData,
    id: String(Date.now()),
    lastPlayed: "Just now",
  }

  return {
    success: true,
    data: newSong,
  }
}

/**
 * Delete a user song
 */
export async function deleteUserSong(id: string): Promise<ApiResponse<boolean>> {
  await delay()
  
  // In a real app, this would delete from the database
  return {
    success: true,
    data: true,
  }
}

// ===========================================
// Song Generation (AI)
// ===========================================

interface GenerateSongParams {
  language: string
  words: string[]
  genre: string
  topic?: string
}

/**
 * Generate a new song using AI
 * This is a placeholder for AI song generation
 */
export async function generateSong(
  params: GenerateSongParams
): Promise<ApiResponse<UserSong>> {
  // Simulate longer delay for AI generation
  await delay(2000)
  
  const { language, words, genre } = params

  // Generate a mock song
  const newSong: UserSong = {
    id: String(Date.now()),
    title: `${genre} Song in ${language}`,
    language,
    flag: getLanguageFlag(language),
    duration: `${Math.floor(Math.random() * 2) + 2}:${String(
      Math.floor(Math.random() * 60)
    ).padStart(2, "0")}`,
    wordsCount: words.length,
    lastPlayed: "Just now",
  }

  return {
    success: true,
    data: newSong,
  }
}

// Helper function to get language flag
function getLanguageFlag(language: string): string {
  const flags: Record<string, string> = {
    Spanish: "🇪🇸",
    French: "🇫🇷",
    German: "🇩🇪",
    Italian: "🇮🇹",
    Japanese: "🇯🇵",
    Korean: "🇰🇷",
    Mandarin: "🇨🇳",
    Portuguese: "🇵🇹",
  }
  return flags[language] || "🌍"
}
