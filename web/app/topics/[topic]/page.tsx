import type { Metadata } from "next"
import Link from "next/link"
import { notFound } from "next/navigation"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { LANGUAGES, GENRES } from "@/lib/constants"

interface TopicPageProps {
  params: Promise<{ topic: string }>
}

const topicData: Record<string, {
  name: string
  description: string
  longDescription: string
  icon: string
  color: string
  sampleVocabulary: { word: string; meaning: string }[]
  benefits: string[]
  relatedTopics: string[]
}> = {
  travel: {
    name: "Travel",
    description: "Essential vocabulary for exploring the world",
    longDescription: "Master the words and phrases you need for international travel. From airports and hotels to asking for directions and ordering food, our travel songs cover all the essentials for confident communication abroad.",
    icon: "✈️",
    color: "coral",
    sampleVocabulary: [
      { word: "airport", meaning: "Where planes take off and land" },
      { word: "reservation", meaning: "A booking for a hotel or restaurant" },
      { word: "passport", meaning: "Travel identification document" },
      { word: "luggage", meaning: "Bags and suitcases" },
      { word: "ticket", meaning: "Proof of purchase for transport" },
      { word: "directions", meaning: "Instructions on how to get somewhere" },
    ],
    benefits: [
      "Navigate airports and train stations confidently",
      "Book hotels and restaurants without stress",
      "Ask for directions and understand responses",
      "Handle emergencies while abroad",
    ],
    relatedTopics: ["food", "business", "daily-life"],
  },
  business: {
    name: "Business",
    description: "Professional vocabulary for the workplace",
    longDescription: "Build your professional language skills with business-focused vocabulary. Perfect for international meetings, email correspondence, negotiations, and networking in any language.",
    icon: "💼",
    color: "lavender",
    sampleVocabulary: [
      { word: "meeting", meaning: "Gathering to discuss work" },
      { word: "deadline", meaning: "Final date for completion" },
      { word: "contract", meaning: "Legal business agreement" },
      { word: "presentation", meaning: "Formal explanation to a group" },
      { word: "negotiation", meaning: "Discussion to reach agreement" },
      { word: "colleague", meaning: "Someone you work with" },
    ],
    benefits: [
      "Participate confidently in international meetings",
      "Write professional emails in multiple languages",
      "Network effectively at global events",
      "Negotiate deals with international partners",
    ],
    relatedTopics: ["technology", "daily-life", "travel"],
  },
  food: {
    name: "Food",
    description: "Culinary vocabulary for food lovers",
    longDescription: "Explore the delicious world of food vocabulary. Learn to order at restaurants, shop at markets, discuss recipes, and share your culinary experiences in any language.",
    icon: "🍽️",
    color: "mint",
    sampleVocabulary: [
      { word: "restaurant", meaning: "Place to eat meals" },
      { word: "recipe", meaning: "Instructions for cooking" },
      { word: "ingredients", meaning: "Components of a dish" },
      { word: "delicious", meaning: "Very tasty" },
      { word: "menu", meaning: "List of available dishes" },
      { word: "chef", meaning: "Professional cook" },
    ],
    benefits: [
      "Order confidently at restaurants anywhere",
      "Understand menus in foreign languages",
      "Discuss food preferences and allergies",
      "Share recipes and cooking tips",
    ],
    relatedTopics: ["travel", "daily-life", "romance"],
  },
  romance: {
    name: "Romance",
    description: "Express your feelings in any language",
    longDescription: "Learn the language of love with romantic vocabulary. Perfect for expressing feelings, writing love letters, understanding romantic songs, and connecting with someone special in their native language.",
    icon: "💕",
    color: "coral",
    sampleVocabulary: [
      { word: "love", meaning: "Deep affection" },
      { word: "heart", meaning: "Symbol of love" },
      { word: "beautiful", meaning: "Pleasing to the senses" },
      { word: "forever", meaning: "For all time" },
      { word: "kiss", meaning: "Touch with lips" },
      { word: "darling", meaning: "Term of endearment" },
    ],
    benefits: [
      "Express your feelings authentically",
      "Understand romantic songs and poetry",
      "Write heartfelt messages",
      "Connect deeper with loved ones",
    ],
    relatedTopics: ["daily-life", "food", "nature"],
  },
  "daily-life": {
    name: "Daily Life",
    description: "Everyday vocabulary for real conversations",
    longDescription: "Master the essential vocabulary for everyday situations. From morning routines to shopping, these words form the foundation of natural conversation in any language.",
    icon: "🏠",
    color: "lavender",
    sampleVocabulary: [
      { word: "morning", meaning: "Early part of the day" },
      { word: "home", meaning: "Where you live" },
      { word: "family", meaning: "Related people" },
      { word: "weather", meaning: "Atmospheric conditions" },
      { word: "shopping", meaning: "Buying things" },
      { word: "friend", meaning: "Person you like" },
    ],
    benefits: [
      "Have natural everyday conversations",
      "Understand casual speech and slang",
      "Navigate daily situations confidently",
      "Build genuine connections with locals",
    ],
    relatedTopics: ["food", "travel", "romance"],
  },
  nature: {
    name: "Nature",
    description: "Vocabulary for the natural world",
    longDescription: "Connect with the natural world through language. Learn vocabulary for plants, animals, weather, landscapes, and environmental topics in any language.",
    icon: "🌿",
    color: "mint",
    sampleVocabulary: [
      { word: "forest", meaning: "Area with many trees" },
      { word: "mountain", meaning: "Large natural elevation" },
      { word: "ocean", meaning: "Large body of salt water" },
      { word: "flower", meaning: "Blooming plant" },
      { word: "weather", meaning: "Atmospheric conditions" },
      { word: "animal", meaning: "Living creature" },
    ],
    benefits: [
      "Describe landscapes and scenery",
      "Discuss environmental topics",
      "Understand nature documentaries",
      "Connect through shared appreciation of nature",
    ],
    relatedTopics: ["travel", "daily-life", "sports"],
  },
  technology: {
    name: "Technology",
    description: "Digital age vocabulary",
    longDescription: "Stay current with technology vocabulary in any language. From computers and smartphones to AI and social media, learn the words that define our digital world.",
    icon: "💻",
    color: "coral",
    sampleVocabulary: [
      { word: "computer", meaning: "Electronic device for processing data" },
      { word: "internet", meaning: "Global network" },
      { word: "software", meaning: "Computer programs" },
      { word: "download", meaning: "Transfer data to device" },
      { word: "password", meaning: "Secret access code" },
      { word: "application", meaning: "Software program" },
    ],
    benefits: [
      "Communicate about tech topics globally",
      "Understand technical documentation",
      "Work with international tech teams",
      "Navigate digital services abroad",
    ],
    relatedTopics: ["business", "daily-life", "travel"],
  },
  sports: {
    name: "Sports",
    description: "Athletic and fitness vocabulary",
    longDescription: "Learn sports vocabulary to discuss your favorite activities, follow international sports, and stay fit while abroad. From football to yoga, we cover it all.",
    icon: "⚽",
    color: "lavender",
    sampleVocabulary: [
      { word: "team", meaning: "Group playing together" },
      { word: "goal", meaning: "Scoring point" },
      { word: "match", meaning: "Competitive game" },
      { word: "exercise", meaning: "Physical activity" },
      { word: "champion", meaning: "Winner" },
      { word: "training", meaning: "Practice sessions" },
    ],
    benefits: [
      "Follow international sports coverage",
      "Discuss games with fans worldwide",
      "Navigate gyms and fitness classes",
      "Understand sports commentary",
    ],
    relatedTopics: ["daily-life", "nature", "travel"],
  },
}

export async function generateStaticParams() {
  return Object.keys(topicData).map((topic) => ({ topic }))
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
  const { topic } = await params
  const data = topicData[topic]
  
  if (!data) {
    return { title: "Topic Not Found" }
  }

  return {
    title: `${data.name} Vocabulary Songs - LyricLingo`,
    description: `Learn ${data.name.toLowerCase()} vocabulary through AI-generated songs. ${data.description}. Master essential words and phrases for ${data.name.toLowerCase()} situations.`,
    openGraph: {
      title: `Learn ${data.name} Vocabulary with Music | LyricLingo`,
      description: data.longDescription.slice(0, 150) + "...",
    },
  }
}

export default async function TopicPage({ params }: TopicPageProps) {
  const { topic } = await params
  const data = topicData[topic]

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
              <span className="text-6xl sm:text-7xl mb-6 block">{data.icon}</span>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                {data.name} Vocabulary
                <span className={`block text-${data.color} mt-1`}>Through Music</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                {data.longDescription}
              </p>
              <div className="mt-8">
                <Link
                  href={`/get-started?topic=${topic}`}
                  className="inline-flex items-center justify-center px-8 py-4 rounded-xl bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors text-lg"
                >
                  Start Learning {data.name} Words
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Sample Vocabulary */}
        <section className="py-16 sm:py-24 bg-secondary/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
              Sample {data.name} Vocabulary
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.sampleVocabulary.map((item) => (
                <div
                  key={item.word}
                  className="p-5 rounded-2xl bg-card border border-border/50"
                >
                  <div className={`text-lg font-semibold text-${data.color} mb-1`}>
                    {item.word}
                  </div>
                  <div className="text-sm text-muted-foreground">{item.meaning}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
              What You'll Be Able To Do
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {data.benefits.map((benefit, index) => (
                <div
                  key={index}
                  className="flex items-start gap-4 p-5 rounded-2xl bg-card border border-border/50"
                >
                  <div className={`w-8 h-8 rounded-full bg-${data.color}/10 text-${data.color} flex items-center justify-center flex-shrink-0`}>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-foreground">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Choose Language */}
        <section className="py-16 sm:py-24 bg-secondary/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
              Learn {data.name} Words in Any Language
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Choose your target language and start learning {data.name.toLowerCase()} vocabulary through songs.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {LANGUAGES.slice(0, 8).map((lang) => (
                <Link
                  key={lang.code}
                  href={`/get-started?topic=${topic}&language=${lang.code}`}
                  className="flex items-center gap-2 px-5 py-3 rounded-full bg-card border border-border/50 hover:border-coral/30 transition-colors"
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="font-medium">{lang.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Music Styles */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
              Pick Your Music Style
            </h2>
            <p className="text-muted-foreground text-center mb-12 max-w-2xl mx-auto">
              Learn {data.name.toLowerCase()} vocabulary in the genre you enjoy most.
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {GENRES.map((genre) => (
                <Link
                  key={genre.id}
                  href={`/genres/${genre.id}`}
                  className="px-5 py-3 rounded-full bg-card border border-border/50 hover:border-lavender/30 transition-colors"
                >
                  {genre.label}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Related Topics */}
        <section className="py-16 sm:py-24 bg-secondary/30">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
              Related Topics
            </h2>
            <div className="flex flex-wrap justify-center gap-4">
              {data.relatedTopics.map((relatedTopic) => {
                const related = topicData[relatedTopic]
                if (!related) return null
                return (
                  <Link
                    key={relatedTopic}
                    href={`/topics/${relatedTopic}`}
                    className="flex items-center gap-3 px-6 py-4 rounded-2xl bg-card border border-border/50 hover:border-coral/30 transition-colors"
                  >
                    <span className="text-2xl">{related.icon}</span>
                    <div>
                      <div className="font-semibold">{related.name}</div>
                      <div className="text-sm text-muted-foreground">{related.description}</div>
                    </div>
                  </Link>
                )
              })}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Start Learning {data.name} Vocabulary
            </h2>
            <p className="text-muted-foreground mb-8">
              Create your first {data.name.toLowerCase()} song in under a minute.
            </p>
            <Link
              href={`/get-started?topic=${topic}`}
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
