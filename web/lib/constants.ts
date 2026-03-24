import type { Language, Topic, Genre } from "@/types"

// ===========================================
// Languages Configuration
// ===========================================

export const LANGUAGES: Language[] = [
  { code: "es", name: "Spanish", flag: "🇪🇸", nativeName: "Español" },
  { code: "fr", name: "French", flag: "🇫🇷", nativeName: "Français" },
  { code: "de", name: "German", flag: "🇩🇪", nativeName: "Deutsch" },
  { code: "it", name: "Italian", flag: "🇮🇹", nativeName: "Italiano" },
  { code: "ja", name: "Japanese", flag: "🇯🇵", nativeName: "日本語" },
  { code: "ko", name: "Korean", flag: "🇰🇷", nativeName: "한국어" },
  { code: "zh", name: "Mandarin", flag: "🇨🇳", nativeName: "中文" },
  { code: "pt", name: "Portuguese", flag: "🇵🇹", nativeName: "Português" },
  { code: "ru", name: "Russian", flag: "🇷🇺", nativeName: "Русский" },
  { code: "ar", name: "Arabic", flag: "🇸🇦", nativeName: "العربية" },
  { code: "hi", name: "Hindi", flag: "🇮🇳", nativeName: "हिन्दी" },
  { code: "nl", name: "Dutch", flag: "🇳🇱", nativeName: "Nederlands" },
]

export const LANGUAGE_MAP = Object.fromEntries(
  LANGUAGES.map((lang) => [lang.name, lang])
)

// ===========================================
// Topics Configuration
// ===========================================

export const TOPICS: Topic[] = [
  { id: "food", label: "Food" },
  { id: "travel", label: "Travel" },
  { id: "business", label: "Business" },
  { id: "romance", label: "Romance" },
  { id: "daily-life", label: "Daily Life" },
  { id: "nature", label: "Nature" },
  { id: "sports", label: "Sports" },
  { id: "technology", label: "Technology" },
]

// ===========================================
// Music Genres Configuration
// ===========================================

export const GENRES: Genre[] = [
  { id: "pop", label: "Pop", description: "Catchy and upbeat" },
  { id: "jazz", label: "Jazz", description: "Smooth and sophisticated" },
  { id: "acoustic", label: "Acoustic", description: "Mellow and organic" },
  { id: "rnb", label: "R&B", description: "Soulful and rhythmic" },
  { id: "rock", label: "Rock", description: "Energetic and powerful" },
  { id: "hip-hop", label: "Hip Hop", description: "Rhythmic and expressive" },
  { id: "electronic", label: "Electronic", description: "Modern and dynamic" },
  { id: "folk", label: "Folk", description: "Traditional and storytelling" },
]

// ===========================================
// App Configuration
// ===========================================

export const APP_CONFIG = {
  name: "LyricLingo",
  tagline: "Learn languages through music",
  defaultLanguage: "Spanish",
  maxWordsPerSong: 20,
  minWordsPerSong: 3,
} as const

// ===========================================
// Navigation Links
// ===========================================

export const NAV_LINKS = [
  { href: "#features", label: "Features" },
  { href: "#how-it-works", label: "How It Works" },
  { href: "#pricing", label: "Pricing" },
  { href: "/library", label: "Library" },
] as const

export const DASHBOARD_NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: "home" },
  { id: "songs", label: "My Songs", icon: "songs" },
  { id: "words", label: "Vocabulary", icon: "vocab" },
  { id: "settings", label: "Settings", icon: "settings" },
] as const

// ===========================================
// Filter Options
// ===========================================

export const FILTER_ALL = "All" as const

export const getLanguageFilterOptions = () => [
  FILTER_ALL,
  ...LANGUAGES.map((lang) => lang.name),
]

export const getTopicFilterOptions = () => [
  FILTER_ALL,
  ...TOPICS.map((topic) => topic.label),
]

export const getGenreFilterOptions = () => [
  FILTER_ALL,
  ...GENRES.map((genre) => genre.label),
]
