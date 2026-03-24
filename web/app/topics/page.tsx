import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Vocabulary Topics - LyricLingo",
  description: "Learn vocabulary by topic through AI-generated songs. Travel, business, food, romance, and more. Choose your topic and master vocabulary through music.",
  openGraph: {
    title: "Choose Your Vocabulary Topic | LyricLingo",
    description: "Learn any vocabulary topic through personalized AI-generated songs.",
  },
}

const topics = [
  {
    id: "travel",
    name: "Travel",
    description: "Essential vocabulary for exploring the world",
    icon: "✈️",
    wordCount: "500+",
  },
  {
    id: "business",
    name: "Business",
    description: "Professional vocabulary for the workplace",
    icon: "💼",
    wordCount: "400+",
  },
  {
    id: "food",
    name: "Food",
    description: "Culinary vocabulary for food lovers",
    icon: "🍽️",
    wordCount: "350+",
  },
  {
    id: "romance",
    name: "Romance",
    description: "Express your feelings in any language",
    icon: "💕",
    wordCount: "300+",
  },
  {
    id: "daily-life",
    name: "Daily Life",
    description: "Everyday vocabulary for real conversations",
    icon: "🏠",
    wordCount: "600+",
  },
  {
    id: "nature",
    name: "Nature",
    description: "Vocabulary for the natural world",
    icon: "🌿",
    wordCount: "250+",
  },
  {
    id: "technology",
    name: "Technology",
    description: "Digital age vocabulary",
    icon: "💻",
    wordCount: "300+",
  },
  {
    id: "sports",
    name: "Sports",
    description: "Athletic and fitness vocabulary",
    icon: "⚽",
    wordCount: "200+",
  },
]

export default function TopicsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-mint/5 via-transparent to-transparent" />
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Learn Vocabulary
                <span className="block text-mint mt-1">By Topic</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Choose a topic that interests you and learn relevant vocabulary through 
                AI-generated songs. From travel essentials to business terms, we've got you covered.
              </p>
            </div>
          </div>
        </section>

        {/* Topics Grid */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {topics.map((topic) => (
                <Link
                  key={topic.id}
                  href={`/topics/${topic.id}`}
                  className="p-6 rounded-2xl bg-card border border-border/50 hover:border-mint/30 transition-all hover:shadow-lg group"
                >
                  <div className="text-4xl mb-4">{topic.icon}</div>
                  <h2 className="text-xl font-semibold text-foreground group-hover:text-mint transition-colors mb-2">
                    {topic.name}
                  </h2>
                  <p className="text-sm text-muted-foreground mb-4">{topic.description}</p>
                  <div className="text-xs text-mint font-medium">{topic.wordCount} words</div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-16 sm:py-24 bg-secondary/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
              How Topic Learning Works
            </h2>
            <div className="grid sm:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-mint/10 text-mint flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  1
                </div>
                <h3 className="font-semibold text-foreground mb-2">Choose a Topic</h3>
                <p className="text-sm text-muted-foreground">
                  Select from our curated vocabulary topics
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-mint/10 text-mint flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  2
                </div>
                <h3 className="font-semibold text-foreground mb-2">Pick Your Language</h3>
                <p className="text-sm text-muted-foreground">
                  Learn topic vocabulary in any of 100+ languages
                </p>
              </div>
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-mint/10 text-mint flex items-center justify-center mx-auto mb-4 text-xl font-bold">
                  3
                </div>
                <h3 className="font-semibold text-foreground mb-2">Get Custom Songs</h3>
                <p className="text-sm text-muted-foreground">
                  AI generates songs with your topic vocabulary
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Can't Find Your Topic?
            </h2>
            <p className="text-muted-foreground mb-8">
              Enter your own vocabulary words and we'll create songs just for you.
            </p>
            <Link
              href="/get-started"
              className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors text-lg"
            >
              Create Custom Songs
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
