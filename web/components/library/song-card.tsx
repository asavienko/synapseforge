"use client"

// SongCard component v2 - uses article with role="button" to avoid nested button issues
// Updated: No button elements used - outer is article, inner favorite is span

interface Song {
  id: string
  title: string
  language: string
  languageFlag: string
  topic: string
  style: string
  words: string[]
  duration: string
  createdAt: string
  likes: number
}

interface SongCardProps {
  song: Song
  isActive: boolean
  onPlay: () => void
  isFavorite?: boolean
  onToggleFavorite?: () => void
}

export function SongCard({ song, isActive, onPlay, isFavorite, onToggleFavorite }: SongCardProps) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onPlay()
    }
  }

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    onToggleFavorite?.()
  }

  const handleFavoriteKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      e.stopPropagation()
      onToggleFavorite?.()
    }
  }

  return (
    <article
      data-component="song-card"
      role="button"
      tabIndex={0}
      onClick={onPlay}
      onKeyDown={handleKeyDown}
      aria-pressed={isActive}
      className={`text-left w-full p-4 md:p-5 rounded-xl border transition-all duration-200 hover-lift group cursor-pointer ${
        isActive
          ? 'bg-foreground text-background border-foreground shadow-lg'
          : 'bg-card border-border/50 hover:border-foreground/30'
      }`}
    >
      <div className="flex items-start gap-3 md:gap-4">
        {/* Play button / Album art placeholder */}
        <div className={`flex-shrink-0 w-12 h-12 md:w-14 md:h-14 rounded-lg flex items-center justify-center transition-all ${
          isActive 
            ? 'bg-background/20' 
            : 'bg-secondary group-hover:bg-coral/10'
        }`}>
          {isActive ? (
            <div className="flex items-center gap-0.5">
              <span className="w-1 h-4 bg-background rounded-full animate-pulse" />
              <span className="w-1 h-6 bg-background rounded-full animate-pulse" style={{ animationDelay: '0.1s' }} />
              <span className="w-1 h-3 bg-background rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
            </div>
          ) : (
            <svg className="w-5 h-5 md:w-6 md:h-6 text-foreground/70 group-hover:text-coral transition-colors" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>

        <div className="flex-1 min-w-0">
          {/* Title and duration */}
          <div className="flex items-start justify-between gap-2">
            <h3 className={`font-medium text-sm md:text-base truncate ${
              isActive ? 'text-background' : 'text-foreground'
            }`}>
              {song.title}
            </h3>
            <div className="flex items-center gap-2 flex-shrink-0">
              {onToggleFavorite && (
                <span
                  role="button"
                  tabIndex={0}
                  onClick={handleFavoriteClick}
                  onKeyDown={handleFavoriteKeyDown}
                  aria-label={isFavorite ? "Remove from favorites" : "Add to favorites"}
                  className={`p-1 rounded-md transition-colors cursor-pointer ${
                    isFavorite 
                      ? 'text-coral'
                      : isActive ? 'text-background/50 hover:text-background' : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <svg className="w-4 h-4" fill={isFavorite ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </span>
              )}
              <span className={`text-xs ${
                isActive ? 'text-background/70' : 'text-muted-foreground'
              }`}>
                {song.duration}
              </span>
            </div>
          </div>

          {/* Language and metadata */}
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className="text-sm">{song.languageFlag}</span>
            <span className={`text-xs ${isActive ? 'text-background/70' : 'text-muted-foreground'}`}>
              {song.language}
            </span>
            <span className={`text-xs ${isActive ? 'text-background/40' : 'text-border'}`}>•</span>
            <span className={`text-xs ${isActive ? 'text-background/70' : 'text-muted-foreground'}`}>
              {song.topic}
            </span>
            <span className={`text-xs ${isActive ? 'text-background/40' : 'text-border'}`}>•</span>
            <span className={`text-xs ${isActive ? 'text-background/70' : 'text-muted-foreground'}`}>
              {song.style}
            </span>
            <span className={`text-xs ${isActive ? 'text-background/40' : 'text-border'}`}>•</span>
            <span className={`flex items-center gap-1 text-xs ${isActive ? 'text-background/70' : 'text-muted-foreground'}`}>
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
              {song.likes >= 1000 ? `${(song.likes / 1000).toFixed(1)}k` : song.likes}
            </span>
          </div>

          {/* Vocabulary preview */}
          <div className="flex flex-wrap gap-1 mt-2 md:mt-3">
            {song.words.slice(0, 4).map((word, index) => (
              <span
                key={index}
                className={`text-xs px-2 py-0.5 rounded-full ${
                  isActive
                    ? 'bg-background/20 text-background'
                    : 'bg-lavender/20 text-foreground/80'
                }`}
              >
                {word}
              </span>
            ))}
            {song.words.length > 4 && (
              <span className={`text-xs px-2 py-0.5 ${
                isActive ? 'text-background/60' : 'text-muted-foreground'
              }`}>
                +{song.words.length - 4} more
              </span>
            )}
          </div>
        </div>
      </div>
    </article>
  )
}
