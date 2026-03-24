"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { DemoPlayer } from "./demo-player"

const steps = [
  { 
    number: "01", 
    title: "Type your words", 
    description: "Enter vocabulary or pick a topic",
    action: "scroll-hero",
    actionLabel: "Try it now"
  },
  { 
    number: "02", 
    title: "Choose a style", 
    description: "Select genre, mood, and voice",
    action: "scroll-hero",
    actionLabel: "Pick a style"
  },
  { 
    number: "03", 
    title: "Generate", 
    description: "AI creates your custom song",
    action: "/get-started",
    actionLabel: "Start creating"
  },
  { 
    number: "04", 
    title: "Practice", 
    description: "Karaoke, quizzes, and more",
    action: "/library",
    actionLabel: "Browse songs"
  },
]

export function AboutSection() {
  const [activeStep, setActiveStep] = useState(2)
  const [hoveredStep, setHoveredStep] = useState<number | null>(null)
  const router = useRouter()

  const handleStepClick = (index: number) => {
    setActiveStep(index)
    const step = steps[index]
    
    if (step.action === "scroll-hero") {
      // Scroll to hero section and focus on generator
      const heroSection = document.querySelector('section')
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth' })
        // Focus on the textarea after scrolling
        setTimeout(() => {
          const textarea = document.querySelector('textarea')
          if (textarea) textarea.focus()
        }, 800)
      }
    } else if (step.action.startsWith('/')) {
      // Navigate to page
      router.push(step.action)
    }
  }

  return (
    <section id="how-it-works" className="py-24 lg:py-32">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">
        <div className="text-center mb-16">
          <p className="text-sm font-medium text-coral tracking-wide uppercase mb-3">How It Works</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
            From words to song
            <br />
            <span className="italic">in minutes</span>
          </h2>
        </div>

        {/* Steps - Apple liquid glass */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-16">
          {steps.map((step, index) => (
            <button
              key={step.number}
              onClick={() => handleStepClick(index)}
              onMouseEnter={() => setHoveredStep(index)}
              onMouseLeave={() => setHoveredStep(null)}
              className="group text-left relative rounded-2xl overflow-hidden transition-all duration-300"
            >
              {/* Glass layers */}
              {activeStep === index ? (
                <>
                  <div className="absolute inset-0 bg-foreground" />
                  <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-foreground/90" />
                  <div className="absolute inset-[1px] rounded-2xl border border-background/10" />
                  {/* Active glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-coral/20 to-lavender/20" />
                </>
              ) : (
                <>
                  <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background/50 backdrop-blur-2xl" />
                  <div className="absolute inset-0 bg-gradient-to-br from-lavender/5 via-transparent to-coral/5" />
                  <div className="absolute inset-[1px] rounded-2xl border border-background/80" />
                  <div className="absolute inset-0 rounded-2xl border border-foreground/[0.06] group-hover:border-foreground/10 transition-colors" />
                </>
              )}
              
              <div className="relative z-10 p-5 md:p-6">
                <span className={`text-xs font-mono ${activeStep === index ? 'text-background/60' : 'text-muted-foreground'}`}>
                  {step.number}
                </span>
                <h3 className={`mt-2 font-semibold ${activeStep === index ? 'text-background' : 'text-foreground'}`}>
                  {step.title}
                </h3>
                <p className={`mt-1 text-sm ${activeStep === index ? 'text-background/70' : 'text-muted-foreground'}`}>
                  {step.description}
                </p>
                
                {/* Action indicator on hover */}
                <div className={`mt-3 flex items-center gap-1.5 text-xs font-medium transition-all duration-300 ${
                  hoveredStep === index || activeStep === index ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
                } ${activeStep === index ? 'text-coral' : 'text-coral'}`}>
                  <span>{step.actionLabel}</span>
                  <svg className="w-3 h-3 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Demo Player */}
        <DemoPlayer />
      </div>
    </section>
  )
}
