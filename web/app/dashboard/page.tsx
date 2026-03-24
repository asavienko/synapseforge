"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { 
  HomeIcon, 
  MySongsIcon, 
  VocabIcon, 
  SettingsIcon,
  StreakIcon,
  SongIcon,
  PracticeTimeIcon,
  ArrowIcon,
  PlayIcon,
  AddIcon
} from "@/components/icons"
import { Logo } from "@/components/logo"
import { CreateSongModal } from "@/components/dashboard/create-song-modal"
import { DashboardPlayer, DashboardSong } from "@/components/dashboard/song-player"

// Mock user data
const userData = {
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

// Recent songs
const recentSongs = [
  { id: "1", title: "Cafe Conversations", language: "Spanish", flag: "🇪🇸", duration: "2:34", wordsCount: 5, lastPlayed: "2 hours ago" },
  { id: "2", title: "Market Day", language: "Spanish", flag: "🇪🇸", duration: "3:12", wordsCount: 8, lastPlayed: "Yesterday" },
  { id: "3", title: "Beach Sunset", language: "Spanish", flag: "🇪🇸", duration: "2:48", wordsCount: 6, lastPlayed: "2 days ago" },
]

// Words to review
const wordsToReview = [
  { word: "hola", translation: "hello", strength: 85 },
  { word: "gracias", translation: "thank you", strength: 92 },
  { word: "buenos dias", translation: "good morning", strength: 70 },
  { word: "por favor", translation: "please", strength: 65 },
  { word: "amigo", translation: "friend", strength: 88 },
]

// Achievement Icons
const AchievementIcons = {
  firstSong: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
      <path d="M9 18V5l12-2v13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <circle cx="6" cy="18" r="3" stroke="currentColor" strokeWidth="1.5"/>
      <circle cx="18" cy="16" r="3" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  weekWarrior: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
      <path d="M12 2v2m0 16v2M4 12H2m20 0h-2m-2.93-7.07l-1.41 1.41m-9.32 9.32l-1.41 1.41m0-12.14l1.41 1.41m9.32 9.32l1.41 1.41" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
  wordCollector: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
      <path d="M4 19.5A2.5 2.5 0 016.5 17H20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M8 7h8M8 11h6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    </svg>
  ),
  polyglot: () => (
    <svg viewBox="0 0 24 24" fill="none" className="w-7 h-7">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5"/>
      <path d="M2 12h20M12 2c2.5 2.5 4 5.5 4 10s-1.5 7.5-4 10c-2.5-2.5-4-5.5-4-10s1.5-7.5 4-10z" stroke="currentColor" strokeWidth="1.5"/>
    </svg>
  ),
}

// Achievements
const achievements = [
  { id: "1", name: "First Song", description: "Generate your first song", icon: "firstSong", color: "coral", unlocked: true },
  { id: "2", name: "Week Warrior", description: "7-day learning streak", icon: "weekWarrior", color: "lavender", unlocked: true },
  { id: "3", name: "Word Collector", description: "Learn 100 words", icon: "wordCollector", color: "sage", unlocked: true },
  { id: "4", name: "Polyglot", description: "Learn 3 languages", icon: "polyglot", color: "coral", unlocked: false },
]

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "songs" | "words" | "settings">("overview")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [userSongs, setUserSongs] = useState<DashboardSong[]>(recentSongs)
  const [currentSong, setCurrentSong] = useState<DashboardSong | null>(null)
  const [savedWords, setSavedWords] = useState<{ word: string; translation: string }[]>([
    { word: "hola", translation: "hello" },
    { word: "gracias", translation: "thank you" },
  ])
  const router = useRouter()

  const handlePlaySong = (song: DashboardSong) => {
    setCurrentSong(song)
  }

  const handlePlayAll = () => {
    if (userSongs.length > 0) {
      setCurrentSong(userSongs[0])
    }
  }

  const handleSaveWord = (word: string, translation: string) => {
    if (!savedWords.some(w => w.word.toLowerCase() === word.toLowerCase())) {
      setSavedWords(prev => [...prev, { word, translation }])
    }
  }

  const handleSongCreated = (song: { title: string; language: string; flag: string; words: string[]; genre: string }) => {
    const newSong = {
      id: String(Date.now()),
      title: song.title,
      language: song.language,
      flag: song.flag,
      duration: `${Math.floor(Math.random() * 2) + 2}:${String(Math.floor(Math.random() * 60)).padStart(2, '0')}`,
      wordsCount: song.words.length,
      lastPlayed: "Just now"
    }
    setUserSongs(prev => [newSong, ...prev])
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar for desktop - Apple liquid glass style */}
      <aside className="fixed left-4 top-4 bottom-4 w-60 hidden lg:flex flex-col">
        <div className="relative flex-1 flex flex-col overflow-hidden rounded-3xl">
          {/* Glass background layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/40 to-background/60 backdrop-blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-lavender/5 via-transparent to-coral/5" />
          <div className="absolute inset-[1px] rounded-3xl border border-background/50" />
          <div className="absolute inset-0 rounded-3xl border border-foreground/[0.08] shadow-2xl shadow-foreground/10" />
          
          {/* Content */}
          <div className="relative flex-1 flex flex-col z-10">
            {/* Logo */}
            <div className="p-5 flex items-center gap-2.5">
              <Link href="/" className="flex items-center gap-2.5 group">
                <div className="relative">
                  <Logo size="sm" className="h-8 w-8 relative z-10" />
                  <div className="absolute inset-0 bg-coral/20 blur-lg rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <span className="text-sm font-semibold text-foreground tracking-tight">LyricLingo</span>
              </Link>
            </div>

            {/* Divider with glow */}
            <div className="mx-4 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

            {/* Navigation */}
            <nav className="flex-1 p-3 space-y-1">
              {[
                { id: "overview", label: "Overview", icon: HomeIcon },
                { id: "songs", label: "My Songs", icon: MySongsIcon },
                { id: "words", label: "Vocabulary", icon: VocabIcon },
                { id: "settings", label: "Settings", icon: SettingsIcon },
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as typeof activeTab)}
                  className={`relative w-full flex items-center gap-3 px-3 py-2.5 rounded-2xl text-sm font-medium transition-all duration-300 ${
                    activeTab === item.id 
                      ? "text-background" 
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {/* Active state background */}
                  {activeTab === item.id && (
                    <>
                      <div className="absolute inset-0 bg-foreground rounded-2xl" />
                      <div className="absolute inset-0 bg-gradient-to-r from-coral/10 to-lavender/10 rounded-2xl" />
                      <div className="absolute inset-[1px] rounded-2xl shadow-inner shadow-background/10" />
                    </>
                  )}
                  {/* Hover state */}
                  {activeTab !== item.id && (
                    <div className="absolute inset-0 bg-foreground/0 hover:bg-foreground/5 rounded-2xl transition-colors" />
                  )}
                  <item.icon className="w-[18px] h-[18px] relative z-10" />
                  <span className="relative z-10">{item.label}</span>
                </button>
              ))}
            </nav>

            {/* Divider with glow */}
            <div className="mx-4 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />

            {/* User section */}
            <div className="p-3">
              <div className="relative flex items-center gap-3 px-3 py-2.5 rounded-2xl hover:bg-foreground/5 transition-all duration-300 cursor-pointer group">
                <div className="relative">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-br from-coral to-lavender flex items-center justify-center text-background text-sm font-semibold">
                    {userData.name.charAt(0)}
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-coral to-lavender blur-md opacity-40 group-hover:opacity-60 transition-opacity" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{userData.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{userData.email}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Mobile header - Apple liquid glass style */}
      <header className="lg:hidden fixed top-3 left-3 right-3 z-50">
        <div className="relative rounded-2xl overflow-hidden">
          {/* Glass background layers */}
          <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background/50 backdrop-blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-r from-lavender/5 via-transparent to-coral/5" />
          <div className="absolute inset-[1px] rounded-2xl border border-background/50" />
          <div className="absolute inset-0 rounded-2xl border border-foreground/[0.08] shadow-2xl shadow-foreground/10" />
          
          {/* Content */}
          <div className="relative z-10 px-4 py-3">
            <div className="flex items-center justify-between">
<Link href="/" className="flex items-center gap-2 group">
              <div className="relative">
                <Logo size="sm" className="h-7 w-7 relative z-10" />
                <div className="absolute inset-0 bg-coral/20 blur-lg rounded-full scale-150 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
                <span className="text-sm font-semibold text-foreground">LyricLingo</span>
              </Link>
              <div className="relative">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-coral to-lavender flex items-center justify-center text-background text-xs font-semibold">
                  {userData.name.charAt(0)}
                </div>
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-coral to-lavender blur-md opacity-30" />
              </div>
            </div>
            
            {/* Mobile tabs */}
            <div className="flex mt-3 pt-3 border-t border-foreground/[0.08] gap-1.5 overflow-x-auto scrollbar-hide">
              {["overview", "songs", "words", "settings"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab as typeof activeTab)}
                  className={`relative flex-shrink-0 px-4 py-2 rounded-full text-xs font-medium transition-all duration-300 ${
                    activeTab === tab
                      ? "text-background"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {activeTab === tab && (
                    <>
                      <div className="absolute inset-0 bg-foreground rounded-full" />
                      <div className="absolute inset-0 bg-gradient-to-r from-coral/10 to-lavender/10 rounded-full" />
                    </>
                  )}
                  <span className="relative z-10">{tab.charAt(0).toUpperCase() + tab.slice(1)}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className={`lg:ml-72 pt-32 lg:pt-0 transition-all duration-300 ${currentSong ? 'pb-72' : 'pb-8'}`}>
        <div className="max-w-5xl mx-auto px-4 lg:px-8 lg:py-8">
          {activeTab === "overview" && (
            <>
              {/* Welcome section */}
              <div className="mb-8">
                <h1 className="text-2xl lg:text-3xl font-semibold text-foreground tracking-tight">
                  Welcome back, {userData.name}!
                </h1>
                <p className="mt-1.5 text-muted-foreground">
                  Continue your {userData.targetFlag} {userData.targetLanguage} journey
                </p>
              </div>

              {/* Stats grid - Apple liquid glass style */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { icon: StreakIcon, value: userData.streak, label: "Day streak", color: "coral" },
                  { icon: SongIcon, value: userData.totalSongs, label: "Songs created", color: "lavender" },
                  { icon: VocabIcon, value: userData.wordsLearned, label: "Words learned", color: "coral" },
                  { icon: PracticeTimeIcon, value: `${Math.floor(userData.minutesPracticed / 60)}h`, label: "Time practiced", color: "lavender" },
                ].map((stat, index) => (
                  <div key={index} className="relative group rounded-2xl overflow-hidden">
                    {/* Glass layers */}
                    <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/40 backdrop-blur-2xl" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color === 'coral' ? 'from-coral/5' : 'from-lavender/5'} via-transparent to-transparent`} />
                    <div className="absolute inset-[1px] rounded-2xl border border-background/60" />
                    <div className="absolute inset-0 rounded-2xl border border-foreground/[0.06]" />
                    
                    {/* Hover glow */}
                    <div className={`absolute -inset-4 ${stat.color === 'coral' ? 'bg-coral/10' : 'bg-lavender/10'} rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                    
                    <div className="relative z-10 p-4 lg:p-5">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center ${stat.color === 'coral' ? 'bg-coral/10' : 'bg-lavender/10'}`}>
                          <stat.icon className={`w-5 h-5 ${stat.color === 'coral' ? 'text-coral' : 'text-lavender'}`} />
                          <div className={`absolute inset-0 rounded-xl ${stat.color === 'coral' ? 'bg-coral/20' : 'bg-lavender/20'} blur-lg opacity-50`} />
                        </div>
                      </div>
                      <p className="text-2xl lg:text-3xl font-semibold text-foreground tracking-tight">{stat.value}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Level progress - Apple liquid glass */}
              <div className="relative rounded-2xl overflow-hidden mb-8">
                {/* Glass layers */}
                <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/40 backdrop-blur-2xl" />
                <div className="absolute inset-0 bg-gradient-to-r from-coral/5 via-transparent to-lavender/5" />
                <div className="absolute inset-[1px] rounded-2xl border border-background/60" />
                <div className="absolute inset-0 rounded-2xl border border-foreground/[0.06]" />
                
                <div className="relative z-10 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-8 bg-gradient-to-b from-coral to-lavender rounded-full" />
                      <div>
                        <h3 className="text-sm font-semibold text-foreground">{userData.level}</h3>
                        <p className="text-xs text-muted-foreground">{userData.xp} / {userData.xpToNextLevel} XP</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs px-3 py-1.5 rounded-full bg-foreground/5 border border-foreground/[0.06] text-muted-foreground">Next: Advanced</span>
                    </div>
                  </div>
                  <div className="relative h-2.5 bg-foreground/5 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-coral via-coral to-lavender rounded-full transition-all relative"
                      style={{ width: `${(userData.xp / userData.xpToNextLevel) * 100}%` }}
                    >
                      <div className="absolute inset-0 bg-gradient-to-b from-background/20 to-transparent" />
                    </div>
                    {/* Glow effect */}
                    <div 
                      className="absolute top-0 bottom-0 left-0 bg-coral/30 blur-md rounded-full"
                      style={{ width: `${(userData.xp / userData.xpToNextLevel) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Quick actions - Apple liquid glass */}
              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                <button 
                  onClick={() => setIsCreateModalOpen(true)}
                  className="relative rounded-2xl p-6 text-left group overflow-hidden transition-all duration-300"
                >
                  {/* Solid gradient background */}
                  <div className="absolute inset-0 bg-foreground" />
                  <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-foreground/90" />
                  <div className="absolute inset-[1px] rounded-2xl border border-background/10" />
                  {/* Hover effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-coral/20 to-lavender/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-background mb-1">Create New Song</h3>
                      <p className="text-sm text-background/70">Generate a song with your vocabulary</p>
                    </div>
                    <div className="relative">
                      <AddIcon className="w-6 h-6 text-background transition-transform duration-300 group-hover:scale-110 group-hover:rotate-90" />
                      <div className="absolute inset-0 bg-background/20 blur-xl rounded-full scale-0 group-hover:scale-150 transition-transform duration-300" />
                    </div>
                  </div>
                </button>
                
                <button 
                  onClick={() => router.push("/library")}
                  className="relative rounded-2xl p-6 text-left group overflow-hidden transition-all duration-300"
                >
                  {/* Glass layers */}
                  <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/40 backdrop-blur-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-lavender/5 via-transparent to-coral/5" />
                  <div className="absolute inset-[1px] rounded-2xl border border-background/60" />
                  <div className="absolute inset-0 rounded-2xl border border-foreground/[0.06] group-hover:border-foreground/10 transition-colors" />
                  
                  <div className="relative z-10 flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-foreground mb-1">Browse Library</h3>
                      <p className="text-sm text-muted-foreground">Explore community songs</p>
                    </div>
                    <ArrowIcon className="w-6 h-6 text-muted-foreground group-hover:text-foreground transition-all duration-300 group-hover:translate-x-1" />
                  </div>
                </button>
              </div>

              {/* Recent songs - Apple liquid glass */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-5 bg-gradient-to-b from-coral to-lavender rounded-full" />
                    <h2 className="text-lg font-semibold text-foreground">Recent Songs</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={handlePlayAll}
                      className="relative px-3 py-1.5 text-xs font-medium text-coral transition-all duration-200 flex items-center gap-1.5 rounded-full overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-coral/10 group-hover:bg-coral/15 transition-colors" />
                      <PlayIcon className="w-3 h-3 relative z-10" />
                      <span className="relative z-10">Play all</span>
                    </button>
                    <button 
                      onClick={() => setActiveTab("songs")}
                      className="px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors rounded-full hover:bg-foreground/5"
                    >
                      View all
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  {userSongs.slice(0, 3).map((song) => (
                    <div 
                      key={song.id}
                      onClick={() => handlePlaySong(song)}
                      className="relative rounded-2xl overflow-hidden cursor-pointer group"
                    >
                      {/* Glass layers */}
                      <div className={`absolute inset-0 backdrop-blur-2xl transition-colors duration-300 ${
                        currentSong?.id === song.id 
                          ? 'bg-gradient-to-r from-coral/10 to-coral/5' 
                          : 'bg-gradient-to-b from-background/60 to-background/40 group-hover:from-background/70'
                      }`} />
                      <div className="absolute inset-[1px] rounded-2xl border border-background/60" />
                      <div className={`absolute inset-0 rounded-2xl border transition-colors duration-300 ${
                        currentSong?.id === song.id ? 'border-coral/30' : 'border-foreground/[0.06] group-hover:border-foreground/10'
                      }`} />
                      
                      <div className="relative z-10 p-4 flex items-center gap-4">
                        <div className={`relative w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                          currentSong?.id === song.id ? 'bg-coral/20' : 'bg-foreground/5 group-hover:bg-foreground/10'
                        }`}>
                          <span className="text-xl">{song.flag}</span>
                          {currentSong?.id === song.id && (
                            <div className="absolute inset-0 rounded-xl bg-coral/20 blur-lg animate-pulse" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className={`text-sm font-medium truncate transition-colors ${currentSong?.id === song.id ? 'text-coral' : 'text-foreground'}`}>{song.title}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{song.wordsCount} words - {song.duration}</p>
                        </div>
                        <span className="text-xs text-muted-foreground flex-shrink-0 hidden sm:block">{song.lastPlayed}</span>
                        <button 
                          onClick={(e) => { e.stopPropagation(); handlePlaySong(song); }}
                          className={`relative w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 overflow-hidden ${
                            currentSong?.id === song.id ? '' : ''
                          }`}
                        >
                          <div className={`absolute inset-0 ${
                            currentSong?.id === song.id 
                              ? 'bg-coral' 
                              : 'bg-foreground group-hover:bg-foreground/90'
                          }`} />
                          <div className="absolute inset-[1px] rounded-full border border-background/10" />
                          <PlayIcon className="w-4 h-4 text-background relative z-10" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Achievements - Apple liquid glass */}
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-5 bg-gradient-to-b from-lavender to-coral rounded-full" />
                  <h2 className="text-lg font-semibold text-foreground">Achievements</h2>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {achievements.map((achievement) => {
                    const IconComponent = AchievementIcons[achievement.icon as keyof typeof AchievementIcons]
                    const colorClasses = {
                      coral: { bg: 'bg-coral/10', text: 'text-coral', glow: 'bg-coral/20' },
                      lavender: { bg: 'bg-lavender/10', text: 'text-lavender', glow: 'bg-lavender/20' },
                      sage: { bg: 'bg-sage/10', text: 'text-sage', glow: 'bg-sage/20' },
                    }[achievement.color] || { bg: 'bg-coral/10', text: 'text-coral', glow: 'bg-coral/20' }
                    
                    return (
                      <div 
                        key={achievement.id}
                        className={`relative rounded-2xl overflow-hidden text-center group transition-all duration-300 ${
                          achievement.unlocked ? '' : 'opacity-40 grayscale'
                        }`}
                      >
                        {/* Glass layers */}
                        <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/40 backdrop-blur-2xl" />
                        <div className={`absolute inset-0 ${achievement.unlocked ? `bg-gradient-to-br from-${achievement.color}/5 via-transparent to-transparent` : ''}`} />
                        <div className="absolute inset-[1px] rounded-2xl border border-background/60" />
                        <div className="absolute inset-0 rounded-2xl border border-foreground/[0.06] group-hover:border-foreground/10 transition-colors" />
                        
                        <div className="relative z-10 p-4">
                          {/* Icon with gradient background */}
                          <div className="relative inline-flex items-center justify-center mb-3">
                            <div className={`w-12 h-12 rounded-2xl ${colorClasses.bg} flex items-center justify-center ${colorClasses.text} transition-transform duration-300 group-hover:scale-105`}>
                              <IconComponent />
                            </div>
                            {achievement.unlocked && (
                              <div className={`absolute inset-0 ${colorClasses.glow} blur-xl rounded-2xl scale-150 opacity-60`} />
                            )}
                          </div>
                          <h4 className="text-xs font-semibold text-foreground mb-1">{achievement.name}</h4>
                          <p className="text-[10px] text-muted-foreground leading-relaxed">{achievement.description}</p>
                          {achievement.unlocked && (
                            <div className={`mt-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${colorClasses.bg}`}>
                              <svg className={`w-2.5 h-2.5 ${colorClasses.text}`} fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                              <span className={`text-[9px] font-medium ${colorClasses.text}`}>Unlocked</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </>
          )}

          {activeTab === "songs" && (
            <>
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h1 className="text-2xl font-semibold text-foreground mb-1 tracking-tight">My Songs</h1>
                  <p className="text-muted-foreground">All your generated songs in one place</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePlayAll}
                    className="relative px-4 py-2.5 text-sm font-medium rounded-full overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-foreground/5 group-hover:bg-foreground/10 transition-colors" />
                    <div className="absolute inset-[1px] rounded-full border border-foreground/10" />
                    <span className="relative z-10 flex items-center gap-2 text-foreground">
                      <PlayIcon className="w-4 h-4" />
                      Play All
                    </span>
                  </button>
                  <button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="relative px-4 py-2.5 text-sm font-medium rounded-full overflow-hidden group"
                  >
                    <div className="absolute inset-0 bg-foreground group-hover:bg-foreground/90 transition-colors" />
                    <div className="absolute inset-[1px] rounded-full border border-background/10" />
                    <span className="relative z-10 flex items-center gap-2 text-background">
                      <AddIcon className="w-4 h-4" />
                      New Song
                    </span>
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                {userSongs.map((song) => (
                  <div 
                    key={song.id}
                    onClick={() => handlePlaySong(song)}
                    className="relative rounded-2xl overflow-hidden cursor-pointer group"
                  >
                    {/* Glass layers */}
                    <div className={`absolute inset-0 backdrop-blur-2xl transition-colors duration-300 ${
                      currentSong?.id === song.id 
                        ? 'bg-gradient-to-r from-coral/10 to-coral/5' 
                        : 'bg-gradient-to-b from-background/60 to-background/40 group-hover:from-background/70'
                    }`} />
                    <div className="absolute inset-[1px] rounded-2xl border border-background/60" />
                    <div className={`absolute inset-0 rounded-2xl border transition-colors duration-300 ${
                      currentSong?.id === song.id ? 'border-coral/30' : 'border-foreground/[0.06] group-hover:border-foreground/10'
                    }`} />
                    
                    <div className="relative z-10 p-4 flex items-center gap-4">
                      <div className={`relative w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                        currentSong?.id === song.id ? 'bg-coral/20' : 'bg-foreground/5 group-hover:bg-foreground/10'
                      }`}>
                        <span className="text-2xl">{song.flag}</span>
                        {currentSong?.id === song.id && (
                          <div className="absolute inset-0 rounded-2xl bg-coral/20 blur-lg animate-pulse" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className={`font-medium truncate transition-colors ${currentSong?.id === song.id ? 'text-coral' : 'text-foreground'}`}>{song.title}</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">{song.language} - {song.wordsCount} words - {song.duration}</p>
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); handlePlaySong(song); }}
                        className="relative w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 overflow-hidden"
                      >
                        <div className={`absolute inset-0 ${
                          currentSong?.id === song.id 
                            ? 'bg-coral' 
                            : 'bg-foreground group-hover:bg-foreground/90'
                        }`} />
                        <div className="absolute inset-[1px] rounded-full border border-background/10" />
                        <PlayIcon className="w-5 h-5 text-background relative z-10" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === "words" && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-semibold text-foreground mb-1 tracking-tight">Vocabulary</h1>
                <p className="text-muted-foreground">{savedWords.length + wordsToReview.length} words learned across all songs</p>
              </div>

              {/* Saved from Songs - Apple liquid glass */}
              {savedWords.length > 0 && (
                <div className="relative rounded-2xl overflow-hidden mb-4">
                  {/* Glass layers */}
                  <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/40 backdrop-blur-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-sage/5 via-transparent to-transparent" />
                  <div className="absolute inset-[1px] rounded-2xl border border-background/60" />
                  <div className="absolute inset-0 rounded-2xl border border-foreground/[0.06]" />
                  
                  <div className="relative z-10">
                    <div className="px-5 py-4 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-1 h-5 bg-sage rounded-full" />
                        <span className="text-sm font-semibold text-foreground">Saved from Songs</span>
                      </div>
                      <span className="text-xs font-medium text-sage bg-sage/10 px-3 py-1.5 rounded-full border border-sage/20">{savedWords.length} words</span>
                    </div>
                    <div className="mx-5 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
                    <div className="divide-y divide-foreground/[0.06]">
                      {savedWords.map((word, index) => (
                        <div key={index} className="px-5 py-3.5 flex items-center gap-4 hover:bg-foreground/[0.02] transition-colors">
                          <div className="flex-1">
                            <span className="text-sm font-medium text-foreground">{word.word}</span>
                            <span className="text-sm text-muted-foreground ml-2">- {word.translation}</span>
                          </div>
                          <span className="text-xs font-medium text-sage bg-sage/10 px-2 py-1 rounded-full">New</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Words to Review - Apple liquid glass */}
              <div className="relative rounded-2xl overflow-hidden">
                {/* Glass layers */}
                <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/40 backdrop-blur-2xl" />
                <div className="absolute inset-0 bg-gradient-to-br from-lavender/5 via-transparent to-coral/5" />
                <div className="absolute inset-[1px] rounded-2xl border border-background/60" />
                <div className="absolute inset-0 rounded-2xl border border-foreground/[0.06]" />
                
                <div className="relative z-10">
                  <div className="px-5 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-1 h-5 bg-gradient-to-b from-coral to-lavender rounded-full" />
                      <span className="text-sm font-semibold text-foreground">Words to Review</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{wordsToReview.length} words</span>
                  </div>
                  <div className="mx-5 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
                  <div className="divide-y divide-foreground/[0.06]">
                    {wordsToReview.map((word, index) => (
                      <div key={index} className="px-5 py-3.5 flex items-center gap-4 hover:bg-foreground/[0.02] transition-colors">
                        <div className="flex-1">
                          <span className="text-sm font-medium text-foreground">{word.word}</span>
                          <span className="text-sm text-muted-foreground ml-2">- {word.translation}</span>
                        </div>
                        <div className="w-20">
                          <div className="h-1.5 bg-foreground/5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all ${word.strength >= 80 ? 'bg-sage' : word.strength >= 60 ? 'bg-yellow-500' : 'bg-coral'}`}
                              style={{ width: `${word.strength}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-xs text-muted-foreground w-10 text-right tabular-nums">{word.strength}%</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === "settings" && (
            <>
              <div className="mb-6">
                <h1 className="text-2xl font-medium text-foreground mb-1">Settings</h1>
                <p className="text-muted-foreground">Manage your account and preferences</p>
              </div>
              <div className="space-y-4">
                {/* Profile Card - Apple liquid glass */}
                <div className="relative rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/40 backdrop-blur-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-lavender/5 via-transparent to-coral/5" />
                  <div className="absolute inset-[1px] rounded-2xl border border-background/60" />
                  <div className="absolute inset-0 rounded-2xl border border-foreground/[0.06]" />
                  
                  <div className="relative z-10 p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-1 h-5 bg-gradient-to-b from-lavender to-coral rounded-full" />
                      <h3 className="font-semibold text-foreground">Profile</h3>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2">Name</label>
                        <input 
                          type="text" 
                          defaultValue={userData.name}
                          className="w-full h-11 rounded-xl border border-foreground/[0.08] bg-foreground/5 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/20 focus:bg-foreground/[0.07] transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-muted-foreground mb-2">Email</label>
                        <input 
                          type="email" 
                          defaultValue={userData.email}
                          className="w-full h-11 rounded-xl border border-foreground/[0.08] bg-foreground/5 px-4 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-foreground/20 focus:bg-foreground/[0.07] transition-colors"
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Learning Card - Apple liquid glass */}
                <div className="relative rounded-2xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-background/60 to-background/40 backdrop-blur-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-sage/5 via-transparent to-transparent" />
                  <div className="absolute inset-[1px] rounded-2xl border border-background/60" />
                  <div className="absolute inset-0 rounded-2xl border border-foreground/[0.06]" />
                  
                  <div className="relative z-10 p-6">
                    <div className="flex items-center gap-3 mb-5">
                      <div className="w-1 h-5 bg-sage rounded-full" />
                      <h3 className="font-semibold text-foreground">Learning</h3>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-muted-foreground mb-2">Target Language</label>
                      <div className="flex items-center gap-3 px-4 py-3 rounded-xl border border-foreground/[0.08] bg-foreground/5">
                        <span className="text-lg">{userData.targetFlag}</span>
                        <span className="text-sm font-medium text-foreground">{userData.targetLanguage}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <button className="relative px-5 py-2.5 text-sm font-medium rounded-xl overflow-hidden group">
                    <div className="absolute inset-0 bg-foreground group-hover:bg-foreground/90 transition-colors" />
                    <div className="absolute inset-[1px] rounded-xl border border-background/10" />
                    <span className="relative z-10 text-background">Save Changes</span>
                  </button>
                  <Link href="/">
                    <button className="relative px-5 py-2.5 text-sm font-medium rounded-xl overflow-hidden group">
                      <div className="absolute inset-0 bg-foreground/5 group-hover:bg-foreground/10 transition-colors" />
                      <div className="absolute inset-[1px] rounded-xl border border-foreground/10" />
                      <span className="relative z-10 text-foreground">Back to Home</span>
                    </button>
                  </Link>
                </div>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Create Song Modal */}
      <CreateSongModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSongCreated={handleSongCreated}
      />

      {/* Song Player */}
      {currentSong && (
        <DashboardPlayer
          song={currentSong}
          songs={userSongs}
          onClose={() => setCurrentSong(null)}
          onSongChange={setCurrentSong}
          savedWords={savedWords}
          onSaveWord={handleSaveWord}
        />
      )}
    </div>
  )
}
