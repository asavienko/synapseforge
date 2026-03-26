import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Check, X, ArrowRight, Star } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "OpenHelix vs Crisp: Best Crisp Alternative in 2026",
  description:
    "Comparing OpenHelix AI and Crisp for AI customer support. Features, pricing, and why businesses choose OpenHelix for Telegram and WhatsApp. Free plan available.",
  openGraph: {
    title: "OpenHelix vs Crisp — Full Comparison 2026",
    description: "Is Crisp right for you? Honest feature comparison with pricing, AI capabilities, and channel support.",
    type: "article",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is OpenHelix a good Crisp alternative?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes, especially if you need Telegram support, flexible AI models (GPT-4, Claude, OpenRouter), or white-label capabilities. Crisp's AI (Hugo) is newer and less mature. OpenHelix is API-first and lets you bring your own API keys.",
      },
    },
    {
      "@type": "Question",
      name: "What does Crisp have that OpenHelix doesn't?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Crisp has a strong shared inbox for teams, a built-in CRM, and a free plan with live chat. It's well-established for web chat with human agents. OpenHelix is focused on AI-first automation rather than human-agent workflows.",
      },
    },
    {
      "@type": "Question",
      name: "How does OpenHelix pricing compare to Crisp?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Crisp has a generous free plan for basic live chat. OpenHelix starts free at 2,000 AI messages/month. OpenHelix paid plans let you use your own API keys — no AI cost markup. Crisp's Hugo AI is billed separately on top of base plans.",
      },
    },
    {
      "@type": "Question",
      name: "Does OpenHelix work for multilingual support like Crisp?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. The AI responds automatically in the customer's language without extra configuration. Both OpenHelix and Crisp support multilingual conversations.",
      },
    },
  ],
};

const features = [
  { name: "Free plan", openhelix: true, crisp: true, note: "Crisp: free for 2 agents, basic features. OpenHelix: 2,000 AI messages." },
  { name: "GPT-4 support", openhelix: true, crisp: true, note: "Crisp's Hugo AI. OpenHelix: your choice of model." },
  { name: "Claude / Anthropic", openhelix: true, crisp: false },
  { name: "OpenRouter (50+ models)", openhelix: true, crisp: false },
  { name: "Bring your own API key", openhelix: true, crisp: false },
  { name: "Telegram integration", openhelix: true, crisp: false },
  { name: "WhatsApp integration", openhelix: true, crisp: true },
  { name: "Web chat widget", openhelix: true, crisp: true },
  { name: "White-label option", openhelix: true, crisp: false },
  { name: "Shared team inbox", openhelix: false, crisp: true, note: "Crisp excels at multi-agent live chat" },
  { name: "Built-in CRM", openhelix: false, crisp: true },
  { name: "Knowledge base", openhelix: true, crisp: true },
  { name: "Manager dashboard", openhelix: true, crisp: true },
  { name: "API access", openhelix: true, crisp: true },
  { name: "Webhooks / automation", openhelix: true, crisp: true },
  { name: "Multilingual", openhelix: true, crisp: true },
  { name: "GDPR compliant", openhelix: true, crisp: true },
  { name: "Setup time", openhelix: true, crisp: true, note: "Both are relatively quick to set up" },
];

export default function CrispComparePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SiteHeader />

      <main className="max-w-5xl mx-auto px-4 py-16">
        <nav className="text-sm text-zinc-500 mb-8">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
          <span className="mx-2">/</span><span>Compare</span>
          <span className="mx-2">/</span><span className="text-zinc-300">OpenHelix vs Crisp</span>
        </nav>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            Updated March 2026
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 leading-tight">
            OpenHelix vs Crisp:<br /><span className="text-violet-400">Which Wins for AI Support?</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
            Crisp is great for live chat teams. But if you need AI-first automation with Telegram, flexible LLMs, or white-label — here&apos;s how we compare.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-left">
              <div className="text-xs text-violet-400 font-medium mb-2">CHOOSE OPENHELIX IF…</div>
              <ul className="space-y-1.5 text-sm text-zinc-300">
                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />You need Telegram + WhatsApp + web</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />You want GPT-4, Claude, or any LLM</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />You need white-label for clients</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />You want AI to handle 90%+ without agents</li>
              </ul>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-left">
              <div className="text-xs text-zinc-500 font-medium mb-2">CHOOSE CRISP IF…</div>
              <ul className="space-y-1.5 text-sm text-zinc-400">
                <li className="flex gap-2"><Check className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />You have a human support team</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />You need a shared inbox / ticketing</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />Built-in CRM matters to you</li>
              </ul>
            </div>
          </div>

          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-3.5 rounded-xl font-semibold text-lg">
            Try OpenHelix Free <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-zinc-500 mt-3">No credit card · 2,000 messages free · 3-minute setup</p>
        </div>

        {/* Quick table */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Quick Comparison</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium w-1/3"></th>
                  <th className="px-4 py-3 text-violet-400 font-semibold text-center">OpenHelix AI</th>
                  <th className="px-4 py-3 text-zinc-400 font-medium text-center">Crisp</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Free plan", "2,000 AI msgs/mo", "2 agents, basic chat"],
                  ["AI model", "GPT-4, Claude, 50+ via OpenRouter", "Hugo (GPT-4 based)"],
                  ["Own API key", "✅ Yes", "❌ No"],
                  ["Telegram", "✅ Yes", "❌ No"],
                  ["WhatsApp", "✅ Yes", "✅ Yes"],
                  ["White label", "✅ Yes", "❌ No"],
                  ["Shared inbox", "❌ No", "✅ Yes"],
                  ["Built-in CRM", "❌ No", "✅ Yes"],
                  ["API access", "✅ Full", "✅ Yes"],
                  ["Setup time", "~3 minutes", "~10 minutes"],
                ].map(([feature, oh, cr], i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-zinc-300">{feature}</td>
                    <td className="px-4 py-3 text-center font-medium text-violet-300">{oh}</td>
                    <td className="px-4 py-3 text-center text-zinc-400">{cr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Full matrix */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Full Feature Comparison</h2>
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Feature</th>
                  <th className="px-4 py-3 text-violet-400 font-semibold text-center w-24">OpenHelix</th>
                  <th className="px-4 py-3 text-zinc-400 font-medium text-center w-24">Crisp</th>
                </tr>
              </thead>
              <tbody>
                {features.map((f, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-zinc-300">
                      <div>{f.name}</div>
                      {f.note && <div className="text-xs text-zinc-500 mt-0.5">{f.note}</div>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {f.openhelix ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-zinc-600 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {f.crisp ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-zinc-600 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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

        <section className="text-center bg-violet-500/10 border border-violet-500/20 rounded-2xl p-12">
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">AI-first support starts here</h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">GPT-4 + Claude · Telegram + WhatsApp + web · Free plan · 3-minute setup</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-4 rounded-xl font-semibold text-lg">
            Start for Free <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-zinc-500 mt-4">No credit card required</p>
        </section>

        {/* Related links */}
        <section className="mb-8">
          <h2 className="text-xl font-bold mb-4">Related Guides</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/compare/tidio" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">OpenHelix vs Tidio</div><div className="text-xs text-zinc-500 mt-0.5">Most popular chatbot alternative</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/compare/intercom" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">OpenHelix vs Intercom</div><div className="text-xs text-zinc-500 mt-0.5">Is Intercom&apos;s price worth it?</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/integrations/whatsapp" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">WhatsApp AI Chatbot Guide</div><div className="text-xs text-zinc-500 mt-0.5">Connect AI to WhatsApp Business</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/blog/how-to-build-telegram-chatbot" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">How to Build a Telegram AI Chatbot</div><div className="text-xs text-zinc-500 mt-0.5">Step-by-step, 10 minutes</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
