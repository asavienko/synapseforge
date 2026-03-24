"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { 
  SparkleIcon, 
  LoaderIcon, 
  CheckIcon,
  WaveformIcon,
  CloseIcon 
} from "@/components/icons"

const quickTopics = ["Travel", "Food", "Business", "Romance", "Daily Life", "Shopping"]
const genres = ["Pop", "Jazz", "Acoustic", "R&B", "Hip Hop", "Classical"]
const languages = [
  { name: "Spanish", code: "es", flag: "🇪🇸" },
  { name: "French", code: "fr", flag: "🇫🇷" },
  { name: "German", code: "de", flag: "🇩🇪" },
  { name: "Italian", code: "it", flag: "🇮🇹" },
  { name: "Portuguese", code: "pt", flag: "🇵🇹" },
  { name: "Japanese", code: "ja", flag: "🇯🇵" },
  { name: "Korean", code: "ko", flag: "🇰🇷" },
  { name: "Mandarin", code: "zh", flag: "🇨🇳" },
]

interface CreateSongModalProps {
  isOpen: boolean
  onClose: () => void
  onSongCreated?: (song: { title: string; language: string; flag: string; words: string[]; genre: string }) => void
}

export function CreateSongModal({ isOpen, onClose, onSongCreated }: CreateSongModalProps) {
  const [step, setStep] = useState(1)
  const [language, setLanguage] = useState("es")
  const [words, setWords] = useState("")
  const [genre, setGenre] = useState("Pop")
  const [isGenerating, setIsGenerating] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Focus textarea when modal opens
  useEffect(() => {
    if (isOpen && step === 1) {
      setTimeout(() => textareaRef.current?.focus(), 100)
    }
  }, [isOpen, step])

  // Reset state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setStep(1)
      setWords("")
      setGenre("Pop")
      setIsGenerating(false)
      setShowSuccess(false)
    }
  }, [isOpen])

  const selectedLanguage = languages.find(l => l.code === language)

  const handleGenerate = async () => {
    setIsGenerating(true)
    
    // Simulate generation
    await new Promise(resolve => setTimeout(resolve, 2500))
    
    setIsGenerating(false)
    setShowSuccess(true)
    
    // Notify parent of new song
    if (onSongCreated) {
      const wordList = words.split(/[,\n]/).map(w => w.trim()).filter(Boolean)
      onSongCreated({
        title: `${quickTopics[Math.floor(Math.random() * quickTopics.length)]} ${selectedLanguage?.name || 'Song'}`,
        language: selectedLanguage?.name || "Spanish",
        flag: selectedLanguage?.flag || "🇪🇸",
        words: wordList,
        genre
      })
    }
    
    // Close after success
    setTimeout(() => {
      onClose()
    }, 1500)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-foreground/20 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg bg-card/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50">
          <div>
            <h2 className="text-lg font-medium text-foreground">Create New Song</h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Step {step} of 2 - {step === 1 ? "Add vocabulary" : "Choose style"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Progress indicator */}
          <div className="flex gap-2 mb-6">
            <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 1 ? 'bg-foreground' : 'bg-secondary'}`} />
            <div className={`flex-1 h-1 rounded-full transition-colors ${step >= 2 ? 'bg-foreground' : 'bg-secondary'}`} />
          </div>

          {/* Generating state */}
          {isGenerating && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-16 h-16 rounded-full bg-secondary flex items-center justify-center">
                <LoaderIcon className="h-8 w-8 text-foreground" />
              </div>
              <div className="text-center">
                <p className="text-foreground font-medium">Creating your song...</p>
                <p className="text-sm text-muted-foreground mt-1">This usually takes a few seconds</p>
              </div>
              <WaveformIcon className="h-6 w-24 text-coral" />
            </div>
          )}

          {/* Success state */}
          {showSuccess && !isGenerating && (
            <div className="flex flex-col items-center justify-center py-12 gap-4">
              <div className="w-16 h-16 rounded-full bg-sage/20 flex items-center justify-center">
                <CheckIcon className="h-8 w-8 text-sage" />
              </div>
              <div className="text-center">
                <p className="text-foreground font-medium">Your song is ready!</p>
                <p className="text-sm text-muted-foreground mt-1">Added to your library</p>
              </div>
            </div>
          )}

          {/* Step 1: Language & Words */}
          {step === 1 && !isGenerating && !showSuccess && (
            <div className="space-y-5">
              {/* Language selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Target Language
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`flex flex-col items-center gap-1 p-3 rounded-xl border transition-all ${
                        language === lang.code 
                          ? 'bg-foreground text-background border-foreground' 
                          : 'bg-secondary/50 text-foreground border-border/50 hover:border-foreground/50'
                      }`}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span className="text-xs font-medium">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Words input */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Words to learn
                </label>
                <textarea
                  ref={textareaRef}
                  value={words}
                  onChange={(e) => setWords(e.target.value)}
                  placeholder="Enter words separated by commas or new lines...&#10;e.g., hola, gracias, buenos dias"
                  className="h-28 w-full resize-none rounded-xl border border-border/50 bg-background/50 px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-2 focus:ring-foreground/10 transition-all"
                />
                <div className="mt-2 flex flex-wrap gap-2">
                  {quickTopics.map((topic) => (
                    <button
                      key={topic}
                      onClick={() => setWords(prev => prev ? `${prev}, ${topic.toLowerCase()}` : topic.toLowerCase())}
                      className="rounded-full border border-border/50 bg-background/50 px-3 py-1.5 text-xs font-medium text-muted-foreground transition-all hover:border-foreground hover:text-foreground hover:bg-secondary/50"
                    >
                      + {topic}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Step 2: Genre selection */}
          {step === 2 && !isGenerating && !showSuccess && (
            <div className="space-y-5">
              {/* Selected language summary */}
              <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 border border-border/50">
                <span className="text-2xl">{selectedLanguage?.flag}</span>
                <div>
                  <p className="text-sm font-medium text-foreground">{selectedLanguage?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {words.split(/[,\n]/).filter(w => w.trim()).length} words selected
                  </p>
                </div>
              </div>

              {/* Genre selection */}
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Choose a style
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {genres.map((g) => (
                    <button
                      key={g}
                      onClick={() => setGenre(g)}
                      className={`p-4 rounded-xl border text-center transition-all ${
                        genre === g 
                          ? 'bg-foreground text-background border-foreground' 
                          : 'bg-secondary/50 text-foreground border-border/50 hover:border-foreground/50'
                      }`}
                    >
                      <span className="text-sm font-medium">{g}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preview */}
              <div className="p-4 rounded-xl bg-coral/10 border border-coral/20">
                <p className="text-xs text-muted-foreground mb-1">Preview</p>
                <p className="text-sm text-foreground">
                  A <span className="font-medium text-coral">{genre}</span> song in{" "}
                  <span className="font-medium text-coral">{selectedLanguage?.name}</span> with your vocabulary
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {!isGenerating && !showSuccess && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-secondary/30">
            {step === 1 ? (
              <>
                <Button
                  variant="ghost"
                  onClick={onClose}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => setStep(2)}
                  disabled={!words.trim()}
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6"
                >
                  Continue
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  onClick={() => setStep(1)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  Back
                </Button>
                <Button
                  onClick={handleGenerate}
                  className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-6 group"
                >
                  <SparkleIcon className="mr-2 h-4 w-4 transition-transform group-hover:scale-110 group-hover:rotate-12" />
                  Generate Song
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
