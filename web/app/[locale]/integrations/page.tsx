import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { ArrowRight, Send, Phone, Gamepad2, Hash } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FadeInView } from "@/components/animations/FadeInView";

export const metadata: Metadata = {
  title: "OpenHelix Integrations — Telegram, WhatsApp, Discord & More",
  description: "Connect OpenHelix AI to Telegram, WhatsApp, Discord, Slack, Make.com, and Zapier. Full integration guides.",
};

const integrations = [
  { slug: "telegram", name: "Telegram", icon: Send, desc: "Deploy a GPT-4 or Claude bot to any Telegram channel, group, or 1-on-1 chat.", badge: "Most popular", color: "text-blue-600 dark:text-blue-400" },
  { slug: "whatsapp", name: "WhatsApp Business", icon: Phone, desc: "Connect to your WhatsApp Business number via Twilio. Handle customer messages 24/7.", badge: null, color: "text-emerald-600 dark:text-emerald-400" },
  { slug: "discord", name: "Discord", icon: Gamepad2, desc: "Add an AI bot to your Discord server. Handles support, FAQs, and community questions.", badge: null, color: "text-indigo-600 dark:text-indigo-400" },
  { slug: "slack", name: "Slack", icon: Hash, desc: "Add an AI bot to your Slack workspace. Channel support, DMs, and thread handling.", badge: null, color: "text-rose-600 dark:text-rose-400" },
];

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      <SiteHeader />

      {/* Hero */}
      <section className="relative mesh-gradient grid-bg py-16 sm:py-24 md:py-32">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <FadeInView direction="up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/20 text-[12px] text-blue-600 dark:text-blue-400 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Connect Your Channels
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="gradient-text">Integrations</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-white/50 max-w-xl mx-auto">
              Connect OpenHelix AI to your channels and tools. Step-by-step setup guides for each platform.
            </p>
          </FadeInView>
        </div>
      </section>

      {/* Integrations Grid */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {integrations.map((item, i) => (
              <FadeInView key={item.slug} direction="up" delay={i * 80}>
                <NextLink href={`/integrations/${item.slug}`} className={`glass-card glow-border rounded-xl p-5 group block h-full transition-all duration-300 hover:-translate-y-0.5 stagger-${(i % 6) + 1}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <item.icon className={`w-5 h-5 ${item.color}`} />
                      <h2 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.name}</h2>
                    </div>
                    {item.badge && <span className="text-xs bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2 py-0.5 rounded-full">{item.badge}</span>}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-white/50 mb-4 leading-relaxed">{item.desc}</p>
                  <div className="flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                    Setup guide <ArrowRight className="w-3.5 h-3.5" />
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
