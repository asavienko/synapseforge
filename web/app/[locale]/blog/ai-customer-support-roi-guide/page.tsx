import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Calculator, TrendingDown, Clock, Users } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "AI Customer Support ROI: Calculate Your Cost Savings",
  description:
    "Calculate the ROI of AI customer support. See real cost savings, industry benchmarks, and how to measure the impact on your support team.",
  openGraph: {
    title: "AI Customer Support ROI Guide",
    description: "Calculate your cost savings with AI support. Real benchmarks, formulas, and case study data.",
    type: "article",
  },
};

export default function BlogPost() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      {/* Header */}
      <SiteHeader />

      <article className="max-w-3xl mx-auto px-4 py-12">
        {/* Title */}
        <header className="mb-10">
          <div className="flex items-center gap-2 text-emerald-400 text-sm mb-4">
            <Calculator className="w-4 h-4" />
            <span>ROI Guide</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">
            AI Customer Support ROI: Calculate Your Cost Savings
          </h1>
          <p className="text-xl text-zinc-400">
            A data-driven guide to measuring AI support ROI. 
            Real benchmarks, cost formulas, and what to expect in your first 90 days.
          </p>
        </header>

        {/* The bottom line */}
        <section className="mb-12 bg-gradient-to-r from-emerald-600/10 to-green-600/10 border border-emerald-500/20 rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-3 text-emerald-400">The Bottom Line</h2>
          <p className="text-zinc-300 mb-4">
            Companies using AI for customer support typically see:
          </p>
          <div className="grid sm:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-1">60-80%</div>
              <div className="text-sm text-zinc-500">of tickets deflected</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-1">$0.10</div>
              <div className="text-sm text-zinc-500">per AI interaction</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-1">3-6mo</div>
              <div className="text-sm text-zinc-500">payback period</div>
            </div>
          </div>
        </section>

        {/* Cost comparison */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Cost Per Interaction: AI vs. Human</h2>
          <p className="text-zinc-400 mb-6">
            The math is simple. Human agents cost $8-15 per hour. 
            AI costs pennies per conversation.
          </p>
          
          <div className="overflow-x-auto mb-6">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr className="text-left text-zinc-500">
                  <th className="pb-3 font-medium">Support Channel</th>
                  <th className="pb-3 font-medium text-right">Cost per Contact</th>
                  <th className="pb-3 font-medium text-right">Response Time</th>
                </tr>
              </thead>
              <tbody className="text-zinc-300">
                <tr className="border-b border-white/5">
                  <td className="py-3">Human agent (phone)</td>
                  <td className="py-3 text-right">$8-15</td>
                  <td className="py-3 text-right text-zinc-500">2-5 minutes</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">Human agent (chat)</td>
                  <td className="py-3 text-right">$3-5</td>
                  <td className="py-3 text-right text-zinc-500">1-3 minutes</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">Human agent (email)</td>
                  <td className="py-3 text-right">$5-12</td>
                  <td className="py-3 text-right text-zinc-500">4-24 hours</td>
                </tr>
                <tr className="bg-emerald-500/5">
                  <td className="py-3 font-medium text-emerald-400">AI chatbot</td>
                  <td className="py-3 text-right font-medium text-emerald-400">$0.05-0.15</td>
                  <td className="py-3 text-right text-emerald-400">Instant</td>
                </tr>
              </tbody>
            </table>
          </div>
          
          <p className="text-sm text-zinc-500">
            Source: Industry averages from Gartner, McKinsey, and Help Scout benchmarks (2024).
          </p>
        </section>

        {/* ROI Calculator */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Calculate Your ROI</h2>
          <p className="text-zinc-400 mb-6">
            Use this formula to estimate your savings. We&apos;ll use a mid-sized company as an example.
          </p>

          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-6 mb-6">
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Calculator className="w-5 h-5 text-violet-400" />
              Example: Company with 5,000 monthly tickets
            </h3>
            
            <div className="space-y-4 text-sm">
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-500">Monthly tickets</span>
                <span className="font-mono">5,000</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-500">Current cost per ticket (human)</span>
                <span className="font-mono">$4.50</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-500">AI deflection rate</span>
                <span className="font-mono">70%</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-500">Tickets handled by AI</span>
                <span className="font-mono">3,500</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-500">AI cost per ticket</span>
                <span className="font-mono">$0.10</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-500">Current monthly cost</span>
                <span className="font-mono">$22,500</span>
              </div>
              <div className="flex justify-between py-2 border-b border-white/5">
                <span className="text-zinc-500">New monthly cost (AI + humans)</span>
                <span className="font-mono">$7,175</span>
              </div>
              <div className="flex justify-between py-3 text-emerald-400 font-semibold">
                <span>Monthly savings</span>
                <span>$15,325</span>
              </div>
              <div className="flex justify-between py-2 text-emerald-400">
                <span>Annual savings</span>
                <span className="font-bold">$183,900</span>
              </div>
            </div>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-lg p-4">
            <div className="flex items-center gap-2 text-xs text-zinc-500 mb-2">
              <Calculator className="w-3 h-3" /> ROI Formula
            </div>
            <code className="font-mono text-sm text-zinc-300">
              Savings = (Tickets × Deflection% × Human Cost) - (Tickets × Deflection% × AI Cost)
            </code>
          </div>
        </section>

        {/* Hidden costs */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Hidden Costs to Consider</h2>
          <p className="text-zinc-400 mb-4">
            AI isn&apos;t free. Here are the real costs beyond the per-message price:
          </p>
          
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-amber-400 text-xs">1</span>
              </div>
              <div>
                <div className="font-medium">Setup and training</div>
                <div className="text-sm text-zinc-500">20-40 hours to build knowledge base, test responses, configure escalation rules</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-amber-400 text-xs">2</span>
              </div>
              <div>
                <div className="font-medium">Ongoing maintenance</div>
                <div className="text-sm text-zinc-500">5-10 hours/month to review conversations, add new answers, tune responses</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-amber-400 text-xs">3</span>
              </div>
              <div>
                <div className="font-medium">Escalation handling</div>
                <div className="text-sm text-zinc-500">You still need humans for complex issues — budget for 30-40% of tickets</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-6 h-6 rounded-full bg-amber-500/10 flex items-center justify-center shrink-0 mt-0.5">
                <span className="text-amber-400 text-xs">4</span>
              </div>
              <div>
                <div className="font-medium">Platform costs</div>
                <div className="text-sm text-zinc-500">Subscription fees, API costs, integration work</div>
              </div>
            </div>
          </div>
        </section>

        {/* Timeline */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">What to Expect: 90-Day Timeline</h2>
          
          <div className="space-y-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold text-sm">M1</div>
                <h3 className="font-semibold">Month 1: Setup & Launch</h3>
              </div>
              <ul className="text-sm text-zinc-400 space-y-1 list-disc list-inside">
                <li>Build knowledge base (FAQs, docs, common issues)</li>
                <li>Configure AI responses and escalation rules</li>
                <li>Soft launch to 20% of traffic</li>
                <li>Expect 40-50% deflection (learning phase)</li>
              </ul>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 font-bold text-sm">M2</div>
                <h3 className="font-semibold">Month 2: Tuning</h3>
              </div>
              <ul className="text-sm text-zinc-400 space-y-1 list-disc list-inside">
                <li>Review failed conversations</li>
                <li>Add missing answers to knowledge base</li>
                <li>Roll out to 50% of traffic</li>
                <li>Expect 60-70% deflection</li>
              </ul>
            </div>

            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold text-sm">M3</div>
                <h3 className="font-semibold">Month 3: Full Deployment</h3>
              </div>
              <ul className="text-sm text-zinc-400 space-y-1 list-disc list-inside">
                <li>100% traffic on AI for Tier-1 questions</li>
                <li>Humans handle escalations and complex issues</li>
                <li>Expect 70-80% deflection at scale</li>
                <li>ROI becomes clearly positive</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Key metrics */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Key Metrics to Track</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-emerald-400" />
                <span className="font-medium">Deflection Rate</span>
              </div>
              <p className="text-sm text-zinc-500">% of tickets resolved without human intervention</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-violet-400" />
                <span className="font-medium">Response Time</span>
              </div>
              <p className="text-sm text-zinc-500">Average time to first response (should be instant)</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Users className="w-4 h-4 text-blue-400" />
                <span className="font-medium">Resolution Rate</span>
              </div>
              <p className="text-sm text-zinc-500">% of conversations that fully solve the customer&apos;s problem</p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Calculator className="w-4 h-4 text-amber-400" />
                <span className="font-medium">Cost Per Contact</span>
              </div>
              <p className="text-sm text-zinc-500">Total support costs divided by total tickets</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-violet-600/10 to-purple-600/10 border border-violet-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Calculate Your Exact Savings</h2>
          <p className="text-zinc-400 mb-6">
            Try OpenHelix AI free for 2,000 messages. No credit card required. 
            See your actual deflection rate before committing.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/sign-up" 
              className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Start Free Trial <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/pricing" 
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              View Pricing
            </Link>
          </div>
        </section>
      </article>
      <SiteFooter />
    </div>
  );
}
