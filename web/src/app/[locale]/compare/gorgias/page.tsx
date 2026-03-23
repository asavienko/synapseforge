import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Check, X, ArrowRight, Zap, Star, ShoppingCart, DollarSign, MessageSquare, Clock } from "lucide-react";

export const metadata: Metadata = {
  title: "OpenHelix vs Gorgias (2026) — AI Alternative for Ecommerce",
  description:
    "Compare OpenHelix AI vs Gorgias. AI-powered support at $29/mo vs $60/agent/mo. See why ecommerce brands are switching to AI for customer service.",
  openGraph: {
    title: "OpenHelix vs Gorgias — AI Ecommerce Support Alternative",
    description: "AI support vs Gorgias for ecommerce. Compare pricing, automation, and Shopify integration.",
    type: "article",
  },
};

export default function CompareGorgiasPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      {/* Header */}
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

      <article className="max-w-5xl mx-auto px-4 py-12">
        {/* Title */}
        <header className="mb-12">
          <div className="flex items-center gap-2 text-violet-400 text-sm mb-4">
            <Star className="w-4 h-4" />
            <span>Comparison</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4">
            OpenHelix vs Gorgias
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl">
            <strong className="text-white">AI-native support</strong> vs ecommerce help desk. 
            See why Shopify brands are choosing AI automation over traditional ticketing.
          </p>
        </header>

        {/* Price comparison */}
        <section className="mb-12 bg-gradient-to-r from-violet-600/10 to-purple-600/10 border border-violet-500/20 rounded-2xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-6">Pricing Comparison</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <ShoppingCart className="w-5 h-5 text-zinc-400" />
                <span className="font-semibold">Gorgias</span>
              </div>
              <div className="text-3xl font-bold mb-2">$60<span className="text-lg text-zinc-500">/agent/mo</span></div>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li>• Basic: $60/agent/month</li>
                <li>• Pro: $90/agent/month</li>
                <li>• Advanced: custom pricing</li>
                <li>• 3 agent minimum on most plans</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-white/10 text-sm text-zinc-500">
                3 agents × $60 = <strong className="text-zinc-300">$180/month minimum</strong>
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
                <li>• Growth: $79/month (30K messages)</li>
                <li>• No per-agent fees</li>
                <li>• Unlimited AI instances</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-violet-500/20 text-sm text-violet-300">
                <strong>84% cheaper</strong> for the same support volume
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
                <ShoppingCart className="w-5 h-5 text-violet-400" />
                <span className="font-semibold">Ecommerce Integration</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-400"><strong className="text-zinc-300">Gorgias:</strong> Deep Shopify integration. Order lookup, shipping data, refund handling.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300"><strong>OpenHelix:</strong> API-based ecommerce integration. Connect to any platform. AI learns your store data.</span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <MessageSquare className="w-5 h-5 text-violet-400" />
                <span className="font-semibold">Automation Approach</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-400"><strong className="text-zinc-300">Gorgias:</strong> Rule-based automations. Templates and macros. Still requires human review.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300"><strong>OpenHelix:</strong> AI understands context. Natural conversations. 70-80% fully automated.</span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Clock className="w-5 h-5 text-violet-400" />
                <span className="font-semibold">Response Time</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-400"><strong className="text-zinc-300">Gorgias:</strong> Depends on agent availability. During sales, wait times increase.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300"><strong>OpenHelix:</strong> Instant responses 24/7. No queue during Black Friday or flash sales.</span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <DollarSign className="w-5 h-5 text-violet-400" />
                <span className="font-semibold">Scaling Costs</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-400"><strong className="text-zinc-300">Gorgias:</strong> Add agents as you grow. 10 agents = $600-900/month.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300"><strong>OpenHelix:</strong> Handle 10× volume on same plan. Scale without proportional cost.</span>
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
                  <th className="pb-3 font-medium text-zinc-400 text-center">Gorgias</th>
                  <th className="pb-3 font-medium text-violet-400 text-center">OpenHelix</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-white/5">
                  <td className="py-3">Shopify integration</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /> Native</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /> API</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">Order tracking automation</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /> AI-powered</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">AI responses</td>
                  <td className="py-3 text-center"><X className="w-4 h-4 text-red-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">Social media support</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">Live chat</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">Email support</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">Macros/templates</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="py-3 text-center">AI generates</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">Reporting/analytics</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /> + AI insights</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">WhatsApp integration</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
                <tr>
                  <td className="py-3">Custom branding</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
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
              <h3 className="font-semibold mb-3 text-zinc-300">Choose Gorgias if...</h3>
              <ul className="text-sm text-zinc-400 space-y-2">
                <li>• You want deep, native Shopify integration</li>
                <li>• You prefer traditional ticket management</li>
                <li>• You have a dedicated support team already</li>
                <li>• You need influencer/collab management features</li>
              </ul>
            </div>

            <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-5">
              <h3 className="font-semibold mb-3 text-violet-300">Choose OpenHelix if...</h3>
              <ul className="text-sm text-zinc-300 space-y-2">
                <li>• You want to automate 70%+ of support</li>
                <li>• You need 24/7 coverage without hiring</li>
                <li>• You\u0026apos;re looking to reduce support costs</li>
                <li>• You sell on multiple platforms (not just Shopify)</li>
                <li>• You want instant response times during sales</li>
              </ul>
            </div>
          </div>
        </section>

        {/* Ecommerce specific */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">Ecommerce Use Cases</h2>
          <p className="text-zinc-400 mb-6">OpenHelix AI excels at the repetitive questions that dominate ecommerce support:</p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <h3 className="font-semibold mb-2">Order Status</h3>
              <p className="text-sm text-zinc-400">\u0026quot;Where is my order?\u0026quot; — AI checks tracking and provides real-time updates without human involvement.</p>
            </div>
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <h3 className="font-semibold mb-2">Returns & Exchanges</h3>
              <p className="text-sm text-zinc-400">Guide customers through return policies and process requests automatically.</p>
            </div>
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <h3 className="font-semibold mb-2">Product Questions</h3>
              <p className="text-sm text-zinc-400">Size guides, specifications, availability — AI answers instantly from your product catalog.</p>
            </div>
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <h3 className="font-semibold mb-2">Cart Recovery</h3>
              <p className="text-sm text-zinc-400">Proactive outreach to abandoned carts with personalized assistance.</p>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-violet-600/10 to-purple-600/10 border border-violet-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Switch from Gorgias?</h2>
          <p className="text-zinc-400 mb-6 max-w-xl mx-auto">
            Start your free trial today. Most ecommerce brands see 70%+ automation 
            and significant cost savings within the first month.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/sign-up" 
              className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Try OpenHelix Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/use-cases/ecommerce" 
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              See Ecommerce Features
            </Link>
          </div>
        </section>
      </article>
    </div>
  );
}
