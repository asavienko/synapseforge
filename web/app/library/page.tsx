"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { SongCard } from "@/components/library/song-card"
import { SongPlayer } from "@/components/library/song-player"
import { Logo } from "@/components/logo"
import { SAMPLE_SONGS } from "@/data"
import { getLanguageFilterOptions, getTopicFilterOptions, getGenreFilterOptions } from "@/lib/constants"
import type { Song, SortOption, ViewMode } from "@/types"

// Use centralized data
const sampleSongs = SAMPLE_SONGS

// Legacy array (will be replaced by constants)
const legacySampleSongs = [
  {
    id: "1",
    title: "Cafe Conversations",
    language: "Spanish",
    languageFlag: "🇪🇸",
    topic: "Food",
    style: "Pop",
    words: ["café", "leche", "azúcar", "taza", "caliente"],
    lyrics: [
      { text: "En la mañana temprano", highlighted: [] },
      { text: "Pido un café con leche", highlighted: ["café", "leche"] },
      { text: "Con una taza caliente", highlighted: ["taza", "caliente"] },
      { text: "Y un poco de azúcar", highlighted: ["azúcar"] },
      { text: "El aroma llena el aire", highlighted: [] },
      { text: "Mientras el sol aparece", highlighted: [] },
      { text: "Otra taza de café", highlighted: ["café", "taza"] },
      { text: "Para empezar el día", highlighted: [] },
    ],
    duration: "2:34",
    createdAt: "2024-01-15",
    likes: 1247,
  },
  {
    id: "2",
    title: "Paris Morning",
    language: "French",
    languageFlag: "🇫🇷",
    topic: "Travel",
    style: "Jazz",
    words: ["bonjour", "merci", "croissant", "rue", "soleil"],
    lyrics: [
      { text: "Bonjour Paris, la ville lumière", highlighted: ["bonjour"] },
      { text: "Je marche dans la rue", highlighted: ["rue"] },
      { text: "Le soleil brille sur moi", highlighted: ["soleil"] },
      { text: "Merci pour ce moment", highlighted: ["merci"] },
      { text: "Un croissant au petit matin", highlighted: ["croissant"] },
      { text: "Les oiseaux chantent tout autour", highlighted: [] },
      { text: "Paris, tu es mon amour", highlighted: [] },
      { text: "Je reviendrai toujours", highlighted: [] },
    ],
    duration: "3:12",
    createdAt: "2024-01-14",
    likes: 892,
  },
  {
    id: "3",
    title: "Business Meeting",
    language: "German",
    languageFlag: "🇩🇪",
    topic: "Business",
    style: "Acoustic",
    words: ["arbeit", "büro", "kollege", "projekt", "erfolg"],
    lyrics: [
      { text: "Im Büro am Morgen", highlighted: ["büro"] },
      { text: "Mit meinem Kollege", highlighted: ["kollege"] },
      { text: "Wir arbeiten am Projekt", highlighted: ["projekt"] },
      { text: "Für unseren Erfolg", highlighted: ["erfolg"] },
      { text: "Die Arbeit macht uns stark", highlighted: ["arbeit"] },
      { text: "Zusammen sind wir ein Team", highlighted: [] },
    ],
    duration: "2:48",
    createdAt: "2024-01-13",
    likes: 534,
  },
  {
    id: "4",
    title: "Love Letter",
    language: "Italian",
    languageFlag: "🇮🇹",
    topic: "Romance",
    style: "R&B",
    words: ["amore", "cuore", "bella", "sempre", "insieme"],
    lyrics: [
      { text: "Il mio cuore batte per te", highlighted: ["cuore"] },
      { text: "Sei così bella stasera", highlighted: ["bella"] },
      { text: "Ti amo per sempre", highlighted: ["sempre"] },
      { text: "Voglio stare insieme", highlighted: ["insieme"] },
      { text: "Il nostro amore è eterno", highlighted: ["amore"] },
      { text: "Come le stelle nel cielo", highlighted: [] },
      { text: "Tu sei il mio destino", highlighted: [] },
      { text: "Per sempre insieme", highlighted: ["insieme"] },
    ],
    duration: "3:45",
    createdAt: "2024-01-12",
    likes: 2156,
  },
  {
    id: "5",
    title: "Tokyo Night",
    language: "Japanese",
    languageFlag: "🇯🇵",
    topic: "Travel",
    style: "Pop",
    words: ["東京", "夜", "光", "電車", "夢"],
    lyrics: [
      { text: "東京の夜は輝く", highlighted: ["東京", "夜"] },
      { text: "光が街を照らす", highlighted: ["光"] },
      { text: "電車が走り抜ける", highlighted: ["電車"] },
      { text: "夢を追いかけて", highlighted: ["夢"] },
      { text: "ネオンの光の中で", highlighted: ["光"] },
      { text: "明日を信じて歩く", highlighted: [] },
    ],
    duration: "2:56",
    createdAt: "2024-01-11",
    likes: 1823,
  },
  {
    id: "6",
    title: "Seoul Rhythm",
    language: "Korean",
    languageFlag: "🇰🇷",
    topic: "Food",
    style: "R&B",
    words: ["김치", "밥", "맛있다", "먹다", "좋아"],
    lyrics: [
      { text: "오늘 김치를 먹었어", highlighted: ["김치", "먹다"] },
      { text: "밥이랑 같이 먹으면", highlighted: ["밥"] },
      { text: "정말 맛있다", highlighted: ["맛있다"] },
      { text: "나는 한국 음식이 좋아", highlighted: ["좋아"] },
      { text: "매일 매일 먹고 싶어", highlighted: ["먹다"] },
      { text: "맛있는 음식 최고야", highlighted: ["맛있다"] },
    ],
    duration: "3:22",
    createdAt: "2024-01-10",
    likes: 967,
  },
  {
    id: "7",
    title: "Beijing Dreams",
    language: "Mandarin",
    languageFlag: "🇨🇳",
    topic: "Business",
    style: "Jazz",
    words: ["工作", "成功", "努力", "公司", "未来"],
    lyrics: [
      { text: "在公司工作每一天", highlighted: ["公司", "工作"] },
      { text: "努力追求成功", highlighted: ["努力", "成功"] },
      { text: "我相信未来", highlighted: ["未来"] },
      { text: "梦想会实现", highlighted: [] },
      { text: "每一步都是进步", highlighted: [] },
      { text: "成功就在前方", highlighted: ["成功"] },
    ],
    duration: "2:44",
    createdAt: "2024-01-09",
    likes: 743,
  },
  {
    id: "8",
    title: "Lisbon Sunset",
    language: "Portuguese",
    languageFlag: "🇵🇹",
    topic: "Travel",
    style: "Acoustic",
    words: ["praia", "sol", "mar", "saudade", "amor"],
    lyrics: [
      { text: "Na praia ao pôr do sol", highlighted: ["praia", "sol"] },
      { text: "Olhando para o mar", highlighted: ["mar"] },
      { text: "Sinto saudade de ti", highlighted: ["saudade"] },
      { text: "Meu eterno amor", highlighted: ["amor"] },
      { text: "As ondas cantam canções", highlighted: [] },
      { text: "De amor e saudade", highlighted: ["amor", "saudade"] },
      { text: "O sol se põe devagar", highlighted: ["sol"] },
      { text: "E eu fico a sonhar", highlighted: [] },
    ],
    duration: "3:18",
    createdAt: "2024-01-08",
    likes: 1456,
  },
]

// Use centralized filter options from constants
const languages = getLanguageFilterOptions()
const topics = getTopicFilterOptions()
const styles = getGenreFilterOptions()

export default function LibraryPage() {
  const [selectedLanguage, setSelectedLanguage] = useState("All")
  const [selectedTopic, setSelectedTopic] = useState("All")
  const [selectedStyle, setSelectedStyle] = useState("All")
  const [searchQuery, setSearchQuery] = useState("")
  const [activeSong, setActiveSong] = useState<typeof sampleSongs[0] | null>(null)
  const [sortBy, setSortBy] = useState<SortOption>("newest")
  const [viewMode, setViewMode] = useState<ViewMode>("grid")
  const [favorites, setFavorites] = useState<Set<string>>(new Set())

  const toggleFavorite = (songId: string) => {
    setFavorites(prev => {
      const next = new Set(prev)
      if (next.has(songId)) {
        next.delete(songId)
      } else {
        next.add(songId)
      }
      return next
    })
  }

  const filteredSongs = useMemo(() => {
    let songs = sampleSongs.filter((song) => {
      const matchesLanguage = selectedLanguage === "All" || song.language === selectedLanguage
      const matchesTopic = selectedTopic === "All" || song.topic === selectedTopic
      const matchesStyle = selectedStyle === "All" || song.style === selectedStyle
      const matchesSearch = searchQuery === "" || 
        song.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        song.words.some(word => word.toLowerCase().includes(searchQuery.toLowerCase()))
      
      return matchesLanguage && matchesTopic && matchesStyle && matchesSearch
    })

    // Sort songs
    switch (sortBy) {
      case "newest":
        songs = [...songs].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        break
      case "oldest":
        songs = [...songs].sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
        break
      case "popular":
        songs = [...songs].sort((a, b) => b.likes - a.likes)
        break
      case "duration":
        const parseDuration = (d: string) => {
          const [m, s] = d.split(":").map(Number)
          return m * 60 + s
        }
        songs = [...songs].sort((a, b) => parseDuration(a.duration) - parseDuration(b.duration))
        break
    }

    return songs
  }, [selectedLanguage, selectedTopic, selectedStyle, searchQuery, sortBy])

  return (
    <main id="main-content" className="min-h-screen bg-background">
      <Navbar />
      
      <div className="pt-24 pb-16">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8 md:mb-12">
            <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Back to Home
            </Link>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-medium tracking-tight text-foreground">
              Song Library
            </h1>
            <p className="mt-2 text-sm sm:text-base text-muted-foreground max-w-xl">
              Browse and play all your generated songs. Filter by language, topic, or style.
            </p>
          </div>

          {/* Search and Filters */}
          <div className="mb-6 md:mb-8 space-y-4">
            {/* Search */}
            <input
              type="text"
              placeholder="Search songs or vocabulary..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full rounded-xl border border-border bg-card px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all"
            />
            
            {/* Filter Pills */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Language Filter */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-muted-foreground mb-2">Language</label>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                  {languages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        selectedLanguage === lang
                          ? 'bg-foreground text-background'
                          : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              {/* Topic Filter */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-muted-foreground mb-2">Topic</label>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                  {topics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setSelectedTopic(topic)}
                      className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        selectedTopic === topic
                          ? 'bg-foreground text-background'
                          : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {topic}
                    </button>
                  ))}
                </div>
              </div>

              {/* Style Filter */}
              <div className="flex-1">
                <label className="block text-xs font-medium text-muted-foreground mb-2">Style</label>
                <div className="flex gap-1.5 overflow-x-auto scrollbar-hide pb-1">
                  {styles.map((style) => (
                    <button
                      key={style}
                      onClick={() => setSelectedStyle(style)}
                      className={`flex-shrink-0 rounded-full px-3 py-1.5 text-xs font-medium transition-all ${
                        selectedStyle === style
                          ? 'bg-foreground text-background'
                          : 'bg-secondary text-muted-foreground hover:text-foreground hover:bg-secondary/80'
                      }`}
                    >
                      {style}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Results count and controls */}
          <div className="flex items-center justify-between mb-4 gap-4">
            <p className="text-sm text-muted-foreground">
              {filteredSongs.length} {filteredSongs.length === 1 ? 'song' : 'songs'} found
            </p>
            
            <div className="flex items-center gap-3">
              {/* Sort dropdown */}
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground hidden sm:block">Sort:</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as SortOption)}
                  className="text-xs bg-secondary border border-border rounded-lg px-2.5 py-1.5 text-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10"
                >
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                  <option value="popular">Most Popular</option>
                  <option value="duration">Duration</option>
                </select>
              </div>

              {/* View mode toggle */}
              <div className="flex items-center gap-1 bg-secondary rounded-lg p-1">
                <button
                  onClick={() => setViewMode("grid")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "grid" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="Grid view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                  </svg>
                </button>
                <button
                  onClick={() => setViewMode("list")}
                  className={`p-1.5 rounded-md transition-all ${
                    viewMode === "list" 
                      ? "bg-background text-foreground shadow-sm" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                  title="List view"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* Song Grid/List */}
          {viewMode === "grid" ? (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredSongs.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  isActive={activeSong?.id === song.id}
                  onPlay={() => setActiveSong(song)}
                  isFavorite={favorites.has(song.id)}
                  onToggleFavorite={() => toggleFavorite(song.id)}
                />
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filteredSongs.map((song) => (
                <div
                  key={song.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActiveSong(song)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setActiveSong(song)
                    }
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all cursor-pointer ${
                    activeSong?.id === song.id
                      ? "bg-foreground/10 border border-foreground/20"
                      : "bg-card border border-border hover:bg-secondary/50"
                  }`}
                >
                  <div className="w-12 h-12 rounded-lg bg-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-xl">{song.languageFlag}</span>
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="text-sm font-medium text-foreground truncate">{song.title}</h3>
                    <p className="text-xs text-muted-foreground truncate">
                      {song.language} - {song.topic} - {song.style}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={(e) => {
                        e.stopPropagation()
                        toggleFavorite(song.id)
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault()
                          e.stopPropagation()
                          toggleFavorite(song.id)
                        }
                      }}
                      className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                        favorites.has(song.id) 
                          ? "text-coral" 
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      <svg className="w-4 h-4" fill={favorites.has(song.id) ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </span>
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                      </svg>
                      {song.likes >= 1000 ? `${(song.likes / 1000).toFixed(1)}k` : song.likes}
                    </span>
                    <span className="text-xs text-muted-foreground">{song.duration}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {filteredSongs.length === 0 && (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-secondary mb-4">
                <Logo size="md" className="w-8 h-8 opacity-50" />
              </div>
              <h3 className="text-lg font-medium text-foreground mb-2">No songs found</h3>
              <p className="text-sm text-muted-foreground">
                Try adjusting your filters or search query
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Song Player - Fixed at bottom when a song is selected */}
      {activeSong && (
        <SongPlayer
          song={activeSong}
          songs={filteredSongs}
          onClose={() => setActiveSong(null)}
          onSongChange={setActiveSong}
        />
      )}

      <Footer />
    </main>
  )
}
