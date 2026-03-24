// ===========================================
// Core Domain Types
// ===========================================

/**
 * Lyric line with highlighted vocabulary words
 */
export interface LyricLine {
  text: string
  highlighted: string[]
}

/**
 * Detailed lyric line with word-by-word translations (for dashboard player)
 */
export interface DetailedLyricLine {
  text: string
  words: { word: string; translation: string }[]
}

/**
 * Base song interface for library/community songs
 */
export interface Song {
  id: string
  title: string
  language: string
  languageFlag: string
  topic: string
  style: string
  words: string[]
  lyrics: LyricLine[]
  duration: string
  createdAt: string
  likes: number
}

/**
 * User's personal song with additional metadata
 */
export interface UserSong {
  id: string
  title: string
  language: string
  flag: string
  duration: string
  wordsCount: number
  lastPlayed: string
  lyrics?: DetailedLyricLine[]
}

/**
 * Word with translation and learning progress
 */
export interface VocabularyWord {
  word: string
  translation: string
  strength?: number
}

/**
 * User profile and learning progress
 */
export interface User {
  id: string
  name: string
  email: string
  targetLanguage: string
  targetFlag: string
  streak: number
  totalSongs: number
  wordsLearned: number
  minutesPracticed: number
  level: string
  xp: number
  xpToNextLevel: number
}

/**
 * Achievement/Badge
 */
export interface Achievement {
  id: string
  name: string
  description: string
  icon: string
  color: "coral" | "lavender" | "sage"
  unlocked: boolean
}

// ===========================================
// Configuration Types
// ===========================================

/**
 * Supported language
 */
export interface Language {
  code: string
  name: string
  flag: string
  nativeName: string
}

/**
 * Topic/Category for songs
 */
export interface Topic {
  id: string
  label: string
  icon?: string
}

/**
 * Music genre/style
 */
export interface Genre {
  id: string
  label: string
  description?: string
}

// ===========================================
// Component Props Types
// ===========================================

export type RepeatMode = "off" | "one" | "all" | "count"

export type SortOption = "newest" | "oldest" | "popular" | "duration"

export type ViewMode = "grid" | "list"

// ===========================================
// API Response Types (for future backend)
// ===========================================

export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}
