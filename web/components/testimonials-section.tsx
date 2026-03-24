"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { 
  CheckIcon, 
  ChevronLeftIcon, 
  ChevronRightIcon, 
  QuoteIcon,
  WavyLineGraphic,
  StarIcon,
  SparkleIcon,
  BlobGraphic
} from "@/components/icons"

const testimonials = [
  {
    quote: "I used to dread learning Spanish vocabulary. Now I actually look forward to it. The songs get stuck in my head.",
    author: "Maria S.",
    role: "Spanish Learner",
    rating: 5,
  },
  {
    quote: "My German test scores improved dramatically. Instead of boring flashcards, I generate songs with my vocab lists.",
    author: "James L.",
    role: "German Major",
    rating: 5,
  },
  {
    quote: "My students are actually excited about vocabulary homework now. The classroom tools are amazing.",
    author: "Elena M.",
    role: "Language Teacher",
    rating: 5,
  },
]

const pricingTiers = [
  {
    name: "Free",
    monthlyPrice: 0,
    yearlyPrice: 0,
    description: "Try LyricLingo",
    features: ["3 songs per day", "Basic genres", "7-day history"],
    cta: "Get Started",
    highlighted: false,
    accent: "sage",
  },
  {
    name: "Supporter",
    monthlyPrice: 5,
    yearlyPrice: 48,
    description: "For serious learners",
    features: ["Unlimited songs", "All genres", "Pronunciation feedback", "Spaced repetition"],
    cta: "Start Learning",
    highlighted: true,
    accent: "coral",
  },
  {
    name: "Pro",
    monthlyPrice: 15,
    yearlyPrice: 144,
    description: "For teams",
    features: ["Everything in Supporter", "Classroom features", "API access", "Priority support"],
    cta: "Contact Sales",
    highlighted: false,
    accent: "lavender",
  },
]

export function TestimonialsSection() {
  const [isYearly, setIsYearly] = useState(false)
  const [currentTestimonial, setCurrentTestimonial] = useState(0)

  return (
    <section id="testimonials" className="py-24 lg:py-32 bg-card relative overflow-hidden">
      {/* Decorative elements */}
      <WavyLineGraphic className="absolute bottom-0 left-0 right-0 h-24 text-foreground/5" />
      <BlobGraphic className="absolute -top-32 -right-32 w-[400px] h-[400px] text-coral/10" />
      <BlobGraphic className="absolute -bottom-40 -left-40 w-[350px] h-[350px] text-lavender/10" />
      
      <div className="mx-auto max-w-6xl px-6 lg:px-8 relative z-10">
        {/* Testimonials */}
        <div className="mb-32">
          <p className="text-sm font-medium text-coral tracking-wide uppercase mb-3 text-center">Testimonials</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground text-center mb-12">
            What learners <span className="italic">say</span>
          </h2>

          <div className="relative max-w-2xl mx-auto">
            <QuoteIcon className="absolute -top-6 -left-6 w-20 h-20 text-coral/20" />
            
            {/* Apple liquid glass card */}
            <div className="relative rounded-3xl overflow-hidden">
              {/* Glass layers */}
              <div className="absolute inset-0 bg-gradient-to-b from-background/70 via-background/50 to-background/60 backdrop-blur-3xl" />
              <div className="absolute inset-0 bg-gradient-to-br from-coral/5 via-transparent to-lavender/5" />
              <div className="absolute inset-[1px] rounded-3xl border border-background/80" />
              <div className="absolute inset-0 rounded-3xl border border-foreground/[0.06]" />
              
              {/* Accent glows */}
              <div className="absolute -top-20 left-1/4 w-40 h-40 bg-coral/10 rounded-full blur-3xl" />
              <div className="absolute -bottom-20 right-1/4 w-40 h-40 bg-lavender/10 rounded-full blur-3xl" />
              
              <div className="relative z-10 p-8 sm:p-10">
                <div className="text-center">
                  {/* Star rating */}
                  <div className="flex justify-center gap-1 mb-6">
                    {Array.from({ length: testimonials[currentTestimonial].rating }).map((_, i) => (
                      <StarIcon key={i} className="h-5 w-5 text-coral" />
                    ))}
                  </div>
                  
                  <p className="text-xl sm:text-2xl text-foreground leading-relaxed mb-8">
                    &ldquo;{testimonials[currentTestimonial].quote}&rdquo;
                  </p>
                  
                  {/* Author avatar - glass style */}
                  <div className="relative w-14 h-14 rounded-full mx-auto mb-3">
                    <div className="absolute inset-0 bg-foreground/5 backdrop-blur-xl rounded-full" />
                    <div className="absolute inset-[1px] rounded-full border border-background/60" />
                    <div className="absolute inset-0 rounded-full border border-foreground/[0.08]" />
                    <div className="relative z-10 w-full h-full flex items-center justify-center">
                      <span className="text-lg font-semibold text-foreground">
                        {testimonials[currentTestimonial].author.charAt(0)}
                      </span>
                    </div>
                  </div>
                  <p className="font-semibold text-foreground">{testimonials[currentTestimonial].author}</p>
                  <p className="text-sm text-muted-foreground">{testimonials[currentTestimonial].role}</p>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4 mt-8">
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev - 1 + testimonials.length) % testimonials.length)}
                className="relative p-2.5 rounded-full overflow-hidden transition-all group"
              >
                <div className="absolute inset-0 bg-foreground/5 group-hover:bg-foreground/10 transition-colors" />
                <div className="absolute inset-[1px] rounded-full border border-foreground/[0.08]" />
                <ChevronLeftIcon className="h-5 w-5 relative z-10" />
              </button>
              <div className="flex gap-2">
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentTestimonial(i)}
                    className={`h-2 rounded-full transition-all ${
                      currentTestimonial === i ? 'bg-coral w-8' : 'bg-foreground/10 w-2 hover:bg-foreground/20'
                    }`}
                  />
                ))}
              </div>
              <button
                onClick={() => setCurrentTestimonial((prev) => (prev + 1) % testimonials.length)}
                className="relative p-2.5 rounded-full overflow-hidden transition-all group"
              >
                <div className="absolute inset-0 bg-foreground/5 group-hover:bg-foreground/10 transition-colors" />
                <div className="absolute inset-[1px] rounded-full border border-foreground/[0.08]" />
                <ChevronRightIcon className="h-5 w-5 relative z-10" />
              </button>
            </div>
          </div>
        </div>

        {/* Pricing */}
        <div id="pricing">
          <div className="text-center mb-12">
            <p className="text-sm font-medium text-lavender tracking-wide uppercase mb-3">Pricing</p>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
              Simple <span className="italic">pricing</span>
            </h2>
            
            <div className="mt-6 flex items-center justify-center gap-3">
              <span className={`text-sm transition-colors ${!isYearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Monthly
              </span>
              <Switch checked={isYearly} onCheckedChange={setIsYearly} />
              <span className={`text-sm transition-colors ${isYearly ? 'text-foreground font-medium' : 'text-muted-foreground'}`}>
                Yearly
              </span>
              {isYearly && (
                <span className="inline-flex items-center gap-1 text-xs font-medium text-sage bg-sage/20 px-2.5 py-1 rounded-full">
                  <SparkleIcon className="h-3 w-3" />
                  Save 20%
                </span>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-4 md:gap-5 max-w-4xl mx-auto">
            {pricingTiers.map((tier) => (
              <div 
                key={tier.name}
                className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
                  tier.highlighted ? 'scale-105 z-10' : 'hover:scale-[1.02]'
                }`}
              >
                {/* Glass layers */}
                {tier.highlighted ? (
                  <>
                    <div className="absolute inset-0 bg-foreground" />
                    <div className="absolute inset-0 bg-gradient-to-br from-foreground via-foreground to-foreground/90" />
                    <div className="absolute inset-[1px] rounded-2xl border border-background/10" />
                    <div className="absolute inset-0 bg-gradient-to-r from-coral/10 to-lavender/10" />
                    {/* Glow effect */}
                    <div className="absolute -inset-4 bg-coral/20 rounded-full blur-3xl" />
                  </>
                ) : (
                  <>
                    <div className="absolute inset-0 bg-gradient-to-b from-background/70 to-background/50 backdrop-blur-2xl" />
                    <div className={`absolute inset-0 bg-gradient-to-br ${
                      tier.accent === 'sage' ? 'from-sage/5' : 'from-lavender/5'
                    } via-transparent to-transparent`} />
                    <div className="absolute inset-[1px] rounded-2xl border border-background/80" />
                    <div className="absolute inset-0 rounded-2xl border border-foreground/[0.06] hover:border-foreground/10 transition-colors" />
                  </>
                )}
                
                {tier.highlighted && (
                  <div className="absolute -top-px left-1/2 -translate-x-1/2 flex items-center gap-1 bg-coral text-background text-xs font-semibold px-4 py-1.5 rounded-b-xl z-20">
                    <SparkleIcon className="h-3 w-3" />
                    Popular
                  </div>
                )}
                
                <div className="relative z-10 p-6 pt-8">
                  <h3 className={`font-semibold text-lg ${tier.highlighted ? 'text-background' : 'text-foreground'}`}>
                    {tier.name}
                  </h3>
                  <div className="mt-3 flex items-baseline">
                    <span className={`text-4xl font-bold tracking-tight ${tier.highlighted ? 'text-background' : 'text-foreground'}`}>
                      ${isYearly ? tier.yearlyPrice : tier.monthlyPrice}
                    </span>
                    {tier.monthlyPrice > 0 && (
                      <span className={`ml-1 text-sm ${tier.highlighted ? 'text-background/60' : 'text-muted-foreground'}`}>
                        /{isYearly ? 'yr' : 'mo'}
                      </span>
                    )}
                  </div>
                  <p className={`mt-2 text-sm ${tier.highlighted ? 'text-background/70' : 'text-muted-foreground'}`}>
                    {tier.description}
                  </p>
                  
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-sm">
                        <CheckIcon className={`h-5 w-5 shrink-0 ${
                          tier.highlighted ? 'text-coral' : 
                          tier.accent === 'sage' ? 'text-sage' :
                          tier.accent === 'lavender' ? 'text-lavender' : 'text-coral'
                        }`} />
                        <span className={tier.highlighted ? 'text-background' : 'text-foreground'}>{feature}</span>
                      </li>
                    ))}
                  </ul>

                  <button 
                    className={`relative w-full mt-6 h-11 rounded-xl font-semibold overflow-hidden transition-all group ${
                      tier.highlighted ? 'text-background' : 'text-background'
                    }`}
                  >
                    {tier.highlighted ? (
                      <>
                        <div className="absolute inset-0 bg-coral group-hover:bg-coral/90 transition-colors" />
                        <div className="absolute inset-[1px] rounded-xl border border-background/10" />
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-foreground group-hover:bg-foreground/90 transition-colors" />
                        <div className="absolute inset-[1px] rounded-xl border border-background/10" />
                      </>
                    )}
                    <span className="relative z-10">{tier.cta}</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
