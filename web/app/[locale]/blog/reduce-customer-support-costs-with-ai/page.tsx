import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Zap, Clock, Calendar, Check, TrendingDown } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Reduce Customer Support Costs by 60% with AI (2026 Guide)",
  description:
    "Practical guide to cutting customer support costs using AI agents. Real numbers, ROI calculator, and step-by-step implementation. Works for SMBs and growing teams.",
  openGraph: {
    title: "How to Reduce Customer Support Costs by 60% with AI",
    description: "Real numbers on AI support ROI. How businesses cut response costs while improving customer satisfaction.",
    type: "article",
  },
};

const articleSchema = {
  "@context": "https://schema.org",
  "@type": "Article",
  headline: "How to Reduce Customer Support Costs by 60% with AI (2026)",
  description: "Practical guide to cutting customer support costs using AI agents — with real ROI numbers and implementation steps.",
  datePublished: "2026-03-23",
  dateModified: "2026-03-23",
  author: { "@type": "Organization", name: "OpenHelix AI", url: "https://openhelixai.com" },
  publisher: {
    "@type": "Organization",
    name: "OpenHelix AI",
    logo: { "@type": "ImageObject", url: "https://openhelixai.com/logo.png" },
  },
};

const costs = [
  { role: "Support agent (junior)", salary: "$35,000/yr", perHour: "$17", perTicket: "$8–15", note: "Handles ~25 tickets/day" },
  { role: "Support agent (senior)", salary: "$55,000/yr", perHour: "$26", perTicket: "$15–25", note: "Handles complex issues" },
  { role: "Support manager", salary: "$75,000/yr", perHour: "$36", perTicket: "Overhead", note: "Team of 5–8 agents" },
];

const aiCosts = [
  { item: "OpenHelix AI (Pro plan)", cost: "$79/month", note: "Unlimited instances" },
  { item: "GPT-4o mini API (10K msgs/mo)", cost: "~$2/month", note: "At $0.0002/1K tokens" },
  { item: "GPT-4o API (10K msgs/mo)", cost: "~$50/month", note: "At $0.005/1K tokens" },
  { item: "Twilio WhatsApp (10K msgs)", cost: "~$50/month", note: "At $0.005/msg" },
  { item: "Total (mid-tier)", cost: "~$131/month", note: "Replaces 0.5–1 FTE" },
];

export default function ReduceSupportCostsPost() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

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

      <main className="max-w-3xl mx-auto px-4 py-16">

        <nav className="text-sm text-zinc-500 mb-8">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/blog" className="hover:text-zinc-300 transition-colors">Blog</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">Reduce Customer Support Costs</span>
        </nav>

        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-xs font-medium px-2 py-0.5 rounded-full text-emerald-400 bg-emerald-400/10">ROI Guide</span>
            <span className="text-xs text-zinc-500 flex items-center gap-1"><Calendar className="w-3 h-3" />March 23, 2026</span>
            <span className="text-xs text-zinc-500 flex items-center gap-1"><Clock className="w-3 h-3" />9 min read</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">
            How to Reduce Customer Support Costs by 60% with AI
          </h1>
          <p className="text-lg text-zinc-400 leading-relaxed">
            A junior support agent costs $35,000/year. They handle 25 tickets/day, work 8 hours, and need benefits, management, and training on top. An AI agent handles 1,000+ messages/day at $2–50/month. Here&apos;s how to make the switch — and the math behind why it works.
          </p>
        </div>

        {/* Key stat */}
        <div className="grid grid-cols-3 gap-4 mb-10">
          {[
            { stat: "73%", label: "of customers believe AI can improve their support experience" },
            { stat: "60%", label: "average reduction in cost per ticket with AI automation" },
            { stat: "24/7", label: "availability vs 9–5 for human-only support teams" },
          ].map((item, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-violet-400 mb-1">{item.stat}</div>
              <div className="text-xs text-zinc-500 leading-relaxed">{item.label}</div>
            </div>
          ))}
        </div>

        {/* Inline CTA */}
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 mb-10 flex items-center justify-between gap-4 flex-wrap">
          <div>
            <div className="text-sm font-semibold text-white">Calculate your savings</div>
            <div className="text-xs text-zinc-400">Free account — see ROI in your first week.</div>
          </div>
          <Link href="/sign-up" className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg text-sm font-semibold shrink-0">
            Try Free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="prose prose-invert max-w-none space-y-10">

          {/* Section 1 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">The Real Cost of Human-Only Support</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Most businesses underestimate support costs because they only look at salaries. The true cost per ticket includes salary, benefits (~30% on top), management overhead, training time, and tools.
            </p>
            <div className="overflow-x-auto rounded-xl border border-white/10 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th className="text-left px-4 py-2 text-zinc-400 font-medium">Role</th>
                    <th className="px-4 py-2 text-zinc-400 font-medium text-center">Salary</th>
                    <th className="px-4 py-2 text-zinc-400 font-medium text-center">Per hour</th>
                    <th className="px-4 py-2 text-zinc-400 font-medium text-center">Cost/ticket</th>
                  </tr>
                </thead>
                <tbody>
                  {costs.map((row, i) => (
                    <tr key={i} className="border-b border-white/5">
                      <td className="px-4 py-3 text-zinc-300">
                        <div>{row.role}</div>
                        <div className="text-xs text-zinc-500">{row.note}</div>
                      </td>
                      <td className="px-4 py-3 text-center text-zinc-300">{row.salary}</td>
                      <td className="px-4 py-3 text-center text-zinc-400">{row.perHour}</td>
                      <td className="px-4 py-3 text-center text-red-400 font-medium">{row.perTicket}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-zinc-400 leading-relaxed text-sm">
              For a business handling 500 tickets/month with one junior agent, that&apos;s roughly <strong className="text-white">$4,000–7,500/month</strong> in true support cost. A larger team of 5 agents = $20,000–37,500/month.
            </p>
          </div>

          {/* Section 2 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">What AI Costs (The Actual Numbers)</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              AI support costs are almost entirely variable — you pay per message, not per headcount. Here&apos;s a realistic breakdown for 10,000 messages/month:
            </p>
            <div className="overflow-x-auto rounded-xl border border-white/10 mb-4">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/10 bg-white/[0.03]">
                    <th className="text-left px-4 py-2 text-zinc-400 font-medium">Item</th>
                    <th className="px-4 py-2 text-zinc-400 font-medium text-center">Cost/month</th>
                    <th className="px-4 py-2 text-zinc-400 font-medium">Note</th>
                  </tr>
                </thead>
                <tbody>
                  {aiCosts.map((row, i) => (
                    <tr key={i} className={`border-b border-white/5 ${i === aiCosts.length - 1 ? "bg-emerald-500/5" : ""}`}>
                      <td className="px-4 py-3 text-zinc-300 font-medium">{row.item}</td>
                      <td className={`px-4 py-3 text-center font-semibold ${i === aiCosts.length - 1 ? "text-emerald-400" : "text-zinc-300"}`}>{row.cost}</td>
                      <td className="px-4 py-3 text-zinc-500 text-xs">{row.note}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-sm">
              <TrendingDown className="w-4 h-4 text-emerald-400 inline mr-2" />
              <strong className="text-emerald-400">Bottom line:</strong>
              <span className="text-zinc-300"> $131/month vs $4,000–7,500/month. AI handles 80–90% of routine tickets, leaving human agents for complex cases only.</span>
            </div>
          </div>

          {/* Section 3 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Where AI Cuts Costs (and Where It Doesn&apos;t)</h2>
            <p className="text-zinc-400 leading-relaxed mb-5">
              Not all support tickets are equal. AI excels at high-volume, repetitive queries — the ones that drain agent time most.
            </p>
            <div className="grid sm:grid-cols-2 gap-4 mb-4">
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">AI handles well ✅</div>
                <ul className="space-y-2">
                  {[
                    "FAQ answers (hours, prices, policies)",
                    "Order status and tracking",
                    "Account basics (password reset, plan info)",
                    "Product questions and specs",
                    "Booking confirmations",
                    "After-hours coverage",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />{item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-3">Still needs humans ⚠️</div>
                <ul className="space-y-2">
                  {[
                    "Complex billing disputes",
                    "Legal or compliance issues",
                    "Emotionally distressed customers",
                    "Custom enterprise negotiations",
                    "Product feedback requiring decisions",
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-zinc-400">
                      <span className="text-zinc-600 shrink-0">—</span>{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
            <p className="text-zinc-400 text-sm leading-relaxed">
              For most SMBs, <strong className="text-white">70–85% of inbound tickets fall into the AI-handles-well category</strong>. That means you can cut your support team&apos;s ticket volume by that same amount — freeing them for high-value work.
            </p>
          </div>

          {/* Section 4 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">How to Implement AI Support in 4 Steps</h2>
            <div className="space-y-4">
              {[
                {
                  step: "1",
                  title: "Audit your ticket categories",
                  desc: "Pull your last 30 days of support tickets. Group them by topic. You'll likely find that 5–10 topics account for 70%+ of volume. These are your AI automation targets.",
                },
                {
                  step: "2",
                  title: "Build your knowledge base",
                  desc: "For each high-volume topic, write a clear answer. Upload these to your AI agent's knowledge base. The AI will use this to answer accurately — not make things up.",
                },
                {
                  step: "3",
                  title: "Deploy on your highest-traffic channel first",
                  desc: "Start where most of your support requests come from — usually Telegram, WhatsApp, or web chat. Don't try to deploy everywhere at once. Tune one channel first.",
                },
                {
                  step: "4",
                  title: "Monitor and iterate",
                  desc: "Use the manager dashboard to review AI responses weekly. Flag unanswered questions and add them to the knowledge base. Most teams see quality peak within 2–3 weeks.",
                },
              ].map((item) => (
                <div key={item.step} className="flex gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-5">
                  <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 font-bold flex items-center justify-center shrink-0 text-sm">{item.step}</div>
                  <div>
                    <div className="font-semibold text-white mb-1">{item.title}</div>
                    <div className="text-sm text-zinc-400 leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 5 — ROI calc */}
          <div>
            <h2 className="text-xl font-bold text-white mb-4">Quick ROI Calculator</h2>
            <p className="text-zinc-400 mb-5 leading-relaxed text-sm">
              Use this to estimate your savings. Assumptions: 1 support agent at $35K/year, handling 500 tickets/month, AI handles 75% of them.
            </p>
            <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
              <div className="grid grid-cols-2 divide-x divide-white/5">
                <div className="p-5">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Without AI</div>
                  {[
                    { label: "Support staff (1 FTE)", value: "$35,000/yr" },
                    { label: "+ Benefits (30%)", value: "$10,500/yr" },
                    { label: "+ Tools & overhead", value: "$3,600/yr" },
                    { label: "Total", value: "$49,100/yr", highlight: true },
                  ].map((row, i) => (
                    <div key={i} className={`flex justify-between py-2 text-sm ${i < 3 ? "border-b border-white/5" : ""}`}>
                      <span className="text-zinc-400">{row.label}</span>
                      <span className={row.highlight ? "text-red-400 font-bold" : "text-zinc-300"}>{row.value}</span>
                    </div>
                  ))}
                </div>
                <div className="p-5">
                  <div className="text-xs text-zinc-500 uppercase tracking-wider mb-4">With AI (75% automated)</div>
                  {[
                    { label: "OpenHelix AI (Pro)", value: "$948/yr" },
                    { label: "AI API costs", value: "~$600/yr" },
                    { label: "0.25 FTE human (complex)", value: "$12,275/yr" },
                    { label: "Total", value: "$13,823/yr", highlight: true },
                  ].map((row, i) => (
                    <div key={i} className={`flex justify-between py-2 text-sm ${i < 3 ? "border-b border-white/5" : ""}`}>
                      <span className="text-zinc-400">{row.label}</span>
                      <span className={row.highlight ? "text-emerald-400 font-bold" : "text-zinc-300"}>{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="border-t border-white/10 bg-emerald-500/10 p-4 text-center">
                <span className="text-emerald-400 font-bold text-lg">$35,277 saved per year</span>
                <span className="text-zinc-400 text-sm ml-2">(72% reduction)</span>
              </div>
            </div>
          </div>

          {/* Section 6 */}
          <div>
            <h2 className="text-xl font-bold text-white mb-3">The Hidden Benefit: Better Customer Experience</h2>
            <p className="text-zinc-400 leading-relaxed mb-4">
              Cost reduction is the easy argument. The harder-to-quantify benefit: <strong className="text-white">customers who get instant answers at 11 PM are happier customers</strong>.
            </p>
            <p className="text-zinc-400 leading-relaxed">
              80% of customers who interact with AI support report a positive experience (Tidio, 2026). Response time going from 4 hours to 4 seconds matters more to retention than most product features. AI doesn&apos;t just cut costs — it upgrades the experience at the same time.
            </p>
          </div>

        </div>

        {/* Bottom CTA */}
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-8 text-center mt-12">
          <h2 className="text-xl font-bold mb-2">Start cutting support costs today</h2>
          <p className="text-zinc-400 text-sm mb-6">Free plan · 2,000 messages · GPT-4 or Claude · Live in 3 minutes</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-xl font-semibold">
            Try OpenHelix Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Related */}
        <div className="mt-12 pt-8 border-t border-white/5">
          <div className="text-sm text-zinc-500 mb-4">Related guides</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/blog/best-ai-models-for-customer-support" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Best AI Models for Customer Support</div><div className="text-xs text-zinc-500 mt-0.5">GPT-4o vs Claude vs Gemini — which wins?</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/blog/how-to-build-telegram-chatbot" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">How to Build a Telegram AI Chatbot</div><div className="text-xs text-zinc-500 mt-0.5">Step-by-step, 10 minutes</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/compare/intercom" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">OpenHelix vs Intercom</div><div className="text-xs text-zinc-500 mt-0.5">Is Intercom&apos;s price worth it for SMBs?</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/pricing" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">OpenHelix Pricing</div><div className="text-xs text-zinc-500 mt-0.5">Plans starting free — see full breakdown</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
          </div>
        </div>

      </main>
    </div>
  );
}
