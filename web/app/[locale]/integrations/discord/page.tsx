import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Check, Zap, MessageCircle, Bot, Shield, Clock, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "Discord AI Support Bot — Add GPT-4 to Your Discord Server",
  description:
    "Deploy an AI customer support bot to your Discord server. Powered by GPT-4 or Claude. Answers questions in channels and DMs. Free to start.",
  openGraph: {
    title: "Discord AI Support Bot — GPT-4 on Discord",
    description: "Add an AI agent to your Discord server. Handles support questions, FAQs, and onboarding 24/7.",
    type: "article",
  },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to add an AI bot to a Discord server",
  description: "Deploy a GPT-4 or Claude-powered AI agent to your Discord server using OpenHelix.",
  totalTime: "PT10M",
  step: [
    { "@type": "HowToStep", position: 1, name: "Create a Discord application", text: "Go to discord.com/developers/applications. Click 'New Application', give it a name, then navigate to the Bot section. Add a bot and copy the token." },
    { "@type": "HowToStep", position: 2, name: "Invite the bot to your server", text: "In OAuth2 → URL Generator, select 'bot' scope and permissions: Send Messages, Read Message History, View Channels. Copy the URL and open it to add the bot to your server." },
    { "@type": "HowToStep", position: 3, name: "Sign up for OpenHelix", text: "Create a free account at openhelixai.com. Add your OpenAI, Anthropic, or OpenRouter API key in Credentials." },
    { "@type": "HowToStep", position: 4, name: "Configure your AI agent", text: "Write a system prompt that defines your agent's role and knowledge. Upload any FAQ docs to the knowledge base." },
    { "@type": "HowToStep", position: 5, name: "Connect Discord and go live", text: "Paste your Discord bot token in Deploy → Discord. Your AI agent is now live in your server." },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can the Discord bot respond in specific channels only?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. You can configure the bot to respond only in designated support channels, or only when mentioned with @botname, to avoid flooding general chat." },
    },
    {
      "@type": "Question",
      name: "Which AI models can I use for the Discord bot?",
      acceptedAnswer: { "@type": "Answer", text: "Any model via OpenAI, Anthropic, or OpenRouter — including GPT-4o, Claude 3, Mistral, Gemini, and 50+ others. You use your own API key so costs pass through at cost." },
    },
    {
      "@type": "Question",
      name: "Can it answer questions from my Discord community members?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. It's ideal for community servers where members ask the same questions repeatedly. Upload your FAQ, rules, and product docs to the knowledge base for accurate answers." },
    },
    {
      "@type": "Question",
      name: "Is a Discord AI bot free?",
      acceptedAnswer: { "@type": "Answer", text: "OpenHelix is free up to 2,000 messages/month. You'll also need an AI API key — OpenAI costs roughly $1–5/month for a small community. Discord bots themselves are free to create." },
    },
  ],
};

export default function DiscordIntegrationPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

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

      <main className="max-w-5xl mx-auto px-4 py-16">

        <nav className="text-sm text-zinc-500 mb-8">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/integrations" className="hover:text-zinc-300 transition-colors">Integrations</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">Discord</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <MessageCircle className="w-3.5 h-3.5" />Discord Integration
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 leading-tight">
            Discord AI Support Bot<br /><span className="text-violet-400">Answer Questions 24/7</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
            Add a GPT-4 or Claude-powered AI agent to your Discord server. Handles support questions, community FAQs, and onboarding — so your team doesn&apos;t have to answer the same questions all day.
          </p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-3.5 rounded-xl font-semibold text-lg">
            Add to Discord Free <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-zinc-500 mt-3">2,000 messages free · No credit card · ~10 min setup</p>
        </div>

        {/* Benefits */}
        <section className="mb-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Bot, title: "Any AI model", desc: "GPT-4o, Claude 3, Mistral, Gemini — use your own API key. No AI cost markup." },
              { icon: Clock, title: "24/7 instant replies", desc: "Community members get answers immediately, even at 3 AM in a different timezone." },
              { icon: Users, title: "Built for communities", desc: "Perfect for crypto projects, SaaS products, gaming servers, and creator communities." },
              { icon: Shield, title: "Knowledge base", desc: "Upload your docs, FAQ, roadmap. The AI answers only from what you provide — no hallucinations." },
              { icon: MessageCircle, title: "Channel-specific", desc: "Configure the bot to respond only in #support or only when @mentioned." },
              { icon: Check, title: "Manager dashboard", desc: "See all Discord conversations, unanswered questions, and support trends in one place." },
            ].map((item, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                <item.icon className="w-6 h-6 text-violet-400 mb-3" />
                <h3 className="font-semibold text-white mb-1.5">{item.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How to */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">How to Add AI to Your Discord Server</h2>
          <p className="text-zinc-400 mb-8">Takes about 10 minutes from start to first AI reply.</p>
          <div className="space-y-4">
            {howToSchema.step.map((item) => (
              <div key={item.position} className="flex gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-5">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 font-bold flex items-center justify-center shrink-0 text-sm">
                  {item.position}
                </div>
                <div>
                  <div className="font-semibold text-white mb-0.5">{item.name}</div>
                  <div className="text-sm text-zinc-400 leading-relaxed">{item.text}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Use cases */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">Discord AI Bot Use Cases</h2>
          <p className="text-zinc-400 mb-6">What communities actually use it for.</p>
          <div className="grid sm:grid-cols-2 gap-4">
            {[
              { title: "Crypto & Web3 projects", desc: "Answer tokenomics, wallet setup, and roadmap questions without moderation burnout." },
              { title: "SaaS support servers", desc: "Handle tier-1 support — billing questions, feature FAQs, bug reporting flow — before escalating to your team." },
              { title: "Gaming communities", desc: "Game guides, patch notes summaries, event info — AI keeps it fresh without manual updates." },
              { title: "Creator communities", desc: "Answer subscriber questions, membership perks, and exclusive content info 24/7." },
              { title: "Developer tools", desc: "API documentation Q&A, error messages explained, setup troubleshooting." },
              { title: "E-learning servers", desc: "Answer curriculum questions, assignment guidance, and resource recommendations." },
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
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Add AI to Your Discord Server</h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">Free plan · 2,000 messages · GPT-4 or Claude · ~10 min setup</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-4 rounded-xl font-semibold text-lg">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        {/* Related links */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Related Guides</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/integrations/telegram" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Telegram Integration</div><div className="text-xs text-zinc-500 mt-0.5">Also deploy AI on Telegram</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/integrations/whatsapp" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">WhatsApp Integration</div><div className="text-xs text-zinc-500 mt-0.5">Add AI to WhatsApp Business</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/blog/how-to-build-telegram-chatbot" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Telegram Chatbot Tutorial</div><div className="text-xs text-zinc-500 mt-0.5">Step-by-step, 10 minutes</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/blog/best-ai-models-for-customer-support" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Best AI Models for Support</div><div className="text-xs text-zinc-500 mt-0.5">GPT-4o vs Claude vs Gemini</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-white/5 py-8 mt-16">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <span>© 2026 SynapseForge. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/integrations/telegram" className="hover:text-zinc-300 transition-colors">Telegram</Link>
            <Link href="/integrations/whatsapp" className="hover:text-zinc-300 transition-colors">WhatsApp</Link>
            <Link href="/pricing" className="hover:text-zinc-300 transition-colors">Pricing</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
