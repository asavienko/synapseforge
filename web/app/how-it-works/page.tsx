import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "How It Works - LyricLingo | AI-Powered Music Language Learning",
  description: "Discover how LyricLingo uses AI to generate personalized songs that help you learn vocabulary 3x faster. Enter words, get custom songs, master languages.",
  openGraph: {
    title: "How LyricLingo Works",
    description: "Learn how our AI creates personalized songs to help you memorize vocabulary effortlessly.",
  },
}

const steps = [
  {
    number: "01",
    title: "Choose Your Language",
    description: "Select from over 100 languages. Whether you're learning Spanish for travel or Japanese for anime, we've got you covered.",
    details: [
      "100+ languages supported",
      "Native speaker pronunciation",
      "Regional dialect options",
      "Difficulty level selection",
    ],
    color: "coral",
  },
  {
    number: "02",
    title: "Enter Your Vocabulary",
    description: "Add the words you want to learn. Import from your class, pick a topic, or let our AI suggest words based on your level.",
    details: [
      "Manual word entry",
      "Topic-based vocabulary packs",
      "Import from Anki, Quizlet, etc.",
      "AI-powered word suggestions",
    ],
    color: "lavender",
  },
  {
    number: "03",
    title: "Pick Your Style",
    description: "Choose a music genre that matches your taste. Pop, Jazz, Hip Hop, Rock - your vocabulary comes wrapped in music you actually enjoy.",
    details: [
      "8+ music genres",
      "Tempo customization",
      "Mood selection",
      "Instrumental options",
    ],
    color: "mint",
  },
  {
    number: "04",
    title: "AI Generates Your Song",
    description: "Our AI composes a unique song incorporating your vocabulary naturally. Lyrics, melody, and production - all created in seconds.",
    details: [
      "Contextually accurate lyrics",
      "Natural word integration",
      "Catchy, memorable melodies",
      "Professional audio quality",
    ],
    color: "coral",
  },
  {
    number: "05",
    title: "Learn & Practice",
    description: "Listen, sing along, and tap words for instant translations. Spaced repetition ensures long-term retention.",
    details: [
      "Interactive lyrics display",
      "One-tap translations",
      "Pronunciation guides",
      "Progress tracking",
    ],
    color: "lavender",
  },
]

const features = [
  {
    title: "Spaced Repetition",
    description: "Songs resurface at optimal intervals based on memory science, ensuring vocabulary moves to long-term memory.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Contextual Learning",
    description: "Words appear in meaningful sentences within song lyrics, helping you understand usage and nuance.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: "Active Recall",
    description: "Singing along activates deeper memory pathways than passive listening, boosting retention significantly.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: "Emotional Connection",
    description: "Music creates emotional associations with words, making them more memorable and easier to recall.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
]

const faqs = [
  {
    q: "How long does it take to generate a song?",
    a: "Most songs are generated in under 30 seconds. Complex requests with many words may take up to a minute.",
  },
  {
    q: "Can I download my songs?",
    a: "Yes! Premium users can download songs in MP3 format to listen offline or share with friends.",
  },
  {
    q: "How accurate are the translations?",
    a: "We use advanced AI models verified by native speakers. All translations are contextually appropriate.",
  },
  {
    q: "Does it work for complete beginners?",
    a: "Absolutely! We have beginner-friendly modes with simpler vocabulary and slower tempos.",
  },
]

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-lavender/5 via-transparent to-transparent" />
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <span className="inline-block px-4 py-1.5 rounded-full bg-lavender/10 text-lavender text-sm font-medium mb-6">
                The Science of Musical Learning
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Five Simple Steps to
                <span className="block text-lavender mt-1">Language Mastery</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Our AI-powered platform transforms vocabulary learning from a chore into a 
                musical experience. Here's exactly how it works.
              </p>
            </div>
          </div>
        </section>

        {/* Steps Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="space-y-16 sm:space-y-24">
              {steps.map((step, index) => (
                <div
                  key={step.number}
                  className={`flex flex-col ${index % 2 === 1 ? 'md:flex-row-reverse' : 'md:flex-row'} gap-8 md:gap-12 items-center`}
                >
                  <div className="flex-1">
                    <div className={`text-5xl font-bold text-${step.color}/20 mb-2`}>
                      {step.number}
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                      {step.title}
                    </h2>
                    <p className="text-muted-foreground mb-6 leading-relaxed">
                      {step.description}
                    </p>
                    <ul className="space-y-2">
                      {step.details.map((detail) => (
                        <li key={detail} className="flex items-center gap-3 text-sm text-muted-foreground">
                          <svg className={`w-5 h-5 text-${step.color} flex-shrink-0`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex-1 w-full">
                    <div className={`aspect-video rounded-2xl bg-gradient-to-br from-${step.color}/10 to-${step.color}/5 border border-${step.color}/20 flex items-center justify-center`}>
                      <div className={`w-16 h-16 rounded-2xl bg-${step.color}/20 flex items-center justify-center`}>
                        <span className={`text-2xl font-bold text-${step.color}`}>{step.number}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Science Section */}
        <section className="py-16 sm:py-24 bg-secondary/30">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
                The Science Behind It
              </h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Our approach is grounded in decades of cognitive science research on music and memory.
              </p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="p-6 rounded-2xl bg-card border border-border/50"
                >
                  <div className="w-12 h-12 rounded-xl bg-coral/10 text-coral flex items-center justify-center mb-4">
                    {feature.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
              Common Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq) => (
                <div key={faq.q} className="p-6 rounded-2xl bg-card border border-border/50">
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
            <div className="text-center mt-8">
              <Link href="/faq" className="text-coral hover:underline text-sm">
                View all frequently asked questions →
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-transparent to-lavender/5">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Ready to Try It Yourself?
            </h2>
            <p className="text-muted-foreground mb-8">
              Create your first song in under a minute. No credit card required.
            </p>
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors text-lg"
            >
              Start Learning Free
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
