import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Zap, Check, Users, BookOpen, BarChart3, Headphones, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Chatbot for SaaS — Automate Onboarding, Support & Churn Prevention",
  description:
    "Deploy an AI support agent for your SaaS product. Automate onboarding, answer feature questions, and reduce churn with proactive AI support. Free plan. 3-minute setup.",
  openGraph: {
    title: "AI Chatbot for SaaS Products",
    description: "Onboarding, feature questions, churn prevention — automated with AI. Works on web, Telegram, and WhatsApp.",
    type: "website",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How can AI chatbots help SaaS companies?",
      acceptedAnswer: { "@type": "Answer", text: "SaaS companies benefit from AI chatbots in three main ways: faster onboarding (users get instant answers to 'how do I...' questions), reduced support load (feature questions, billing FAQs, and integrations are handled automatically), and churn prevention (proactive outreach to users showing disengagement signals)." },
    },
    {
      "@type": "Question",
      name: "Can the AI chatbot help with user onboarding?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Train the AI on your product docs, setup guides, and common onboarding pitfalls. New users get step-by-step guidance in real time — without waiting for a customer success manager to respond." },
    },
    {
      "@type": "Question",
      name: "Does it integrate with Intercom, HubSpot, or other tools?",
      acceptedAnswer: { "@type": "Answer", text: "OpenHelix AI integrates via webhooks, allowing you to push conversation data to your CRM or trigger workflows in Zapier/Make. Direct native integrations with Intercom and HubSpot are on the roadmap." },
    },
    {
      "@type": "Question",
      name: "What's the difference between OpenHelix AI and Intercom?",
      acceptedAnswer: { "@type": "Answer", text: "Intercom costs $74–$395/month and focuses on marketing + sales. OpenHelix AI focuses purely on AI-powered support automation at $0–49/month — with support for Telegram, WhatsApp, and Discord out of the box. See our full comparison at /compare/intercom." },
    },
  ],
};

const useCases = [
  {
    icon: BookOpen,
    title: "Onboarding Automation",
    desc: "Walk new users through setup step by step. Answer 'how do I...' questions from your docs. Turn trial users into activated users faster.",
    tag: "High Impact",
  },
  {
    icon: Headphones,
    title: "Tier-1 Support Deflection",
    desc: "Handle billing questions, feature FAQs, and integration guides without a support agent touching the ticket. Deflect 60–80% of L1 tickets.",
    tag: "Cost Saving",
  },
  {
    icon: Users,
    title: "User Retention & Churn Prevention",
    desc: "Detect disengaged users and trigger proactive outreach via Telegram or email. Answer 'why isn\\'t X working?' before they cancel.",
    tag: "Revenue",
  },
  {
    icon: BarChart3,
    title: "Feature Discovery",
    desc: "Users miss features they\\'d love. The AI proactively surfaces relevant features based on user questions — improving activation depth.",
    tag: "Growth",
  },
  {
    icon: RefreshCw,
    title: "Upgrade & Upsell Qualification",
    desc: "When users ask about plan limits or advanced features, the AI surfaces upgrade options — qualifying intent without a sales call.",
    tag: "Revenue",
  },
  {
    icon: Zap,
    title: "API & Developer Support",
    desc: "Train the AI on your API docs and code examples. Developers get instant answers to integration questions — 24/7, no waiting.",
    tag: "Developer",
  },
];

export default function SaasPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
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

      <main className="max-w-5xl mx-auto px-4">

        <nav className="text-sm text-zinc-500 pt-8 mb-8">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/use-cases" className="hover:text-zinc-300 transition-colors">Use Cases</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">SaaS</span>
        </nav>

        {/* Hero */}
        <section className="py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-6">
              <Users className="w-3.5 h-3.5" />
              SaaS AI Support Agent
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight">
              AI Support for Your <span className="text-violet-400">SaaS Product</span>
            </h1>
            <p className="text-lg text-zinc-400 mb-8 leading-relaxed max-w-2xl">
              Automate onboarding, deflect tier-1 support, and reduce churn — with an AI agent trained on your product docs. Deploy in 3 minutes. Free plan available.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-xl font-semibold">
                Start Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/compare/intercom" className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 px-6 py-3 rounded-xl text-zinc-300 transition-colors text-sm">
                Compare with Intercom
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-4">No credit card · 2,000 messages free · 3-minute setup</p>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {[
            { value: "65%", label: "of SaaS support tickets are tier-1 (FAQ/how-to)" },
            { value: "4.2×", label: "higher activation rate with instant onboarding answers" },
            { value: "$0/mo", label: "to start — free plan includes 2,000 messages" },
            { value: "3 min", label: "average setup time" },
          ].map((s, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-violet-400 mb-1">{s.value}</div>
              <div className="text-xs text-zinc-500 leading-relaxed">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Use cases */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">What It Handles for SaaS</h2>
          <p className="text-zinc-400 mb-8">Train it on your product docs once. It handles the rest — from trial to retention.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((uc, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                    <uc.icon className="w-4 h-4 text-violet-400" />
                  </div>
                  <span className="text-xs text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full">{uc.tag}</span>
                </div>
                <h3 className="font-semibold mb-2">{uc.title}</h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{uc.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Why not Intercom */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Why SaaS Companies Choose OpenHelix Over Intercom</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="text-left px-5 py-3 text-zinc-400 font-medium">Feature</th>
                  <th className="px-5 py-3 text-center text-violet-400 font-medium">OpenHelix AI</th>
                  <th className="px-5 py-3 text-center text-zinc-500 font-medium">Intercom</th>
                </tr>
              </thead>
              <tbody>
                {[
                  { feature: "Starting price", us: "$0/mo (free plan)", them: "$74/mo" },
                  { feature: "GPT-4o or Claude", us: "✓ Your choice", them: "Fin AI (proprietary)" },
                  { feature: "Telegram/WhatsApp support", us: "✓ Built-in", them: "✗ Not supported" },
                  { feature: "API access", us: "✓ Free", them: "Paid add-on" },
                  { feature: "White-label", us: "✓ Included", them: "Enterprise only" },
                  { feature: "Setup time", us: "3 minutes", them: "Days (enterprise onboarding)" },
                ].map((row, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    <td className="px-5 py-3 text-zinc-300">{row.feature}</td>
                    <td className="px-5 py-3 text-center text-emerald-400 font-medium">{row.us}</td>
                    <td className="px-5 py-3 text-center text-zinc-500">{row.them}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-3 text-right">
            <Link href="/compare/intercom" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">Full comparison →</Link>
          </div>
        </section>

        {/* Supported channels */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Meet Your Users Where They Are</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { name: "Web Chat", desc: "Embed on your app or docs site. Appears as a bubble — non-intrusive, always available.", link: null },
              { name: "Telegram Bot", desc: "Perfect for developer-focused SaaS. Users get support in Telegram without leaving their workflow.", link: "/integrations/telegram" },
              { name: "WhatsApp Business", desc: "High-touch B2B SaaS. Reach users on WhatsApp for onboarding check-ins and alerts.", link: "/integrations/whatsapp" },
            ].map((ch, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  {ch.name}
                  {ch.link && <Link href={ch.link as never} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">Guide →</Link>}
                </h3>
                <p className="text-sm text-zinc-400 leading-relaxed">{ch.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqSchema.mainEntity.map((item, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                <div className="font-medium mb-2">{item.name}</div>
                <div className="text-sm text-zinc-400 leading-relaxed">{item.acceptedAnswer.text}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-8 text-center mb-16">
          <h2 className="text-2xl font-bold mb-2">Add AI support to your SaaS today</h2>
          <p className="text-zinc-400 text-sm mb-6">Free plan · 2,000 messages · GPT-4 or Claude · 3-minute setup</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-4 rounded-xl font-semibold text-lg">
            Start Free <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        {/* Related */}
        <section className="mb-16 pt-8 border-t border-white/5">
          <div className="text-sm text-zinc-500 mb-4">Related</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/use-cases/ecommerce" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">AI Chatbot for Ecommerce</div><div className="text-xs text-zinc-500 mt-0.5">Order tracking, returns, cart recovery</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/compare/intercom" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">OpenHelix vs Intercom</div><div className="text-xs text-zinc-500 mt-0.5">Full feature and pricing comparison</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/blog/best-ai-models-for-customer-support" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Best AI Models for SaaS Support</div><div className="text-xs text-zinc-500 mt-0.5">GPT-4o vs Claude vs Gemini for B2B</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/blog/reduce-customer-support-costs-with-ai" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Cut Support Costs by 60%</div><div className="text-xs text-zinc-500 mt-0.5">ROI breakdown for SaaS businesses</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
