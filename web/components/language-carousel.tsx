"use client"

import { useState, useEffect, useRef } from "react"
import { Search, ChevronLeft, ChevronRight, X } from "lucide-react"

const languages = [
  { name: "Spanish", native: "Espanol", flag: "ES", learners: "50K+", color: "coral" },
  { name: "French", native: "Francais", flag: "FR", learners: "35K+", color: "blue" },
  { name: "German", native: "Deutsch", flag: "DE", learners: "28K+", color: "yellow" },
  { name: "Japanese", native: "Nihongo", flag: "JP", learners: "42K+", color: "pink" },
  { name: "Korean", native: "Hangugeo", flag: "KR", learners: "38K+", color: "green" },
  { name: "Mandarin", native: "Zhongwen", flag: "CN", learners: "45K+", color: "coral" },
  { name: "Portuguese", native: "Portugues", flag: "PT", learners: "22K+", color: "blue" },
  { name: "Italian", native: "Italiano", flag: "IT", learners: "25K+", color: "green" },
  { name: "Arabic", native: "Al Arabiyya", flag: "SA", learners: "18K+", color: "yellow" },
  { name: "Hindi", native: "Hindi", flag: "IN", learners: "15K+", color: "pink" },
  { name: "Russian", native: "Russkiy", flag: "RU", learners: "20K+", color: "blue" },
  { name: "Turkish", native: "Turkce", flag: "TR", learners: "12K+", color: "coral" },
]

const colorMap: Record<string, { bg: string; text: string }> = {
  coral: { bg: "bg-coral/20", text: "text-coral" },
  blue: { bg: "bg-blue/20", text: "text-blue" },
  green: { bg: "bg-green/20", text: "text-green" },
  yellow: { bg: "bg-yellow/20", text: "text-yellow" },
  pink: { bg: "bg-pink/20", text: "text-pink" },
}

export function LanguageCarousel() {
  const [activeIndex, setActiveIndex] = useState(0)
  const [searchQuery, setSearchQuery] = useState("")
  const [showSearch, setShowSearch] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const [startX, setStartX] = useState(0)
  const [scrollLeft, setScrollLeft] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const searchInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (isPaused || showSearch) return
    const interval = setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % languages.length)
    }, 2500)
    return () => clearInterval(interval)
  }, [isPaused, showSearch])

  useEffect(() => {
    if (showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [showSearch])

  const filteredLanguages = languages.filter(lang => 
    lang.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    lang.native.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!carouselRef.current) return
    setIsDragging(true)
    setIsPaused(true)
    setStartX(e.pageX - carouselRef.current.offsetLeft)
    setScrollLeft(carouselRef.current.scrollLeft)
  }

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !carouselRef.current) return
    e.preventDefault()
    const x = e.pageX - carouselRef.current.offsetLeft
    const walk = (x - startX) * 2
    carouselRef.current.scrollLeft = scrollLeft - walk
  }

  const handleMouseUp = () => {
    setIsDragging(false)
    setTimeout(() => setIsPaused(false), 1000)
  }

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return
    const scrollAmount = 200
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  const handleLanguageSelect = (index: number) => {
    setActiveIndex(index)
    setIsPaused(true)
    setTimeout(() => setIsPaused(false), 3000)
  }

  return (
    <section 
      className="py-16 overflow-hidden border-y-2 border-border bg-secondary/20"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => { if (!showSearch) setIsPaused(false) }}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm font-medium text-muted-foreground">
            Learn in <span className="text-primary font-bold">100+</span> languages
          </p>
          
          <button
            onClick={() => setShowSearch(!showSearch)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all ${
              showSearch ? 'bg-primary text-primary-foreground' : 'bg-card border-2 border-border text-muted-foreground hover:text-foreground hover:border-primary/50'
            }`}
          >
            {showSearch ? <X className="h-4 w-4" /> : <Search className="h-4 w-4" />}
            {!showSearch && <span className="hidden sm:inline">Search</span>}
          </button>
        </div>

        {/* Search Bar */}
        <div className={`overflow-hidden transition-all duration-300 ${showSearch ? 'max-h-20 opacity-100 mb-6' : 'max-h-0 opacity-0'}`}>
          <div className="relative max-w-md mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search languages..."
              className="w-full pl-11 pr-4 py-3 rounded-2xl border-2 border-border bg-card text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-all"
            />
          </div>
        </div>
        
        {/* Carousel */}
        <div className="relative group">
          <button
            onClick={() => scrollCarousel('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-20 h-11 w-11 flex items-center justify-center rounded-full bg-card border-2 border-border shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10 pointer-events-none" />
          
          <div 
            ref={carouselRef}
            className={`flex gap-4 overflow-x-auto scrollbar-hide py-2 px-4 -mx-4 cursor-grab ${isDragging ? 'cursor-grabbing' : ''}`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          >
            {(showSearch ? filteredLanguages : [...languages, ...languages]).map((lang, i) => {
              const originalIndex = i % languages.length
              const colors = colorMap[lang.color]
              return (
                <button
                  key={`${lang.name}-${i}`}
                  onClick={() => handleLanguageSelect(originalIndex)}
                  className={`flex-shrink-0 flex items-center gap-3 rounded-2xl border-2 px-5 py-3.5 transition-all duration-300 hover:scale-105 ${
                    originalIndex === activeIndex && !showSearch
                      ? `border-primary ${colors.bg} scale-105 shadow-lg` 
                      : 'border-border bg-card hover:border-primary/50'
                  }`}
                >
                  <div className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-bold transition-all ${
                    originalIndex === activeIndex && !showSearch 
                      ? 'bg-primary text-primary-foreground' 
                      : `${colors.bg} ${colors.text}`
                  }`}>
                    {lang.flag}
                  </div>
                  <div className="text-left">
                    <p className="font-semibold text-foreground text-sm">{lang.name}</p>
                    <p className="text-xs text-muted-foreground">{lang.native}</p>
                  </div>
                  <div className={`ml-2 text-xs font-bold ${colors.text}`}>
                    {lang.learners}
                  </div>
                </button>
              )
            })}
          </div>

          <button
            onClick={() => scrollCarousel('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-20 h-11 w-11 flex items-center justify-center rounded-full bg-card border-2 border-border shadow-lg opacity-0 group-hover:opacity-100 transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        {/* Quick Pills */}
        <div className="mt-8 flex flex-wrap justify-center gap-2">
          {languages.slice(0, 6).map((lang, i) => {
            const colors = colorMap[lang.color]
            return (
              <button
                key={lang.name}
                onClick={() => handleLanguageSelect(i)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all hover:scale-105 ${
                  activeIndex === i
                    ? 'bg-primary text-primary-foreground shadow-lg shadow-primary/30'
                    : `${colors.bg} ${colors.text} hover:opacity-80`
                }`}
              >
                {lang.name}
              </button>
            )
          })}
          <span className="rounded-full bg-secondary px-4 py-2 text-sm text-muted-foreground font-medium">
            +{languages.length - 6} more
          </span>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm text-muted-foreground">
            <span className="font-bold text-foreground">{languages[activeIndex].learners}</span> learners studying{" "}
            <span className="text-primary font-bold">{languages[activeIndex].name}</span> with LyricLingo
          </p>
        </div>
      </div>
    </section>
  )
}
