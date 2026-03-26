import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Check, X, ArrowRight, Zap, Star, HelpCircle, Mail, Shield, Users } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "OpenHelix vs Help Scout (2026) — AI-Powered Alternative",
  description:
    "Compare OpenHelix AI vs Help Scout. Modern AI support at $29/mo vs $50/user/mo. See feature comparison, pricing, and why teams are switching.",
  openGraph: {
    title: "OpenHelix vs Help Scout — AI Customer Support Alternative",
    description: "AI-powered support vs traditional help desk. Compare features, pricing, and automation capabilities.",
    type: "article",
  },
};

export default function CompareHelpScoutPage() {
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
            OpenHelix vs Help Scout
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl">
            <strong className="text-white">AI-first customer support</strong> vs traditional help desk. 
            See why modern teams are choosing automation over manual ticket management.
          </p>
        </header>

        {/* Price comparison */}
        <section className="mb-12 bg-gradient-to-r from-violet-600/10 to-purple-600/10 border border-violet-500/20 rounded-2xl p-6 sm:p-8">
          <h2 className="text-2xl font-bold mb-6">Pricing Comparison</h2>
          <div className="grid sm:grid-cols-2 gap-6">
            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <HelpCircle className="w-5 h-5 text-zinc-400" />
                <span className="font-semibold">Help Scout</span>
              </div>
              <div className="text-3xl font-bold mb-2">$50<span className="text-lg text-zinc-500">/user/mo</span></div>
              <ul className="text-sm text-zinc-400 space-y-1">
                <li>• Plus plan: $50/user/month (5 users min)</li>
                <li>• Pro plan: $65/user/month</li>
                <li>• AI features: Additional cost</li>
                <li>• 5 user minimum on Plus plan</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-white/10 text-sm text-zinc-500">
                5 users × $50 = <strong className="text-zinc-300">$250/month minimum</strong>
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
                <li>• No per-user fees</li>
                <li>• AI included in all plans</li>
              </ul>
              <div className="mt-4 pt-4 border-t border-violet-500/20 text-sm text-violet-300">
                <strong>88% cheaper</strong> than Help Scout Plus (5 users)
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
                <Mail className="w-5 h-5 text-violet-400" />
                <span className="font-semibold">Email-First vs AI-First</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-400"><strong className="text-zinc-300">Help Scout:</strong> Built for email support. AI is an add-on, not core to the product.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300"><strong>OpenHelix:</strong> AI-native platform. Built from the ground up for automated support.</span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Users className="w-5 h-5 text-violet-400" />
                <span className="font-semibold">Team Size Requirements</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-400"><strong className="text-zinc-300">Help Scout:</strong> 5-user minimum on most plans. Expensive for small teams.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300"><strong>OpenHelix:</strong> No minimums. Start solo and scale as you grow.</span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Zap className="w-5 h-5 text-violet-400" />
                <span className="font-semibold">Automation Depth</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-400"><strong className="text-zinc-300">Help Scout:</strong> Workflows and auto-replies. Limited AI capabilities.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300"><strong>OpenHelix:</strong> Full AI conversations with knowledge base integration. 70-80% deflection.</span>
                </div>
              </div>
            </div>

            <div className="bg-white/[0.02] border border-white/10 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-violet-400" />
                <span className="font-semibold">Knowledge Base</span>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-start gap-2">
                  <X className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-400"><strong className="text-zinc-300">Help Scout:</strong> Docs site for self-service. Separate from support workflow.</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="text-zinc-300"><strong>OpenHelix:</strong> AI pulls from knowledge base in real-time. Same source for docs and chat.</span>
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
                  <th className="pb-3 font-medium text-zinc-400 text-center">Help Scout</th>
                  <th className="pb-3 font-medium text-violet-400 text-center">OpenHelix</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-white/5">
                  <td className="py-3">Shared inbox</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="py-3 text-center">AI-powered</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">Knowledge base/docs</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /> + AI</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">Live chat</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /> Beacon</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /> AI-native</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">AI responses</td>
                  <td className="py-3 text-center"><X className="w-4 h-4 text-red-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">Workflows/automation</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /> Basic</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /> AI-powered</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">Multi-channel (social)</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">API access</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">Satisfaction surveys</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3">Reporting/analytics</td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /></td>
                  <td className="py-3 text-center"><Check className="w-4 h-4 text-emerald-400 inline" /> + AI insights</td>
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
              <h3 className="font-semibold mb-3 text-zinc-300">Choose Help Scout if...</h3>
              <ul className="text-sm text-zinc-400 space-y-2">
                <li>• You need a traditional email-based help desk</li>
                <li>• Your team is already trained on email workflows</li>
                <li>• You have 5+ support agents and budget for per-user pricing</li>
                <li>• You want a simple, familiar interface</li>
              </ul>
            </div>

            <div className="bg-violet-600/10 border border-violet-500/20 rounded-xl p-5">
              <h3 className="font-semibold mb-3 text-violet-300">Choose OpenHelix if...</h3>
              <ul className="text-sm text-zinc-300 space-y-2">
                <li>• You want to automate 70%+ of your support</li>
                <li>• You need 24/7 coverage without hiring</li>
                <li>• You\u0026apos;re a small team with big support volume</li>
                <li>• You want consistent, accurate AI responses</li>
                <li>• You prefer usage-based over per-user pricing</li>
              </ul>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-gradient-to-r from-violet-600/10 to-purple-600/10 border border-violet-500/20 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold mb-3">Ready to Switch from Help Scout?</h2>
          <p className="text-zinc-400 mb-6 max-w-xl mx-auto">
            Start your free trial today. No credit card required. 
            Most teams see 70%+ automation within the first week.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link 
              href="/sign-up" 
              className="inline-flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              Try OpenHelix Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link 
              href="/compare" 
              className="inline-flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 px-6 py-3 rounded-xl font-semibold transition-colors"
            >
              See All Comparisons
            </Link>
          </div>
        </section>
      </article>
      <SiteFooter />
    </div>
  );
}
