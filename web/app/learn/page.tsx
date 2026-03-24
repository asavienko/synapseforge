import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { LANGUAGES } from "@/lib/constants"

export const metadata: Metadata = {
  title: "Learn Languages Through Music - LyricLingo",
  description: "Choose from 100+ languages to learn with AI-generated songs. Spanish, French, Japanese, Korean, Mandarin, and more. Start your musical language journey today.",
  openGraph: {
    title: "Learn Any Language with Music | LyricLingo",
    description: "Master vocabulary in 100+ languages through personalized AI-generated songs.",
  },
}

const featuredLanguages = [
  { code: "spanish", name: "Spanish", flag: "🇪🇸", learners: "2M+" },
  { code: "french", name: "French", flag: "🇫🇷", learners: "1.5M+" },
  { code: "japanese", name: "Japanese", flag: "🇯🇵", learners: "800K+" },
  { code: "korean", name: "Korean", flag: "🇰🇷", learners: "600K+" },
  { code: "mandarin", name: "Mandarin", flag: "🇨🇳", learners: "500K+" },
  { code: "german", name: "German", flag: "🇩🇪", learners: "400K+" },
  { code: "italian", name: "Italian", flag: "🇮🇹", learners: "350K+" },
  { code: "portuguese", name: "Portuguese", flag: "🇧🇷", learners: "300K+" },
]

const allLanguages = [
  { name: "Arabic", flag: "🇸🇦" },
  { name: "Bengali", flag: "🇧🇩" },
  { name: "Cantonese", flag: "🇭🇰" },
  { name: "Czech", flag: "🇨🇿" },
  { name: "Danish", flag: "🇩🇰" },
  { name: "Dutch", flag: "🇳🇱" },
  { name: "Finnish", flag: "🇫🇮" },
  { name: "Greek", flag: "🇬🇷" },
  { name: "Hebrew", flag: "🇮🇱" },
  { name: "Hindi", flag: "🇮🇳" },
  { name: "Hungarian", flag: "🇭🇺" },
  { name: "Indonesian", flag: "🇮🇩" },
  { name: "Norwegian", flag: "🇳🇴" },
  { name: "Polish", flag: "🇵🇱" },
  { name: "Romanian", flag: "🇷🇴" },
  { name: "Russian", flag: "🇷🇺" },
  { name: "Swedish", flag: "🇸🇪" },
  { name: "Thai", flag: "🇹🇭" },
  { name: "Turkish", flag: "🇹🇷" },
  { name: "Ukrainian", flag: "🇺🇦" },
  { name: "Vietnamese", flag: "🇻🇳" },
  { name: "Swahili", flag: "🇰🇪" },
  { name: "Tagalog", flag: "🇵🇭" },
  { name: "Malay", flag: "🇲🇾" },
]

export default function LearnPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-coral/5 via-transparent to-transparent" />
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Learn Any Language
                <span className="block text-coral mt-1">Through Music</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Choose from over 100 languages and start learning with AI-generated songs 
                tailored to your vocabulary and musical preferences.
              </p>
            </div>
          </div>
        </section>

        {/* Featured Languages */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
              Most Popular Languages
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Join millions of learners already mastering these languages through music.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {featuredLanguages.map((lang) => (
                <Link
                  key={lang.code}
                  href={`/learn/${lang.code}`}
                  className="p-6 rounded-2xl bg-card border border-border/50 hover:border-coral/30 transition-all hover:shadow-lg group"
                >
                  <div className="text-4xl mb-3">{lang.flag}</div>
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-coral transition-colors">
                    {lang.name}
                  </h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    {lang.learners} learners
                  </p>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* All Languages */}
        <section className="py-16 sm:py-24 bg-secondary/30">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
              All Available Languages
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {[...featuredLanguages, ...allLanguages].map((lang) => {
                const code = 'code' in lang ? lang.code : lang.name.toLowerCase()
                return (
                  <Link
                    key={lang.name}
                    href={`/learn/${code}`}
                    className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/50 hover:border-coral/30 transition-colors"
                  >
                    <span className="text-xl">{lang.flag}</span>
                    <span className="text-sm font-medium truncate">{lang.name}</span>
                  </Link>
                )
              })}
            </div>
            <p className="text-center text-sm text-muted-foreground mt-8">
              And many more! We support 100+ languages and are constantly adding new ones.
            </p>
          </div>
        </section>

        {/* Why Learn With Music */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
              Why Learn Languages Through Music?
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-coral/10 text-coral flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">3x Better Retention</h3>
                <p className="text-sm text-muted-foreground">
                  Music activates multiple brain regions, creating stronger memory pathways.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-lavender/10 text-lavender flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Actually Enjoyable</h3>
                <p className="text-sm text-muted-foreground">
                  Learning feels like listening to your favorite music, not studying.
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-mint/10 text-mint flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Learn Anywhere</h3>
                <p className="text-sm text-muted-foreground">
                  Study during commutes, workouts, or relaxation—no screen required.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-transparent to-coral/5">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Start Your Language Journey
            </h2>
            <p className="text-muted-foreground mb-8">
              Pick any language above and create your first song in under a minute.
            </p>
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors text-lg"
            >
              Get Started Free
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
