import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Zap, Clock, Calendar, Check, AlertTriangle, ShoppingCart } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "How to Automate Ecommerce Customer Support with AI (2026 Playbook)",
  description:
    "Step-by-step playbook for automating your ecommerce customer support with AI. Covers tools, setup, knowledge base structure, and real ROI numbers. Works for Shopify, WooCommerce, and any platform.",
  openGraph: {
    title: "How to Automate Ecommerce Customer Support with AI",
    description: "The complete playbook — from auditing your ticket categories to going live with AI on WhatsApp and web. Practical, no fluff.",
    type: "article",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Automate Ecommerce Customer Support with AI (2026 Playbook)",
  description: "Step-by-step guide to automating ecommerce customer support — audit, setup, knowledge base, channels, and ROI.",
  datePublished: "2026-03-23",
  dateModified: "2026-03-23",
  author: { "@type": "Organization", name: "OpenHelix AI", url: "https://openhelixai.com" },
  publisher: {
    "@type": "Organization",
    name: "OpenHelix AI",
    logo: { "@type": "ImageObject", url: "https://openhelixai.com/logo.png" },
  },
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Automate Ecommerce Customer Support with AI",
  description: "A complete playbook for setting up AI automation for your online store's customer support.",
  step: [
    { "@type": "HowToStep", name: "Audit your support tickets", text: "Pull 30 days of tickets and group by topic. Identify your top 5–10 categories — these become your automation targets." },
    { "@type": "HowToStep", name: "Build your knowledge base", text: "Write clear answers to every high-volume question. Include your return policy, shipping times, and sizing guides." },
    { "@type": "HowToStep", name: "Set up your AI agent", text: "Create an OpenHelix AI account, configure your agent with your store's context, and upload your knowledge base." },
    { "@type": "HowToStep", name: "Connect your channels", text: "Add the web chat widget to your store and connect WhatsApp or Telegram for messaging app support." },
    { "@type": "HowToStep", name: "Monitor and improve", text: "Review unanswered questions weekly. Add them to your knowledge base. Most stores reach 75%+ automation within 2 weeks." },
  ],
};

const ticketCategories = [
  { category: "Order status / tracking", percentage: 28, automatable: true },
  { category: "Return / refund requests", percentage: 22, automatable: true },
  { category: "Product questions / sizing", percentage: 18, automatable: true },
  { category: "Shipping info / times", percentage: 12, automatable: true },
  { category: "Payment / checkout issues", percentage: 8, automatable: false },
  { category: "Damaged / wrong items", percentage: 7, automatable: false },
  { category: "Other / complex", percentage: 5, automatable: false },
];

export default function AutomateEcommercePost() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <SiteHeader />

      <main className="max-w-3xl mx-auto px-4 py-16">

        <nav className="text-sm text-zinc-500 mb-8">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-zinc-300 transition-colors">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">Automate Ecommerce Support</span>
        </nav>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-blue-400 bg-blue-400/10">Playbook</span>
            <span className="text-xs text-zinc-500 flex items-center gap-1"><Calendar className="w-3 h-3" />March 23, 2026</span>
            <span className="text-xs text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3" />11 min read</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
            How to Automate Ecommerce Customer Support with AI
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            The average ecommerce store handles 200–500 support tickets per month. 80% are variations of the same 5 questions. This playbook shows you exactly how to automate those — and what to do with the remaining 20% that still needs a human.
          </p>
        </div>

        {/* Inline CTA */}
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 mb-10 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-semibold text-white">Ready to implement this?</div>
            <div className="text-xs text-zinc-400">Free plan — set up in 20 minutes.</div>
          </div>
          <Link href="/sign-up" className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg text-sm font-semibold shrink-0">
            Start Free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="space-y-12">

          {/* Section 1 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Step 1: Audit Your Ticket Categories</h2>
            <p className="text-zinc-400 leading-relaxed mb-5">
              Before deploying AI, you need to know which ticket categories to target. Pull your last 30 days of support tickets and group them by topic. Here&apos;s what a typical ecommerce store looks like:
            </p>
            <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden mb-4">
              <div className="px-5 py-3 border-b border-white/5 text-xs text-zinc-500 flex justify-between">
                <span>Ticket Category</span>
                <span>Volume / Automatable?</span>
              </div>
              {ticketCategories.map((row, i) => (
                <div key={i} className="px-5 py-3 border-b border-white/5 last:border-0 flex items-center gap-3">
                  <div className="flex-1">
                    <div className="text-sm text-zinc-300 mb-1">{row.category}</div>
                    <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full ${row.automatable ? "bg-violet-500" : "bg-zinc-700"}`} style={{ width: `${row.percentage * 2.5}%` }} />
                    </div>
                  </div>
                  <span className="text-xs text-zinc-400 w-8 text-right">{row.percentage}%</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full ${row.automatable ? "text-emerald-400 bg-emerald-400/10" : "text-zinc-500 bg-white/5"}`}>
                    {row.automatable ? "✓ AI" : "Human"}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              <strong className="text-white">The key insight:</strong> the top 4 categories (order tracking, returns, product questions, shipping) account for 80% of volume and are fully automatable. That&apos;s your target.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Step 2: Build a Knowledge Base That Actually Works</h2>
            <p className="text-zinc-400 leading-relaxed mb-5">
              The quality of your AI answers is 100% dependent on your knowledge base. Vague inputs produce vague outputs. Here&apos;s exactly what to include for each automatable category:
            </p>
            <div className="space-y-4">
              {[
                {
                  category: "Order Status & Tracking",
                  icon: ShoppingCart,
                  what: [
                    "Your order lookup URL (e.g., yourstore.com/order-status)",
                    "Which carriers you use and their tracking URL formats",
                    "How long processing takes before shipping",
                    "What to do if tracking shows 'delivered' but not received",
                  ],
                  example: "Example entry: 'To check your order status, visit yourstore.com/order-status and enter your order number and email. Orders typically ship within 1–2 business days.'",
                },
                {
                  category: "Return & Refund Policy",
                  icon: AlertTriangle,
                  what: [
                    "Return window (e.g., 30 days from delivery)",
                    "Which items are returnable (and which aren't)",
                    "How to start a return (link to your return portal)",
                    "Refund timeline (e.g., 5–7 business days after receipt)",
                  ],
                  example: "Example entry: 'We accept returns within 30 days of delivery. Items must be unused and in original packaging. Start your return at yourstore.com/returns — you'll get a prepaid label via email.'",
                },
                {
                  category: "Product & Sizing Questions",
                  icon: Zap,
                  what: [
                    "Full product descriptions with materials and dimensions",
                    "Size guide with measurements (not just S/M/L)",
                    "Frequently compared products (e.g., 'what's the difference between X and Y?')",
                    "Availability notes (e.g., 'this color ships separately')",
                  ],
                  example: "Upload your full product catalog as a PDF or paste it as text. Be specific — 'fits true to size' is unhelpful. '26-inch waist = size Small' is what the AI needs.",
                },
              ].map((item, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-7 h-7 rounded-lg bg-violet-500/10 flex items-center justify-center">
                      <item.icon className="w-3.5 h-3.5 text-violet-400" />
                    </div>
                    <span className="font-semibold text-sm">{item.category}</span>
                  </div>
                  <ul className="space-y-1.5 mb-3">
                    {item.what.map((w, j) => (
                      <li key={j} className="flex gap-2 text-sm text-zinc-400">
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />{w}
                      </li>
                    ))}
                  </ul>
                  <div className="bg-black/30 rounded-lg p-3 text-xs text-zinc-500 italic leading-relaxed">{item.example}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Step 3: Configure Your AI Agent</h2>
            <p className="text-zinc-400 leading-relaxed mb-5">
              Your agent&apos;s system prompt defines its personality and boundaries. For ecommerce, keep it focused:
            </p>
            <div className="bg-black/30 rounded-xl p-5 border border-white/10 mb-5">
              <div className="text-xs text-zinc-500 mb-3">Example system prompt for an ecommerce store:</div>
              <pre className="text-xs text-zinc-300 font-mono leading-relaxed whitespace-pre-wrap">{`You are a friendly customer support agent for [Store Name], 
an online store specializing in [your niche].

Your job is to help customers with:
- Order tracking and status questions
- Return and refund requests (collect info, share return portal link)
- Product questions and sizing guidance
- Shipping times and policies

Always be warm and solution-focused. If you can't answer 
something confidently, say: "Let me get our team to help 
with this — can I take your email?" 

Never invent information. Only answer based on what you know.`}</pre>
            </div>
            <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-sm">
              <strong className="text-amber-400">Key rule:</strong>
              <span className="text-zinc-300"> Tell the AI what to do when it doesn&apos;t know the answer. &quot;Collect their email and escalate&quot; beats a confident wrong answer every time.</span>
            </div>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Step 4: Choose Your Channels</h2>
            <p className="text-zinc-400 leading-relaxed mb-5">
              Start with one channel and expand. Here&apos;s which one to pick first:
            </p>
            <div className="grid sm:grid-cols-2 gap-4">
              {[
                {
                  channel: "Web Chat (start here)",
                  desc: "Embed on your store — catches visitors before they bounce. No customer setup required. Shows up on every product page.",
                  priority: "First",
                  color: "border-violet-500/20 bg-violet-500/5",
                },
                {
                  channel: "WhatsApp Business",
                  desc: "Best for markets where WhatsApp is primary (EU, LATAM, Middle East, Africa). High open rates — customers actually read and reply.",
                  priority: "Second",
                  color: "border-white/5 bg-white/[0.02]",
                },
                {
                  channel: "Telegram",
                  desc: "Great for tech-forward customers and markets where Telegram is dominant. Easier to set up than WhatsApp.",
                  priority: "Third",
                  color: "border-white/5 bg-white/[0.02]",
                },
              ].map((ch, i) => (
                <div key={i} className={`border rounded-xl p-5 ${ch.color}`}>
                  <div className="flex items-start justify-between mb-2">
                    <span className="font-semibold text-sm">{ch.channel}</span>
                    <span className="text-xs text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">{ch.priority}</span>
                  </div>
                  <p className="text-sm text-zinc-400 leading-relaxed">{ch.desc}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Step 5: Monitor, Measure, Improve</h2>
            <p className="text-zinc-400 leading-relaxed mb-5">
              Week 1 is never perfect. The AI will encounter questions you didn&apos;t anticipate. Here&apos;s your weekly review process:
            </p>
            <div className="space-y-3">
              {[
                { day: "Weekly", action: "Review unanswered questions in your manager dashboard", impact: "Add top 5 to knowledge base — these are your gaps" },
                { day: "Bi-weekly", action: "Check conversation quality scores", impact: "If score drops, review the flagged conversations for pattern issues" },
                { day: "Monthly", action: "Measure automation rate (AI-resolved vs escalated)", impact: "Target: 70% automated by end of month 1, 80%+ by month 2" },
              ].map((item, i) => (
                <div key={i} className="flex gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-4">
                  <div className="shrink-0 text-xs font-semibold text-violet-400 bg-violet-500/10 px-2 py-1 rounded-lg h-fit">{item.day}</div>
                  <div>
                    <div className="text-sm font-medium text-white mb-0.5">{item.action}</div>
                    <div className="text-xs text-zinc-400">{item.impact}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 6 — what not to automate */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">What NOT to Automate</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Some situations need a human. Configure your AI to recognize these and escalate immediately:
            </p>
            <div className="grid sm:grid-cols-2 gap-3">
              {[
                "Damaged or defective items — customer is emotional, needs empathy",
                "Fraud or unauthorized charges — needs immediate human review",
                "Repeat contacts for the same unresolved issue",
                "Negative reviews / public complaints",
                "Enterprise or wholesale inquiries",
              ].map((item, i) => (
                <div key={i} className="flex gap-2 bg-amber-500/5 border border-amber-500/10 rounded-lg p-3">
                  <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span className="text-sm text-zinc-300">{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* ROI snapshot */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">What This Gets You</h2>
            <div className="grid sm:grid-cols-3 gap-4">
              {[
                { metric: "80%", label: "of tickets handled automatically by week 2" },
                { metric: "3 sec", label: "average response time vs 4+ hours without AI" },
                { metric: "~$30K", label: "saved annually vs a full-time support agent" },
              ].map((item, i) => (
                <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-5 text-center">
                  <div className="text-3xl font-bold text-violet-400 mb-2">{item.metric}</div>
                  <div className="text-sm text-zinc-400 leading-relaxed">{item.label}</div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* CTA */}
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-8 text-center mt-12">
          <h2 className="text-xl font-bold mb-2">Ready to implement this for your store?</h2>
          <p className="text-zinc-400 text-sm mb-6">Free plan · 2,000 messages · Works on Shopify, WooCommerce, any platform · Live in 20 minutes</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-xl font-semibold">
            Set Up Your Ecommerce AI <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Related */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="text-sm text-zinc-500 mb-4">Related guides</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/use-cases/ecommerce" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Ecommerce AI Chatbot</div><div className="text-xs text-zinc-500 mt-0.5">Use case overview + feature breakdown</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/blog/reduce-customer-support-costs-with-ai" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Reduce Support Costs by 60%</div><div className="text-xs text-zinc-500 mt-0.5">ROI breakdown with real numbers</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/compare/tidio" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">OpenHelix vs Tidio</div><div className="text-xs text-zinc-500 mt-0.5">Popular ecommerce chat tool comparison</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/integrations/whatsapp" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">WhatsApp Integration Setup</div><div className="text-xs text-zinc-500 mt-0.5">Connect AI to WhatsApp Business</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
          </div>
        </div>

      </main>
      <SiteFooter />
    </div>
  );
}
