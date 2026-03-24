"use client"

import { useState, useEffect, useRef } from "react"
import { PlayIcon, PauseIcon, SkipIcon, PreviousIcon, RepeatIcon, VolumeIcon, AddIcon } from "@/components/icons"

interface LyricLine {
  text: string
  words: { word: string; translation: string }[]
}

export interface DashboardSong {
  id: string
  title: string
  language: string
  flag: string
  duration: string
  wordsCount: number
  lastPlayed: string
  lyrics?: LyricLine[]
  vocabularyWords?: { word: string; translation: string }[]
}

type RepeatMode = 'off' | 'one' | 'all' | 'count'

interface WordPopupProps {
  word: string
  translation: string
  position: { x: number; y: number }
  onClose: () => void
  onSave: (word: string, translation: string) => void
  isSaved: boolean
}

function WordPopup({ word, translation, position, onClose, onSave, isSaved }: WordPopupProps) {
  const popupRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popupRef.current && !popupRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  return (
    <div
      ref={popupRef}
      className="fixed z-[100] min-w-[220px]"
      style={{
        left: Math.min(position.x, window.innerWidth - 240),
        top: Math.max(position.y - 120, 10),
      }}
    >
      {/* Glass layers */}
      <div className="relative rounded-2xl overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 to-background/95 backdrop-blur-3xl" />
        <div className="absolute inset-0 bg-gradient-to-br from-coral/5 via-transparent to-lavender/5" />
        <div className="absolute inset-[1px] rounded-2xl border border-background/60" />
        <div className="absolute inset-0 rounded-2xl border border-foreground/[0.08] shadow-2xl shadow-foreground/20" />
        
        <div className="relative z-10 p-4">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-lg font-semibold text-foreground">{word}</p>
              <p className="text-sm text-muted-foreground">{translation}</p>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-muted-foreground hover:text-foreground transition-colors rounded-lg hover:bg-foreground/5"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <button
            onClick={() => onSave(word, translation)}
            disabled={isSaved}
            className={`relative w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all overflow-hidden ${
              isSaved
                ? "text-sage"
                : "text-background"
            }`}
          >
            {/* Button background */}
            {isSaved ? (
              <div className="absolute inset-0 bg-sage/15" />
            ) : (
              <>
                <div className="absolute inset-0 bg-coral" />
                <div className="absolute inset-0 bg-gradient-to-r from-coral via-coral to-lavender/50 opacity-80" />
              </>
            )}
            <span className="relative z-10 flex items-center gap-2">
              {isSaved ? (
                <>
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" />
                  </svg>
                  Saved to Dictionary
                </>
              ) : (
                <>
                  <AddIcon className="w-4 h-4" />
                  Save to Dictionary
                </>
              )}
            </span>
          </button>
        </div>
      </div>
    </div>
  )
}

interface DashboardPlayerProps {
  song: DashboardSong
  songs: DashboardSong[]
  onClose: () => void
  onSongChange: (song: DashboardSong) => void
  savedWords: { word: string; translation: string }[]
  onSaveWord: (word: string, translation: string) => void
}

export function DashboardPlayer({ 
  song, 
  songs, 
  onClose, 
  onSongChange,
  savedWords,
  onSaveWord
}: DashboardPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0)
  const [showLyrics, setShowLyrics] = useState(true)
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off')
  const [repeatCount, setRepeatCount] = useState(1)
  const [currentRepeat, setCurrentRepeat] = useState(0)
  const [showRepeatMenu, setShowRepeatMenu] = useState(false)
  const [volume, setVolume] = useState(80)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const speedMenuRef = useRef<HTMLDivElement>(null)
  const [selectedWord, setSelectedWord] = useState<{
    word: string
    translation: string
    position: { x: number; y: number }
  } | null>(null)

  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const repeatMenuRef = useRef<HTMLDivElement>(null)

  // Default lyrics if not provided
  const lyrics: LyricLine[] = song.lyrics || [
    { text: "Hola, buenos dias mi amigo", words: [
      { word: "Hola", translation: "Hello" },
      { word: "buenos", translation: "good" },
      { word: "dias", translation: "days/morning" },
      { word: "mi", translation: "my" },
      { word: "amigo", translation: "friend" }
    ]},
    { text: "Como estas en este dia?", words: [
      { word: "Como", translation: "How" },
      { word: "estas", translation: "are you" },
      { word: "en", translation: "in" },
      { word: "este", translation: "this" },
      { word: "dia", translation: "day" }
    ]},
    { text: "El sol brilla en el cielo", words: [
      { word: "El", translation: "The" },
      { word: "sol", translation: "sun" },
      { word: "brilla", translation: "shines" },
      { word: "en", translation: "in" },
      { word: "cielo", translation: "sky" }
    ]},
    { text: "Y la vida es muy bella", words: [
      { word: "Y", translation: "And" },
      { word: "la", translation: "the" },
      { word: "vida", translation: "life" },
      { word: "es", translation: "is" },
      { word: "muy", translation: "very" },
      { word: "bella", translation: "beautiful" }
    ]},
    { text: "Vamos a cantar juntos", words: [
      { word: "Vamos", translation: "Let's go" },
      { word: "a", translation: "to" },
      { word: "cantar", translation: "sing" },
      { word: "juntos", translation: "together" }
    ]},
    { text: "Con alegria en el corazon", words: [
      { word: "Con", translation: "With" },
      { word: "alegria", translation: "joy" },
      { word: "en", translation: "in" },
      { word: "el", translation: "the" },
      { word: "corazon", translation: "heart" }
    ]},
  ]

  const currentIndex = songs.findIndex(s => s.id === song.id)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < songs.length - 1

  const parseDuration = (duration: string) => {
    const [minutes, seconds] = duration.split(':').map(Number)
    return minutes * 60 + seconds
  }

  const totalDuration = parseDuration(song.duration)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (repeatMenuRef.current && !repeatMenuRef.current.contains(e.target as Node)) {
        setShowRepeatMenu(false)
      }
      if (speedMenuRef.current && !speedMenuRef.current.contains(e.target as Node)) {
        setShowSpeedMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSongEnd = () => {
    if (repeatMode === 'one') {
      setCurrentTime(0)
      setIsPlaying(true)
    } else if (repeatMode === 'count') {
      if (currentRepeat < repeatCount - 1) {
        setCurrentRepeat(prev => prev + 1)
        setCurrentTime(0)
        setIsPlaying(true)
      } else {
        setCurrentRepeat(0)
        if (hasNext) {
          playNext()
        } else {
          setIsPlaying(false)
          setCurrentTime(0)
        }
      }
    } else if (repeatMode === 'all') {
      if (hasNext) {
        playNext()
      } else {
        onSongChange(songs[0])
      }
    } else {
      if (hasNext) {
        playNext()
      } else {
        setIsPlaying(false)
        setCurrentTime(0)
      }
    }
  }

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prev) => {
          if (prev >= totalDuration) {
            handleSongEnd()
            return 0
          }
          return prev + (0.1 * playbackSpeed)
        })
      }, 100)
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [isPlaying, totalDuration, repeatMode, repeatCount, currentRepeat, hasNext])

  useEffect(() => {
    const lyricDuration = totalDuration / lyrics.length
    const newIndex = Math.min(
      Math.floor(currentTime / lyricDuration),
      lyrics.length - 1
    )
    setCurrentLyricIndex(newIndex)
  }, [currentTime, totalDuration, lyrics.length])

  useEffect(() => {
    setCurrentTime(0)
    setIsPlaying(true)
    setCurrentLyricIndex(0)
    setCurrentRepeat(0)
  }, [song.id])

  const playPrevious = () => {
    if (hasPrevious) {
      onSongChange(songs[currentIndex - 1])
      setCurrentRepeat(0)
    }
  }

  const playNext = () => {
    if (hasNext) {
      onSongChange(songs[currentIndex + 1])
      setCurrentRepeat(0)
    } else if (repeatMode === 'all') {
      onSongChange(songs[0])
      setCurrentRepeat(0)
    }
  }

  const cycleRepeatMode = () => {
    if (repeatMode === 'off') {
      setRepeatMode('one')
    } else if (repeatMode === 'one') {
      setRepeatMode('all')
    } else {
      setRepeatMode('off')
    }
    setCurrentRepeat(0)
  }

  const setRepeatTimes = (times: number) => {
    setRepeatMode('count')
    setRepeatCount(times)
    setCurrentRepeat(0)
    setShowRepeatMenu(false)
  }

  const progress = (currentTime / totalDuration) * 100

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const clickPosition = (e.clientX - rect.left) / rect.width
    setCurrentTime(clickPosition * totalDuration)
  }

  const handleWordClick = (word: string, translation: string, e: React.MouseEvent) => {
    e.stopPropagation()
    setSelectedWord({
      word,
      translation,
      position: { x: e.clientX, y: e.clientY }
    })
  }

  const handleSaveWord = (word: string, translation: string) => {
    onSaveWord(word, translation)
  }

  const isWordSaved = (word: string) => {
    return savedWords.some(w => w.word.toLowerCase() === word.toLowerCase())
  }

  const renderLyricLine = (line: LyricLine, isActive: boolean) => {
    return line.words.map((wordObj, i) => (
      <span key={i}>
        <button
          onClick={(e) => handleWordClick(wordObj.word, wordObj.translation, e)}
          className={`inline transition-all duration-200 hover:text-coral hover:underline underline-offset-2 cursor-pointer ${
            isActive 
              ? isWordSaved(wordObj.word)
                ? 'text-sage font-semibold'
                : 'text-foreground'
              : isWordSaved(wordObj.word)
                ? 'text-sage/60'
                : 'text-muted-foreground/60'
          }`}
        >
          {wordObj.word}
        </button>
        {i < line.words.length - 1 && ' '}
      </span>
    ))
  }

  return (
    <>
      <div className="fixed inset-x-0 bottom-0 z-50 safe-bottom">
        <div className="mx-auto max-w-5xl px-4 pb-4 lg:pb-6">
          <div className="relative rounded-3xl overflow-hidden">
            {/* Multi-layered glass background - Apple style */}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/70 to-background/60 backdrop-blur-3xl" />
            <div className="absolute inset-0 bg-gradient-to-br from-lavender/8 via-transparent to-coral/8" />
            <div className="absolute inset-0 bg-gradient-to-t from-foreground/[0.02] to-transparent" />
            {/* Inner highlight border */}
            <div className="absolute inset-[1px] rounded-3xl border border-background/80" />
            {/* Outer subtle border with glow */}
            <div className="absolute inset-0 rounded-3xl border border-foreground/[0.06]" />
            {/* Shadow for depth */}
            <div className="absolute inset-0 rounded-3xl shadow-[0_-8px_60px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_-8px_60px_-12px_rgba(0,0,0,0.5)]" />
            
            {/* Animated accent glow */}
            <div className="absolute -top-20 left-1/4 w-40 h-40 bg-coral/10 rounded-full blur-3xl" />
            <div className="absolute -top-20 right-1/4 w-40 h-40 bg-lavender/10 rounded-full blur-3xl" />

            <div className="relative z-10">
              {/* Lyrics Panel */}
              {showLyrics && (
                <div className="px-4 sm:px-5 md:px-6 pt-4 sm:pt-5 md:pt-6 pb-3 md:pb-4">
                  <div className="flex items-center justify-between mb-3 md:mb-4">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="w-1 h-3 sm:h-4 bg-gradient-to-b from-coral to-lavender rounded-full" />
                      <h3 className="text-xs sm:text-sm font-medium text-foreground">Tap words for translation</h3>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] sm:text-xs text-muted-foreground px-2 sm:px-3 py-1 sm:py-1.5 rounded-full bg-foreground/5 border border-foreground/[0.06]">
                        {currentIndex + 1} of {songs.length}
                      </span>
                    </div>
                  </div>
                  <div className="space-y-2 sm:space-y-3 max-h-28 sm:max-h-32 md:max-h-36 overflow-y-auto scrollbar-hide pr-2">
                    {lyrics.map((line, index) => (
                      <p
                        key={index}
                        className={`text-sm md:text-base transition-all duration-500 ease-out ${
                          index === currentLyricIndex 
                            ? 'scale-[1.02] origin-left' 
                            : 'opacity-60'
                        }`}
                      >
                        {renderLyricLine(line, index === currentLyricIndex)}
                      </p>
                    ))}
                  </div>
                  {/* Subtle divider */}
                  <div className="mt-3 md:mt-4 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
                </div>
              )}

              {/* Player Controls */}
              <div className="px-4 sm:px-5 md:px-6 py-4 md:py-5">
                {/* Mobile: Stacked layout, Desktop: Single row */}
                <div className="flex flex-col gap-4 md:gap-0 md:flex-row md:items-center">
                  {/* Song Info + Play Button Row (Mobile) / Song Info (Desktop) */}
                  <div className="flex items-center gap-3 sm:gap-4 md:flex-1 md:min-w-0">
                    <div className="relative group flex-shrink-0">
                      <div className="w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14 rounded-xl md:rounded-2xl bg-gradient-to-br from-foreground/5 to-foreground/10 flex items-center justify-center border border-foreground/[0.06] shadow-lg">
                        <span className="text-xl sm:text-2xl">{song.flag}</span>
                      </div>
                      {/* Glow effect on playing */}
                      {isPlaying && (
                        <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-coral/20 blur-xl animate-pulse" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-semibold text-foreground truncate">{song.title}</h4>
                      <p className="text-xs text-muted-foreground truncate mt-0.5">
                        {song.language} - {song.wordsCount} words
                      </p>
                      {repeatMode === 'count' && (
                        <p className="text-xs text-coral mt-1">
                          Repeat {currentRepeat + 1} of {repeatCount}
                        </p>
                      )}
                    </div>
                    
                    {/* Mobile Play Button - Large touch target */}
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="md:hidden flex-shrink-0 w-12 h-12 rounded-full bg-foreground text-background flex items-center justify-center active:scale-95 transition-transform"
                    >
                      {isPlaying ? (
                        <PauseIcon className="w-5 h-5" />
                      ) : (
                        <PlayIcon className="w-5 h-5 ml-0.5" />
                      )}
                    </button>
                  </div>

                  {/* Center Controls - Hidden on mobile, visible on desktop */}
                  <div className="hidden md:flex items-center gap-1">
                    {/* Repeat */}
                    <div className="relative" ref={repeatMenuRef}>
                      <button
                        onClick={() => setShowRepeatMenu(!showRepeatMenu)}
                        onDoubleClick={cycleRepeatMode}
                        className={`relative p-2.5 rounded-xl transition-all duration-200 ${
                          repeatMode !== 'off'
                            ? 'text-coral'
                            : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {repeatMode !== 'off' && (
                          <div className="absolute inset-0 bg-coral/10 rounded-xl" />
                        )}
                        <RepeatIcon className="w-5 h-5 relative z-10" />
                        {repeatMode === 'one' && (
                          <span className="absolute -top-0.5 -right-0.5 text-[9px] font-bold text-background bg-coral rounded-full w-4 h-4 flex items-center justify-center shadow-lg">1</span>
                        )}
                        {repeatMode === 'all' && (
                          <span className="absolute -top-0.5 -right-0.5 text-[9px] font-bold text-background bg-coral rounded-full w-4 h-4 flex items-center justify-center shadow-lg">A</span>
                        )}
                        {repeatMode === 'count' && (
                          <span className="absolute -top-0.5 -right-0.5 text-[9px] font-bold text-background bg-coral rounded-full w-4 h-4 flex items-center justify-center shadow-lg">{repeatCount}</span>
                        )}
                      </button>

                      {showRepeatMenu && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2">
                          <div className="relative rounded-2xl overflow-hidden min-w-[180px]">
                            <div className="absolute inset-0 bg-gradient-to-b from-background/90 to-background/95 backdrop-blur-3xl" />
                            <div className="absolute inset-0 bg-gradient-to-br from-lavender/5 to-coral/5" />
                            <div className="absolute inset-[1px] rounded-2xl border border-background/60" />
                            <div className="absolute inset-0 rounded-2xl border border-foreground/[0.06] shadow-2xl" />
                            
                            <div className="relative z-10 p-2">
                              <button
                                onClick={() => { setRepeatMode('off'); setShowRepeatMenu(false); }}
                                className={`w-full text-left px-3 py-2.5 text-xs font-medium rounded-xl transition-all ${repeatMode === 'off' ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'}`}
                              >
                                Off
                              </button>
                              <button
                                onClick={() => { setRepeatMode('one'); setShowRepeatMenu(false); }}
                                className={`w-full text-left px-3 py-2.5 text-xs font-medium rounded-xl transition-all ${repeatMode === 'one' ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'}`}
                              >
                                Repeat One
                              </button>
                              <button
                                onClick={() => { setRepeatMode('all'); setShowRepeatMenu(false); }}
                                className={`w-full text-left px-3 py-2.5 text-xs font-medium rounded-xl transition-all ${repeatMode === 'all' ? 'bg-foreground/10 text-foreground' : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'}`}
                              >
                                Repeat All
                              </button>
                              <div className="my-2 h-px bg-gradient-to-r from-transparent via-foreground/10 to-transparent" />
                              <p className="px-3 py-1.5 text-xs text-muted-foreground">Repeat times:</p>
                              <div className="flex gap-1.5 px-2 pb-1">
                                {[2, 3, 5, 10].map((n) => (
                                  <button
                                    key={n}
                                    onClick={() => setRepeatTimes(n)}
                                    className={`relative flex-1 px-2 py-2 text-xs font-medium rounded-xl transition-all overflow-hidden ${
                                      repeatMode === 'count' && repeatCount === n 
                                        ? 'text-background' 
                                        : 'text-muted-foreground hover:text-foreground'
                                    }`}
                                  >
                                    {repeatMode === 'count' && repeatCount === n ? (
                                      <div className="absolute inset-0 bg-coral" />
                                    ) : (
                                      <div className="absolute inset-0 bg-foreground/5 hover:bg-foreground/10" />
                                    )}
                                    <span className="relative z-10">{n}x</span>
                                  </button>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Previous */}
                    <button
                      onClick={playPrevious}
                      disabled={!hasPrevious}
                      className={`p-2.5 rounded-xl transition-all duration-200 ${
                        hasPrevious 
                          ? 'text-muted-foreground hover:text-foreground hover:bg-foreground/5' 
                          : 'text-muted-foreground/20 cursor-not-allowed'
                      }`}
                    >
                      <PreviousIcon className="w-5 h-5" />
                    </button>

                    {/* Play/Pause - Hero button */}
                    <button
                      onClick={() => setIsPlaying(!isPlaying)}
                      className="relative w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 group"
                    >
                      {/* Button layers */}
                      <div className="absolute inset-0 bg-foreground rounded-full shadow-xl shadow-foreground/20" />
                      <div className="absolute inset-0 bg-gradient-to-b from-foreground via-foreground to-foreground/90 rounded-full" />
                      <div className="absolute inset-[1px] rounded-full border border-background/10" />
                      {/* Hover glow */}
                      <div className="absolute inset-0 rounded-full bg-coral/0 group-hover:bg-coral/10 transition-colors" />
                      
                      {isPlaying ? (
                        <PauseIcon className="w-5 h-5 text-background relative z-10" />
                      ) : (
                        <PlayIcon className="w-5 h-5 text-background relative z-10 ml-0.5" />
                      )}
                    </button>

                    {/* Next */}
                    <button
                      onClick={playNext}
                      disabled={!hasNext && repeatMode !== 'all'}
                      className={`p-2.5 rounded-xl transition-all duration-200 ${
                        hasNext || repeatMode === 'all'
                          ? 'text-muted-foreground hover:text-foreground hover:bg-foreground/5' 
                          : 'text-muted-foreground/20 cursor-not-allowed'
                      }`}
                    >
                      <SkipIcon className="w-5 h-5" />
                    </button>

                    {/* Speed Control */}
                    <div className="relative hidden sm:block" ref={speedMenuRef}>
                      <button
                        onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                        className={`relative px-2.5 py-1.5 rounded-xl text-xs font-medium transition-all ${
                          playbackSpeed !== 1 ? 'text-lavender' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        {playbackSpeed !== 1 && (
                          <div className="absolute inset-0 bg-lavender/10 rounded-xl" />
                        )}
                        <span className="relative z-10">{playbackSpeed}x</span>
                      </button>
                      
                      {showSpeedMenu && (
                        <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2">
                          <div className="relative rounded-2xl overflow-hidden min-w-[120px]">
                            <div className="absolute inset-0 bg-gradient-to-b from-background/90 to-background/95 backdrop-blur-3xl" />
                            <div className="absolute inset-0 bg-gradient-to-br from-lavender/5 to-coral/5" />
                            <div className="absolute inset-[1px] rounded-2xl border border-background/60" />
                            <div className="absolute inset-0 rounded-2xl border border-foreground/[0.06] shadow-2xl" />
                            
                            <div className="relative z-10 p-2">
                              {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                                <button
                                  key={speed}
                                  onClick={() => { setPlaybackSpeed(speed); setShowSpeedMenu(false); }}
                                  className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl transition-all ${
                                    playbackSpeed === speed 
                                      ? 'bg-foreground/10 text-foreground' 
                                      : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
                                  }`}
                                >
                                  {speed}x {speed === 1 && '(Normal)'}
                                </button>
                              ))}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Volume */}
                    <div className="hidden sm:flex items-center gap-2 ml-1">
                      <VolumeIcon className="w-5 h-5 text-muted-foreground" />
                      <div className="relative w-20 h-6 flex items-center">
                        <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                          <div className="w-full h-1 bg-foreground/10 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-gradient-to-r from-coral/80 to-coral rounded-full transition-all"
                              style={{ width: `${volume}%` }}
                            />
                          </div>
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={volume}
                          onChange={(e) => setVolume(Number(e.target.value))}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Controls - Desktop only */}
                  <div className="hidden md:flex items-center gap-1 flex-1 justify-end">
                    {/* Toggle Lyrics */}
                    <button
                      onClick={() => setShowLyrics(!showLyrics)}
                      className={`relative p-2.5 rounded-xl transition-all duration-200 ${
                        showLyrics 
                          ? 'text-foreground' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {showLyrics && (
                        <div className="absolute inset-0 bg-foreground/10 rounded-xl" />
                      )}
                      <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                    </button>

                    {/* Close */}
                    <button
                      onClick={onClose}
                      className="p-2.5 text-muted-foreground hover:text-foreground transition-all duration-200 rounded-xl hover:bg-foreground/5"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Mobile Controls Row */}
                <div className="flex md:hidden items-center justify-between mt-3">
                  {/* Left: Repeat & Previous */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={cycleRepeatMode}
                      className={`relative p-2.5 rounded-xl transition-all ${
                        repeatMode !== 'off' ? 'text-coral' : 'text-muted-foreground'
                      }`}
                    >
                      {repeatMode !== 'off' && (
                        <div className="absolute inset-0 bg-coral/10 rounded-xl" />
                      )}
                      <RepeatIcon className="w-5 h-5 relative z-10" />
                      {repeatMode === 'one' && (
                        <span className="absolute -top-0.5 -right-0.5 text-[9px] font-bold text-background bg-coral rounded-full w-4 h-4 flex items-center justify-center">1</span>
                      )}
                      {repeatMode === 'all' && (
                        <span className="absolute -top-0.5 -right-0.5 text-[9px] font-bold text-background bg-coral rounded-full w-4 h-4 flex items-center justify-center">A</span>
                      )}
                    </button>
                    <button
                      onClick={playPrevious}
                      disabled={!hasPrevious}
                      className={`p-2.5 rounded-xl ${hasPrevious ? 'text-muted-foreground active:scale-95' : 'text-muted-foreground/20'}`}
                    >
                      <PreviousIcon className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Right: Next, Lyrics, Close */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={playNext}
                      disabled={!hasNext && repeatMode !== 'all'}
                      className={`p-2.5 rounded-xl ${hasNext || repeatMode === 'all' ? 'text-muted-foreground active:scale-95' : 'text-muted-foreground/20'}`}
                    >
                      <SkipIcon className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => setShowLyrics(!showLyrics)}
                      className={`relative p-2.5 rounded-xl ${showLyrics ? 'text-foreground' : 'text-muted-foreground'}`}
                    >
                      {showLyrics && <div className="absolute inset-0 bg-foreground/10 rounded-xl" />}
                      <svg className="w-5 h-5 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6h16M4 12h16M4 18h7" />
                      </svg>
                    </button>
                    <button
                      onClick={onClose}
                      className="p-2.5 text-muted-foreground rounded-xl hover:bg-foreground/5"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-3 md:mt-4 flex items-center gap-2 sm:gap-3 md:gap-4">
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground w-8 sm:w-10 text-right tabular-nums">
                    {formatTime(currentTime)}
                  </span>
                  <div 
                    className="relative flex-1 h-8 sm:h-6 flex items-center cursor-pointer group touch-none"
                    onClick={handleProgressClick}
                  >
                    {/* Track background */}
                    <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                      <div className="w-full h-2 sm:h-1.5 bg-foreground/10 rounded-full overflow-hidden">
                        {/* Progress fill with gradient */}
                        <div 
                          className="h-full bg-gradient-to-r from-coral via-coral to-lavender rounded-full relative transition-all duration-100"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                    {/* Thumb indicator - Always visible on mobile, hover on desktop */}
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 sm:opacity-0 sm:group-hover:opacity-100 transition-all duration-200 pointer-events-none"
                      style={{ left: `calc(${progress}% - 8px)` }}
                    >
                      <div className="w-full h-full rounded-full bg-foreground shadow-lg shadow-foreground/30" />
                      <div className="absolute inset-0 rounded-full bg-coral/20 blur-md" />
                    </div>
                  </div>
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground w-8 sm:w-10 tabular-nums">
                    {song.duration}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Word Translation Popup */}
      {selectedWord && (
        <WordPopup
          word={selectedWord.word}
          translation={selectedWord.translation}
          position={selectedWord.position}
          onClose={() => setSelectedWord(null)}
          onSave={handleSaveWord}
          isSaved={isWordSaved(selectedWord.word)}
        />
      )}
    </>
  )
}
