import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Check, X } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "OpenHelix AI vs Freshdesk — Cheaper AI-First Alternative (2026)",
  description:
    "Freshdesk charges per agent and hides AI behind premium tiers. OpenHelix AI starts free with GPT-4 included. Compare features, pricing, and AI capabilities.",
  openGraph: {
    title: "OpenHelix AI vs Freshdesk — Full Comparison 2026",
    description: "Freshdesk alternative with AI built-in from day one. Compare pricing, features, and AI automation capabilities.",
    type: "website",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is OpenHelix AI a good Freshdesk alternative?",
      acceptedAnswer: { "@type": "Answer", text: "Yes — for teams that want AI-first support automation rather than a traditional ticketing system. Freshdesk is built around human agents handling tickets; AI (Freddy AI) is a paid add-on starting at $29/agent/month. OpenHelix AI automates conversations with GPT-4 or Claude by default, with no per-seat pricing." },
    },
    {
      "@type": "Question",
      name: "How does Freshdesk pricing compare to OpenHelix AI?",
      acceptedAnswer: { "@type": "Answer", text: "Freshdesk's Growth plan is $15/agent/month, but Freddy AI starts at $29/agent/month on top. A 5-agent team with AI costs $220/month ($2,640/year). OpenHelix AI Pro is $49/month flat ($588/year) — and AI is included by default, not an add-on." },
    },
    {
      "@type": "Question",
      name: "Does OpenHelix AI have a ticketing system like Freshdesk?",
      acceptedAnswer: { "@type": "Answer", text: "OpenHelix AI focuses on conversation automation rather than traditional ticketing. Complex issues escalate to your team with full context. If you need enterprise SLA management, ITIL workflows, or multi-department ticket routing, Freshdesk may still be relevant. For SMBs wanting to automate 70%+ of queries, OpenHelix is simpler and cheaper." },
    },
    {
      "@type": "Question",
      name: "Can OpenHelix AI work alongside Freshdesk?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. You can use OpenHelix AI on Telegram and WhatsApp for automated tier-1 support, while routing escalations to Freshdesk for complex tickets. The two tools serve different layers of the support stack." },
    },
    {
      "@type": "Question",
      name: "Does OpenHelix AI support the same channels as Freshdesk?",
      acceptedAnswer: { "@type": "Answer", text: "OpenHelix AI supports web chat, Telegram, WhatsApp, and Discord natively. Freshdesk supports email, phone, chat, and social. Freshdesk has broader channel coverage, but OpenHelix AI leads on messaging apps (Telegram/WhatsApp) which are critical in many markets." },
    },
  ],
};

const features = [
  { feature: "Starting price", openhelix: "Free (2,000 msg/mo)", freshdesk: "$15/agent/month", winner: "openhelix" },
  { feature: "AI included in base plan", openhelix: "✓ GPT-4 or Claude", freshdesk: "✗ Freddy AI add-on ($29+)", winner: "openhelix" },
  { feature: "Per-seat pricing", openhelix: "No — flat monthly", freshdesk: "Yes — per agent", winner: "openhelix" },
  { feature: "Telegram / WhatsApp", openhelix: "✓ Built-in", freshdesk: "WhatsApp add-on only", winner: "openhelix" },
  { feature: "Setup time", openhelix: "3 minutes", freshdesk: "Hours to days", winner: "openhelix" },
  { feature: "Email ticketing", openhelix: "Basic escalation", freshdesk: "✓ Full workflow", winner: "freshdesk" },
  { feature: "Phone / voice support", openhelix: "✗ Not included", freshdesk: "✓ Freshcaller add-on", winner: "freshdesk" },
  { feature: "SLA management", openhelix: "Not included", freshdesk: "✓ Built-in", winner: "freshdesk" },
  { feature: "AI conversation automation", openhelix: "✓ Core feature", freshdesk: "Add-on ($$$)", winner: "openhelix" },
  { feature: "Choose your own LLM", openhelix: "✓ GPT-4, Claude, Gemini", freshdesk: "✗ Freddy AI only", winner: "openhelix" },
  { feature: "White-label", openhelix: "✓ Included", freshdesk: "Enterprise only", winner: "openhelix" },
  { feature: "Free plan", openhelix: "✓ 2,000 msg/mo", freshdesk: "Free plan (limited)", winner: "tie" },
];

export default function VsFreshdeskPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <SiteHeader />

      <main className="max-w-5xl mx-auto px-4 py-12">

        <nav className="text-sm text-zinc-500 mb-8">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/compare" className="hover:text-zinc-300 transition-colors">Compare</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">vs Freshdesk</span>
        </nav>

        {/* Hero */}
        <section className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight">OpenHelix AI vs Freshdesk</h1>
          <p className="text-lg text-zinc-400 mb-8 max-w-2xl leading-relaxed">
            Freshdesk starts cheap but AI is a paid add-on. When you add Freddy AI, a 5-agent team costs $220/month. OpenHelix AI includes GPT-4 or Claude in every plan — starting free.
          </p>
          <div className="grid sm:grid-cols-3 gap-3 mb-8">
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-violet-400 mb-1">65%</div>
              <div className="text-xs text-zinc-400">cheaper than Freshdesk + Freddy AI for a 5-agent team</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">Included</div>
              <div className="text-xs text-zinc-400">GPT-4 or Claude — not a $29/agent add-on</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">3 min</div>
              <div className="text-xs text-zinc-400">to deploy vs hours of Freshdesk configuration</div>
            </div>
          </div>
        </section>

        {/* Feature table */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Feature Comparison</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="text-left px-5 py-3 text-zinc-400 font-medium">Feature</th>
                  <th className="px-5 py-3 text-center text-violet-400 font-semibold">OpenHelix AI</th>
                  <th className="px-5 py-3 text-center text-zinc-400 font-medium">Freshdesk</th>
                </tr>
              </thead>
              <tbody>
                {features.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    <td className="px-5 py-3 text-zinc-300">{row.feature}</td>
                    <td className={`px-5 py-3 text-center font-medium ${row.winner === "openhelix" ? "text-emerald-400" : row.winner === "tie" ? "text-zinc-300" : "text-zinc-400"}`}>{row.openhelix}</td>
                    <td className={`px-5 py-3 text-center ${row.winner === "freshdesk" ? "text-emerald-400 font-medium" : "text-zinc-500"}`}>{row.freshdesk}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pricing breakdown */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6">The Real Cost of Freshdesk with AI</h2>
          <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden mb-4">
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
              <div className="p-6">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Freshdesk Growth + Freddy AI (5 agents)</div>
                {[
                  { label: "Growth plan (5 × $15)", value: "$75/mo" },
                  { label: "Freddy AI (5 × $29)", value: "$145/mo" },
                  { label: "Total monthly", value: "$220/mo", highlight: true },
                  { label: "Annual cost", value: "$2,640/yr", red: true },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between py-2 text-sm border-b border-white/5 last:border-0">
                    <span className="text-zinc-400">{row.label}</span>
                    <span className={row.red ? "text-red-400 font-bold" : row.highlight ? "text-white font-bold" : "text-zinc-300"}>{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="p-6">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-4">OpenHelix AI Pro (unlimited agents)</div>
                {[
                  { label: "Pro plan (flat)", value: "$49/mo" },
                  { label: "AI model cost (est.)", value: "~$5–50/mo" },
                  { label: "Total monthly", value: "$84–129/mo", highlight: true },
                  { label: "Annual cost", value: "$948–1,548/yr", green: true },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between py-2 text-sm border-b border-white/5 last:border-0">
                    <span className="text-zinc-400">{row.label}</span>
                    <span className={row.green ? "text-emerald-400 font-bold" : row.highlight ? "text-white font-bold" : "text-zinc-300"}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="border-t border-white/10 bg-emerald-500/10 p-4 text-center">
              <span className="text-emerald-400 font-bold">Save $1,100–1,700/year</span>
              <span className="text-zinc-400 text-sm ml-2">switching from Freshdesk + Freddy AI to OpenHelix AI Pro</span>
            </div>
          </div>
        </section>

        {/* When to choose */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6">When to Choose Each</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-6">
              <h3 className="font-bold text-violet-300 mb-4">Choose OpenHelix AI if you:</h3>
              <ul className="space-y-2">
                {[
                  "Want AI built-in, not as a paid add-on",
                  "Need Telegram or WhatsApp automation",
                  "Have a small team paying Freshdesk per-seat",
                  "Want to go live in minutes, not hours",
                  "Choose your own LLM (GPT-4, Claude, Gemini)",
                  "Need white-label without enterprise pricing",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
              <h3 className="font-bold text-zinc-300 mb-4">Stick with Freshdesk if you:</h3>
              <ul className="space-y-2">
                {[
                  "Need full email ticketing + phone support",
                  "Require ITIL / ITSM workflows",
                  "Use Freshdesk deeply (automations, SLA rules)",
                  "Need Freshworks ecosystem integrations",
                  "Have complex multi-department routing",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-400">
                    <X className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-5">FAQ</h2>
          <div className="space-y-3">
            {faqSchema.mainEntity.map((item, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                <div className="font-medium mb-2 text-sm">{item.name}</div>
                <div className="text-sm text-zinc-400 leading-relaxed">{item.acceptedAnswer.text}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-8 text-center mb-12">
          <h2 className="text-2xl font-bold mb-2">Try the Freshdesk alternative — free</h2>
          <p className="text-zinc-400 text-sm mb-6">AI included · 2,000 messages free · No credit card · Live in 3 minutes</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-4 rounded-xl font-semibold text-lg">
            Start Free <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        {/* Related */}
        <section className="mb-8 pt-8 border-t border-white/5">
          <div className="text-sm text-zinc-500 mb-4">Related comparisons</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/compare/zendesk" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">OpenHelix vs Zendesk</div><div className="text-xs text-zinc-500 mt-0.5">The other enterprise help desk giant</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/compare/intercom" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">OpenHelix vs Intercom</div><div className="text-xs text-zinc-500 mt-0.5">Enterprise messaging platform comparison</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/use-cases/saas" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">AI for SaaS Companies</div><div className="text-xs text-zinc-500 mt-0.5">Onboarding, churn prevention, L1 deflection</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/blog/reduce-customer-support-costs-with-ai" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Reduce Support Costs by 60%</div><div className="text-xs text-zinc-500 mt-0.5">ROI breakdown — real numbers</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
