import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import NextLink from "next/link";
import { ArrowRight, MessageCircle } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";

export const metadata: Metadata = {
  title: "OpenHelix Integrations — Telegram, WhatsApp, Discord & More",
  description: "Connect OpenHelix AI to Telegram, WhatsApp, Discord, Slack, Make.com, and Zapier. Full integration guides.",
};

const integrations = [
  { slug: "telegram", name: "Telegram", desc: "Deploy a GPT-4 or Claude bot to any Telegram channel, group, or 1-on-1 chat.", badge: "Most popular", color: "text-blue-400" },
  { slug: "whatsapp", name: "WhatsApp Business", desc: "Connect to your WhatsApp Business number via Twilio. Handle customer messages 24/7.", badge: null, color: "text-emerald-400" },
  { slug: "discord", name: "Discord", desc: "Add an AI bot to your Discord server. Handles support, FAQs, and community questions.", badge: null, color: "text-indigo-400" },
  { slug: "slack", name: "Slack", desc: "Add an AI bot to your Slack workspace. Channel support, DMs, and thread handling.", badge: null, color: "text-rose-400" },
];

export default function IntegrationsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      <SiteHeader />
      <main className="max-w-5xl mx-auto px-4 py-16">
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Integrations</h1>
        <p className="text-gray-500 dark:text-white/50 mb-12 max-w-xl">Connect OpenHelix AI to your channels and tools. Step-by-step setup guides for each platform.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((item) => (
            <NextLink key={item.slug} href={`/integrations/${item.slug}`} className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 hover:border-blue-200 dark:hover:border-blue-500/30 hover:bg-gray-50 dark:hover:bg-white/[0.04] transition-all rounded-xl p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className={`w-5 h-5 ${item.color}`} />
                  <h2 className="font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">{item.name}</h2>
                </div>
                {item.badge && <span className="text-xs bg-blue-500/20 text-blue-400 px-2 py-0.5 rounded-full">{item.badge}</span>}
              </div>
              <p className="text-sm text-gray-500 dark:text-white/50 mb-4 leading-relaxed">{item.desc}</p>
              <div className="flex items-center gap-1 text-sm text-blue-400">
                Setup guide <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </NextLink>
          ))}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
