import type { User, Achievement, VocabularyWord, ApiResponse } from "@/types"
import { MOCK_USER, USER_ACHIEVEMENTS, WORDS_TO_REVIEW } from "@/data"

/**
 * User API Layer
 * 
 * This module provides an abstraction layer for user-related operations.
 * Currently uses mock data, but designed for easy integration with a real backend.
 */

// Simulated network delay for development
const MOCK_DELAY = 200

async function delay(ms: number = MOCK_DELAY): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// ===========================================
// User Profile
// ===========================================

/**
 * Get the current user's profile
 */
export async function getCurrentUser(): Promise<ApiResponse<User>> {
  await delay()
  
  return {
    success: true,
    data: MOCK_USER,
  }
}

/**
 * Update user profile
 */
export async function updateUserProfile(
  updates: Partial<User>
): Promise<ApiResponse<User>> {
  await delay()
  
  const updatedUser = { ...MOCK_USER, ...updates }
  
  return {
    success: true,
    data: updatedUser,
  }
}

/**
 * Update user's target language
 */
export async function updateTargetLanguage(
  language: string,
  flag: string
): Promise<ApiResponse<User>> {
  await delay()
  
  return {
    success: true,
    data: {
      ...MOCK_USER,
      targetLanguage: language,
      targetFlag: flag,
    },
  }
}

// ===========================================
// User Progress & Stats
// ===========================================

interface UserStats {
  streak: number
  totalSongs: number
  wordsLearned: number
  minutesPracticed: number
  level: string
  xp: number
  xpToNextLevel: number
}

/**
 * Get user's learning statistics
 */
export async function getUserStats(): Promise<ApiResponse<UserStats>> {
  await delay()
  
  return {
    success: true,
    data: {
      streak: MOCK_USER.streak,
      totalSongs: MOCK_USER.totalSongs,
      wordsLearned: MOCK_USER.wordsLearned,
      minutesPracticed: MOCK_USER.minutesPracticed,
      level: MOCK_USER.level,
      xp: MOCK_USER.xp,
      xpToNextLevel: MOCK_USER.xpToNextLevel,
    },
  }
}

/**
 * Record practice session
 */
export async function recordPracticeSession(
  minutes: number,
  wordsReviewed: number
): Promise<ApiResponse<UserStats>> {
  await delay()
  
  // In a real app, this would update the database
  const updatedStats: UserStats = {
    streak: MOCK_USER.streak,
    totalSongs: MOCK_USER.totalSongs,
    wordsLearned: MOCK_USER.wordsLearned + wordsReviewed,
    minutesPracticed: MOCK_USER.minutesPracticed + minutes,
    level: MOCK_USER.level,
    xp: MOCK_USER.xp + (minutes * 10) + (wordsReviewed * 5),
    xpToNextLevel: MOCK_USER.xpToNextLevel,
  }

  return {
    success: true,
    data: updatedStats,
  }
}

// ===========================================
// Achievements
// ===========================================

/**
 * Get user's achievements
 */
export async function getUserAchievements(): Promise<ApiResponse<Achievement[]>> {
  await delay()
  
  return {
    success: true,
    data: USER_ACHIEVEMENTS,
  }
}

/**
 * Unlock an achievement
 */
export async function unlockAchievement(
  achievementId: string
): Promise<ApiResponse<Achievement | null>> {
  await delay()
  
  const achievement = USER_ACHIEVEMENTS.find((a) => a.id === achievementId)
  
  if (!achievement) {
    return {
      success: false,
      data: null,
      error: "Achievement not found",
    }
  }

  return {
    success: true,
    data: { ...achievement, unlocked: true },
  }
}

// ===========================================
// Vocabulary
// ===========================================

/**
 * Get user's saved vocabulary words
 */
export async function getSavedWords(): Promise<ApiResponse<VocabularyWord[]>> {
  await delay()
  
  return {
    success: true,
    data: WORDS_TO_REVIEW,
  }
}

/**
 * Save a new word to vocabulary
 */
export async function saveWord(
  word: string,
  translation: string
): Promise<ApiResponse<VocabularyWord>> {
  await delay()
  
  const newWord: VocabularyWord = {
    word,
    translation,
    strength: 0, // New words start at 0 strength
  }

  return {
    success: true,
    data: newWord,
  }
}

/**
 * Delete a word from vocabulary
 */
export async function deleteWord(word: string): Promise<ApiResponse<boolean>> {
  await delay()
  
  return {
    success: true,
    data: true,
  }
}

/**
 * Update word strength after review
 */
export async function updateWordStrength(
  word: string,
  correct: boolean
): Promise<ApiResponse<VocabularyWord | null>> {
  await delay()
  
  const existingWord = WORDS_TO_REVIEW.find((w) => w.word === word)
  
  if (!existingWord) {
    return {
      success: false,
      data: null,
      error: "Word not found",
    }
  }

  // Adjust strength based on correctness
  const strengthChange = correct ? 10 : -5
  const newStrength = Math.max(0, Math.min(100, (existingWord.strength || 0) + strengthChange))

  return {
    success: true,
    data: {
      ...existingWord,
      strength: newStrength,
    },
  }
}

/**
 * Get words due for review (spaced repetition)
 */
export async function getWordsForReview(
  limit: number = 10
): Promise<ApiResponse<VocabularyWord[]>> {
  await delay()
  
  // In a real app, this would use spaced repetition algorithm
  // For now, return words with lowest strength
  const sortedWords = [...WORDS_TO_REVIEW]
    .sort((a, b) => (a.strength || 0) - (b.strength || 0))
    .slice(0, limit)

  return {
    success: true,
    data: sortedWords,
  }
}
