import { Metadata } from "next";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Zap, ShoppingCart, Users, UtensilsCrossed, Building2, Globe, Headphones } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Chatbot Use Cases — Industries & Business Types",
  description:
    "Explore how businesses deploy AI chatbots for customer support. Ecommerce, SaaS, restaurants, agencies — ready-to-deploy templates for every industry.",
  openGraph: {
    title: "AI Chatbot Use Cases",
    description: "See how OpenHelix AI powers customer support across ecommerce, SaaS, hospitality, and more.",
    type: "website",
  },
};

const industries = [
  {
    slug: "ecommerce",
    icon: ShoppingCart,
    title: "Ecommerce",
    desc: "Order tracking, returns, product questions, abandoned cart recovery — automated 24/7.",
    tags: ["Order status", "Returns", "Product Q&A", "Cart recovery"],
    highlight: true,
  },
  {
    slug: "saas",
    icon: Users,
    title: "SaaS & Software",
    desc: "Onboarding automation, tier-1 support deflection, churn prevention, feature discovery.",
    tags: ["Onboarding", "L1 deflection", "Churn prevention", "API docs"],
    highlight: true,
  },
  {
    slug: null,
    icon: UtensilsCrossed,
    title: "Restaurants & Hospitality",
    desc: "Handle reservation questions, menu inquiries, hours, and special requests automatically.",
    tags: ["Reservations", "Menu Q&A", "Hours", "Reviews"],
    highlight: false,
    comingSoon: true,
  },
  {
    slug: null,
    icon: Building2,
    title: "Real Estate",
    desc: "Qualify leads, answer property questions, schedule viewings — without agent involvement.",
    tags: ["Lead qualification", "Property Q&A", "Scheduling", "Listings"],
    highlight: false,
    comingSoon: true,
  },
  {
    slug: null,
    icon: Globe,
    title: "Agencies & Consultancies",
    desc: "White-label AI support for your clients. Deploy branded agents under your domain.",
    tags: ["White-label", "Multi-client", "Custom branding", "Reporting"],
    highlight: false,
    comingSoon: true,
  },
  {
    slug: null,
    icon: Headphones,
    title: "Customer Service BPO",
    desc: "Augment your support team with AI. Handle volume spikes without hiring.",
    tags: ["Volume handling", "Tier-1 automation", "Escalation", "Analytics"],
    highlight: false,
    comingSoon: true,
  },
];

export default function UseCasesPage() {
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

        <nav className="text-sm text-zinc-500 mb-8">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">Use Cases</span>
        </nav>

        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">AI Chatbot <span className="text-violet-400">Use Cases</span></h1>
          <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed">
            OpenHelix AI adapts to any business type. Explore how companies like yours deploy AI customer support agents — and what they automate.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {industries.map((ind, i) => {
            const Card = (
              <div className={`relative bg-white/[0.02] border rounded-xl p-6 h-full flex flex-col ${ind.highlight ? "border-violet-500/20 hover:border-violet-500/40" : "border-white/5 hover:border-white/10"} transition-all group`}>
                {ind.comingSoon && (
                  <span className="absolute top-4 right-4 text-xs text-zinc-600 bg-white/5 px-2 py-0.5 rounded-full">Coming soon</span>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${ind.highlight ? "bg-violet-500/10 border border-violet-500/20" : "bg-white/5"}`}>
                  <ind.icon className={`w-5 h-5 ${ind.highlight ? "text-violet-400" : "text-zinc-500"}`} />
                </div>
                <h2 className="font-bold text-lg mb-2 group-hover:text-violet-300 transition-colors">{ind.title}</h2>
                <p className="text-sm text-zinc-400 leading-relaxed mb-4 flex-1">{ind.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {ind.tags.map((tag, j) => (
                    <span key={j} className="text-xs text-zinc-500 bg-white/5 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
                {ind.slug && !ind.comingSoon && (
                  <div className="mt-4 flex items-center gap-1 text-sm text-violet-400 group-hover:text-violet-300 transition-colors">
                    Explore <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );

            return ind.slug ? (
              <NextLink key={i} href={`/use-cases/${ind.slug}`} className="block">
                {Card}
              </NextLink>
            ) : (
              <div key={i}>{Card}</div>
            );
          })}
        </div>

        {/* Quick CTA */}
        <div className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-8 text-center mb-12">
          <h2 className="text-xl font-bold mb-2">Don&apos;t see your industry?</h2>
          <p className="text-zinc-400 text-sm mb-5">OpenHelix AI works for any business with repetitive customer questions. Start free and configure it for your use case.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-xl font-semibold">
            Try It Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Related */}
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/compare" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
            <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Compare Alternatives</div><div className="text-xs text-zinc-500 mt-0.5">vs Tidio, Intercom, Crisp</div></div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
          </Link>
          <Link href="/integrations" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
            <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Integrations</div><div className="text-xs text-zinc-500 mt-0.5">Telegram, WhatsApp, Discord</div></div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
          </Link>
          <Link href="/pricing" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
            <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Pricing</div><div className="text-xs text-zinc-500 mt-0.5">Free plan · No credit card</div></div>
            <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
          </Link>
        </div>

      </main>
    </div>
  );
}
