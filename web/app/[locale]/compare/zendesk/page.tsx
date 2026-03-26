import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Check, X } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "OpenHelix AI vs Zendesk — Cheaper Alternative with AI-First Support (2026)",
  description:
    "Zendesk starts at $55/agent/month and requires complex setup. OpenHelix AI starts free and deploys AI support in 3 minutes. See the full comparison: features, pricing, and when to choose each.",
  openGraph: {
    title: "OpenHelix AI vs Zendesk — Which Is Better for Your Business?",
    description: "Honest comparison of OpenHelix AI and Zendesk: pricing, AI capabilities, ease of setup, and which one fits SMBs vs enterprise.",
    type: "website",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is OpenHelix AI a good Zendesk alternative?",
      acceptedAnswer: { "@type": "Answer", text: "Yes — for businesses focused on AI automation rather than enterprise ticketing workflows. OpenHelix AI is an AI-first platform: GPT-4 or Claude handles conversations automatically, with no per-agent seat pricing. Zendesk is a traditional help desk that added AI features on top of a human-agent workflow. If you want to automate most of your support, OpenHelix AI is significantly cheaper and faster to set up." },
    },
    {
      "@type": "Question",
      name: "How much cheaper is OpenHelix AI vs Zendesk?",
      acceptedAnswer: { "@type": "Answer", text: "Zendesk Suite starts at $55/agent/month — a team of 5 agents costs $275/month, or $3,300/year. OpenHelix AI's Pro plan is $49/month flat — $588/year, with unlimited AI conversations. For most SMBs, that's 70–90% cheaper." },
    },
    {
      "@type": "Question",
      name: "Does OpenHelix AI have a ticketing system like Zendesk?",
      acceptedAnswer: { "@type": "Answer", text: "OpenHelix AI focuses on AI conversation automation rather than traditional ticketing. Complex issues can be escalated to your team, but it doesn't replicate Zendesk's full ticketing workflow. If your business needs advanced ticket routing, SLA management, and enterprise compliance, Zendesk may still be the right choice. If your goal is automating 70–80% of conversations with AI, OpenHelix wins on price and simplicity." },
    },
    {
      "@type": "Question",
      name: "Can OpenHelix AI replace Zendesk for a small business?",
      acceptedAnswer: { "@type": "Answer", text: "For most small businesses (under 50 support tickets/day), yes. OpenHelix AI handles the most common questions automatically — FAQs, order tracking, policies — and escalates complex cases. You don't need a ticketing system if your AI resolves 75%+ of inquiries before they become tickets." },
    },
    {
      "@type": "Question",
      name: "How long does it take to switch from Zendesk to OpenHelix AI?",
      acceptedAnswer: { "@type": "Answer", text: "Most teams switch in one afternoon. Export your Zendesk FAQ content, upload it to OpenHelix AI's knowledge base, connect your channels (web, Telegram, WhatsApp), and you're live. No migration consultants needed." },
    },
  ],
};

const features = [
  { feature: "Starting price", openhelix: "Free (2,000 msg/mo)", zendesk: "$55/agent/month", winner: "openhelix" },
  { feature: "Per-seat pricing", openhelix: "No — flat monthly", zendesk: "Yes — per agent", winner: "openhelix" },
  { feature: "AI model choice", openhelix: "GPT-4o, Claude, Gemini", zendesk: "Zendesk AI (proprietary)", winner: "openhelix" },
  { feature: "Setup time", openhelix: "3 minutes", zendesk: "Days to weeks", winner: "openhelix" },
  { feature: "Telegram / WhatsApp", openhelix: "✓ Built-in", zendesk: "Limited / add-on", winner: "openhelix" },
  { feature: "Enterprise ticketing", openhelix: "Basic escalation", zendesk: "✓ Full workflow", winner: "zendesk" },
  { feature: "SLA management", openhelix: "Not included", zendesk: "✓ Built-in", winner: "zendesk" },
  { feature: "CSAT surveys", openhelix: "Via webhooks", zendesk: "✓ Native", winner: "zendesk" },
  { feature: "AI conversation automation", openhelix: "✓ Core feature", zendesk: "Add-on ($)", winner: "openhelix" },
  { feature: "White-label", openhelix: "✓ Included", zendesk: "Enterprise only", winner: "openhelix" },
  { feature: "API access", openhelix: "✓ Free", zendesk: "✓ Available", winner: "tie" },
  { feature: "Free plan", openhelix: "✓ 2,000 msg/mo", zendesk: "✗ No free plan", winner: "openhelix" },
];

const pricing = [
  { plan: "OpenHelix Free", price: "$0/mo", features: ["2,000 messages/month", "1 AI agent", "Web + Telegram + WhatsApp", "GPT-4o or Claude"], cta: "Start Free", href: "/sign-up", highlight: false },
  { plan: "OpenHelix Pro", price: "$49/mo", features: ["Unlimited messages", "Multiple instances", "Priority support", "Advanced analytics", "White-label"], cta: "Start Pro", href: "/sign-up", highlight: true },
  { plan: "Zendesk Suite Team", price: "$55/agent/mo", features: ["Ticketing system", "Email + chat", "Basic reporting", "Zendesk AI (extra cost)"], cta: "zendesk.com", href: "https://zendesk.com", highlight: false },
];

export default function VsZendeskPage() {
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
          <span className="text-zinc-300">vs Zendesk</span>
        </nav>

        {/* Hero */}
        <section className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight">
            OpenHelix AI vs Zendesk
          </h1>
          <p className="text-lg text-zinc-400 mb-8 max-w-2xl leading-relaxed">
            Zendesk built a ticketing empire. OpenHelix AI built an AI-first automation platform. If you&apos;re paying $55/agent/month for a help desk that still routes tickets to humans — there&apos;s a better option.
          </p>

          {/* Quick verdict */}
          <div className="grid sm:grid-cols-3 gap-3 mb-8">
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-violet-400 mb-1">90%</div>
              <div className="text-xs text-zinc-400">cheaper than Zendesk Suite for a 3-person team</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">3 min</div>
              <div className="text-xs text-zinc-400">vs days of Zendesk onboarding and configuration</div>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-white mb-1">AI-first</div>
              <div className="text-xs text-zinc-400">resolves 70–80% of conversations automatically</div>
            </div>
          </div>
        </section>

        {/* Quick summary table */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Quick Summary</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="text-left px-5 py-3 text-zinc-400 font-medium">Feature</th>
                  <th className="px-5 py-3 text-center text-violet-400 font-semibold">OpenHelix AI</th>
                  <th className="px-5 py-3 text-center text-zinc-400 font-medium">Zendesk</th>
                </tr>
              </thead>
              <tbody>
                {features.map((row, i) => (
                  <tr key={i} className="border-b border-white/5 last:border-0">
                    <td className="px-5 py-3 text-zinc-300">{row.feature}</td>
                    <td className={`px-5 py-3 text-center font-medium ${row.winner === "openhelix" ? "text-emerald-400" : row.winner === "tie" ? "text-zinc-300" : "text-zinc-400"}`}>
                      {row.openhelix}
                    </td>
                    <td className={`px-5 py-3 text-center ${row.winner === "zendesk" ? "text-emerald-400 font-medium" : "text-zinc-500"}`}>
                      {row.zendesk}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* When to choose each */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6">When to Choose Each</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-violet-500/5 border border-violet-500/20 rounded-xl p-6">
              <h3 className="font-bold text-violet-300 mb-4">Choose OpenHelix AI if you:</h3>
              <ul className="space-y-2">
                {[
                  "Want to automate 70%+ of support with AI",
                  "Are an SMB paying per seat for Zendesk",
                  "Need Telegram or WhatsApp support",
                  "Want to go live in minutes, not weeks",
                  "Don't need enterprise SLA management",
                  "Want GPT-4o or Claude (not proprietary AI)",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-violet-400 shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6">
              <h3 className="font-bold text-zinc-300 mb-4">Stick with Zendesk if you:</h3>
              <ul className="space-y-2">
                {[
                  "Need enterprise SLA management & compliance",
                  "Have complex multi-department ticket routing",
                  "Require Zendesk-specific integrations",
                  "Need CSAT surveys baked into the workflow",
                  "Have an enterprise contract already",
                ].map((item, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-400">
                    <X className="w-4 h-4 text-zinc-600 shrink-0 mt-0.5" />{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-6">Pricing Comparison</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {pricing.map((plan, i) => (
              <div key={i} className={`rounded-xl border p-5 flex flex-col ${plan.highlight ? "border-violet-500/30 bg-violet-500/5" : "border-white/5 bg-white/[0.02]"}`}>
                <div className="text-sm font-semibold text-zinc-300 mb-1">{plan.plan}</div>
                <div className="text-2xl font-bold mb-4">{plan.price}</div>
                <ul className="space-y-2 flex-1 mb-5">
                  {plan.features.map((f, j) => (
                    <li key={j} className="flex gap-2 text-xs text-zinc-400">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />{f}
                    </li>
                  ))}
                </ul>
                <Link href={plan.href as never} className={`text-center text-sm font-semibold py-2 rounded-lg transition-colors ${plan.highlight ? "bg-violet-600 hover:bg-violet-500 text-white" : "border border-white/10 hover:border-white/20 text-zinc-300"}`}>
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Migration */}
        <section className="mb-12">
          <h2 className="text-xl font-bold mb-4">Migrating from Zendesk in an Afternoon</h2>
          <div className="space-y-3">
            {[
              { n: "1", title: "Export your Zendesk knowledge base", desc: "Download your Help Center articles as a CSV or PDF. This becomes your AI's training data." },
              { n: "2", title: "Create your OpenHelix account", desc: "Free plan — no credit card. Set up your AI agent with your business name and system prompt in 5 minutes." },
              { n: "3", title: "Upload your knowledge base", desc: "Paste FAQ content or upload documents. The AI learns your policies instantly." },
              { n: "4", title: "Connect your channels", desc: "Add the web chat widget to your site, or connect Telegram/WhatsApp. Takes 3 minutes." },
              { n: "5", title: "Run parallel for one week", desc: "Keep Zendesk running while you validate OpenHelix AI response quality. Then cancel Zendesk." },
            ].map((step) => (
              <div key={step.n} className="flex gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="w-7 h-7 rounded-full bg-violet-500/20 text-violet-400 font-bold flex items-center justify-center shrink-0 text-xs">{step.n}</div>
                <div>
                  <div className="font-medium text-sm mb-0.5">{step.title}</div>
                  <div className="text-xs text-zinc-400 leading-relaxed">{step.desc}</div>
                </div>
              </div>
            ))}
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
          <h2 className="text-2xl font-bold mb-2">Try the Zendesk alternative — free</h2>
          <p className="text-zinc-400 text-sm mb-6">2,000 messages free · No credit card · AI handles conversations automatically</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-4 rounded-xl font-semibold text-lg">
            Start Free <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-xs text-zinc-500 mt-3">Live in 3 minutes · Cancel anytime</p>
        </section>

        {/* Related */}
        <section className="mb-8 pt-8 border-t border-white/5">
          <div className="text-sm text-zinc-500 mb-4">Related comparisons</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/compare/intercom" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">OpenHelix vs Intercom</div><div className="text-xs text-zinc-500 mt-0.5">Another enterprise-priced alternative</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/compare/tidio" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">OpenHelix vs Tidio</div><div className="text-xs text-zinc-500 mt-0.5">Most popular chatbot tool</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/use-cases/ecommerce" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">AI for Ecommerce</div><div className="text-xs text-zinc-500 mt-0.5">Use case guide for online stores</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/blog/reduce-customer-support-costs-with-ai" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Reduce Support Costs by 60%</div><div className="text-xs text-zinc-500 mt-0.5">ROI guide — real numbers</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
          </div>
        </section>

      </main>
      <SiteFooter />
    </div>
  );
}
