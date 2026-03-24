"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { 
  ArrowIcon, 
  PlayIcon, 
  LoaderIcon, 
  CheckIcon, 
  SparkleIcon,
  WaveformIcon,
  MusicNotesGraphic,
  BlobGraphic,
  SoundWaveDecoration,
  StarIcon
} from "@/components/icons"

const quickTopics = ["Travel", "Food", "Business", "Romance"]
const genres = ["Pop", "Jazz", "Acoustic", "R&B"]
const languages = [
  { name: "Spanish", code: "es", flag: "🇪🇸" },
  { name: "French", code: "fr", flag: "🇫🇷" },
  { name: "German", code: "de", flag: "🇩🇪" },
  { name: "Italian", code: "it", flag: "🇮🇹" },
  { name: "Portuguese", code: "pt", flag: "🇵🇹" },
  { name: "Dutch", code: "nl", flag: "🇳🇱" },
  { name: "Swedish", code: "sv", flag: "🇸🇪" },
  { name: "Danish", code: "da", flag: "🇩🇰" },
  { name: "Norwegian", code: "no", flag: "🇳🇴" },
  { name: "Polish", code: "pl", flag: "🇵🇱" },
  { name: "Russian", code: "ru", flag: "🇷🇺" },
  { name: "Ukrainian", code: "uk", flag: "🇺🇦" },
  { name: "Greek", code: "el", flag: "🇬🇷" },
  { name: "Turkish", code: "tr", flag: "🇹🇷" },
  { name: "Arabic", code: "ar", flag: "🇸🇦" },
  { name: "Hebrew", code: "he", flag: "🇮🇱" },
  { name: "Japanese", code: "ja", flag: "🇯🇵" },
  { name: "Korean", code: "ko", flag: "🇰🇷" },
  { name: "Mandarin", code: "zh", flag: "🇨🇳" },
  { name: "Cantonese", code: "yue", flag: "🇭🇰" },
  { name: "Thai", code: "th", flag: "🇹🇭" },
  { name: "Vietnamese", code: "vi", flag: "🇻🇳" },
  { name: "Indonesian", code: "id", flag: "🇮🇩" },
  { name: "Filipino", code: "tl", flag: "🇵🇭" },
  { name: "Hindi", code: "hi", flag: "🇮🇳" },
  { name: "Bengali", code: "bn", flag: "🇧🇩" },
  { name: "Brazilian Portuguese", code: "pt-br", flag: "🇧🇷" },
  { name: "Mexican Spanish", code: "es-mx", flag: "🇲🇽" },
]

const typingExamples = [
  "hola, gracias, buenos dias",
  "bonjour, merci, au revoir",
  "konnichiwa, arigatou",
]

export function HeroSection() {
  const [language, setLanguage] = useState("es")
  const [searchQuery, setSearchQuery] = useState("")
  const [words, setWords] = useState("")
  const [genre, setGenre] = useState("Pop")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [typingIndex, setTypingIndex] = useState(0)
  const [displayText, setDisplayText] = useState("")
  const [carouselScroll, setCarouselScroll] = useState(0)
  const carouselRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (words) return
    
    const currentExample = typingExamples[typingIndex]
    let charIndex = 0
    
    const typeInterval = setInterval(() => {
      if (charIndex <= currentExample.length) {
        setDisplayText(currentExample.slice(0, charIndex))
        charIndex++
      } else {
        clearInterval(typeInterval)
        setTimeout(() => {
          setTypingIndex(prev => (prev + 1) % typingExamples.length)
        }, 2500)
      }
    }, 80)

    return () => clearInterval(typeInterval)
  }, [typingIndex, words])

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return
    const scrollAmount = 220
    const newScroll = direction === 'left' 
      ? Math.max(0, carouselScroll - scrollAmount)
      : carouselScroll + scrollAmount
    
    carouselRef.current.scrollTo({ left: newScroll, behavior: 'smooth' })
    setCarouselScroll(newScroll)
  }

  const handleCarouselScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    setCarouselScroll(target.scrollLeft)
  }

  const filteredLanguages = languages.filter((lang) =>
    lang.name.toLowerCase().includes(searchQuery) ||
    lang.code.toLowerCase().includes(searchQuery)
  )

  const handleGenerate = () => {
    setIsGenerating(true)
    setShowSuccess(false)
    setTimeout(() => {
      setIsGenerating(false)
      setShowSuccess(true)
      setTimeout(() => {
        document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })
      }, 600)
    }, 2000)
  }

  return (
    <section className="relative min-h-screen flex items-center pt-16 sm:pt-20 md:pt-24 pb-12 sm:pb-16 overflow-hidden">
      {/* Subtle decorative background element */}
      <BlobGraphic className="absolute -bottom-32 -right-40 w-[300px] sm:w-[400px] lg:w-[600px] h-[300px] sm:h-[400px] lg:h-[600px] text-lavender/10 animate-float" />
      
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 w-full relative z-10">
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 lg:gap-16 items-center">
          {/* Left side - Copy */}
          <div className="order-2 md:order-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-medium tracking-tight text-foreground leading-[1.1] text-balance opacity-0 animate-stagger-fade-up [animation-fill-mode:forwards]">
              Learn languages
              <br />
              <span className="italic text-coral">through music</span>
            </h1>

            <p className="mt-3 sm:mt-4 md:mt-6 text-sm sm:text-base md:text-lg text-muted-foreground leading-relaxed max-w-md opacity-0 animate-stagger-fade-up delay-200 [animation-fill-mode:forwards]">
              Type your vocabulary. Choose a style. Get a custom AI-generated song that sticks in your head.
            </p>

            <Button 
              size="lg"
              className="mt-5 sm:mt-6 md:mt-8 bg-foreground text-background hover:bg-foreground/90 rounded-full px-5 sm:px-6 md:px-8 h-10 sm:h-11 md:h-12 text-xs sm:text-sm md:text-base group shadow-lg shadow-foreground/10 opacity-0 animate-stagger-fade-up delay-400 [animation-fill-mode:forwards]"
              onClick={() => textareaRef.current?.focus()}
            >
              Try it free
              <ArrowIcon className="ml-2 h-3.5 w-3.5 sm:h-4 sm:w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </div>

          {/* Right side - Generator Card */}
          <div className="order-1 md:order-2 opacity-0 animate-scale-in delay-200 [animation-fill-mode:forwards]">
            <div className="relative rounded-2xl md:rounded-3xl overflow-hidden">
              {/* Multi-layered glass background - Apple style */}
              <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/60 backdrop-blur-3xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-lavender/8 via-transparent to-coral/8" />
              <div className="absolute inset-[1px] rounded-2xl md:rounded-3xl border border-background/80" />
              <div className="absolute inset-0 rounded-2xl md:rounded-3xl border border-foreground/[0.08]" />
              <div className="absolute inset-0 rounded-2xl md:rounded-3xl shadow-2xl shadow-foreground/10" />
              
              {/* Animated accent glows */}
              <div className="absolute -top-20 -left-20 w-40 h-40 bg-coral/15 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-lavender/15 rounded-full blur-3xl" />
              
              <div className="relative z-10 p-4 sm:p-5 md:p-6 lg:p-8">
                {/* Progress/Success states */}
                {isGenerating && (
                  <div className="relative mb-4 sm:mb-6 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-foreground/5 backdrop-blur-xl" />
                    <div className="absolute inset-[1px] rounded-xl border border-background/60" />
                    <div className="relative z-10 flex items-center justify-center gap-3 py-3 sm:py-4">
                      <LoaderIcon className="h-4 sm:h-5 w-4 sm:w-5 text-foreground" />
                      <span className="text-xs sm:text-sm font-medium text-foreground">Creating your song...</span>
                      <WaveformIcon className="h-4 sm:h-5 w-12 sm:w-16 text-coral" />
                    </div>
                  </div>
                )}

                {showSuccess && !isGenerating && (
                  <div className="relative mb-4 sm:mb-6 rounded-xl overflow-hidden">
                    <div className="absolute inset-0 bg-sage/10 backdrop-blur-xl" />
                    <div className="absolute inset-[1px] rounded-xl border border-sage/20" />
                    <div className="relative z-10 flex items-center justify-center gap-2 py-3 sm:py-4">
                      <CheckIcon className="h-4 sm:h-5 w-4 sm:w-5 text-sage" />
                      <span className="text-xs sm:text-sm font-medium text-foreground">Your song is ready!</span>
                    </div>
                  </div>
                )}

              <div className="mb-4 md:mb-5">
                {/* Search input - Apple glass style */}
                <input
                  type="text"
                  placeholder="Search languages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value.toLowerCase())}
                  className="w-full mb-2 md:mb-3 rounded-xl border border-foreground/[0.08] bg-foreground/5 px-4 py-2 md:py-2.5 text-xs md:text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground/20 focus:outline-none focus:bg-foreground/[0.07] transition-all"
                />

                {/* Language carousel */}
                <div className="relative -mx-4 md:mx-0">
                  <div
                    ref={carouselRef}
                    onScroll={handleCarouselScroll}
                    className="flex gap-1.5 md:gap-2 overflow-x-auto scroll-smooth scrollbar-hide px-4 md:px-0"
                    style={{ scrollBehavior: 'smooth', WebkitOverflowScrolling: 'touch', overscrollBehavior: 'contain' }}
                  >
                    {filteredLanguages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code)
                          setSearchQuery("")
                        }}
                        className={`relative flex-shrink-0 rounded-full px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium transition-all flex items-center gap-1.5 md:gap-2 whitespace-nowrap overflow-hidden ${
                          language === lang.code 
                            ? 'text-background' 
                            : 'text-foreground hover:bg-foreground/5'
                        }`}
                        title={lang.name}
                      >
                        {language === lang.code ? (
                          <>
                            <div className="absolute inset-0 bg-foreground" />
                            <div className="absolute inset-[1px] rounded-full border border-background/10" />
                          </>
                        ) : (
                          <>
                            <div className="absolute inset-0 bg-foreground/5" />
                            <div className="absolute inset-[1px] rounded-full border border-foreground/[0.08]" />
                          </>
                        )}
                        <span className="relative z-10 text-sm md:text-base">{lang.flag}</span>
                        <span className="relative z-10 text-xs md:text-sm">{lang.name}</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Navigation arrows - only show on larger screens if there are many languages */}
                  {filteredLanguages.length > 4 && (
                    <>
                      <button
                        onClick={() => scrollCarousel('left')}
                        className={`hidden md:flex absolute -left-6 lg:-left-8 top-1/2 -translate-y-1/2 h-7 w-7 lg:h-8 lg:w-8 items-center justify-center rounded-full transition-all z-20 ${
                          carouselScroll > 0 
                            ? 'bg-foreground/20 text-foreground hover:bg-foreground/30 cursor-pointer' 
                            : 'bg-foreground/5 text-foreground/30 cursor-not-allowed'
                        }`}
                        disabled={carouselScroll === 0}
                        aria-label="Scroll left"
                      >
                        <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                      </button>
                      <button
                        onClick={() => scrollCarousel('right')}
                        className="hidden md:flex absolute -right-6 lg:-right-8 top-1/2 -translate-y-1/2 h-7 w-7 lg:h-8 lg:w-8 items-center justify-center rounded-full bg-foreground/20 text-foreground hover:bg-foreground/30 transition-all z-20 cursor-pointer"
                        aria-label="Scroll right"
                      >
                        <svg className="w-3.5 h-3.5 lg:w-4 lg:h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    </>
                  )}
                </div>
              </div>
              
              <div className="mb-4 md:mb-5">
                <label className="mb-2 md:mb-2.5 block text-xs md:text-sm font-semibold text-foreground">
                  What words do you want to learn?
                </label>
                <textarea
                  ref={textareaRef}
                  value={words}
                  onChange={(e) => setWords(e.target.value)}
                  placeholder={!words ? displayText + "|" : "Type your vocabulary..."}
                  className="h-20 md:h-24 lg:h-28 w-full resize-none rounded-xl md:rounded-2xl border border-foreground/[0.08] bg-foreground/5 px-3 md:px-4 py-2.5 md:py-3 text-xs md:text-sm lg:text-base text-foreground placeholder:text-muted-foreground focus:border-foreground/20 focus:outline-none focus:bg-foreground/[0.07] transition-all"
                />
                <div className="mt-2.5 md:mt-3 flex flex-wrap gap-1.5 md:gap-2">
                  {quickTopics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setWords(`${topic.toLowerCase()} vocabulary...`)}
                      className="relative rounded-full px-3 md:px-3.5 py-1.5 md:py-2 text-xs font-medium text-muted-foreground transition-all hover:text-foreground overflow-hidden group"
                    >
                      <div className="absolute inset-0 bg-foreground/5 group-hover:bg-foreground/10 transition-colors" />
                      <div className="absolute inset-[1px] rounded-full border border-foreground/[0.08]" />
                      <span className="relative z-10">{topic}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-4 md:mb-5">
                <label className="mb-2 md:mb-2.5 block text-xs md:text-sm font-semibold text-foreground">Style</label>
                <div className="flex flex-wrap gap-1.5 md:gap-2">
                  {genres.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenre(g)}
                      className={`relative rounded-full px-3 md:px-4 py-1.5 md:py-2 text-xs md:text-sm font-medium transition-all overflow-hidden ${
                        genre === g 
                          ? 'text-background' 
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {genre === g ? (
                        <>
                          <div className="absolute inset-0 bg-foreground" />
                          <div className="absolute inset-[1px] rounded-full border border-background/10" />
                        </>
                      ) : (
                        <>
                          <div className="absolute inset-0 bg-foreground/5 hover:bg-foreground/10 transition-colors" />
                          <div className="absolute inset-[1px] rounded-full border border-foreground/[0.08]" />
                        </>
                      )}
                      <span className="relative z-10">{g}</span>
                    </button>
                  ))}
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating || !words.trim()}
                className="relative w-full h-11 md:h-12 lg:h-14 text-xs md:text-sm lg:text-base font-semibold rounded-xl md:rounded-2xl overflow-hidden disabled:opacity-50 transition-all group"
              >
                {/* Button layers */}
                <div className="absolute inset-0 bg-foreground group-hover:bg-foreground/90 transition-colors" />
                <div className="absolute inset-0 bg-gradient-to-r from-foreground via-foreground to-foreground/90" />
                <div className="absolute inset-[1px] rounded-xl md:rounded-2xl border border-background/10" />
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-coral/20 to-lavender/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                
                <span className="relative z-10 flex items-center justify-center text-background">
                  {isGenerating ? (
                    <>
                      <LoaderIcon className="mr-2 h-4 sm:h-5 w-4 sm:w-5" />
                      Generating...
                    </>
                  ) : (
                    <>
                      <SparkleIcon className="mr-2 h-4 sm:h-5 w-4 sm:w-5 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                      Generate Song
                    </>
                  )}
                </span>
              </button>
              
              <p className="mt-4 sm:mt-5 text-center text-xs text-muted-foreground">
                Free to try. No account required.
              </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
