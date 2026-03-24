import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export const metadata: Metadata = {
  title: "OpenHelix vs Competitors — AI Chatbot Comparisons",
  description: "Honest comparisons of OpenHelix AI vs Tidio, Intercom, Crisp, and other AI customer support platforms.",
};

const comparisons = [
  { slug: "tidio", name: "Tidio", desc: "SMB live chat with AI add-on. Compare features, pricing, and Telegram/WhatsApp support.", badge: "Most popular" },
  { slug: "intercom", name: "Intercom", desc: "Enterprise customer messaging platform. See how we compare on AI capabilities and pricing.", badge: "High intent" },
  { slug: "zendesk", name: "Zendesk", desc: "The biggest help desk — but $55/agent/month adds up fast. See how we compare on AI automation.", badge: "🔥 High traffic" },
  { slug: "freshdesk", name: "Freshdesk", desc: "Freshdesk hides AI behind Freddy AI add-ons. Compare real costs and automation capabilities.", badge: null },
  { slug: "crisp", name: "Crisp", desc: "Multi-channel support platform with new AI features. Honest feature-by-feature breakdown.", badge: null },
  { slug: "livechat", name: "LiveChat", desc: "Traditional live chat at $52/agent/month vs AI at $29/month. Cost comparison and feature breakdown.", badge: "🔥 High intent" },
  { slug: "helpscout", name: "Help Scout", desc: "Email-first help desk at $50/user/mo vs AI-native support. Feature and pricing comparison.", badge: null },
  { slug: "gorgias", name: "Gorgias", desc: "Ecommerce help desk at $60/agent/mo vs AI. Shopify integration comparison and automation features.", badge: "Ecommerce" },
];

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
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
      <main className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">OpenHelix vs Competitors</h1>
        <p className="text-zinc-400 mb-12 max-w-xl">Honest comparisons to help you pick the right AI customer support platform for your business.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisons.map((c) => (
            <NextLink key={c.slug} href={`/compare/${c.slug}`} className="bg-white/[0.02] border border-white/10 hover:border-violet-500/30 hover:bg-white/[0.04] transition-all rounded-xl p-5 group">
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-semibold text-white group-hover:text-violet-300 transition-colors">
                  OpenHelix vs {c.name}
                </h2>
                {c.badge && <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full">{c.badge}</span>}
              </div>
              <p className="text-sm text-zinc-400 mb-4 leading-relaxed">{c.desc}</p>
              <div className="flex items-center gap-1 text-sm text-violet-400">
                Compare <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </NextLink>
          ))}
        </div>
      </main>
    </div>
  );
}
