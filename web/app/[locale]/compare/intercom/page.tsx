import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Check, X, ArrowRight, Star } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "OpenHelix vs Intercom: Best Intercom Alternative in 2026",
  description:
    "Comparing OpenHelix AI and Intercom for AI customer support. See features, pricing, and why businesses choose OpenHelix. Free plan available.",
  openGraph: {
    title: "OpenHelix vs Intercom — Full Comparison 2026",
    description: "Is Intercom too expensive? See how OpenHelix compares on features, pricing, and AI capabilities.",
    type: "article",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is OpenHelix a good Intercom alternative?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "For AI-first customer support on Telegram, WhatsApp, and web, yes. OpenHelix offers flexible LLM support (GPT-4, Claude, OpenRouter), white-label, and your own API keys at a fraction of Intercom's cost. Intercom is stronger for large enterprise with complex CRM workflows.",
      },
    },
    {
      "@type": "Question",
      name: "How much cheaper is OpenHelix vs Intercom?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Intercom's Essential plan starts at $39/seat/month and scales quickly with usage. OpenHelix starts free with 2,000 messages, with paid plans starting lower. Crucially, OpenHelix lets you use your own API keys — AI model costs pass through at cost with no markup.",
      },
    },
    {
      "@type": "Question",
      name: "Does OpenHelix have a Fin AI equivalent?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. OpenHelix's AI agents use GPT-4, Claude, or any LLM you choose, trained on your knowledge base. Unlike Fin (which is locked to Intercom's model), you choose and control the AI model.",
      },
    },
    {
      "@type": "Question",
      name: "What does Intercom have that OpenHelix doesn't?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Intercom has a mature in-app messenger, advanced CRM/pipeline features, deep Salesforce integration, and a large enterprise ecosystem. If you need in-app chat inside your SaaS product with CRM workflows, Intercom has more depth there.",
      },
    },
  ],
};

const features = [
  { name: "Free plan", openhelix: true, intercom: false, note: "Intercom requires a paid plan from day 1" },
  { name: "GPT-4 support", openhelix: true, intercom: true },
  { name: "Claude / Anthropic", openhelix: true, intercom: false },
  { name: "OpenRouter (50+ models)", openhelix: true, intercom: false },
  { name: "Bring your own API key", openhelix: true, intercom: false, note: "Intercom's Fin AI is billed per resolution" },
  { name: "Telegram integration", openhelix: true, intercom: false },
  { name: "WhatsApp integration", openhelix: true, intercom: true, note: "Intercom: enterprise add-on" },
  { name: "Web chat widget", openhelix: true, intercom: true },
  { name: "White-label option", openhelix: true, intercom: false },
  { name: "Manager dashboard", openhelix: true, intercom: true },
  { name: "Knowledge base", openhelix: true, intercom: true },
  { name: "API access", openhelix: true, intercom: true, note: "OpenHelix is OpenAI-compatible" },
  { name: "Webhook integrations", openhelix: true, intercom: true },
  { name: "In-app messenger (SaaS)", openhelix: false, intercom: true, note: "Intercom excels at in-product chat" },
  { name: "CRM / pipeline features", openhelix: false, intercom: true },
  { name: "Salesforce integration", openhelix: false, intercom: true },
  { name: "Setup time", openhelix: true, intercom: false, note: "OpenHelix: ~3 min. Intercom: hours to days." },
  { name: "SMB-friendly pricing", openhelix: true, intercom: false },
  { name: "GDPR compliant", openhelix: true, intercom: true },
];

export default function IntercomComparePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SiteHeader />

      <main className="max-w-5xl mx-auto px-4 py-16">
        <nav className="text-sm text-zinc-500 mb-8">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
          <span className="mx-2">/</span><span>Compare</span>
          <span className="mx-2">/</span><span className="text-zinc-300">OpenHelix vs Intercom</span>
        </nav>

        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            Updated March 2026
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 leading-tight">
            OpenHelix vs Intercom:<br /><span className="text-violet-400">Is the Price Worth It?</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
            Intercom is powerful — but starts at $39/seat and scales fast. Here&apos;s an honest comparison of when each makes sense.
          </p>

          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-left">
              <div className="text-xs text-violet-400 font-medium mb-2">CHOOSE OPENHELIX IF…</div>
              <ul className="space-y-1.5 text-sm text-zinc-300">
                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />You want Telegram + WhatsApp + web</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />Budget matters (SMB, startup)</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />You want to choose your own LLM</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />You need white-label for clients</li>
              </ul>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-left">
              <div className="text-xs text-zinc-500 font-medium mb-2">CHOOSE INTERCOM IF…</div>
              <ul className="space-y-1.5 text-sm text-zinc-400">
                <li className="flex gap-2"><Check className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />You need in-app chat inside a SaaS product</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />You have complex CRM/pipeline needs</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />You need Salesforce integration</li>
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
                  <th className="px-4 py-3 text-zinc-400 font-medium text-center">Intercom</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Starting price", "Free (2,000 msgs)", "$39/seat/month"],
                  ["AI model", "GPT-4, Claude, 50+ models", "Fin AI (GPT-4 based)"],
                  ["Own API key", "✅ Yes", "❌ Billed per Fin resolution"],
                  ["Telegram", "✅ Yes", "❌ No"],
                  ["WhatsApp", "✅ Yes", "Enterprise add-on"],
                  ["White label", "✅ Yes", "❌ No"],
                  ["Free trial", "✅ 2,000 msgs free", "14-day trial only"],
                  ["Setup time", "~3 minutes", "Hours to days"],
                  ["In-app chat (SaaS)", "❌ No", "✅ Yes"],
                  ["CRM features", "❌ No", "✅ Advanced"],
                ].map(([feature, oh, ic], i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02]">
                    <td className="px-4 py-3 text-zinc-300">{feature}</td>
                    <td className="px-4 py-3 text-center font-medium text-violet-300">{oh}</td>
                    <td className="px-4 py-3 text-center text-zinc-400">{ic}</td>
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
                  <th className="px-4 py-3 text-zinc-400 font-medium text-center w-24">Intercom</th>
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
                      {f.intercom ? <Check className="w-4 h-4 text-emerald-400 mx-auto" /> : <X className="w-4 h-4 text-zinc-600 mx-auto" />}
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
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Try the affordable alternative</h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">Free plan · GPT-4 + Claude · Telegram + WhatsApp + web · 3-minute setup</p>
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
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">OpenHelix vs Tidio</div><div className="text-xs text-zinc-500 mt-0.5">The most popular chatbot alternative</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/compare/crisp" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">OpenHelix vs Crisp</div><div className="text-xs text-zinc-500 mt-0.5">Crisp alternative with AI-first approach</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/integrations/telegram" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Telegram AI Chatbot Setup</div><div className="text-xs text-zinc-500 mt-0.5">Deploy GPT-4 on Telegram in 3 minutes</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/blog/best-ai-models-for-customer-support" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Best AI Models for Customer Support</div><div className="text-xs text-zinc-500 mt-0.5">GPT-4o vs Claude vs Gemini compared</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
