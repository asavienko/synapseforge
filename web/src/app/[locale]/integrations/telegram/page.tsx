import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Check, Zap, MessageCircle, Bot, Shield, Clock, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "Telegram AI Chatbot — Deploy GPT-4 on Telegram in 3 Minutes",
  description:
    "Add an AI customer support agent to your Telegram channel or group. Powered by GPT-4, Claude, or any LLM. No coding required. Free to start.",
  openGraph: {
    title: "Telegram AI Chatbot — Deploy GPT-4 on Telegram in 3 Minutes",
    description: "AI-powered customer support for Telegram. GPT-4, Claude, 50+ models. Free plan available.",
    type: "article",
  },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to add an AI chatbot to Telegram",
  description: "Deploy a GPT-4 or Claude-powered AI agent to your Telegram channel in under 5 minutes.",
  totalTime: "PT5M",
  step: [
    {
      "@type": "HowToStep",
      position: 1,
      name: "Create a Telegram bot",
      text: "Open Telegram, search for @BotFather, send /newbot, choose a name and username. Copy the bot token.",
    },
    {
      "@type": "HowToStep",
      position: 2,
      name: "Sign up for OpenHelix",
      text: "Create a free account at openhelixai.com. No credit card required.",
    },
    {
      "@type": "HowToStep",
      position: 3,
      name: "Add your AI API key",
      text: "Go to Credentials and add your OpenAI, Anthropic, or OpenRouter API key.",
    },
    {
      "@type": "HowToStep",
      position: 4,
      name: "Connect Telegram",
      text: "Paste your bot token in the Deploy tab under Telegram. Click Connect.",
    },
    {
      "@type": "HowToStep",
      position: 5,
      name: "Go live",
      text: "Your AI agent is now live on Telegram. Every message to your bot gets an AI response.",
    },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Does the Telegram bot work in groups?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Add the bot to any Telegram group or channel. You can configure it to respond only when mentioned (@botname) or to reply to all messages.",
      },
    },
    {
      "@type": "Question",
      name: "Which AI models can I use for the Telegram bot?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Any model supported by OpenAI, Anthropic, or OpenRouter — including GPT-4o, GPT-4 Turbo, Claude 3 Opus, Claude 3 Sonnet, Gemini, Mistral, and 50+ others.",
      },
    },
    {
      "@type": "Question",
      name: "Can I train the bot on my own data?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Upload documents, FAQs, or product information to the knowledge base. The AI agent answers questions based on your content.",
      },
    },
    {
      "@type": "Question",
      name: "Is it free to add AI to Telegram?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OpenHelix is free to start with 2,000 messages/month. You also need an AI API key (OpenAI starts at $0.002/1K tokens — typically $1–5/month for a small business).",
      },
    },
  ],
};

export default function TelegramIntegrationPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

      {/* Nav */}
      <nav className="border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <Zap className="w-5 h-5 text-violet-400" />
            OpenHelix AI
          </Link>
          <Link
            href="/sign-up"
            className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg text-sm font-semibold"
          >
            Try Free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-16">

        {/* Breadcrumb */}
        <nav className="text-sm text-zinc-500 mb-8">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span>Integrations</span>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">Telegram</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <MessageCircle className="w-3.5 h-3.5" />
            Telegram Integration
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Telegram AI Chatbot<br />
            <span className="text-violet-400">Live in 3 Minutes</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
            Add a GPT-4 or Claude-powered AI agent to any Telegram channel, group, or bot. Answers customer questions 24/7. No coding required.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
            <Link
              href="/sign-up"
              className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-3.5 rounded-xl font-semibold text-lg w-full sm:w-auto justify-center"
            >
              Connect Telegram Free <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/api-docs"
              className="flex items-center gap-2 border border-white/10 hover:border-white/20 px-8 py-3.5 rounded-xl font-semibold text-zinc-300 w-full sm:w-auto justify-center"
            >
              View API Docs
            </Link>
          </div>
          <p className="text-sm text-zinc-500">2,000 messages free · No credit card · 3-minute setup</p>
        </div>

        {/* Benefits grid */}
        <section className="mb-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Bot, title: "Any AI model", desc: "GPT-4o, Claude 3, Gemini, Mistral, and 50+ models via OpenRouter. Use your own API keys." },
              { icon: Clock, title: "24/7 responses", desc: "Your Telegram bot replies instantly at any hour — even when your team is offline." },
              { icon: Globe, title: "Multilingual", desc: "The AI responds in the customer's language automatically. No extra configuration needed." },
              { icon: Shield, title: "Knowledge base", desc: "Upload your FAQs, docs, and product info. The AI only answers based on your content." },
              { icon: MessageCircle, title: "Groups & channels", desc: "Works in Telegram groups, channels, and 1-on-1 chats. Configure mention-only mode." },
              { icon: Check, title: "Manager dashboard", desc: "View all Telegram conversations, track unanswered questions, and get daily digest emails." },
            ].map((item, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                <item.icon className="w-6 h-6 text-violet-400 mb-3" />
                <h3 className="font-semibold text-white mb-1.5">{item.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How to guide */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">How to Add AI to Telegram</h2>
          <p className="text-zinc-400 mb-8">Step-by-step setup — takes about 5 minutes.</p>

          <div className="space-y-4">
            {[
              {
                step: "1",
                title: "Create a Telegram bot via @BotFather",
                desc: "Open Telegram and search for @BotFather. Send /newbot, choose a display name and a username (must end in 'bot'). BotFather gives you a token — copy it.",
                code: "# Example token format\n5678901234:AAFxxx_your_bot_token_here",
              },
              {
                step: "2",
                title: "Sign up for OpenHelix AI",
                desc: "Create your free account at openhelixai.com. The free plan includes 2,000 messages per month — enough to get started.",
                code: null,
              },
              {
                step: "3",
                title: "Connect your AI model",
                desc: "In your instance dashboard, go to Credentials and add your OpenAI or Anthropic API key. Or use OpenRouter to access 50+ models from one key.",
                code: "# Add to Credentials tab\nOPENAI_API_KEY=sk-...\n# or\nANTHROPIC_API_KEY=sk-ant-...",
              },
              {
                step: "4",
                title: "Write your system prompt",
                desc: "In the Configuration tab, write a system prompt that defines your agent's role, tone, and knowledge. Example: 'You are a support agent for Acme Corp. Help customers with orders, returns, and product questions.'",
                code: null,
              },
              {
                step: "5",
                title: "Paste your bot token and go live",
                desc: "Go to Deploy → Telegram. Paste your bot token and click Connect. Your AI agent is now live — test it by messaging your bot in Telegram.",
                code: null,
              },
            ].map((item) => (
              <div key={item.step} className="bg-white/[0.02] border border-white/5 rounded-xl overflow-hidden">
                <div className="flex gap-4 p-5">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 font-bold flex items-center justify-center shrink-0 text-sm">
                    {item.step}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-white mb-1">{item.title}</h3>
                    <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
                {item.code && (
                  <pre className="bg-black/40 border-t border-white/5 px-5 py-3 text-xs text-emerald-400 font-mono overflow-x-auto">
                    {item.code}
                  </pre>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Use cases */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">What Businesses Use It For</h2>
          <p className="text-zinc-400 mb-6">Common use cases for AI on Telegram.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "Customer support bot", desc: "Answer FAQs, order status, and returns 24/7. Reduce support tickets by 60%." },
              { title: "Lead qualification", desc: "Capture and qualify leads from Telegram ads and channel traffic before human follow-up." },
              { title: "Restaurant & booking", desc: "Take reservations, answer menu questions, and confirm appointments automatically." },
              { title: "Community management", desc: "Answer member questions in large Telegram groups without manual moderation." },
              { title: "Product catalogue bot", desc: "Let customers browse products, check availability, and get specs via chat." },
              { title: "Internal helpdesk", desc: "Deploy for internal teams: IT support, HR questions, onboarding guides." },
            ].map((item, i) => (
              <div key={i} className="flex gap-3 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <Check className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <div className="font-medium text-white mb-0.5">{item.title}</div>
                  <div className="text-sm text-zinc-400">{item.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {faqSchema.mainEntity.map((item, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
                <h3 className="font-semibold text-white mb-2">{item.name}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.acceptedAnswer.text}</p>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-violet-500/10 border border-violet-500/20 rounded-2xl p-12">
          <MessageCircle className="w-12 h-12 text-violet-400 mx-auto mb-4" />
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Add AI to Your Telegram Today</h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            Free plan · 2,000 messages · GPT-4 or Claude · 3-minute setup
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-4 rounded-xl font-semibold text-lg"
          >
            Connect Telegram Free <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8 mt-16">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <span>© 2026 SynapseForge. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/integrations" className="hover:text-zinc-300 transition-colors">All integrations</Link>
            <Link href="/pricing" className="hover:text-zinc-300 transition-colors">Pricing</Link>
            <Link href="/api-docs" className="hover:text-zinc-300 transition-colors">API Docs</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
