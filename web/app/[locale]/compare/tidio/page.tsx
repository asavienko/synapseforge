import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Check, X, ArrowRight, Zap, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "OpenHelix vs Tidio: Best Tidio Alternative in 2026",
  description:
    "Comparing OpenHelix AI and Tidio for AI customer support. See features, pricing, and why 100+ businesses switched. Free plan available.",
  openGraph: {
    title: "OpenHelix vs Tidio — Full Comparison 2026",
    description: "Which AI customer support platform is right for you? Honest feature-by-feature comparison with pricing.",
    type: "article",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is OpenHelix a good Tidio alternative?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. OpenHelix supports multiple AI models (GPT-4, Claude, OpenRouter), offers a white-label option, and lets you use your own API keys — meaning no markup on AI costs. It's especially suited for businesses that want full control over their AI stack.",
      },
    },
    {
      "@type": "Question",
      name: "What does Tidio offer that OpenHelix doesn't?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Tidio has a built-in live chat agent handoff system and a more established e-commerce integration (Shopify, WooCommerce). If your primary channel is an e-commerce store and you need human agents taking over from the bot, Tidio is strong there.",
      },
    },
    {
      "@type": "Question",
      name: "How does OpenHelix pricing compare to Tidio?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "OpenHelix starts free with 2,000 messages/month. Tidio's free plan is limited to 50 conversations. OpenHelix paid plans start lower and include your own API keys, so AI model costs pass through at cost — no markup.",
      },
    },
    {
      "@type": "Question",
      name: "Can I migrate from Tidio to OpenHelix?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Yes. Migration takes about 30 minutes: export your Tidio knowledge base, import it to OpenHelix, connect your Telegram/WhatsApp channels, and you're live. OpenHelix support can assist with the process.",
      },
    },
  ],
};

const features = [
  { name: "Free plan", openhelix: true, tidio: true, note: "OpenHelix: 2,000 msgs. Tidio: 50 convos." },
  { name: "GPT-4 support", openhelix: true, tidio: true },
  { name: "Claude / Anthropic", openhelix: true, tidio: false },
  { name: "OpenRouter (50+ models)", openhelix: true, tidio: false },
  { name: "Bring your own API key", openhelix: true, tidio: false, note: "OpenHelix passes AI costs at cost, no markup" },
  { name: "Telegram integration", openhelix: true, tidio: false },
  { name: "WhatsApp integration", openhelix: true, tidio: true, note: "Tidio requires Business API setup" },
  { name: "Web chat widget", openhelix: true, tidio: true },
  { name: "White-label option", openhelix: true, tidio: false },
  { name: "Manager dashboard", openhelix: true, tidio: true },
  { name: "Knowledge base", openhelix: true, tidio: true },
  { name: "Real-time conversation analytics", openhelix: true, tidio: true },
  { name: "AI-powered suggestions", openhelix: true, tidio: true },
  { name: "API access", openhelix: true, tidio: false, note: "OpenHelix is API-first with full REST + OpenAI-compatible API" },
  { name: "Webhook integrations", openhelix: true, tidio: true },
  { name: "Make.com / Zapier", openhelix: true, tidio: true },
  { name: "Shopify / WooCommerce", openhelix: false, tidio: true, note: "Tidio has native e-commerce integrations" },
  { name: "Live agent handoff", openhelix: false, tidio: true, note: "Tidio has built-in human takeover" },
  { name: "GDPR compliant", openhelix: true, tidio: true },
  { name: "Setup time", openhelix: true, tidio: true, note: "OpenHelix: ~3 min. Tidio: ~15 min." },
];

const pricing = [
  { plan: "Free", openhelix: "2,000 msgs/mo", tidio: "50 conversations" },
  { plan: "Starter", openhelix: "$29/mo", tidio: "$29/mo" },
  { plan: "Pro", openhelix: "$79/mo", tidio: "$59/mo" },
  { plan: "Enterprise", openhelix: "Custom", tidio: "Custom" },
];

export default function TidioComparePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

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
          <span>Compare</span>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">OpenHelix vs Tidio</span>
        </nav>

        {/* Hero */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 text-violet-400 text-xs font-medium px-3 py-1.5 rounded-full mb-6">
            Updated March 2026
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-5 leading-tight">
            OpenHelix vs Tidio:<br />
            <span className="text-violet-400">Which Should You Choose?</span>
          </h1>
          <p className="text-lg text-zinc-400 max-w-2xl mx-auto mb-8">
            A detailed comparison of features, pricing, and use cases to help you pick the right AI customer support platform in 2026.
          </p>

          {/* Quick verdict */}
          <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-8">
            <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 text-left">
              <div className="text-xs text-violet-400 font-medium mb-2">CHOOSE OPENHELIX IF…</div>
              <ul className="space-y-1.5 text-sm text-zinc-300">
                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />You want Telegram + WhatsApp + web</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />You want GPT-4, Claude, or any LLM</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />You need white-label for clients</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />You want API access + webhooks</li>
              </ul>
            </div>
            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 text-left">
              <div className="text-xs text-zinc-500 font-medium mb-2">CHOOSE TIDIO IF…</div>
              <ul className="space-y-1.5 text-sm text-zinc-400">
                <li className="flex gap-2"><Check className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />You run a Shopify / WooCommerce store</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />You need live agent handoff</li>
                <li className="flex gap-2"><Check className="w-4 h-4 text-zinc-500 shrink-0 mt-0.5" />Your primary channel is web chat only</li>
              </ul>
            </div>
          </div>

          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-3.5 rounded-xl font-semibold text-lg"
          >
            Try OpenHelix Free <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-zinc-500 mt-3">No credit card required · 2,000 messages free</p>
        </div>

        {/* Quick comparison table */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Quick Comparison</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium w-1/3"></th>
                  <th className="px-4 py-3 text-violet-400 font-semibold text-center">OpenHelix AI</th>
                  <th className="px-4 py-3 text-zinc-400 font-medium text-center">Tidio</th>
                </tr>
              </thead>
              <tbody>
                {[
                  ["Starting price", "Free (2,000 msgs)", "Free (50 convos)"],
                  ["AI models", "GPT-4, Claude, 50+ via OpenRouter", "GPT-4 (Lyro)"],
                  ["Own API key", "✅ Yes", "❌ No"],
                  ["Telegram", "✅ Yes", "❌ No"],
                  ["WhatsApp", "✅ Yes", "✅ Yes"],
                  ["White label", "✅ Yes", "❌ No"],
                  ["API access", "✅ Full REST + OpenAI-compat.", "❌ No"],
                  ["Setup time", "~3 minutes", "~15 minutes"],
                  ["Live agent handoff", "❌ No", "✅ Yes"],
                  ["Shopify integration", "❌ No", "✅ Yes"],
                ].map(([feature, oh, tidio], i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-zinc-300">{feature}</td>
                    <td className="px-4 py-3 text-center font-medium text-violet-300">{oh}</td>
                    <td className="px-4 py-3 text-center text-zinc-400">{tidio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Full feature matrix */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">Full Feature Comparison</h2>
          <p className="text-zinc-400 mb-6">Every feature, compared honestly.</p>
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Feature</th>
                  <th className="px-4 py-3 text-violet-400 font-semibold text-center w-24">OpenHelix</th>
                  <th className="px-4 py-3 text-zinc-400 font-medium text-center w-24">Tidio</th>
                </tr>
              </thead>
              <tbody>
                {features.map((f, i) => (
                  <tr key={i} className="border-b border-white/5 hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3 text-zinc-300">
                      <div>{f.name}</div>
                      {f.note && <div className="text-xs text-zinc-500 mt-0.5">{f.note}</div>}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {f.openhelix
                        ? <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        : <X className="w-4 h-4 text-zinc-600 mx-auto" />}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {f.tidio
                        ? <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                        : <X className="w-4 h-4 text-zinc-600 mx-auto" />}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Pricing */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">Pricing Comparison</h2>
          <p className="text-zinc-400 mb-6">OpenHelix lets you use your own API keys — no markup on AI model costs. With Tidio, AI usage is bundled into the plan.</p>
          <div className="rounded-xl border border-white/10 overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/10 bg-white/[0.03]">
                  <th className="text-left px-4 py-3 text-zinc-400 font-medium">Plan</th>
                  <th className="px-4 py-3 text-violet-400 font-semibold text-center">OpenHelix AI</th>
                  <th className="px-4 py-3 text-zinc-400 font-medium text-center">Tidio</th>
                </tr>
              </thead>
              <tbody>
                {pricing.map((p, i) => (
                  <tr key={i} className="border-b border-white/5">
                    <td className="px-4 py-3 text-zinc-300 font-medium">{p.plan}</td>
                    <td className="px-4 py-3 text-center text-violet-300">{p.openhelix}</td>
                    <td className="px-4 py-3 text-center text-zinc-400">{p.tidio}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="text-xs text-zinc-500 mt-3">* Prices shown are approximate. Always verify on each vendor&apos;s pricing page.</p>
        </section>

        {/* Migration guide */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-2">How to Switch from Tidio to OpenHelix</h2>
          <p className="text-zinc-400 mb-6">Migration takes about 30 minutes.</p>
          <div className="space-y-4">
            {[
              { step: "1", title: "Export your Tidio knowledge base", desc: "In Tidio: Settings → Lyro AI → Export knowledge articles as CSV or copy your FAQ content." },
              { step: "2", title: "Create your OpenHelix account", desc: "Sign up free at openhelixai.com. No credit card required. Your first 2,000 messages are free." },
              { step: "3", title: "Add your AI API key", desc: "Connect your OpenAI, Anthropic, or OpenRouter key. This means AI costs pass through at cost — no markup." },
              { step: "4", title: "Import knowledge base", desc: "Upload your knowledge articles to your instance's Knowledge Base tab. Bulk upload supports multiple files at once." },
              { step: "5", title: "Connect your channels", desc: "Add your Telegram bot token, WhatsApp number, or embed the web widget. Takes 2 minutes per channel." },
              { step: "6", title: "Test and go live", desc: "Use the built-in test chat to verify responses. When ready, point your channels to OpenHelix and deactivate Tidio." },
            ].map((item) => (
              <div key={item.step} className="flex gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 font-bold flex items-center justify-center shrink-0 text-sm">
                  {item.step}
                </div>
                <div>
                  <div className="font-semibold text-white mb-0.5">{item.title}</div>
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
          <div className="flex items-center justify-center gap-1 mb-4">
            {[...Array(5)].map((_, i) => <Star key={i} className="w-5 h-5 text-yellow-400 fill-yellow-400" />)}
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">Ready to switch?</h2>
          <p className="text-zinc-400 mb-8 max-w-md mx-auto">
            Join 100+ businesses using OpenHelix for multi-channel AI support. Free plan, no credit card.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-4 rounded-xl font-semibold text-lg"
          >
            Start for Free <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-sm text-zinc-500 mt-4">2,000 messages free · No credit card · 3-minute setup</p>
        </section>

        {/* Related links */}
        <section className="mb-16">
          <h2 className="text-xl font-bold mb-4">Related Guides</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/integrations/telegram" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1">
                <div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Telegram AI Chatbot Setup</div>
                <div className="text-xs text-zinc-500 mt-0.5">Deploy GPT-4 on Telegram in 3 minutes</div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors" />
            </Link>
            <Link href="/integrations/whatsapp" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1">
                <div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">WhatsApp Business AI Guide</div>
                <div className="text-xs text-zinc-500 mt-0.5">Connect AI to your WhatsApp number</div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors" />
            </Link>
            <Link href="/compare/intercom" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1">
                <div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">OpenHelix vs Intercom</div>
                <div className="text-xs text-zinc-500 mt-0.5">Is Intercom&apos;s price worth it?</div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors" />
            </Link>
            <Link href="/blog/best-ai-models-for-customer-support" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1">
                <div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Best AI Models for Customer Support</div>
                <div className="text-xs text-zinc-500 mt-0.5">GPT-4o vs Claude vs Gemini — which wins?</div>
              </div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors" />
            </Link>
          </div>
        </section>

      </main>

      <footer className="border-t border-white/5 py-8 mt-4">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <span>© 2026 OpenHelix AI. All rights reserved.</span>
          <div className="flex gap-6">
            <Link href="/compare" className="hover:text-zinc-300 transition-colors">All comparisons</Link>
            <Link href="/pricing" className="hover:text-zinc-300 transition-colors">Pricing</Link>
            <Link href="/contact" className="hover:text-zinc-300 transition-colors">Contact</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
