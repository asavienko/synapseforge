import type { User, Achievement, VocabularyWord } from "@/types"

// ===========================================
// Mock User Data
// ===========================================

export const MOCK_USER: User = {
  id: "user-1",
  name: "Alex",
  email: "alex@example.com",
  targetLanguage: "Spanish",
  targetFlag: "🇪🇸",
  streak: 7,
  totalSongs: 24,
  wordsLearned: 186,
  minutesPracticed: 420,
  level: "Intermediate",
  xp: 2450,
  xpToNextLevel: 3000,
}

// ===========================================
// User Achievements
// ===========================================

export const USER_ACHIEVEMENTS: Achievement[] = [
  {
    id: "1",
    name: "First Song",
    description: "Generate your first song",
    icon: "firstSong",
    color: "coral",
    unlocked: true,
  },
  {
    id: "2",
    name: "Week Warrior",
    description: "7-day learning streak",
    icon: "weekWarrior",
    color: "lavender",
    unlocked: true,
  },
  {
    id: "3",
    name: "Word Collector",
    description: "Learn 100 words",
    icon: "wordCollector",
    color: "sage",
    unlocked: true,
  },
  {
    id: "4",
    name: "Polyglot",
    description: "Learn 3 languages",
    icon: "polyglot",
    color: "coral",
    unlocked: false,
  },
]

// ===========================================
// Vocabulary Words to Review
// ===========================================

export const WORDS_TO_REVIEW: VocabularyWord[] = [
  { word: "hola", translation: "hello", strength: 85 },
  { word: "gracias", translation: "thank you", strength: 92 },
  { word: "buenos dias", translation: "good morning", strength: 70 },
  { word: "por favor", translation: "please", strength: 65 },
  { word: "amigo", translation: "friend", strength: 88 },
]

// ===========================================
// Initial Saved Words
// ===========================================

export const INITIAL_SAVED_WORDS: VocabularyWord[] = [
  { word: "hola", translation: "hello" },
  { word: "gracias", translation: "thank you" },
]
