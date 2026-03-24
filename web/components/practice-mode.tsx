"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Check, X, RotateCcw, Trophy, Zap, Target, ArrowRight } from "lucide-react"

const practiceWords = [
  { word: "restaurant", translation: "restaurante", audio: "res-tau-ran-te" },
  { word: "delicious", translation: "delicioso", audio: "de-li-ci-o-so" },
  { word: "menu", translation: "menu", audio: "me-nu" },
  { word: "order", translation: "pedir", audio: "pe-dir" },
  { word: "check please", translation: "la cuenta por favor", audio: "la cuen-ta por fa-vor" },
]

const fillInBlanks = [
  { sentence: "I walked into the ___", answer: "restaurant", options: ["restaurant", "kitchen", "garden", "office"] },
  { sentence: "The food smells ___", answer: "delicious", options: ["delicious", "terrible", "strange", "normal"] },
  { sentence: "Can I see the ___?", answer: "menu", options: ["menu", "window", "door", "car"] },
]

type PracticeMode = "flashcards" | "fillblank" | "matching"

export function PracticeMode() {
  const [mode, setMode] = useState<PracticeMode>("flashcards")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isFlipped, setIsFlipped] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [showResult, setShowResult] = useState(false)
  const [matchedPairs, setMatchedPairs] = useState<string[]>([])
  const [selectedWord, setSelectedWord] = useState<string | null>(null)
  const [shuffledTranslations, setShuffledTranslations] = useState<string[]>([])
  const [wrongPair, setWrongPair] = useState<string | null>(null)

  useEffect(() => {
    if (mode === "matching") {
      setShuffledTranslations([...practiceWords.map(w => w.translation)].sort(() => Math.random() - 0.5))
      setMatchedPairs([])
      setSelectedWord(null)
    }
  }, [mode])

  const handleFlashcardNext = (correct: boolean) => {
    if (correct) {
      setScore(prev => prev + 10)
      setStreak(prev => prev + 1)
    } else {
      setStreak(0)
    }
    setIsFlipped(false)
    setTimeout(() => setCurrentIndex(prev => (prev + 1) % practiceWords.length), 200)
  }

  const handleFillBlankAnswer = (answer: string) => {
    setSelectedAnswer(answer)
    setShowResult(true)
    if (answer === fillInBlanks[currentIndex].answer) {
      setScore(prev => prev + 15)
      setStreak(prev => prev + 1)
    } else {
      setStreak(0)
    }
    setTimeout(() => {
      setShowResult(false)
      setSelectedAnswer(null)
      setCurrentIndex(prev => (prev + 1) % fillInBlanks.length)
    }, 1500)
  }

  const handleMatchingClick = (item: string, type: 'word' | 'translation') => {
    if (matchedPairs.includes(item)) return
    if (type === 'word') {
      setSelectedWord(item)
      setWrongPair(null)
    } else if (selectedWord) {
      const wordData = practiceWords.find(w => w.word === selectedWord)
      if (wordData && wordData.translation === item) {
        setMatchedPairs(prev => [...prev, selectedWord, item])
        setScore(prev => prev + 20)
        setStreak(prev => prev + 1)
        setSelectedWord(null)
      } else {
        setStreak(0)
        setWrongPair(item)
        setTimeout(() => { setWrongPair(null); setSelectedWord(null) }, 500)
      }
    }
  }

  const resetGame = () => {
    setCurrentIndex(0)
    setScore(0)
    setStreak(0)
    setIsFlipped(false)
    setSelectedAnswer(null)
    setShowResult(false)
    setMatchedPairs([])
    setSelectedWord(null)
    if (mode === "matching") {
      setShuffledTranslations([...practiceWords.map(w => w.translation)].sort(() => Math.random() - 0.5))
    }
  }

  return (
    <section id="practice" className="py-24 lg:py-32 bg-secondary/20">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 rounded-full bg-card border-2 border-border px-4 py-2 text-sm font-medium text-foreground mb-6">
            <span className="w-2 h-2 rounded-full bg-coral animate-pulse" />
            Interactive Practice
          </div>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground text-balance leading-tight">
            Try Different
            <br />
            <span className="text-primary">Practice Modes</span>
          </h2>
        </div>

        {/* Mode Selector */}
        <div className="flex justify-center gap-2 mb-8">
          {[
            { id: "flashcards", label: "Flashcards", icon: RotateCcw, color: "coral" },
            { id: "fillblank", label: "Fill Blank", icon: Target, color: "blue" },
            { id: "matching", label: "Matching", icon: Zap, color: "green" },
          ].map(({ id, label, icon: Icon, color }) => (
            <Button
              key={id}
              variant={mode === id ? "default" : "secondary"}
              onClick={() => { setMode(id as PracticeMode); resetGame() }}
              className={`gap-2 rounded-full transition-all ${mode === id ? 'scale-105 shadow-lg shadow-primary/30' : ''}`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </Button>
          ))}
        </div>

        {/* Score Display */}
        <div className="flex justify-center gap-4 mb-8">
          <div className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-card border-2 border-border">
            <Trophy className="h-4 w-4 text-yellow" />
            <span className="font-bold text-foreground">{score}</span>
            <span className="text-sm text-muted-foreground">points</span>
          </div>
          <div className={`flex items-center gap-2 px-5 py-2.5 rounded-full transition-all ${streak >= 3 ? 'bg-coral/20 border-2 border-coral/40' : 'bg-card border-2 border-border'}`}>
            <Zap className={`h-4 w-4 ${streak >= 3 ? 'text-coral animate-pulse' : 'text-muted-foreground'}`} />
            <span className="font-bold text-foreground">{streak}</span>
            <span className="text-sm text-muted-foreground">streak</span>
          </div>
        </div>

        {/* Practice Area */}
        <div className="bg-card border-2 border-border rounded-3xl overflow-hidden">
          <div className="p-8">
            {/* Flashcards Mode */}
            {mode === "flashcards" && (
              <div className="space-y-6">
                <div className="relative h-64 cursor-pointer perspective-1000" onClick={() => setIsFlipped(!isFlipped)}>
                  <div className={`absolute inset-0 transition-all duration-500 preserve-3d ${isFlipped ? 'rotate-y-180' : ''}`}>
                    <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-coral/10 border-2 border-coral/30 backface-hidden ${isFlipped ? 'invisible' : ''}`}>
                      <p className="text-3xl font-bold text-foreground">{practiceWords[currentIndex].word}</p>
                      <p className="mt-4 text-sm text-muted-foreground">Click to reveal</p>
                    </div>
                    <div className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl bg-blue/10 border-2 border-blue/30 backface-hidden rotate-y-180 ${!isFlipped ? 'invisible' : ''}`}>
                      <p className="text-3xl font-bold text-foreground">{practiceWords[currentIndex].translation}</p>
                      <p className="mt-2 text-sm text-blue font-mono">{practiceWords[currentIndex].audio}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-center gap-4">
                  <Button variant="outline" onClick={() => handleFlashcardNext(false)} className="gap-2 rounded-full border-2">
                    <X className="h-4 w-4" /> Still Learning
                  </Button>
                  <Button onClick={() => handleFlashcardNext(true)} className="gap-2 rounded-full">
                    <Check className="h-4 w-4" /> Got It!
                  </Button>
                </div>

                <div className="flex justify-center gap-1">
                  {practiceWords.map((_, i) => (
                    <div key={i} className={`h-2 w-10 rounded-full transition-colors ${i === currentIndex ? 'bg-primary' : i < currentIndex ? 'bg-primary/40' : 'bg-secondary'}`} />
                  ))}
                </div>
              </div>
            )}

            {/* Fill in the Blank Mode */}
            {mode === "fillblank" && (
              <div className="space-y-8">
                <div className="text-center">
                  <p className="text-2xl font-bold text-foreground">
                    {fillInBlanks[currentIndex].sentence.split("___")[0]}
                    <span className={`inline-block min-w-[120px] mx-2 px-4 py-1 rounded-xl border-2 border-dashed transition-all ${
                      showResult
                        ? selectedAnswer === fillInBlanks[currentIndex].answer
                          ? 'border-green bg-green/20 text-green'
                          : 'border-coral bg-coral/20 text-coral'
                        : 'border-primary/50'
                    }`}>
                      {selectedAnswer || "___"}
                    </span>
                    {fillInBlanks[currentIndex].sentence.split("___")[1]}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
                  {fillInBlanks[currentIndex].options.map((option) => (
                    <Button
                      key={option}
                      variant="outline"
                      disabled={showResult}
                      onClick={() => handleFillBlankAnswer(option)}
                      className={`py-6 text-lg rounded-2xl border-2 transition-all hover:scale-105 ${
                        showResult && option === fillInBlanks[currentIndex].answer
                          ? 'bg-green text-white border-green'
                          : showResult && option === selectedAnswer && option !== fillInBlanks[currentIndex].answer
                            ? 'bg-coral/20 text-coral border-coral'
                            : ''
                      }`}
                    >
                      {option}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Matching Mode */}
            {mode === "matching" && (
              <div className="space-y-6">
                {matchedPairs.length === practiceWords.length * 2 ? (
                  <div className="text-center py-8">
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-yellow/20 mb-4">
                      <Trophy className="h-10 w-10 text-yellow" />
                    </div>
                    <p className="text-2xl font-bold text-foreground mb-2">Perfect Match!</p>
                    <p className="text-muted-foreground mb-6">You matched all {practiceWords.length} pairs</p>
                    <Button onClick={resetGame} className="gap-2 rounded-full">
                      <RotateCcw className="h-4 w-4" /> Play Again
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-8">
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-muted-foreground mb-3 text-center uppercase tracking-wider">English</p>
                      {practiceWords.map(({ word }) => (
                        <button
                          key={word}
                          disabled={matchedPairs.includes(word)}
                          onClick={() => handleMatchingClick(word, 'word')}
                          className={`w-full py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                            matchedPairs.includes(word)
                              ? 'bg-green/20 border-green/50 text-green opacity-50'
                              : selectedWord === word
                                ? 'bg-primary text-primary-foreground border-primary scale-105'
                                : 'bg-card border-border hover:border-primary hover:bg-primary/5'
                          }`}
                        >
                          {word}
                        </button>
                      ))}
                    </div>
                    <div className="space-y-2">
                      <p className="text-xs font-bold text-muted-foreground mb-3 text-center uppercase tracking-wider">Spanish</p>
                      {shuffledTranslations.map((translation) => (
                        <button
                          key={translation}
                          disabled={matchedPairs.includes(translation)}
                          onClick={() => handleMatchingClick(translation, 'translation')}
                          className={`w-full py-3 px-4 rounded-xl border-2 text-sm font-medium transition-all ${
                            matchedPairs.includes(translation)
                              ? 'bg-green/20 border-green/50 text-green opacity-50'
                              : wrongPair === translation
                                ? 'bg-coral/20 border-coral text-coral animate-shake'
                                : 'bg-card border-border hover:border-blue hover:bg-blue/5'
                          }`}
                        >
                          {translation}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mt-8 text-center">
          <Button size="lg" className="gap-2 rounded-full px-8">
            Try Full Practice Mode <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <style jsx>{`
        .perspective-1000 { perspective: 1000px; }
        .preserve-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-y-180 { transform: rotateY(180deg); }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-4px); }
          75% { transform: translateX(4px); }
        }
        .animate-shake { animation: shake 0.3s ease-in-out; }
      `}</style>
    </section>
  )
}
