import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Zap, Clock, Calendar, Check, X } from "lucide-react";

export const metadata: Metadata = {
  title: "Best AI Models for Customer Support in 2026: GPT-4 vs Claude vs Gemini",
  description:
    "Comparing GPT-4o, Claude 3, Gemini 1.5, and Mistral for customer support chatbots. Speed, accuracy, cost, and tone — which model wins?",
  openGraph: {
    title: "Best AI Models for Customer Support 2026: GPT-4 vs Claude vs Gemini",
    description: "Which LLM is best for customer support? We compare GPT-4o, Claude 3, Gemini, and Mistral on accuracy, tone, speed, and cost.",
    type: "article",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "Best AI Models for Customer Support in 2026: GPT-4 vs Claude vs Gemini",
  description: "Comparing GPT-4o, Claude 3 Sonnet, Gemini 1.5 Flash, and Mistral for customer support chatbots.",
  datePublished: "2026-03-23",
  dateModified: "2026-03-23",
  author: { "@type": "Organization", name: "OpenHelix AI", url: "https://openhelixai.com" },
  publisher: {
    "@type": "Organization",
    name: "OpenHelix AI",
    logo: { "@type": "ImageObject", url: "https://openhelixai.com/logo.png" },
  },
};

const models = [
  {
    name: "GPT-4o",
    provider: "OpenAI",
    badge: "Best overall",
    badgeColor: "text-violet-400 bg-violet-400/10",
    price: "~$0.005 / 1K tokens",
    speed: "Fast",
    accuracy: "★★★★★",
    tone: "Professional, adaptable",
    contextWindow: "128K tokens",
    pros: [
      "Best accuracy on complex multi-part questions",
      "Excellent instruction following",
      "Vision support (can describe images)",
      "Consistent, on-brand tone",
      "Widest integration support",
    ],
    cons: [
      "Higher cost than lighter models",
      "Slight latency vs GPT-3.5",
    ],
    bestFor: "High-volume support where accuracy is critical. E-commerce, SaaS, finance.",
    verdict: "The default choice for most businesses. Hard to go wrong.",
  },
  {
    name: "Claude 3 Sonnet",
    provider: "Anthropic",
    badge: "Best tone",
    badgeColor: "text-emerald-400 bg-emerald-400/10",
    price: "~$0.003 / 1K tokens",
    speed: "Fast",
    accuracy: "★★★★★",
    tone: "Warm, empathetic, natural",
    contextWindow: "200K tokens",
    pros: [
      "Most natural-sounding responses",
      "Excellent at de-escalating frustrated customers",
      "Best-in-class for nuanced emotional tone",
      "Huge context window (200K) — can reference long docs",
      "Strong multilingual performance",
    ],
    cons: [
      "Occasionally more verbose than needed",
      "Requires Anthropic API key separately from OpenAI",
    ],
    bestFor: "Hospitality, healthcare, coaching, and any use case where tone matters. Premium experiences.",
    verdict: "Best for brands where warmth and empathy are core to the experience.",
  },
  {
    name: "GPT-4o mini",
    provider: "OpenAI",
    badge: "Best value",
    badgeColor: "text-blue-400 bg-blue-400/10",
    price: "~$0.0002 / 1K tokens",
    speed: "Very fast",
    accuracy: "★★★★☆",
    tone: "Clear, concise",
    contextWindow: "128K tokens",
    pros: [
      "25× cheaper than GPT-4o",
      "Fastest response times",
      "Handles most FAQ scenarios accurately",
      "Good for high-volume, repetitive queries",
    ],
    cons: [
      "Weaker on complex, multi-step reasoning",
      "Occasionally misses nuance in edge cases",
    ],
    bestFor: "High-volume simple FAQs. Small businesses on a budget. Telegram/WhatsApp bots with predictable queries.",
    verdict: "Start here if cost is a concern. Upgrade to GPT-4o if you see accuracy issues.",
  },
  {
    name: "Gemini 1.5 Flash",
    provider: "Google",
    badge: null,
    badgeColor: "",
    price: "~$0.0001 / 1K tokens",
    speed: "Very fast",
    accuracy: "★★★☆☆",
    tone: "Neutral",
    contextWindow: "1M tokens",
    pros: [
      "Cheapest option",
      "Massive 1M token context window",
      "Good for document Q&A on long knowledge bases",
    ],
    cons: [
      "Weaker instruction following vs GPT-4o",
      "Less consistent tone",
      "Not as widely tested for customer support",
    ],
    bestFor: "Budget deployments. Document-heavy knowledge bases where context length matters.",
    verdict: "Viable for basic FAQ bots. Not recommended as primary for customer-facing support.",
  },
  {
    name: "Mistral Large",
    provider: "Mistral AI",
    badge: "Best open alternative",
    badgeColor: "text-orange-400 bg-orange-400/10",
    price: "~$0.004 / 1K tokens",
    speed: "Fast",
    accuracy: "★★★★☆",
    tone: "Precise, direct",
    contextWindow: "128K tokens",
    pros: [
      "Strong multilingual (especially European languages)",
      "Good accuracy, competitive with GPT-4o",
      "Available via OpenRouter",
      "European data residency option",
    ],
    cons: [
      "Less fine-tuned for conversational warmth",
      "Smaller ecosystem vs OpenAI/Anthropic",
    ],
    bestFor: "European businesses requiring GDPR-sensitive data residency. Multilingual (French, Spanish, German) support.",
    verdict: "Strong alternative to GPT-4o, especially for EU-focused businesses.",
  },
];

const comparisonRows = [
  { label: "Price / 1K tokens", values: ["~$0.005", "~$0.003", "~$0.0002", "~$0.0001", "~$0.004"] },
  { label: "Speed", values: ["Fast", "Fast", "Very fast", "Very fast", "Fast"] },
  { label: "Context window", values: ["128K", "200K", "128K", "1M", "128K"] },
  { label: "Tone quality", values: ["★★★★★", "★★★★★", "★★★★☆", "★★★☆☆", "★★★★☆"] },
  { label: "Accuracy", values: ["★★★★★", "★★★★★", "★★★★☆", "★★★☆☆", "★★★★☆"] },
  { label: "Multilingual", values: ["Excellent", "Excellent", "Good", "Good", "Excellent (EU)"] },
  { label: "Vision support", values: ["✅", "✅", "✅", "✅", "❌"] },
];

export default function BestAIModelsPost() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <nav className="border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <Zap className="w-5 h-5 text-violet-400" />OpenHelix AI
          </Link>
          <Link href="/sign-up" className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg text-sm font-semibold">
            Try Free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-4 py-16">

        <nav className="text-sm text-zinc-500 mb-8">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-zinc-300 transition-colors">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">Best AI Models for Customer Support</span>
        </nav>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-violet-400 bg-violet-400/10">Comparison</span>
            <span className="text-xs text-zinc-500 flex items-center gap-1"><Calendar className="w-3 h-3" />March 23, 2026</span>
            <span className="text-xs text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3" />10 min read</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
            Best AI Models for Customer Support in 2026: GPT-4o vs Claude 3 vs Gemini vs Mistral
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            Choosing the wrong AI model means slow responses, bad tone, or unnecessary cost. Here&apos;s a practical breakdown of the top models — what they&apos;re good at, where they fall short, and which one fits your use case.
          </p>
        </div>

        {/* Inline CTA */}
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 mb-10 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-semibold text-white">OpenHelix supports all of these models</div>
            <div className="text-xs text-zinc-400">Switch models anytime — no lock-in.</div>
          </div>
          <Link href="/sign-up" className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg text-sm font-semibold shrink-0">
            Try Free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Quick comparison table */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4">Quick Comparison</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="text-left px-3 py-2 text-zinc-400 font-medium"></th>
                  {models.map(m => (
                    <th key={m.name} className="px-3 py-2 text-zinc-300 font-semibold text-center whitespace-nowrap">{m.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {comparisonRows.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-3 py-2 text-zinc-400 whitespace-nowrap">{row.label}</td>
                    {row.values.map((v, j) => (
                      <td key={j} className="px-3 py-2 text-center text-zinc-300">{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Individual model breakdowns */}
        <div className="space-y-10 mb-12">
          {models.map((model) => (
            <div key={model.name} className="border border-white/10 rounded-2xl overflow-hidden">
              <div className="bg-white/[0.03] border-b border-white/5 px-6 py-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-xl font-bold text-white">{model.name}</h2>
                    {model.badge && (
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${model.badgeColor}`}>
                        {model.badge}
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-zinc-500">by {model.provider}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-violet-300">{model.price}</div>
                  <div className="text-xs text-zinc-500">{model.speed} · {model.contextWindow}</div>
                </div>
              </div>
              <div className="p-6">
                <div className="grid sm:grid-cols-2 gap-6 mb-4">
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Pros</div>
                    <ul className="space-y-1.5">
                      {model.pros.map((p, i) => (
                        <li key={i} className="flex gap-2 text-sm text-zinc-300">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />{p}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <div className="text-xs text-zinc-500 uppercase tracking-wider mb-2">Cons</div>
                    <ul className="space-y-1.5">
                      {model.cons.map((c, i) => (
                        <li key={i} className="flex gap-2 text-sm text-zinc-400">
                          <X className="w-3.5 h-3.5 text-zinc-600 shrink-0 mt-0.5" />{c}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                <div className="bg-white/[0.02] rounded-xl p-3 border border-white/5">
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Best for: </span>
                  <span className="text-sm text-zinc-300">{model.bestFor}</span>
                </div>
                <div className="mt-3 text-sm">
                  <span className="text-zinc-500">Verdict: </span>
                  <span className="text-zinc-200">{model.verdict}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Decision guide */}
        <div className="mb-12">
          <h2 className="text-xl font-bold text-white mb-4">Which Model Should You Choose?</h2>
          <div className="space-y-3">
            {[
              { condition: "You want the best accuracy and don't mind the cost", pick: "GPT-4o" },
              { condition: "Tone matters — warm, human-feeling responses", pick: "Claude 3 Sonnet" },
              { condition: "You have high volume and need to control costs", pick: "GPT-4o mini" },
              { condition: "You have very long documents in your knowledge base", pick: "Gemini 1.5 Flash" },
              { condition: "EU-based, GDPR requirements, or multilingual (FR/DE/ES)", pick: "Mistral Large" },
              { condition: "You want to test before committing", pick: "Start with GPT-4o mini, switch anytime" },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-4 text-sm">
                <div className="text-zinc-400 flex-1">If: <span className="text-zinc-200">{item.condition}</span></div>
                <div className="text-violet-400 font-semibold shrink-0">→ {item.pick}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Pro tip */}
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-5 mb-12">
          <div className="text-amber-400 font-semibold mb-1">💡 Pro tip: Don&apos;t over-engineer this</div>
          <p className="text-sm text-zinc-300 leading-relaxed">
            Most businesses overthink the model choice. Start with <strong>GPT-4o mini</strong> — it handles 80% of support scenarios accurately and costs almost nothing. If you notice quality issues after a week of real traffic, switch to GPT-4o. The most important variable is your <strong>system prompt and knowledge base</strong>, not the model.
          </p>
        </div>

        {/* Bottom CTA */}
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Try any of these models free</h2>
          <p className="text-zinc-400 text-sm mb-6">OpenHelix supports GPT-4o, Claude 3, Gemini, Mistral, and 50+ models. Switch anytime with one click.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-xl font-semibold">
            Start Free — 2,000 Messages <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Related */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="text-sm text-zinc-500 mb-4">Related guides</div>
          <div className="flex flex-col gap-2">
            <Link href="/blog/how-to-build-telegram-chatbot" className="text-violet-400 hover:text-violet-300 transition-colors text-sm">
              → How to build a Telegram AI chatbot in 10 minutes
            </Link>
            <Link href="/integrations/telegram" className="text-violet-400 hover:text-violet-300 transition-colors text-sm">
              → Telegram integration overview
            </Link>
            <Link href="/compare/tidio" className="text-violet-400 hover:text-violet-300 transition-colors text-sm">
              → OpenHelix vs Tidio comparison
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
