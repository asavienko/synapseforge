"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useScrollAnimation } from "@/hooks/use-scroll-animation"
import { 
  SongIcon, 
  TargetIcon, 
  MicrophoneIcon, 
  BrainIcon, 
  UsersIcon, 
  ArrowIcon,
  CirclePatternGraphic,
  HeadphonesIcon,
  ConfettiDecoration
} from "@/components/icons"

const features = [
  {
    icon: SongIcon,
    title: "AI Song Generation",
    description: "Generate custom songs with your vocabulary in any genre. Melodies that stick.",
    accent: "coral",
    action: "scroll-hero",
    actionLabel: "Try it now",
  },
  {
    icon: MicrophoneIcon,
    title: "Karaoke Practice",
    description: "Sing along with highlighted lyrics and get pronunciation feedback.",
    accent: "sage",
    action: "/library",
    actionLabel: "Browse songs",
  },
  {
    icon: BrainIcon,
    title: "Spaced Repetition",
    description: "Smart scheduling for maximum retention and long-term memory.",
    accent: "lavender",
    action: "/get-started",
    actionLabel: "Get started",
  },
]

export function ServicesSection() {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)
  const router = useRouter()
  const { ref: sectionRef, isVisible } = useScrollAnimation({ threshold: 0.2 })

  const handleFeatureClick = (action: string) => {
    if (action === "scroll-hero") {
      const heroSection = document.querySelector('section')
      if (heroSection) {
        heroSection.scrollIntoView({ behavior: 'smooth' })
        setTimeout(() => {
          const textarea = document.querySelector('textarea')
          if (textarea) textarea.focus()
        }, 800)
      }
    } else if (action.startsWith('/')) {
      router.push(action)
    }
  }

  return (
    <section ref={sectionRef} id="features" className="py-24 lg:py-32 bg-card relative overflow-hidden">
      {/* Minimal decorative element */}
      <CirclePatternGraphic className="absolute bottom-0 right-0 w-40 h-40 text-foreground/15" />
      
      <div className="mx-auto max-w-6xl px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-16">
          <div>
            <p className="text-sm font-medium text-coral tracking-wide uppercase mb-3">Features</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
              Everything you need to
              <br />
              <span className="italic">learn effectively</span>
            </h2>
          </div>
          <p className="text-muted-foreground max-w-md lg:text-right">
            From song generation to practice modes to progress tracking, all in one place.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 md:gap-5">
          {features.map((feature, index) => {
            const colorClasses = {
              coral: { bg: 'bg-coral/10', text: 'text-coral', glow: 'from-coral/10' },
              lavender: { bg: 'bg-lavender/10', text: 'text-lavender', glow: 'from-lavender/10' },
              sage: { bg: 'bg-sage/10', text: 'text-sage', glow: 'from-sage/10' },
            }[feature.accent] || { bg: 'bg-coral/10', text: 'text-coral', glow: 'from-coral/10' }
            
            return (
              <button 
                key={feature.title}
                onClick={() => handleFeatureClick(feature.action)}
                onMouseEnter={() => setHoveredIndex(index)}
                onMouseLeave={() => setHoveredIndex(null)}
                className={`group relative rounded-2xl overflow-hidden text-left transition-all duration-300 ${
                  hoveredIndex === index ? 'scale-[1.02]' : ''
                } ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}
                style={{ 
                  transitionDelay: isVisible ? `${index * 150}ms` : '0ms',
                  transitionProperty: 'opacity, transform'
                }}
              >
                {/* Multi-layered glass background - Apple style */}
                <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background/50 backdrop-blur-2xl" />
                <div className={`absolute inset-0 bg-gradient-to-br ${colorClasses.glow} via-transparent to-transparent`} />
                <div className="absolute inset-[1px] rounded-2xl border border-background/80" />
                <div className={`absolute inset-0 rounded-2xl border transition-colors duration-300 ${
                  hoveredIndex === index ? 'border-foreground/15' : 'border-foreground/[0.06]'
                }`} />
                
                {/* Hover glow */}
                <div className={`absolute -inset-4 ${colorClasses.glow.replace('from-', 'bg-').replace('/10', '/20')} rounded-full blur-3xl opacity-0 group-hover:opacity-60 transition-opacity duration-500`} />
                
                <div className="relative z-10 p-6">
                  {/* Icon with gradient background */}
                  <div className="relative mb-4">
                    <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${colorClasses.bg} transition-transform duration-300 group-hover:scale-105`}>
                      <feature.icon className={`h-6 w-6 ${colorClasses.text}`} />
                    </div>
                    <div className={`absolute inset-0 ${colorClasses.bg} blur-xl rounded-2xl opacity-50`} />
                  </div>
                  
                  <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                    {feature.title}
                    <ArrowIcon className={`h-4 w-4 transition-all duration-300 ${
                      hoveredIndex === index 
                        ? 'opacity-100 translate-x-0' 
                        : 'opacity-0 -translate-x-2'
                    }`} />
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                    {feature.description}
                  </p>
                  
                  {/* Action label on hover */}
                  <span className={`text-xs font-medium transition-all duration-300 ${
                    hoveredIndex === index ? 'opacity-100' : 'opacity-0'
                  } ${colorClasses.text}`}>
                    {feature.actionLabel}
                  </span>
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </section>
  )
}
