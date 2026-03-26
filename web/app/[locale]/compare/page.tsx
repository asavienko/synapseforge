import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { ArrowRight } from "lucide-react";

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
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">OpenHelix vs Competitors</h1>
        <p className="text-gray-500 dark:text-white/50 mb-12 max-w-xl">Honest comparisons to help you pick the right AI customer support platform for your business.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {comparisons.map((c) => (
            <NextLink key={c.slug} href={`/compare/${c.slug}`} className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-500/30 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all rounded-xl p-5 group">
              <div className="flex items-start justify-between mb-3">
                <h2 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">
                  OpenHelix vs {c.name}
                </h2>
                {c.badge && <span className="text-xs bg-blue-500/20 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">{c.badge}</span>}
              </div>
              <p className="text-sm text-gray-500 dark:text-white/50 mb-4 leading-relaxed">{c.desc}</p>
              <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400">
                Compare <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </NextLink>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
