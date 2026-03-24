import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Zap, Check, ShoppingCart, Clock, TrendingUp, MessageSquare, Star } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Chatbot for Ecommerce — Automate Customer Support & Boost Sales",
  description:
    "Deploy an AI chatbot for your online store in 3 minutes. Answer order questions 24/7, recover abandoned carts, handle returns automatically. Works on Telegram, WhatsApp & web chat. Free plan available.",
  openGraph: {
    title: "AI Chatbot for Ecommerce Stores",
    description: "Automate customer support for your online store. Order tracking, returns, product questions — answered instantly, 24/7.",
    type: "website",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How can an AI chatbot help my ecommerce store?",
      acceptedAnswer: { "@type": "Answer", text: "An AI chatbot handles the most common ecommerce questions instantly: order status, shipping times, return policies, product specs, and sizing. It works 24/7, so customers get answers even when your team is offline — reducing cart abandonment and support ticket volume by 60–80%." },
    },
    {
      "@type": "Question",
      name: "Can the AI chatbot track order status?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. You can connect OpenHelix AI to your order management system via webhooks or provide it with your tracking URL format. It can also be trained on your order lookup workflow to guide customers step by step." },
    },
    {
      "@type": "Question",
      name: "Does it work with Shopify, WooCommerce, and other platforms?",
      acceptedAnswer: { "@type": "Answer", text: "OpenHelix AI works with any ecommerce platform. You embed the web chat widget, connect via Telegram/WhatsApp, or use our API. No platform-specific plugins required — it's platform-agnostic." },
    },
    {
      "@type": "Question",
      name: "How long does setup take?",
      acceptedAnswer: { "@type": "Answer", text: "Most ecommerce stores go live in 10–20 minutes. You configure the agent with your store policies, upload your FAQ document, and deploy. No developers needed." },
    },
    {
      "@type": "Question",
      name: "What happens when the AI can't answer a question?",
      acceptedAnswer: { "@type": "Answer", text: "The agent escalates to your support team with the full conversation context. You can configure escalation triggers — e.g., when a customer mentions 'refund' or 'damaged item'. Your team gets only the complex cases." },
    },
  ],
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Set Up an AI Chatbot for Your Ecommerce Store",
  description: "Deploy AI customer support for your online store in under 20 minutes",
  step: [
    { "@type": "HowToStep", name: "Create your OpenHelix account", text: "Sign up free — no credit card needed. Your free plan includes 2,000 messages/month." },
    { "@type": "HowToStep", name: "Train on your store data", text: "Upload your FAQ, shipping policy, return policy, and product catalog. The AI learns your store instantly." },
    { "@type": "HowToStep", name: "Connect your channels", text: "Add the web chat widget to your store, connect your Telegram bot, or link your WhatsApp Business number." },
    { "@type": "HowToStep", name: "Go live", text: "Your AI agent starts handling customer questions immediately. Review conversations in the manager dashboard." },
  ],
};

const stats = [
  { value: "73%", label: "of ecommerce support questions are repetitive FAQs" },
  { value: "24/7", label: "availability vs 9–5 human support" },
  { value: "3 min", label: "average response time vs 4+ hours" },
  { value: "60%", label: "average reduction in support ticket volume" },
];

const useCases = [
  {
    icon: MessageSquare,
    title: "Order Status & Tracking",
    desc: "Customers ask 'Where is my order?' dozens of times per day. Your AI answers instantly with tracking instructions — no human needed.",
    example: "Customer: 'Has my order shipped yet?' → AI: 'Your order #12345 shipped on March 20 via DHL. Track it here: [link]'",
  },
  {
    icon: ShoppingCart,
    title: "Returns & Refunds",
    desc: "Walk customers through your return policy step by step. Collect the info you need, create a return label link — automatically.",
    example: "Customer: 'I want to return this' → AI: 'No problem! Our return window is 30 days. Here's the return form: [link]'",
  },
  {
    icon: Star,
    title: "Product Questions",
    desc: "Train the AI on your product catalog. It answers sizing questions, spec comparisons, availability — without a rep touching a ticket.",
    example: "Customer: 'Does this come in size XL?' → AI answers from your catalog, suggests alternatives if out of stock",
  },
  {
    icon: Clock,
    title: "After-Hours Coverage",
    desc: "40% of online shopping happens outside business hours. Your AI captures every inquiry and answers immediately — no leads lost to competitors.",
    example: "11 PM inquiry answered in seconds vs waiting until 9 AM the next day",
  },
  {
    icon: TrendingUp,
    title: "Abandoned Cart Recovery",
    desc: "Trigger proactive messages when a customer abandons their cart. Answer objections instantly. Convert lost revenue.",
    example: "Via Telegram/WhatsApp: 'Did you have any questions about your cart? I'm happy to help.'",
  },
  {
    icon: Zap,
    title: "Shipping & Delivery Info",
    desc: "Answer shipping policy, delivery time, and international shipping questions instantly — the #2 most common ecommerce inquiry.",
    example: "Customer: 'Do you ship to Germany?' → instant answer from your shipping policy",
  },
];

export default function EcommercePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

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

        {/* Breadcrumb */}
        <nav className="text-sm text-zinc-500 pt-8 mb-8">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/use-cases" className="hover:text-zinc-300 transition-colors">Use Cases</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">Ecommerce</span>
        </nav>

        {/* Hero */}
        <section className="py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-6">
              <ShoppingCart className="w-3.5 h-3.5" />
              Ecommerce AI Chatbot
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight">
              AI Customer Support for Your <span className="text-violet-400">Online Store</span>
            </h1>
            <p className="text-lg text-zinc-400 mb-8 leading-relaxed max-w-2xl">
              Answer order questions, handle returns, and recover abandoned carts — automatically, 24/7. Deploy in 20 minutes. Free plan includes 2,000 messages/month.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-xl font-semibold">
                Start Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/compare/tidio" className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 px-6 py-3 rounded-xl text-zinc-300 transition-colors text-sm">
                Compare with Tidio
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-4">No credit card · 2,000 messages free · Live in 20 minutes</p>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {stats.map((s, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-violet-400 mb-1">{s.value}</div>
              <div className="text-xs text-zinc-500 leading-relaxed">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Use cases */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">What Your AI Agent Handles</h2>
          <p className="text-zinc-400 mb-8 max-w-2xl">Train it once on your store&apos;s policies and catalog. It handles the rest — automatically.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((uc, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3">
                  <uc.icon className="w-4 h-4 text-violet-400" />
                </div>
                <h3 className="font-semibold mb-2">{uc.title}</h3>
                <p className="text-sm text-zinc-400 mb-3 leading-relaxed">{uc.desc}</p>
                <div className="bg-black/30 rounded-lg p-3 text-xs text-zinc-500 italic leading-relaxed">
                  {uc.example}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">Set Up in 4 Steps</h2>
          <div className="space-y-4">
            {[
              { n: "1", title: "Create your free account", desc: "Sign up in 30 seconds. No credit card. Free plan includes 2,000 messages/month — enough to validate before committing." },
              { n: "2", title: "Upload your store knowledge", desc: "Paste your FAQ, shipping policy, and return policy. Upload your product catalog. The AI learns your store in minutes." },
              { n: "3", title: "Connect your channels", desc: "Add the web chat widget to your Shopify/WooCommerce store, or connect Telegram/WhatsApp where your customers already are." },
              { n: "4", title: "Monitor and improve", desc: "Review every conversation in the manager dashboard. See what questions the AI couldn't answer — and add them to the knowledge base." },
            ].map((step) => (
              <div key={step.n} className="flex gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-5">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 font-bold flex items-center justify-center shrink-0 text-sm">{step.n}</div>
                <div>
                  <div className="font-semibold mb-1">{step.title}</div>
                  <div className="text-sm text-zinc-400 leading-relaxed">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Platform compatibility */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Works With Every Platform</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-3">Ecommerce Platforms</h3>
              <ul className="space-y-2">
                {["Shopify (web widget + WhatsApp)", "WooCommerce (web widget)", "Magento / Adobe Commerce", "BigCommerce", "Custom storefronts (API)"].map((p, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />{p}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-3">Customer Channels</h3>
              <ul className="space-y-2">
                {[
                  "Web chat (embeddable widget)",
                  "Telegram (bot integration)",
                  "WhatsApp Business (via Twilio)",
                  "Discord (community support)",
                  "REST API (any custom channel)",
                ].map((c, i) => (
                  <li key={i} className="flex gap-2 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />{c}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        {/* ROI section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">The ROI for Ecommerce</h2>
          <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
              <div className="p-6">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Without AI (1 support agent)</div>
                {[
                  { label: "Annual salary + benefits", value: "$45,500" },
                  { label: "Avg. tickets handled/day", value: "25–30" },
                  { label: "After-hours coverage", value: "None" },
                  { label: "Response time", value: "2–8 hours" },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between py-2 text-sm border-b border-white/5 last:border-0">
                    <span className="text-zinc-400">{row.label}</span>
                    <span className="text-zinc-300">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="p-6">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-4">With OpenHelix AI</div>
                {[
                  { label: "Annual cost (Pro plan)", value: "$948", highlight: true },
                  { label: "Avg. conversations handled/day", value: "1,000+" },
                  { label: "After-hours coverage", value: "24/7" },
                  { label: "Response time", value: "< 3 seconds" },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between py-2 text-sm border-b border-white/5 last:border-0">
                    <span className="text-zinc-400">{row.label}</span>
                    <span className={row.highlight ? "text-emerald-400 font-bold" : "text-zinc-300"}>{row.value}</span>
                  </div>
                ))}
              </div>
            </div>
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
          <h2 className="text-2xl font-bold mb-2">Start automating your store support today</h2>
          <p className="text-zinc-400 text-sm mb-6">Free plan · 2,000 messages · Works on Telegram, WhatsApp & web · Live in 20 minutes</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-4 rounded-xl font-semibold text-lg">
            Deploy Your Ecommerce AI <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        {/* Related */}
        <section className="mb-16 pt-8 border-t border-white/5">
          <div className="text-sm text-zinc-500 mb-4">Related guides</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/use-cases/saas" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">AI Chatbot for SaaS</div><div className="text-xs text-zinc-500 mt-0.5">Onboarding, churn prevention, feature questions</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/compare/tidio" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">OpenHelix vs Tidio</div><div className="text-xs text-zinc-500 mt-0.5">Popular ecommerce chatbot alternative</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/integrations/whatsapp" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">WhatsApp for Ecommerce</div><div className="text-xs text-zinc-500 mt-0.5">Reach customers on their preferred channel</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/blog/reduce-customer-support-costs-with-ai" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Reduce Support Costs by 60%</div><div className="text-xs text-zinc-500 mt-0.5">ROI guide with real cost breakdown</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
