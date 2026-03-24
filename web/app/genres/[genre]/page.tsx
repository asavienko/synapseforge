import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { LANGUAGES, TOPICS } from "@/lib/constants"

interface GenrePageProps {
  params: Promise<{ genre: string }>
}

const genreData: Record<string, {
  name: string
  description: string
  longDescription: string
  characteristics: string[]
  tempo: string
  mood: string
  color: string
  artists: string[]
  bestFor: string[]
  sampleLyricStyle: string
}> = {
  pop: {
    name: "Pop",
    description: "Catchy, upbeat melodies perfect for memorization",
    longDescription: "Pop music's infectious hooks and repetitive structures make it ideal for language learning. The catchy melodies help vocabulary stick, while the upbeat energy keeps you motivated.",
    characteristics: ["Catchy hooks", "Verse-chorus structure", "Modern production", "Memorable melodies"],
    tempo: "Medium to Fast (100-130 BPM)",
    mood: "Upbeat & Energetic",
    color: "coral",
    artists: ["Taylor Swift", "Ed Sheeran", "BTS", "Bad Bunny"],
    bestFor: ["Daily vocabulary", "Everyday phrases", "Casual conversation"],
    sampleLyricStyle: "Fun, relatable lyrics with memorable choruses that repeat key vocabulary naturally.",
  },
  jazz: {
    name: "Jazz",
    description: "Smooth, sophisticated sounds for relaxed learning",
    longDescription: "Jazz's mellow rhythms and sophisticated harmonies create a relaxed learning environment. The slower pacing allows for clearer pronunciation and deeper vocabulary absorption.",
    characteristics: ["Smooth harmonies", "Improvisation feel", "Relaxed tempo", "Rich instrumentation"],
    tempo: "Slow to Medium (60-100 BPM)",
    mood: "Relaxed & Sophisticated",
    color: "lavender",
    artists: ["Frank Sinatra", "Norah Jones", "Diana Krall", "Michael Bublé"],
    bestFor: ["Business vocabulary", "Formal language", "Thoughtful phrases"],
    sampleLyricStyle: "Elegant, thoughtful lyrics with sophisticated vocabulary woven into smooth, memorable phrases.",
  },
  rock: {
    name: "Rock",
    description: "Energetic rhythms for memorable learning",
    longDescription: "Rock music's powerful energy and emotional intensity create strong memory associations. The driving rhythms and bold melodies make vocabulary unforgettable.",
    characteristics: ["Electric guitars", "Strong drums", "Powerful vocals", "High energy"],
    tempo: "Medium to Fast (100-140 BPM)",
    mood: "Powerful & Intense",
    color: "coral",
    artists: ["Queen", "Coldplay", "Imagine Dragons", "Arctic Monkeys"],
    bestFor: ["Action words", "Emotional vocabulary", "Strong verbs"],
    sampleLyricStyle: "Bold, declarative lyrics with powerful imagery and memorable hooks.",
  },
  "hip-hop": {
    name: "Hip Hop",
    description: "Rhythmic, word-dense tracks for rapid vocabulary building",
    longDescription: "Hip hop's emphasis on lyrics and wordplay makes it perfect for vocabulary expansion. The rhythmic flow helps with pronunciation, while the word-dense nature maximizes learning per song.",
    characteristics: ["Complex rhymes", "Word-dense lyrics", "Rhythmic flow", "Modern beats"],
    tempo: "Medium (85-115 BPM)",
    mood: "Confident & Dynamic",
    color: "mint",
    artists: ["Kendrick Lamar", "Drake", "J. Cole", "Tyler, The Creator"],
    bestFor: ["Slang & idioms", "Conversational phrases", "Modern vocabulary"],
    sampleLyricStyle: "Rhythmic, rhyme-heavy lyrics that pack maximum vocabulary into memorable verses.",
  },
  acoustic: {
    name: "Acoustic",
    description: "Gentle, organic sounds for focused learning",
    longDescription: "Acoustic music's stripped-down nature puts lyrics front and center. The intimate, organic feel creates a focused learning environment perfect for studying.",
    characteristics: ["Natural instruments", "Intimate feel", "Clear vocals", "Minimal production"],
    tempo: "Slow to Medium (60-100 BPM)",
    mood: "Intimate & Focused",
    color: "mint",
    artists: ["Ed Sheeran", "John Mayer", "Jack Johnson", "Bon Iver"],
    bestFor: ["Clear pronunciation", "Emotional vocabulary", "Poetic phrases"],
    sampleLyricStyle: "Heartfelt, clearly articulated lyrics that let every word shine through.",
  },
  rnb: {
    name: "R&B",
    description: "Soulful grooves for emotional connection",
    longDescription: "R&B's soulful melodies and emotional depth create powerful memory anchors. The smooth rhythms and expressive vocals help vocabulary connect with feelings.",
    characteristics: ["Soulful vocals", "Smooth grooves", "Emotional depth", "Melodic hooks"],
    tempo: "Slow to Medium (70-100 BPM)",
    mood: "Soulful & Smooth",
    color: "lavender",
    artists: ["The Weeknd", "SZA", "Frank Ocean", "Daniel Caesar"],
    bestFor: ["Romantic vocabulary", "Emotional expression", "Relationship words"],
    sampleLyricStyle: "Smooth, emotionally resonant lyrics with soulful phrasing that sticks with you.",
  },
  electronic: {
    name: "Electronic",
    description: "Modern beats for energetic learning sessions",
    longDescription: "Electronic music's modern production and driving beats create energetic learning sessions. Perfect for workout-style study sessions or when you need an energy boost.",
    characteristics: ["Synthesizers", "Digital production", "Build-ups & drops", "Modern sounds"],
    tempo: "Fast (120-150 BPM)",
    mood: "Energetic & Modern",
    color: "coral",
    artists: ["Daft Punk", "Calvin Harris", "Kygo", "Martin Garrix"],
    bestFor: ["Technology vocabulary", "Modern phrases", "Active learning"],
    sampleLyricStyle: "Short, punchy phrases with repetitive hooks that drill vocabulary through the beat.",
  },
  folk: {
    name: "Folk",
    description: "Storytelling traditions for narrative learning",
    longDescription: "Folk music's storytelling tradition makes it perfect for contextual learning. The narrative structure helps vocabulary fit into memorable stories.",
    characteristics: ["Storytelling", "Traditional instruments", "Sing-along friendly", "Cultural roots"],
    tempo: "Slow to Medium (70-110 BPM)",
    mood: "Warm & Nostalgic",
    color: "mint",
    artists: ["Mumford & Sons", "The Lumineers", "Fleet Foxes", "Hozier"],
    bestFor: ["Cultural vocabulary", "Storytelling phrases", "Traditional language"],
    sampleLyricStyle: "Narrative, story-driven lyrics that place vocabulary in memorable contexts.",
  },
}

export async function generateStaticParams() {
  return Object.keys(genreData).map((genre) => ({ genre }))
}

export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const { genre } = await params
  const data = genreData[genre]
  
  if (!data) {
    return { title: "Genre Not Found" }
  }

  return {
    title: `Learn Languages with ${data.name} Music - LyricLingo`,
    description: `Master vocabulary through ${data.name} songs. ${data.description}. AI-generated ${data.name.toLowerCase()} tracks personalized for language learning.`,
    openGraph: {
      title: `${data.name} Language Learning Songs | LyricLingo`,
      description: data.longDescription.slice(0, 150) + "...",
    },
  }
}

export default async function GenrePage({ params }: GenrePageProps) {
  const { genre } = await params
  const data = genreData[genre]

  if (!data) {
    notFound()
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
          <div className={`absolute inset-0 bg-gradient-to-b from-${data.color}/5 via-transparent to-transparent`} />
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <span className={`inline-block px-4 py-1.5 rounded-full bg-${data.color}/10 text-${data.color} text-sm font-medium mb-6`}>
                {data.mood}
              </span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Learn Languages with
                <span className={`block text-${data.color} mt-1`}>{data.name} Music</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {data.longDescription}
              </p>
              <div className="mt-8">
                <Link
                  href={`/get-started?genre=${genre}`}
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors text-lg"
                >
                  Create {data.name} Songs
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Genre Characteristics */}
        <section className="py-16 sm:py-24 bg-secondary/30">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-6">
                  {data.name} Sound Profile
                </h2>
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-muted-foreground w-20">Tempo:</span>
                    <span className="text-foreground">{data.tempo}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-medium text-muted-foreground w-20">Mood:</span>
                    <span className="text-foreground">{data.mood}</span>
                  </div>
                </div>
                <div className="mt-8">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Characteristics:</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.characteristics.map((char) => (
                      <span key={char} className={`px-3 py-1.5 rounded-full bg-${data.color}/10 text-${data.color} text-sm`}>
                        {char}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 rounded-2xl bg-card border border-border/50">
                <h3 className="text-sm font-semibold text-foreground mb-3">Sample Lyric Style:</h3>
                <p className="text-muted-foreground italic leading-relaxed">
                  "{data.sampleLyricStyle}"
                </p>
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-foreground mb-3">Inspired by artists like:</h3>
                  <div className="flex flex-wrap gap-2">
                    {data.artists.map((artist) => (
                      <span key={artist} className="px-3 py-1 rounded-full bg-secondary text-sm">
                        {artist}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Best For */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
              {data.name} is Perfect For Learning
            </h2>
            <div className="grid sm:grid-cols-3 gap-6">
              {data.bestFor.map((item, index) => (
                <div
                  key={index}
                  className="p-6 rounded-2xl bg-card border border-border/50 text-center"
                >
                  <div className={`w-12 h-12 rounded-full bg-${data.color}/10 text-${data.color} flex items-center justify-center mx-auto mb-4`}>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="font-medium text-foreground">{item}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Choose Language */}
        <section className="py-16 sm:py-24 bg-secondary/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
              {data.name} Songs in Any Language
            </h2>
            <p className="text-muted-foreground text-center mb-12">
              Choose your language and get AI-generated {data.name.toLowerCase()} songs personalized for your vocabulary.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {LANGUAGES.slice(0, 8).map((lang) => (
                <Link
                  key={lang.code}
                  href={`/get-started?genre=${genre}&language=${lang.code}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-card border border-border/50 hover:border-coral/30 transition-colors"
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Choose Topic */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
              Choose Your Vocabulary Topic
            </h2>
            <p className="text-muted-foreground text-center mb-12">
              Combine {data.name.toLowerCase()} music with any vocabulary theme.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {TOPICS.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.id}`}
                  className="px-5 py-3 rounded-full bg-card border border-border/50 hover:border-lavender/30 transition-colors"
                >
                  {topic.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Other Genres */}
        <section className="py-16 sm:py-24 bg-secondary/30">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
              Explore Other Genres
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(genreData)
                .filter(([key]) => key !== genre)
                .slice(0, 4)
                .map(([key, g]) => (
                  <Link
                    key={key}
                    href={`/genres/${key}`}
                    className="p-5 rounded-2xl bg-card border border-border/50 hover:border-coral/30 transition-colors"
                  >
                    <h3 className="font-semibold text-foreground mb-1">{g.name}</h3>
                    <p className="text-sm text-muted-foreground">{g.description}</p>
                  </Link>
                ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Start Learning with {data.name}
            </h2>
            <p className="text-muted-foreground mb-8">
              Create your first {data.name.toLowerCase()} language song in under a minute.
            </p>
            <Link
              href={`/get-started?genre=${genre}`}
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
