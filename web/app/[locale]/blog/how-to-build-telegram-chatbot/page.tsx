import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Clock, Calendar, Check } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "How to Build a Telegram AI Chatbot in 10 Minutes (2026 Guide)",
  description:
    "Step-by-step tutorial: deploy a GPT-4 or Claude-powered AI support bot to Telegram. No coding required. Free to start. Covers BotFather setup, API keys, and going live.",
  openGraph: {
    title: "How to Build a Telegram AI Chatbot in 10 Minutes",
    description: "Deploy a GPT-4 powered Telegram bot for customer support. No coding. Free to start.",
    type: "article",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Build a Telegram AI Chatbot in 10 Minutes (2026)",
  description: "Step-by-step guide to deploying a GPT-4 or Claude AI agent on Telegram for customer support.",
  datePublished: "2026-03-23",
  dateModified: "2026-03-23",
  author: { "@type": "Organization", name: "OpenHelix AI", url: "https://openhelixai.com" },
  publisher: {
    "@type": "Organization",
    name: "OpenHelix AI",
    logo: { "@type": "ImageObject", url: "https://openhelixai.com/logo.png" },
  },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to build a Telegram AI chatbot",
  totalTime: "PT10M",
  step: [
    { "@type": "HowToStep", position: 1, name: "Create a bot with @BotFather", text: "Open Telegram, find @BotFather, send /newbot. Choose a name and username. Copy the bot token." },
    { "@type": "HowToStep", position: 2, name: "Sign up for OpenHelix", text: "Create a free account at openhelixai.com. No credit card required." },
    { "@type": "HowToStep", position: 3, name: "Add your AI API key", text: "Add your OpenAI, Anthropic, or OpenRouter key in the Credentials tab." },
    { "@type": "HowToStep", position: 4, name: "Write your system prompt", text: "Define your agent's role, tone, and what it should and shouldn't answer." },
    { "@type": "HowToStep", position: 5, name: "Connect Telegram and go live", text: "Paste your bot token in Deploy → Telegram. Your AI is now live." },
  ],
};

export default function TelegramChatbotPost() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-4 py-16">

        {/* Breadcrumb */}
        <nav className="text-sm text-zinc-500 mb-8">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-zinc-300 transition-colors">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">How to Build a Telegram AI Chatbot</span>
        </nav>

        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-blue-400 bg-blue-400/10">Tutorial</span>
            <span className="text-xs text-zinc-500 flex items-center gap-1"><Calendar className="w-3 h-3" />March 23, 2026</span>
            <span className="text-xs text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3" />8 min read</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
            How to Build a Telegram AI Chatbot in 10 Minutes
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            This guide walks you through deploying a GPT-4 or Claude-powered AI support bot on Telegram — from creating the bot to handling your first customer message. No coding required.
          </p>
        </div>

        {/* Inline CTA */}
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 mb-10 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-semibold text-white">Want to skip the reading?</div>
            <div className="text-xs text-zinc-400">Create an account and follow along — it&apos;s free.</div>
          </div>
          <Link href="/sign-up" className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg text-sm font-semibold shrink-0">
            Start Free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* What you'll need */}
        <div className="prose prose-invert max-w-none">
          <h2 className="text-xl font-bold text-white mb-4">What You&apos;ll Need</h2>
          <ul className="space-y-2 mb-8">
            {[
              "A Telegram account",
              "An OpenAI, Anthropic, or OpenRouter API key (takes 2 minutes to create)",
              "A free OpenHelix account",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-zinc-300 text-sm">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />{item}
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-bold text-white mb-4">Step 1: Create a Bot with @BotFather</h2>
          <p className="text-zinc-400 mb-4 leading-relaxed">
            Every Telegram bot starts with @BotFather — Telegram&apos;s official bot for creating bots. Open Telegram and search for <strong className="text-white">@BotFather</strong>.
          </p>
          <ol className="space-y-3 mb-6 list-none">
            {[
              'Send the command: /newbot',
              'Choose a display name (e.g. "Acme Support")',
              'Choose a username — must end in "bot" (e.g. AcmeSupportBot)',
              'BotFather sends you a token. Copy it — you\'ll need it in Step 5.',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-300">
                <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>
          <div className="bg-black/40 border border-white/5 rounded-xl p-4 mb-8 font-mono text-sm">
            <div className="text-zinc-500 text-xs mb-2"># BotFather gives you a token like this:</div>
            <div className="text-emerald-400">5678901234:AAFxxx_your_bot_token_here</div>
          </div>

          <h2 className="text-xl font-bold text-white mb-4">Step 2: Get Your AI API Key</h2>
          <p className="text-zinc-400 mb-4 leading-relaxed">
            OpenHelix uses your own API key so AI costs pass through at cost — no markup. You can use OpenAI, Anthropic, or OpenRouter (which gives access to 50+ models from one key).
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mb-8">
            {[
              { name: "OpenAI", url: "platform.openai.com/api-keys", note: "GPT-4o, GPT-4 Turbo" },
              { name: "Anthropic", url: "console.anthropic.com", note: "Claude 3 Opus, Sonnet" },
              { name: "OpenRouter", url: "openrouter.ai/keys", note: "50+ models, one key" },
            ].map((p) => (
              <div key={p.name} className="bg-white/[0.03] border border-white/5 rounded-lg p-3 text-sm">
                <div className="font-semibold text-white mb-0.5">{p.name}</div>
                <div className="text-xs text-zinc-500 mb-2">{p.url}</div>
                <div className="text-xs text-zinc-400">{p.note}</div>
              </div>
            ))}
          </div>

          <h2 className="text-xl font-bold text-white mb-4">Step 3: Create Your OpenHelix Instance</h2>
          <p className="text-zinc-400 mb-4 leading-relaxed">
            Sign up at <Link href="/sign-up" className="text-violet-400 hover:text-violet-300">openhelixai.com</Link> — it&apos;s free, no credit card required. Once inside:
          </p>
          <ol className="space-y-3 mb-8 list-none">
            {[
              'Click "New Instance" on the dashboard',
              'Give it a name (e.g. "Customer Support Bot")',
              'Go to Credentials tab → add your API key',
              'Choose your AI model (GPT-4o is a good default)',
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-sm text-zinc-300">
                <span className="w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <span>{item}</span>
              </li>
            ))}
          </ol>

          <h2 className="text-xl font-bold text-white mb-4">Step 4: Write Your System Prompt</h2>
          <p className="text-zinc-400 mb-4 leading-relaxed">
            The system prompt defines your agent&apos;s personality, role, and boundaries. This is the most important step — a good prompt means accurate, on-brand answers.
          </p>
          <div className="bg-black/40 border border-white/5 rounded-xl p-4 mb-4 text-sm">
            <div className="text-zinc-500 text-xs mb-2"># Example system prompt for a restaurant:</div>
            <div className="text-zinc-200 leading-relaxed whitespace-pre-wrap">{`You are the AI assistant for Mario's Pizzeria in Barcelona.

Your job: answer customer questions about our menu, opening hours, reservations, and delivery.

Opening hours: Mon–Sat 12:00–23:00, Sunday closed.
Delivery: We deliver within 5km via our website.
Reservations: Call +34 93 123 4567 or book at marios.com/book

If a customer asks something you don't know, say:
"Great question! Please call us at +34 93 123 4567 and our team will help."

Always be friendly and brief. Respond in the customer's language.`}</div>
          </div>
          <p className="text-zinc-400 mb-8 text-sm">
            <strong className="text-white">Pro tip:</strong> You can also upload a knowledge base — PDFs, FAQs, product docs — and the AI will reference them when answering.
          </p>

          <h2 className="text-xl font-bold text-white mb-4">Step 5: Connect Telegram and Go Live</h2>
          <p className="text-zinc-400 mb-4 leading-relaxed">
            In your instance dashboard, click the <strong className="text-white">Deploy</strong> tab. Under <strong className="text-white">Telegram</strong>, paste the bot token you got from BotFather. Click <strong className="text-white">Connect</strong>.
          </p>
          <p className="text-zinc-400 mb-6 leading-relaxed">
            That&apos;s it. Open Telegram and send your bot a message — it should reply instantly with an AI response.
          </p>

          {/* Result callout */}
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-5 mb-8">
            <div className="text-emerald-400 font-semibold mb-1">✅ Your bot is live</div>
            <p className="text-sm text-zinc-300">Every message your Telegram bot receives will now get an AI response — 24/7, in any language, based on your system prompt and knowledge base.</p>
          </div>

          <h2 className="text-xl font-bold text-white mb-4">What Happens Next</h2>
          <p className="text-zinc-400 mb-4 leading-relaxed">After you go live:</p>
          <ul className="space-y-2 mb-8">
            {[
              "All conversations are logged in your Manager dashboard",
              "You get daily digest emails with unanswered questions",
              "Analytics show response times, message volume, and top topics",
              "You can update the system prompt and knowledge base at any time",
            ].map((item, i) => (
              <li key={i} className="flex items-start gap-2 text-zinc-300 text-sm">
                <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />{item}
              </li>
            ))}
          </ul>

          <h2 className="text-xl font-bold text-white mb-4">Tips for Better Results</h2>
          <ul className="space-y-3 mb-10">
            {[
              { title: "Be specific in your prompt", desc: "The more context you give (business name, hours, products, tone), the better the answers." },
              { title: "Use the knowledge base", desc: "Upload your FAQ doc or product catalogue. The AI uses it as a reference for accurate answers." },
              { title: "Test with edge cases", desc: "Try questions the AI might get wrong — then refine the prompt to handle them correctly." },
              { title: "Review daily digests", desc: "The manager dashboard flags unanswered or unsatisfactory responses. Use these to improve your prompt." },
            ].map((item, i) => (
              <li key={i} className="flex gap-3 text-sm list-none">
                <span className="w-5 h-5 rounded-full bg-violet-500/20 text-violet-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <div>
                  <span className="font-semibold text-white">{item.title}:</span>{" "}
                  <span className="text-zinc-400">{item.desc}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom CTA */}
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Ready to build yours?</h2>
          <p className="text-zinc-400 text-sm mb-6">Free plan · 2,000 messages · GPT-4 or Claude · 3-minute setup</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-xl font-semibold">
            Create Your Telegram Bot <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Related */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="text-sm text-zinc-500 mb-4">Related guides</div>
          <div className="flex flex-col gap-2">
            <Link href="/integrations/telegram" className="text-violet-400 hover:text-violet-300 transition-colors text-sm">
              → Telegram integration overview
            </Link>
            <Link href="/integrations/whatsapp" className="text-violet-400 hover:text-violet-300 transition-colors text-sm">
              → WhatsApp AI chatbot setup guide
            </Link>
            <Link href="/pricing" className="text-violet-400 hover:text-violet-300 transition-colors text-sm">
              → OpenHelix pricing plans
            </Link>
          </div>
        </div>

      </main>
      <SiteFooter />
    </div>
  );
}
