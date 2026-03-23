import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Zap, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "OpenHelix Integrations — Telegram, WhatsApp, Discord & More",
  description: "Connect OpenHelix AI to Telegram, WhatsApp, Discord, Slack, Make.com, and Zapier. Full integration guides.",
};

const integrations = [
  { slug: "telegram", name: "Telegram", desc: "Deploy a GPT-4 or Claude bot to any Telegram channel, group, or 1-on-1 chat.", badge: "Most popular", color: "text-blue-400" },
  { slug: "whatsapp", name: "WhatsApp Business", desc: "Connect to your WhatsApp Business number via Twilio. Handle customer messages 24/7.", badge: null, color: "text-emerald-400" },
];

export default function IntegrationsPage() {
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
        <h1 className="text-3xl sm:text-4xl font-bold mb-4">Integrations</h1>
        <p className="text-zinc-400 mb-12 max-w-xl">Connect OpenHelix AI to your channels and tools. Step-by-step setup guides for each platform.</p>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {integrations.map((item) => (
            <Link key={item.slug} href={`/integrations/${item.slug}` as any} className="bg-white/[0.02] border border-white/10 hover:border-violet-500/30 hover:bg-white/[0.04] transition-all rounded-xl p-5 group">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-2">
                  <MessageCircle className={`w-5 h-5 ${item.color}`} />
                  <h2 className="font-semibold text-white group-hover:text-violet-300 transition-colors">{item.name}</h2>
                </div>
                {item.badge && <span className="text-xs bg-violet-500/20 text-violet-400 px-2 py-0.5 rounded-full">{item.badge}</span>}
              </div>
              <p className="text-sm text-zinc-400 mb-4 leading-relaxed">{item.desc}</p>
              <div className="flex items-center gap-1 text-sm text-violet-400">
                Setup guide <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
