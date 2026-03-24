import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Music Genres - LyricLingo",
  description: "Learn languages through your favorite music genres. Pop, Jazz, Rock, Hip Hop, and more. Choose your style and start learning with AI-generated songs.",
  openGraph: {
    title: "Choose Your Music Genre | LyricLingo",
    description: "Learn any language through your favorite music style.",
  },
}

const genres = [
  {
    id: "pop",
    name: "Pop",
    description: "Catchy, upbeat melodies perfect for memorization",
    mood: "Upbeat & Energetic",
    tempo: "100-130 BPM",
    color: "coral",
  },
  {
    id: "jazz",
    name: "Jazz",
    description: "Smooth, sophisticated sounds for relaxed learning",
    mood: "Relaxed & Sophisticated",
    tempo: "60-100 BPM",
    color: "lavender",
  },
  {
    id: "rock",
    name: "Rock",
    description: "Energetic rhythms for memorable learning",
    mood: "Powerful & Intense",
    tempo: "100-140 BPM",
    color: "coral",
  },
  {
    id: "hip-hop",
    name: "Hip Hop",
    description: "Rhythmic, word-dense tracks for rapid vocabulary",
    mood: "Confident & Dynamic",
    tempo: "85-115 BPM",
    color: "mint",
  },
  {
    id: "acoustic",
    name: "Acoustic",
    description: "Gentle, organic sounds for focused learning",
    mood: "Intimate & Focused",
    tempo: "60-100 BPM",
    color: "mint",
  },
  {
    id: "rnb",
    name: "R&B",
    description: "Soulful grooves for emotional connection",
    mood: "Soulful & Smooth",
    tempo: "70-100 BPM",
    color: "lavender",
  },
  {
    id: "electronic",
    name: "Electronic",
    description: "Modern beats for energetic learning sessions",
    mood: "Energetic & Modern",
    tempo: "120-150 BPM",
    color: "coral",
  },
  {
    id: "folk",
    name: "Folk",
    description: "Storytelling traditions for narrative learning",
    mood: "Warm & Nostalgic",
    tempo: "70-110 BPM",
    color: "mint",
  },
]

export default function GenresPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-lavender/5 via-transparent to-transparent" />
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Learn in Your
                <span className="block text-lavender mt-1">Favorite Genre</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Music preferences are personal. That's why we let you learn in any genre you love. 
                Pop, Jazz, Hip Hop, or Folk—your vocabulary comes wrapped in music that motivates you.
              </p>
            </div>
          </div>
        </section>

        {/* Genres Grid */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {genres.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/genres/${genre.id}`}
                  className={`p-6 rounded-2xl bg-card border border-border/50 hover:border-${genre.color}/30 transition-all hover:shadow-lg group`}
                >
                  <h2 className={`text-xl font-semibold text-foreground group-hover:text-${genre.color} transition-colors mb-2`}>
                    {genre.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">{genre.description}</p>
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div>{genre.mood}</div>
                    <div>{genre.tempo}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Why Genre Matters */}
        <section className="py-16 sm:py-24 bg-secondary/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
              Why Genre Matters for Learning
            </h2>
            <div className="grid sm:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-coral/10 text-coral flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Emotional Connection</h3>
                <p className="text-sm text-muted-foreground">
                  Music you love creates stronger emotional bonds with vocabulary
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-lavender/10 text-lavender flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Consistent Practice</h3>
                <p className="text-sm text-muted-foreground">
                  You'll actually want to listen again when you love the music
                </p>
              </div>
              <div className="text-center p-6">
                <div className="w-16 h-16 rounded-2xl bg-mint/10 text-mint flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2">Better Memory</h3>
                <p className="text-sm text-muted-foreground">
                  Familiar musical patterns help encode vocabulary faster
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Mix Genres for Variety
            </h2>
            <p className="text-muted-foreground mb-8">
              Don't stick to just one! Many learners find variety keeps them engaged longer.
            </p>
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors text-lg"
            >
              Start Creating Songs
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
