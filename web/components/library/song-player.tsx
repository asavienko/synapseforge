"use client"

import { useState, useEffect, useRef } from "react"

interface LyricLine {
  text: string
  highlighted: string[]
}

interface Song {
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

type RepeatMode = 'off' | 'one' | 'all' | 'count'

// Icons
function PlayIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z" />
    </svg>
  )
}

function PauseIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="currentColor" viewBox="0 0 24 24">
      <rect x="6" y="4" width="4" height="16" rx="1" />
      <rect x="14" y="4" width="4" height="16" rx="1" />
    </svg>
  )
}

function VolumeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" d="M19.114 5.636a9 9 0 010 12.728M16.463 8.288a5.25 5.25 0 010 7.424M6.75 8.25l4.72-4.72a.75.75 0 011.28.53v15.88a.75.75 0 01-1.28.53l-4.72-4.72H4.51c-.88 0-1.704-.507-1.938-1.354A9.01 9.01 0 012.25 12c0-.83.112-1.633.322-2.396C2.806 8.756 3.63 8.25 4.51 8.25H6.75z" />
    </svg>
  )
}

interface SongPlayerProps {
  song: Song
  songs: Song[]
  onClose: () => void
  onSongChange: (song: Song) => void
}

export function SongPlayer({ song, songs, onClose, onSongChange }: SongPlayerProps) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [currentLyricIndex, setCurrentLyricIndex] = useState(0)
  const [showLyrics, setShowLyrics] = useState(true)
  const [expandedLyrics, setExpandedLyrics] = useState(false)
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('off')
  const [repeatCount, setRepeatCount] = useState(1)
  const [currentRepeat, setCurrentRepeat] = useState(0)
  const [showRepeatMenu, setShowRepeatMenu] = useState(false)
  const [volume, setVolume] = useState(80)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showSpeedMenu, setShowSpeedMenu] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const lyricsRef = useRef<HTMLDivElement>(null)
  const repeatMenuRef = useRef<HTMLDivElement>(null)
  const speedMenuRef = useRef<HTMLDivElement>(null)

  // Find current song index
  const currentIndex = songs.findIndex(s => s.id === song.id)
  const hasPrevious = currentIndex > 0
  const hasNext = currentIndex < songs.length - 1

  // Parse duration string to seconds
  const parseDuration = (duration: string) => {
    const [minutes, seconds] = duration.split(':').map(Number)
    return minutes * 60 + seconds
  }

  const totalDuration = parseDuration(song.duration)

  // Format time to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  // Close menus when clicking outside
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

  // Handle song end
  const handleSongEnd = () => {
    if (repeatMode === 'one') {
      // Repeat current song indefinitely
      setCurrentTime(0)
      setIsPlaying(true)
    } else if (repeatMode === 'count') {
      if (currentRepeat < repeatCount - 1) {
        // Still have repeats left
        setCurrentRepeat(prev => prev + 1)
        setCurrentTime(0)
        setIsPlaying(true)
      } else {
        // Done with repeats, play next or stop
        setCurrentRepeat(0)
        if (hasNext) {
          playNext()
        } else {
          setIsPlaying(false)
          setCurrentTime(0)
        }
      }
    } else {
      // No repeat, auto-play next
      if (hasNext) {
        playNext()
      } else {
        setIsPlaying(false)
        setCurrentTime(0)
      }
    }
  }

  // Simulate playback with speed support
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

  // Update current lyric based on time
  useEffect(() => {
    const lyricDuration = totalDuration / song.lyrics.length
    const newIndex = Math.min(
      Math.floor(currentTime / lyricDuration),
      song.lyrics.length - 1
    )
    setCurrentLyricIndex(newIndex)
  }, [currentTime, totalDuration, song.lyrics.length])

  // Reset when song changes
  useEffect(() => {
    setCurrentTime(0)
    setIsPlaying(false)
    setCurrentLyricIndex(0)
    setCurrentRepeat(0)
  }, [song.id])

  // Navigation functions
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
    }
  }

  // Set repeat mode
  const cycleRepeatMode = () => {
    if (repeatMode === 'off') {
      setRepeatMode('one')
    } else if (repeatMode === 'one') {
      setRepeatMode('off')
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

  // Highlight words in lyrics
  const renderLyricLine = (line: LyricLine, isActive: boolean) => {
    if (line.highlighted.length === 0) {
      return <span className={isActive ? 'text-foreground' : 'text-muted-foreground/60'}>{line.text}</span>
    }

    const words = line.text.split(' ')
    return words.map((word, i) => {
      const isHighlighted = line.highlighted.some(h => 
        word.toLowerCase().includes(h.toLowerCase())
      )
      return (
        <span key={i}>
          <span className={`${
            isActive 
              ? isHighlighted 
                ? 'text-coral font-semibold' 
                : 'text-foreground'
              : isHighlighted
                ? 'text-coral/60'
                : 'text-muted-foreground/60'
          }`}>
            {word}
          </span>
          {i < words.length - 1 && ' '}
        </span>
      )
    })
  }

  return (
    <div className="fixed inset-x-0 bottom-0 z-50 safe-bottom">
      <div className="mx-auto max-w-5xl px-4 pb-4 lg:pb-6">
        <div className="relative rounded-3xl overflow-hidden">
          {/* Multi-layered glass background */}
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/70 to-background/60 backdrop-blur-3xl" />
          <div className="absolute inset-0 bg-gradient-to-br from-lavender/8 via-transparent to-coral/8" />
          <div className="absolute inset-0 bg-gradient-to-t from-foreground/[0.02] to-transparent" />
          <div className="absolute inset-[1px] rounded-3xl border border-background/80" />
          <div className="absolute inset-0 rounded-3xl border border-foreground/[0.06]" />
          <div className="absolute inset-0 rounded-3xl shadow-[0_-8px_60px_-12px_rgba(0,0,0,0.25)] dark:shadow-[0_-8px_60px_-12px_rgba(0,0,0,0.5)]" />
          
          {/* Accent glows */}
          <div className="absolute -top-20 left-1/4 w-40 h-40 bg-coral/10 rounded-full blur-3xl" />
          <div className="absolute -top-20 right-1/4 w-40 h-40 bg-lavender/10 rounded-full blur-3xl" />
          
          <div className="relative z-10">
        {/* Lyrics Panel - Collapsible and Expandable */}
        {showLyrics && (
          <div className={`border-b border-border/50 transition-all duration-300 ${
            expandedLyrics ? 'fixed inset-0 z-50 bg-card/98 backdrop-blur-lg flex flex-col' : 'pt-4 pb-2 md:pt-6 md:pb-3'
          }`}>
            <div className={`flex items-center justify-between mb-3 ${expandedLyrics ? 'p-4 md:p-6 border-b border-border/50' : ''}`}>
              <h3 className="text-sm font-medium text-foreground">Lyrics</h3>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">
                  {song.words.length} vocabulary words
                </span>
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                  </svg>
                  {song.likes >= 1000 ? `${(song.likes / 1000).toFixed(1)}k` : song.likes}
                </span>
                <button
                  onClick={() => setExpandedLyrics(!expandedLyrics)}
                  className="p-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-muted-foreground hover:text-foreground transition-colors"
                  title={expandedLyrics ? 'Collapse lyrics' : 'Expand lyrics'}
                >
                  {expandedLyrics ? (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
            <div 
              ref={lyricsRef}
              className={`space-y-2 overflow-y-auto scrollbar-hide ${
                expandedLyrics 
                  ? 'flex-1 p-4 md:p-6 max-w-3xl mx-auto w-full' 
                  : 'max-h-32 md:max-h-40'
              }`}
            >
              {song.lyrics.map((line, index) => (
                <p
                  key={index}
                  className={`transition-all duration-300 ${
                    expandedLyrics ? 'text-base md:text-lg py-1' : 'text-sm md:text-base'
                  } ${
                    index === currentLyricIndex 
                      ? 'scale-105 origin-left' 
                      : ''
                  }`}
                >
                  {renderLyricLine(line, index === currentLyricIndex)}
                </p>
              ))}
            </div>

            {/* Vocabulary Words */}
            <div className={`flex flex-wrap gap-1.5 pt-3 border-t border-border/50 ${
              expandedLyrics ? 'p-4 md:p-6 max-w-3xl mx-auto w-full' : 'mt-3'
            }`}>
              <span className="text-xs text-muted-foreground mr-1">Words:</span>
              {song.words.map((word, index) => (
                <span
                  key={index}
                  className="text-xs px-2 py-0.5 rounded-full bg-coral/10 text-coral border border-coral/20"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Player Controls */}
        <div className="px-3 sm:px-4 md:px-5 py-3 md:py-4">
          {/* Mobile Layout: Stacked */}
          <div className="flex flex-col gap-3">
            {/* Top Row: Song Info + Main Play Button */}
            <div className="flex items-center gap-3">
              {/* Song Info */}
              <div className="flex-shrink-0 w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12 rounded-xl bg-secondary flex items-center justify-center">
                <span className="text-lg sm:text-xl md:text-2xl">{song.languageFlag}</span>
              </div>
              
              <div className="flex-1 min-w-0">
                <h4 className="text-sm sm:text-base font-medium text-foreground truncate">
                  {song.title}
                </h4>
                <p className="text-xs text-muted-foreground truncate">
                  {song.language} • {song.topic} • {song.style}
                </p>
              </div>

              {/* Mobile Play/Pause - Large touch target */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex-shrink-0 w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-foreground/90 transition-colors active:scale-95"
              >
                {isPlaying ? (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg className="w-5 h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>
            </div>

            {/* Progress Bar */}
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="text-[10px] sm:text-xs text-muted-foreground w-8 sm:w-10 text-right tabular-nums">
                {formatTime(currentTime)}
              </span>
              <div 
                className="flex-1 h-2 sm:h-1.5 bg-secondary rounded-full cursor-pointer group touch-none"
                onClick={handleProgressClick}
              >
                <div 
                  className="h-full bg-foreground rounded-full relative transition-all"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3.5 h-3.5 sm:w-3 sm:h-3 bg-foreground rounded-full sm:opacity-0 sm:group-hover:opacity-100 transition-opacity shadow-md" />
                </div>
              </div>
              <span className="text-[10px] sm:text-xs text-muted-foreground w-8 sm:w-10 tabular-nums">
                {song.duration}
              </span>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-between">
              {/* Repeat Control */}
              <div className="relative" ref={repeatMenuRef}>
                <button
                  onClick={() => setShowRepeatMenu(!showRepeatMenu)}
                  onDoubleClick={cycleRepeatMode}
                  className={`flex-shrink-0 p-2 rounded-lg transition-colors relative ${
                    repeatMode !== 'off'
                      ? 'text-coral'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  title={repeatMode === 'off' ? 'Repeat off (click for options)' : repeatMode === 'one' ? 'Repeat one' : `Repeat ${repeatCount}x (${currentRepeat + 1}/${repeatCount})`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  {repeatMode === 'one' && (
                    <span className="absolute -top-1 -right-1 text-[10px] font-bold text-coral">1</span>
                  )}
                  {repeatMode === 'count' && (
                    <span className="absolute -top-1 -right-1 text-[10px] font-bold text-coral">{repeatCount}</span>
                  )}
                </button>
                
                {/* Repeat Menu */}
                {showRepeatMenu && (
                  <div className="absolute bottom-full mb-2 right-0 bg-card border border-border rounded-lg shadow-lg p-2 min-w-[140px] z-50">
                    <button
                      onClick={() => { setRepeatMode('off'); setShowRepeatMenu(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors ${repeatMode === 'off' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/50'}`}
                    >
                      Off
                    </button>
                    <button
                      onClick={() => { setRepeatMode('one'); setShowRepeatMenu(false); }}
                      className={`w-full text-left px-3 py-1.5 text-xs rounded-md transition-colors ${repeatMode === 'one' ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:bg-secondary/50'}`}
                    >
                      Repeat One
                    </button>
                    <div className="border-t border-border my-1" />
                    <p className="px-3 py-1 text-xs text-muted-foreground">Repeat times:</p>
                    <div className="flex gap-1 px-2">
                      {[2, 3, 5, 10].map((n) => (
                        <button
                          key={n}
                          onClick={() => setRepeatTimes(n)}
                          className={`flex-1 px-2 py-1 text-xs rounded-md transition-colors ${
                            repeatMode === 'count' && repeatCount === n 
                              ? 'bg-coral text-background' 
                              : 'bg-secondary text-muted-foreground hover:text-foreground'
                          }`}
                        >
                          {n}x
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Previous */}
              <button
                onClick={playPrevious}
                disabled={!hasPrevious}
                className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                  hasPrevious 
                    ? 'text-muted-foreground hover:text-foreground' 
                    : 'text-muted-foreground/30 cursor-not-allowed'
                }`}
                title="Previous song"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 6h2v12H6zm3.5 6l8.5 6V6z" />
                </svg>
              </button>

              {/* Play/Pause */}
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="flex-shrink-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-foreground text-background flex items-center justify-center hover:bg-foreground/90 transition-colors"
              >
                {isPlaying ? (
                  <svg className="w-4 h-4 md:w-5 md:h-5" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="4" width="4" height="16" rx="1" />
                    <rect x="14" y="4" width="4" height="16" rx="1" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 md:w-5 md:h-5 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                )}
              </button>

              {/* Next */}
              <button
                onClick={playNext}
                disabled={!hasNext}
                className={`flex-shrink-0 p-2 rounded-lg transition-colors ${
                  hasNext 
                    ? 'text-muted-foreground hover:text-foreground' 
                    : 'text-muted-foreground/30 cursor-not-allowed'
                }`}
                title="Next song"
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z" />
                </svg>
              </button>

              {/* Speed Control */}
              <div className="relative hidden sm:block" ref={speedMenuRef}>
                <button
                  onClick={() => setShowSpeedMenu(!showSpeedMenu)}
                  className={`relative px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    playbackSpeed !== 1 ? 'text-lavender' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  {playbackSpeed !== 1 && (
                    <div className="absolute inset-0 bg-lavender/10 rounded-lg" />
                  )}
                  <span className="relative z-10">{playbackSpeed}x</span>
                </button>
                
                {showSpeedMenu && (
                  <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2">
                    <div className="relative rounded-xl overflow-hidden min-w-[100px]">
                      <div className="absolute inset-0 bg-background/95 backdrop-blur-xl" />
                      <div className="absolute inset-0 rounded-xl border border-foreground/[0.08] shadow-xl" />
                      
                      <div className="relative z-10 p-1.5">
                        {[0.5, 0.75, 1, 1.25, 1.5, 2].map((speed) => (
                          <button
                            key={speed}
                            onClick={() => { setPlaybackSpeed(speed); setShowSpeedMenu(false); }}
                            className={`w-full text-left px-2.5 py-1.5 text-xs font-medium rounded-lg transition-all ${
                              playbackSpeed === speed 
                                ? 'bg-foreground/10 text-foreground' 
                                : 'text-muted-foreground hover:bg-foreground/5 hover:text-foreground'
                            }`}
                          >
                            {speed}x
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Volume - Hidden on very small screens */}
              <div className="hidden md:flex items-center gap-2">
                <VolumeIcon className="w-4 h-4 text-muted-foreground" />
                <div className="relative w-16 lg:w-20 h-5 flex items-center">
                  <div className="absolute inset-y-0 left-0 right-0 flex items-center">
                    <div className="w-full h-1 bg-foreground/10 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-coral rounded-full transition-all"
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

              {/* Right side controls */}
              <div className="flex items-center gap-1">
                {/* Toggle Lyrics Button */}
                <button
                  onClick={() => setShowLyrics(!showLyrics)}
                  className={`flex-shrink-0 p-2.5 sm:p-2 rounded-xl sm:rounded-lg transition-colors ${
                    showLyrics 
                      ? 'bg-foreground text-background' 
                      : 'bg-secondary text-muted-foreground hover:text-foreground'
                  }`}
                  title={showLyrics ? 'Hide lyrics' : 'Show lyrics'}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h7" />
                  </svg>
                </button>

                {/* Close */}
                <button
                  onClick={onClose}
                  className="flex-shrink-0 p-2.5 sm:p-2 text-muted-foreground hover:text-foreground transition-colors rounded-xl sm:rounded-lg hover:bg-foreground/5"
                  title="Close player"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
          </div>
        </div>
      </div>
    </div>
  )
}
