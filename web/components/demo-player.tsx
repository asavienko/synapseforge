"use client"

import { useState, useEffect, useRef } from "react"
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Mic2 } from "lucide-react"

const lyrics = [
  { time: 0, text: "I walked into the", word: "restaurant", isWord: true },
  { time: 2, text: "Smelled something", word: "delicious", isWord: true },
  { time: 4, text: "Looked at the", word: "menu", isWord: true },
  { time: 6, text: "Ready to", word: "order", isWord: true },
  { time: 8, text: "The waiter smiled at me", word: "", isWord: false },
  { time: 10, text: "And asked", word: "check please?", isWord: true },
]

export function DemoPlayer() {
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [currentLineIndex, setCurrentLineIndex] = useState(0)
  const [showKaraokeMode, setShowKaraokeMode] = useState(false)
  const [isMuted, setIsMuted] = useState(false)
  const progressRef = useRef<HTMLDivElement>(null)
  const totalDuration = 30

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isPlaying) {
      interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= totalDuration) {
            setIsPlaying(false)
            return 0
          }
          return prev + 0.1
        })
      }, 100)
    }
    return () => clearInterval(interval)
  }, [isPlaying])

  useEffect(() => {
    const scaledTime = (currentTime / totalDuration) * 12
    const lineIndex = lyrics.findIndex((l, i) => 
      scaledTime >= l.time && (i === lyrics.length - 1 || scaledTime < lyrics[i + 1].time)
    )
    if (lineIndex !== -1) setCurrentLineIndex(lineIndex)
  }, [currentTime])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const x = Math.max(0, Math.min(e.clientX - rect.left, rect.width))
    setCurrentTime((x / rect.width) * totalDuration)
  }

  return (
    <div className="rounded-2xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-5 py-3 bg-secondary/30">
        <div className="flex items-center gap-1.5">
          <div className="h-2.5 w-2.5 rounded-full bg-coral" />
          <div className="h-2.5 w-2.5 rounded-full bg-lavender" />
          <div className="h-2.5 w-2.5 rounded-full bg-sage" />
        </div>
        <span className="text-xs text-muted-foreground">Demo Player</span>
        <button 
          onClick={() => setShowKaraokeMode(!showKaraokeMode)}
          className={`text-xs flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
            showKaraokeMode ? 'bg-coral/20 text-coral' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          <Mic2 className="h-3 w-3" />
          <span>Karaoke</span>
        </button>
      </div>

      <div className="p-6">
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Player Controls */}
          <div className="space-y-6">
            {/* Album */}
            <div 
              className="relative h-48 rounded-xl bg-secondary flex items-center justify-center cursor-pointer group"
              onClick={() => setIsPlaying(!isPlaying)}
            >
              {/* Visualizer bars */}
              <div className="flex items-end gap-1 h-20">
                {[...Array(12)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 rounded-full transition-all duration-150 ${isPlaying ? 'bg-foreground' : 'bg-muted-foreground'}`}
                    style={{ 
                      height: isPlaying ? `${20 + Math.sin(Date.now() / 200 + i) * 30}px` : '8px',
                      animationDelay: `${i * 50}ms`
                    }}
                  />
                ))}
              </div>
              
              <div className={`absolute inset-0 flex items-center justify-center bg-background/50 transition-opacity ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}>
                <div className="h-14 w-14 rounded-full bg-foreground text-background flex items-center justify-center">
                  {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
                </div>
              </div>

              <div className="absolute bottom-3 left-3">
                <p className="text-sm font-semibold text-foreground">Food Vocabulary</p>
                <p className="text-xs text-muted-foreground">Pop - Happy</p>
              </div>
            </div>

            {/* Progress */}
            <div>
              <div 
                ref={progressRef} 
                className="h-1.5 bg-secondary rounded-full cursor-pointer overflow-hidden"
                onClick={handleProgressClick}
              >
                <div 
                  className="h-full bg-foreground rounded-full transition-all"
                  style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                />
              </div>
              <div className="mt-1.5 flex justify-between text-xs text-muted-foreground">
                <span>{formatTime(currentTime)}</span>
                <span>{formatTime(totalDuration)}</span>
              </div>
            </div>

            {/* Controls */}
            <div className="flex items-center justify-center gap-4">
              <button 
                onClick={() => setIsMuted(!isMuted)} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
              </button>
              <button 
                onClick={() => setCurrentTime(Math.max(currentTime - 5, 0))} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <SkipBack className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                className="h-12 w-12 rounded-full bg-foreground text-background flex items-center justify-center hover:scale-105 transition-transform"
              >
                {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
              </button>
              <button 
                onClick={() => setCurrentTime(Math.min(currentTime + 5, totalDuration))} 
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Lyrics */}
          <div className={`rounded-xl p-5 transition-colors ${showKaraokeMode ? 'bg-coral/10' : 'bg-secondary/30'}`}>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-4">[Verse 1]</p>
            <div className="space-y-2.5 font-mono text-sm">
              {lyrics.map((line, index) => (
                <div 
                  key={index} 
                  className={`transition-all duration-300 ${
                    index === currentLineIndex 
                      ? 'text-foreground' 
                      : index < currentLineIndex 
                        ? 'text-muted-foreground/40' 
                        : 'text-muted-foreground/70'
                  }`}
                >
                  {line.text}{" "}
                  {line.isWord && (
                    <span className={`inline-block px-1.5 py-0.5 rounded transition-all ${
                      index === currentLineIndex 
                        ? 'bg-foreground text-background' 
                        : 'bg-foreground/10 text-foreground'
                    }`}>
                      {line.word}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Word Match */}
        <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl bg-sage/20 px-4 py-3">
          <span className="text-xs font-medium text-foreground">Words matched:</span>
          <span className="text-xs bg-sage text-background px-2 py-0.5 rounded-full font-medium">5/5</span>
          <div className="flex flex-wrap gap-1.5">
            {["restaurant", "delicious", "menu", "order", "check please"].map((word) => (
              <span key={word} className="text-xs bg-background border border-border px-2 py-0.5 rounded-full text-muted-foreground">
                {word}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
