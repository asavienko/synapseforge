import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FadeInView } from "@/components/animations/FadeInView";
import { ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "OpenHelix vs Competitors — AI Chatbot Comparisons",
  description: "Honest comparisons of OpenHelix AI vs Tidio, Intercom, Crisp, and other AI customer support platforms.",
};

const comparisons = [
  { slug: "tidio", name: "Tidio", desc: "SMB live chat with AI add-on. Compare features, pricing, and Telegram/WhatsApp support.", badge: "Most popular" },
  { slug: "intercom", name: "Intercom", desc: "Enterprise customer messaging platform. See how we compare on AI capabilities and pricing.", badge: "High intent" },
  { slug: "zendesk", name: "Zendesk", desc: "The biggest help desk — but $55/agent/month adds up fast. See how we compare on AI automation.", badge: "High traffic" },
  { slug: "freshdesk", name: "Freshdesk", desc: "Freshdesk hides AI behind Freddy AI add-ons. Compare real costs and automation capabilities.", badge: null },
  { slug: "crisp", name: "Crisp", desc: "Multi-channel support platform with new AI features. Honest feature-by-feature breakdown.", badge: null },
  { slug: "livechat", name: "LiveChat", desc: "Traditional live chat at $52/agent/month vs AI at $29/month. Cost comparison and feature breakdown.", badge: "High intent" },
  { slug: "helpscout", name: "Help Scout", desc: "Email-first help desk at $50/user/mo vs AI-native support. Feature and pricing comparison.", badge: null },
  { slug: "gorgias", name: "Gorgias", desc: "Ecommerce help desk at $60/agent/mo vs AI. Shopify integration comparison and automation features.", badge: "Ecommerce" },
];

export default function ComparePage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      <SiteHeader />

      {/* Hero */}
      <section className="relative mesh-gradient grid-bg py-16 sm:py-24 md:py-32">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <FadeInView direction="up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/20 text-[12px] text-blue-600 dark:text-blue-400 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Honest Comparisons
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="gradient-text">OpenHelix vs Competitors</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-white/50 max-w-xl mx-auto">
              Honest comparisons to help you pick the right AI customer support platform for your business.
            </p>
          </FadeInView>
        </div>
      </section>

      {/* Comparisons Grid */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {comparisons.map((c, i) => (
              <FadeInView key={c.slug} direction="up" delay={i * 60}>
                <NextLink href={`/compare/${c.slug}`} className={`glass-card glow-border rounded-xl p-5 group block h-full transition-all duration-300 hover:-translate-y-0.5 stagger-${(i % 6) + 1}`}>
                  <div className="flex items-start justify-between mb-3">
                    <h2 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                      OpenHelix vs {c.name}
                    </h2>
                    {c.badge && <span className="text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">{c.badge}</span>}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-white/50 mb-4 leading-relaxed">{c.desc}</p>
                  <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                    Compare <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </NextLink>
              </FadeInView>
            ))}
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
