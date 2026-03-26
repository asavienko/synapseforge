import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Check, X, ArrowRight, Zap, Star, MessageCircle, DollarSign, Clock, Shield } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "OpenHelix vs LiveChat (2026) — 80% Cheaper AI Alternative",
  description:
    "Compare OpenHelix AI vs LiveChat. AI-powered support at $29/mo vs $52+/agent/mo. No per-agent pricing. See feature comparison, pricing breakdown, and migration guide.",
  openGraph: {
    title: "OpenHelix vs LiveChat — AI Alternative at 80% Less Cost",
    description: "AI customer support vs traditional live chat. Compare pricing, features, and why businesses are switching.",
    type: "article",
  },
};

export default function CompareLiveChatPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      {/* Header */}
      <SiteHeader />

      <article className="max-w-5xl mx-auto px-4 py-12">
        {/* Title */}
        <header className="mb-12">
          <div className="flex items-center gap-2 text-violet-400 text-sm mb-4">
            <Star className="w-4 h-4" />
            <span>Comparison</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            OpenHelix vs LiveChat
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl">
            AI-powered customer support at <strong className="text-white">80% less cost</strong>. 
            No per-agent pricing. No waiting for human availability. 
            See why businesses are switching from LiveChat to AI.
          </p>
        </header>

        {/* Price comparison */}
        <section className="mb-12 bg-gradient-to-r from-violet-600/10 to-purple-600/10 border border-violet-500/20 rounded-2xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-6">Pricing Comparison</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MessageCircle className="w-5 h-5 text-zinc-400" />
                <span className="font-semibold">LiveChat</span>
              </div>
              <div className="text-3xl font-bold mb-2">$52<span className="text-lg text-zinc-500">/agent/mo</span></div>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li>• Team plan: $52/agent/month</li>
                <li>• Business plan: $79/agent/month</li>
                <li>• Enterprise: Custom pricing</li>
                <li>• 3 agents minimum on most plans</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-white/10 text-sm text-zinc-500">
                3 agents × $52 = <strong className="text-zinc-300">$156/month minimum</strong>
              </div>
            </div>

            <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-violet-400" />
                <span className="font-semibold text-violet-300">OpenHelix AI</span>
              </div>
              <div className="text-3xl font-bold text-violet-400 mb-2">$29<span className="text-lg text-violet-300/70">/mo</span></div>
              <ul className="text-sm text-zinc-300 space-y-1">
                <li>• Starter: $29/month (10K messages)</li>
                <li>• Pro: $49/month flat</li>
                <li>• No per-agent fees</li>
                <li>• Unlimited AI agents/instances</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-violet-500/20 text-sm text-violet-300">
                <strong>80% cheaper</strong> for the same support volume
              </div>
            </div>
          </div>
        </section>

        {/* Key differences */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Key Differences</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-violet-400" />
                <span className="font-semibold">Availability</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-400"><strong className="text-zinc-300">LiveChat:</strong> Requires human agents online. Customers wait when no one is available.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300"><strong>OpenHelix:</strong> AI responds instantly, 24/7. No waiting, no staffing gaps.</span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-violet-400" />
                <span className="font-semibold">Pricing Model</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-400"><strong className="text-zinc-300">LiveChat:</strong> Per-agent pricing scales poorly. Double your team = double your cost.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300"><strong>OpenHelix:</strong> Usage-based pricing. Handle 10× volume without adding cost.</span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-violet-400" />
                <span className="font-semibold">Response Quality</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-400"><strong className="text-zinc-300">LiveChat:</strong> Depends on agent training. Inconsistent answers. New agents make mistakes.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300"><strong>OpenHelix:</strong> Consistent, accurate answers from your knowledge base. Always on-brand.</span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-violet-400" />
                <span className="font-semibold">Scalability</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-400"><strong className="text-zinc-300">LiveChat:</strong> Hire more agents for volume spikes. Slow to scale.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300"><strong>OpenHelix:</strong> Handle unlimited concurrent chats. Scale instantly with zero staffing.</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature comparison */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Feature Comparison</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-white/10">
                <tr className="text-left">
                  <th className="pb-3 font-medium text-zinc-400">Feature</th>
                  <th className="pb-3 font-medium text-zinc-400 text-center">LiveChat</th>
                  <th className="pb-3 font-medium text-violet-400 text-center">OpenHelix</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-white/5">
                  <td className="py-3">Live chat widget</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">AI-powered responses</td>
                  <td className="py-3 text-center"><X className="w-4 h-4 text-red-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">24/7 availability</td>
                  <td className="py-3 text-center"><X className="w-4 h-4 text-red-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">Knowledge base integration</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /> Native</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">Chatbot builder</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /> AI-powered</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">Multi-channel (WhatsApp, Telegram, etc.)</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">API access</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /> Business+</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /> All plans</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">Human handoff</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">Analytics & reporting</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /> + AI insights</td>
                </tr>
                <tr>
                  <td className="py-3">White-label / custom branding</td>
                  <td className="py-3 text-center"><X className="w-4 h-4 text-red-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* When to choose */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Which Should You Choose?</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <h3 className="font-semibold mb-3 text-zinc-300">Choose LiveChat if...</h3>
              <ul className="text-sm text-zinc-400 space-y-2">
                <li>• You have a small, consistent support volume</li>
                <li>• Your customers prefer human interaction for everything</li>
                <li>• You have budget for a dedicated support team</li>
                <li>• You need advanced ticketing workflows</li>
              </ul>
            </div>

            <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-5">
              <h3 className="font-semibold mb-3 text-violet-300">Choose OpenHelix if...</h3>
              <ul className="text-sm text-zinc-300 space-y-2">
                <li>• You want to reduce support costs significantly</li>
                <li>• You have repetitive, FAQ-type questions</li>
                <li>• You need 24/7 coverage without hiring globally</li>
                <li>• You want consistent, accurate answers</li>
                <li>• You handle volume spikes (e.g., product launches)</li>
                <li>• You want to scale without proportional cost increases</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Migration */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Migrating from LiveChat?</h2>
          <p className="text-zinc-400 mb-6">
            Switching is straightforward. Most teams are up and running in a day:
          </p>
          <ol className="space-y-3 text-zinc-300 list-decimal list-inside">
            <li>Export your LiveChat knowledge base and conversation history</li>
            <li>Import FAQs and common responses into OpenHelix</li>
            <li>Configure your AI agent&apos;s tone and escalation rules</li>
            <li>Embed the OpenHelix widget (replaces LiveChat)</li>
            <li>Run both in parallel for a week, then fully switch</li>
          </ol>
        </section>

        {/* FAQ */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <h3 className="font-semibold mb-2">Can I still have human agents with OpenHelix?</h3>
              <p className="text-sm text-zinc-400">
                Yes. OpenHelix handles routine questions automatically and escalates complex issues to your team. 
                Most businesses use a hybrid approach: AI for 70-80% of inquiries, humans for the rest.
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <h3 className="font-semibold mb-2">How accurate is the AI compared to human agents?</h3>
              <p className="text-sm text-zinc-400">
                For questions in your knowledge base, AI is often <em>more</em> accurate than humans — 
                it never forgets, never has a bad day, and always follows your approved responses. 
                Accuracy depends on how well you train it (usually 1-2 days of setup).
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <h3 className="font-semibold mb-2">What if the AI can&apos;t answer a question?</h3>
              <p className="text-sm text-zinc-400">
                The AI escalates to humans when confidence is low or when the customer requests it. 
                You can also set up keyword-based escalation (e.g., \u0026quot;refund\u0026quot;, \u0026quot;complaint\u0026quot;, \u0026quot;manager\u0026quot;).
              </p>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <h3 className="font-semibold mb-2">Is there a free trial?</h3>
              <p className="text-sm text-zinc-400">
                Yes. OpenHelix offers a free tier with 2,000 messages — enough to fully test the platform 
                with real customers before committing.
              </p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-violet-600/10 to-purple-600/10 border border-violet-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Switch from LiveChat?</h2>
          <p className="text-zinc-400 mb-6 max-w-xl mx-auto">
            Start your free trial today. No credit card required. 
            Most teams save 80% on support costs within the first month.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/sign-up" 
              className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Try OpenHelix Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/use-cases" 
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              See Use Cases
            </Link>
          </div>
        </section>
      </article>
      <SiteFooter />
    </div>
  );
}
