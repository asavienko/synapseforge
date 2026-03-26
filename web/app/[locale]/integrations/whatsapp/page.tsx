import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Check, MessageCircle, Bot, Shield, Globe, Clock } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "WhatsApp AI Chatbot — Add GPT-4 to WhatsApp Business in Minutes",
  description:
    "Connect an AI customer support agent to WhatsApp Business. GPT-4, Claude, 50+ models. Handles FAQs, bookings, and support 24/7. Free to start.",
  openGraph: {
    title: "WhatsApp AI Chatbot — Deploy AI on WhatsApp Business",
    description: "AI customer support for WhatsApp. GPT-4, Claude, 50+ models. Free plan available.",
    type: "article",
  },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to add an AI chatbot to WhatsApp Business",
  description: "Connect a GPT-4 powered AI agent to your WhatsApp Business number using Twilio.",
  totalTime: "PT10M",
  step: [
    { "@type": "HowToStep", position: 1, name: "Get a Twilio account", text: "Sign up at twilio.com. Twilio provides the WhatsApp Business API connection. New accounts get free credits." },
    { "@type": "HowToStep", position: 2, name: "Connect WhatsApp in Twilio", text: "In Twilio Console, enable the WhatsApp sandbox or connect your business number. Get your Account SID and Auth Token." },
    { "@type": "HowToStep", position: 3, name: "Create your OpenHelix instance", text: "Sign up at openhelixai.com and create a new AI agent instance. Add your OpenAI or Anthropic API key." },
    { "@type": "HowToStep", position: 4, name: "Add Twilio credentials", text: "In your instance Credentials tab, add your Twilio Account SID, Auth Token, and WhatsApp number." },
    { "@type": "HowToStep", position: 5, name: "Go live", text: "Your AI agent now handles all incoming WhatsApp messages automatically." },
  ],
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Do I need a WhatsApp Business API account?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. OpenHelix connects via Twilio's WhatsApp Business API. Twilio provides a sandbox for testing and production numbers for live use. New Twilio accounts get free credits." },
    },
    {
      "@type": "Question",
      name: "Can the WhatsApp bot handle media (images, voice)?",
      acceptedAnswer: { "@type": "Answer", text: "The AI agent handles text messages and can describe images if your AI model supports vision (GPT-4o, Claude 3). Voice messages are not currently supported." },
    },
    {
      "@type": "Question",
      name: "Will the AI respond to every WhatsApp message?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Every inbound message triggers an AI response unless you configure a keyword to hand off to a human agent. You can review all conversations in the manager dashboard." },
    },
    {
      "@type": "Question",
      name: "How much does WhatsApp AI cost?",
      acceptedAnswer: { "@type": "Answer", text: "OpenHelix is free up to 2,000 messages/month. Twilio charges per message (~$0.005 per WhatsApp message). Your AI model costs depend on which model you use — typically $1–5/month for a small business." },
    },
  ],
};

export default function WhatsAppIntegrationPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SiteHeader />

      <main className="max-w-5xl mx-auto px-4 py-16">
        <nav className="text-sm text-zinc-500 mb-8">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
          <span className="mx-2">/</span><span>Integrations</span>
          <span className="mx-2">/</span><span className="text-zinc-300">WhatsApp</span>
        </nav>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            <MessageCircle className="w-3.5 h-3.5" />WhatsApp Business Integration
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 leading-tight">
            WhatsApp AI Chatbot<br /><span className="text-violet-400">Handle Support 24/7</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
            Connect a GPT-4 or Claude-powered AI agent to your WhatsApp Business number. Answers customer questions automatically — day and night.
          </p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-3.5 rounded-xl font-semibold text-lg">
            Connect WhatsApp Free <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-zinc-500 mt-3">2,000 messages free · No credit card</p>
        </div>

        <section className="mb-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              { icon: Bot, title: "GPT-4 & Claude", desc: "Use any AI model via your own API key. No markup on AI costs." },
              { icon: Clock, title: "24/7 auto-reply", desc: "Every WhatsApp message gets an instant AI response, any hour." },
              { icon: Globe, title: "Multilingual", desc: "AI responds in the customer's language automatically." },
              { icon: Shield, title: "Knowledge base", desc: "Train on your FAQs, docs, and product data for accurate answers." },
              { icon: MessageCircle, title: "Full conversation history", desc: "Every chat stored and searchable in your manager dashboard." },
              { icon: Check, title: "Daily digest emails", desc: "Get a daily summary of unanswered questions and support trends." },
            ].map((item, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                <item.icon className="w-6 h-6 text-violet-400 mb-3" />
                <h3 className="font-semibold text-white mb-1.5">{item.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">How to Add AI to WhatsApp</h2>
          <p className="text-zinc-400 mb-8">Setup takes about 10 minutes.</p>
          <div className="space-y-4">
            {howToSchema.step.map((item) => (
              <div key={item.position} className="flex gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-5">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 font-bold flex items-center justify-center shrink-0 text-sm">
                  {item.position}
                </div>
                <div>
                  <div className="font-semibold text-white mb-0.5">{item.name}</div>
                  <div className="text-sm text-zinc-400">{item.text}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

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

        <section className="text-center bg-violet-500/10 border border-violet-500/20 rounded-2xl p-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Add AI to WhatsApp Today</h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">Free plan · 2,000 messages · GPT-4 or Claude · 10-minute setup</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-4 rounded-xl font-semibold text-lg">
            Connect WhatsApp Free <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        {/* Related links */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Related Guides</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/integrations/telegram" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Telegram Integration</div><div className="text-xs text-zinc-500 mt-0.5">Also deploy AI on Telegram — 3 min setup</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/integrations/discord" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Discord Integration</div><div className="text-xs text-zinc-500 mt-0.5">Add AI to your Discord server</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/compare/tidio" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">OpenHelix vs Tidio</div><div className="text-xs text-zinc-500 mt-0.5">How we compare on WhatsApp support</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/blog/best-ai-models-for-customer-support" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Best AI Models for Support</div><div className="text-xs text-zinc-500 mt-0.5">GPT-4o vs Claude vs Gemini</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
