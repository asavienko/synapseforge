import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"
import { Logo } from "@/components/logo"

export const metadata: Metadata = {
  title: "About Us - LyricLingo | Learn Languages Through Music",
  description: "Discover how LyricLingo combines AI-generated music with language learning. Our mission is to make language acquisition enjoyable, memorable, and effective.",
  openGraph: {
    title: "About LyricLingo - Our Story",
    description: "Learn about the team and technology behind the revolutionary music-based language learning platform.",
  },
}

const stats = [
  { value: "500K+", label: "Active Learners" },
  { value: "100+", label: "Languages" },
  { value: "2M+", label: "Songs Generated" },
  { value: "95%", label: "Retention Rate" },
]

const team = [
  {
    name: "Sarah Chen",
    role: "CEO & Co-founder",
    bio: "Former Duolingo product lead with a passion for combining technology and education.",
  },
  {
    name: "Marcus Weber",
    role: "CTO & Co-founder", 
    bio: "Ex-Spotify engineer specializing in audio processing and machine learning.",
  },
  {
    name: "Dr. Elena Rodriguez",
    role: "Head of Learning Science",
    bio: "PhD in Applied Linguistics, 15 years researching music-based language acquisition.",
  },
  {
    name: "James Okafor",
    role: "Head of AI",
    bio: "Former OpenAI researcher focused on generative music and natural language processing.",
  },
]

const values = [
  {
    title: "Learning Should Be Fun",
    description: "We believe the best learning happens when you're enjoying yourself. Music transforms vocabulary drills into moments of joy.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: "Science-Backed Methods",
    description: "Every feature is grounded in cognitive science research. We leverage the proven power of music on memory formation.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: "Personalized Experience",
    description: "No two learners are the same. Our AI creates songs tailored to your vocabulary goals, musical taste, and learning pace.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  {
    title: "Accessible to All",
    description: "Language learning shouldn't be exclusive. We're committed to making our platform affordable and available worldwide.",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
      </svg>
    ),
  },
]

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-coral/5 via-transparent to-transparent" />
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <Logo size="xl" detailed className="h-20 w-20" />
              </div>
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Making Language Learning
                <span className="block text-coral mt-1">Sound Beautiful</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                We started LyricLingo with a simple observation: people remember song lyrics 
                effortlessly, yet struggle to retain vocabulary from textbooks. What if we 
                could harness that power for language learning?
              </p>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="py-12 sm:py-16 border-y border-border/50">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {stats.map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground">
                    {stat.value}
                  </div>
                  <div className="mt-1 text-sm text-muted-foreground">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Story Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">Our Story</h2>
            <div className="prose prose-lg max-w-none text-muted-foreground space-y-6">
              <p>
                LyricLingo was born in 2023 when our founders, both polyglots and music lovers, 
                realized that despite years of formal language education, the words that stuck 
                with them most vividly came from songs they loved.
              </p>
              <p>
                The science backs this up: music activates multiple brain regions simultaneously, 
                creating stronger neural pathways for memory. Melodies provide natural mnemonic 
                devices, and the emotional connection to music deepens encoding.
              </p>
              <p>
                With advances in AI, we saw an opportunity to create personalized songs for any 
                vocabulary set, in any language, matching any musical preference. No longer would 
                learners need to hunt for songs that happen to contain words they're studying.
              </p>
              <p>
                Today, LyricLingo serves over half a million learners worldwide, generating 
                millions of custom songs that make vocabulary stick. Our retention rates are 
                3x higher than traditional flashcard methods, and our learners report actually 
                enjoying their study sessions.
              </p>
            </div>
          </div>
        </section>

        {/* Values Section */}
        <section className="py-16 sm:py-24 bg-secondary/30">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
              Our Values
            </h2>
            <div className="grid sm:grid-cols-2 gap-6">
              {values.map((value) => (
                <div
                  key={value.title}
                  className="relative p-6 rounded-2xl bg-card border border-border/50"
                >
                  <div className="w-12 h-12 rounded-xl bg-coral/10 text-coral flex items-center justify-center mb-4">
                    {value.icon}
                  </div>
                  <h3 className="text-lg font-semibold text-foreground mb-2">{value.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {value.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Team Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-4">
              Meet the Team
            </h2>
            <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
              A passionate group of educators, engineers, linguists, and musicians working 
              together to revolutionize language learning.
            </p>
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {team.map((member) => (
                <div
                  key={member.name}
                  className="text-center p-6 rounded-2xl bg-card border border-border/50"
                >
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-coral/20 to-lavender/20 mx-auto mb-4 flex items-center justify-center">
                    <span className="text-2xl font-bold text-foreground">
                      {member.name.split(' ').map(n => n[0]).join('')}
                    </span>
                  </div>
                  <h3 className="font-semibold text-foreground">{member.name}</h3>
                  <p className="text-sm text-coral mb-2">{member.role}</p>
                  <p className="text-xs text-muted-foreground">{member.bio}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 bg-gradient-to-b from-transparent to-coral/5">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Ready to Start Learning?
            </h2>
            <p className="text-muted-foreground mb-8">
              Join hundreds of thousands of learners who are mastering new languages through music.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors"
              >
                Get Started Free
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-border hover:bg-secondary transition-colors"
              >
                Learn How It Works
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
