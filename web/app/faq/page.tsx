import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "FAQ - LyricLingo | Frequently Asked Questions",
  description: "Find answers to common questions about LyricLingo, our AI music generation, language learning methods, pricing, and more.",
  openGraph: {
    title: "LyricLingo FAQ",
    description: "Get answers to all your questions about learning languages through AI-generated music.",
  },
}

const categories = [
  {
    name: "Getting Started",
    faqs: [
      {
        q: "How does LyricLingo work?",
        a: "LyricLingo uses AI to generate custom songs based on vocabulary you want to learn. Simply enter your target words, choose a language and music style, and our AI creates a unique, catchy song incorporating those words naturally. The music helps cement vocabulary in your memory through melody and repetition.",
      },
      {
        q: "Do I need any musical experience?",
        a: "Not at all! LyricLingo is designed for language learners, not musicians. You just listen to songs and sing along. No instrument playing or music reading required.",
      },
      {
        q: "What languages are supported?",
        a: "We currently support over 100 languages, including Spanish, French, German, Japanese, Korean, Mandarin, Arabic, Hindi, Portuguese, and many more. We're constantly adding new languages based on user demand.",
      },
      {
        q: "Is LyricLingo suitable for beginners?",
        a: "Absolutely! We have beginner-friendly modes with simpler vocabulary, slower tempos, and more repetition. You can start with basic words and gradually increase complexity as you improve.",
      },
      {
        q: "How is this different from other language apps?",
        a: "Unlike flashcard apps or traditional courses, LyricLingo leverages the scientifically-proven connection between music and memory. Songs naturally include repetition, emotional engagement, and contextual usage—all factors that dramatically improve retention.",
      },
    ],
  },
  {
    name: "Features & Content",
    faqs: [
      {
        q: "What music genres are available?",
        a: "We offer Pop, Jazz, Rock, Hip Hop, R&B, Electronic, Acoustic, and Folk genres. Each genre can be customized with different tempos and moods to match your preferences.",
      },
      {
        q: "Can I choose which words appear in my songs?",
        a: "Yes! You can manually enter specific words, choose from curated vocabulary packs by topic, or import word lists from apps like Anki and Quizlet. Our AI then weaves these words naturally into song lyrics.",
      },
      {
        q: "How long are the generated songs?",
        a: "Most songs are 1-2 minutes long, which is optimal for learning and repetition. This length allows you to listen to a song multiple times in a single study session.",
      },
      {
        q: "Can I see translations while listening?",
        a: "Yes! Our interactive lyrics display shows both the original language and translations. You can tap any word for instant translation, pronunciation guide, and example sentences.",
      },
      {
        q: "Are the songs grammatically correct?",
        a: "Our AI is trained on native content and reviewed by linguists. While songs may use poetic license occasionally (as real songs do), the vocabulary usage and grammar are accurate for learning purposes.",
      },
    ],
  },
  {
    name: "Pricing & Plans",
    faqs: [
      {
        q: "Is there a free plan?",
        a: "Yes! Our free plan includes 5 songs per month, 2 languages, and basic vocabulary tracking. It's perfect for trying LyricLingo or casual learning.",
      },
      {
        q: "What does Pro include?",
        a: "Pro ($9.99/month) includes unlimited songs, all 100+ languages, HD audio, offline downloads, advanced analytics, custom playlists, and priority support. No ads!",
      },
      {
        q: "Can I try Pro before paying?",
        a: "Yes! We offer a 14-day free trial of Pro features. No credit card required to start.",
      },
      {
        q: "Do you offer student discounts?",
        a: "Students get 50% off Pro plans with a valid .edu email or student ID verification.",
      },
      {
        q: "What's your refund policy?",
        a: "We offer a 30-day money-back guarantee on all paid plans. If you're not satisfied, contact us for a full refund.",
      },
      {
        q: "Can I cancel anytime?",
        a: "Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period, and your generated songs are yours to keep forever.",
      },
    ],
  },
  {
    name: "Technical",
    faqs: [
      {
        q: "What devices work with LyricLingo?",
        a: "LyricLingo works on any modern web browser (Chrome, Firefox, Safari, Edge) on desktop and mobile. Native iOS and Android apps are coming soon!",
      },
      {
        q: "Can I download songs for offline listening?",
        a: "Pro users can download songs in MP3 format for offline listening on any device.",
      },
      {
        q: "How do I import vocabulary from other apps?",
        a: "Go to Settings > Import and upload a CSV file, or connect directly to Anki or Quizlet to sync your vocabulary lists.",
      },
      {
        q: "Is my data secure?",
        a: "Yes! We use industry-standard encryption for all data transmission and storage. We never sell your personal information. See our Privacy Policy for details.",
      },
      {
        q: "Does LyricLingo work offline?",
        a: "The web app requires an internet connection for song generation. However, Pro users can download songs for offline playback.",
      },
    ],
  },
  {
    name: "Learning & Science",
    faqs: [
      {
        q: "Why does music help with language learning?",
        a: "Music activates multiple brain regions simultaneously, creating stronger neural pathways for memory. Melodies serve as natural mnemonic devices, and the emotional connection to music deepens encoding. Research shows 3x better retention compared to traditional methods.",
      },
      {
        q: "How often should I practice?",
        a: "We recommend 15-20 minutes daily for optimal results. Consistency matters more than duration. Even listening to one song multiple times per day can significantly boost retention.",
      },
      {
        q: "Will this replace traditional language learning?",
        a: "LyricLingo is designed to complement other learning methods, not replace them entirely. It's particularly effective for vocabulary acquisition and pronunciation. We recommend combining it with conversation practice and grammar study.",
      },
      {
        q: "How do you track my progress?",
        a: "Our system tracks which words you've learned, how often you've practiced them, and when you last reviewed them. We use spaced repetition to surface songs at optimal review intervals.",
      },
    ],
  },
]

export default function FAQPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-coral/5 via-transparent to-transparent" />
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Frequently Asked
                <span className="block text-coral mt-1">Questions</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                Everything you need to know about LyricLingo. Can't find your answer? 
                <Link href="/contact" className="text-coral hover:underline ml-1">Contact us</Link>.
              </p>
            </div>
          </div>
        </section>

        {/* FAQ Categories */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            {/* Quick Nav */}
            <div className="flex flex-wrap gap-2 mb-12 justify-center">
              {categories.map((category) => (
                <a
                  key={category.name}
                  href={`#${category.name.toLowerCase().replace(/\s+/g, '-')}`}
                  className="px-4 py-2 rounded-full bg-secondary text-sm text-muted-foreground hover:text-foreground hover:bg-secondary/80 transition-colors"
                >
                  {category.name}
                </a>
              ))}
            </div>

            {/* FAQ Sections */}
            <div className="space-y-16">
              {categories.map((category) => (
                <div key={category.name} id={category.name.toLowerCase().replace(/\s+/g, '-')}>
                  <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6 flex items-center gap-3">
                    <div className="w-1 h-6 bg-coral rounded-full" />
                    {category.name}
                  </h2>
                  <div className="space-y-4">
                    {category.faqs.map((faq) => (
                      <details
                        key={faq.q}
                        className="group rounded-2xl bg-card border border-border/50 overflow-hidden"
                      >
                        <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                          <h3 className="font-medium text-foreground pr-4">{faq.q}</h3>
                          <svg
                            className="w-5 h-5 text-muted-foreground flex-shrink-0 transition-transform group-open:rotate-180"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </summary>
                        <div className="px-6 pb-6 pt-0">
                          <p className="text-muted-foreground leading-relaxed">{faq.a}</p>
                        </div>
                      </details>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24 bg-secondary/30">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Still Have Questions?
            </h2>
            <p className="text-muted-foreground mb-8">
              Our support team is happy to help with any questions not covered here.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/contact"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl bg-foreground text-background font-medium hover:bg-foreground/90 transition-colors"
              >
                Contact Support
              </Link>
              <Link
                href="/get-started"
                className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-border hover:bg-secondary transition-colors"
              >
                Try LyricLingo Free
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
