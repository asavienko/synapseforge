import { Metadata } from "next";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { HelixLogo } from "@/components/icons/BrandIcons";
import { ArrowRight, ShoppingCart, Users, UtensilsCrossed, Building2, Globe, Headphones, HeartPulse, Landmark } from "lucide-react";

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
    slug: "restaurant",
    icon: UtensilsCrossed,
    title: "Restaurants & Hospitality",
    desc: "Handle reservation questions, menu inquiries, hours, and special requests automatically.",
    tags: ["Reservations", "Menu Q&A", "Hours", "Reviews"],
    highlight: false,
  },
  {
    slug: "healthcare",
    icon: HeartPulse,
    title: "Healthcare & Clinics",
    desc: "Automate patient inquiries, appointment booking, and FAQ responses. HIPAA-aware AI support that works 24/7.",
    tags: ["Patient support", "Appointments", "FAQ automation", "After-hours"],
    highlight: false,
  },
  {
    slug: "fintech",
    icon: Landmark,
    title: "Fintech & Financial Services",
    desc: "Automate account FAQs, transaction questions, and onboarding flows. Compliant, accurate, always available.",
    tags: ["Account support", "Transactions", "Onboarding", "Compliance"],
    highlight: false,
  },
  {
    slug: "real-estate",
    icon: Building2,
    title: "Real Estate",
    desc: "Qualify leads, answer property questions, schedule viewings — without agent involvement.",
    tags: ["Lead qualification", "Property Q&A", "Scheduling", "Listings"],
    highlight: false,
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
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      <nav className="border-b border-gray-200/50 dark:border-white/[0.06] bg-white/80 dark:bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-gray-900 dark:text-white">
            <HelixLogo className="w-7 h-7 text-blue-600 dark:text-blue-400" size={28} />OpenHelix<span className="text-blue-600 dark:text-blue-400">.</span>
          </Link>
          <Link href="/sign-up" className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg text-sm font-semibold text-white">
            Try Free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4 py-16">

        <nav className="text-sm text-gray-500 dark:text-white/50 mb-8">
          <Link href="/" className="hover:text-gray-700 dark:hover:text-zinc-300 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-700 dark:text-zinc-300">Use Cases</span>
        </nav>

        <div className="mb-12">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">AI Chatbot <span className="text-blue-600 dark:text-blue-400">Use Cases</span></h1>
          <p className="text-lg text-gray-500 dark:text-white/50 max-w-2xl leading-relaxed">
            OpenHelix AI adapts to any business type. Explore how companies like yours deploy AI customer support agents — and what they automate.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
          {industries.map((ind, i) => {
            const Card = (
              <div className={`relative bg-white dark:bg-white/[0.02] border rounded-xl p-6 h-full flex flex-col ${ind.highlight ? "border-blue-200 dark:border-blue-500/20 hover:border-blue-300 dark:hover:border-blue-500/40" : "border-gray-100 dark:border-white/[0.06] hover:border-gray-200 dark:hover:border-white/10"} transition-all group`}>
                {ind.comingSoon && (
                  <span className="absolute top-4 right-4 text-xs text-gray-400 dark:text-zinc-600 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">Coming soon</span>
                )}
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${ind.highlight ? "bg-blue-500/10 border border-blue-200 dark:border-blue-500/20" : "bg-gray-100 dark:bg-white/5"}`}>
                  <ind.icon className={`w-5 h-5 ${ind.highlight ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-zinc-500"}`} />
                </div>
                <h2 className="font-bold text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">{ind.title}</h2>
                <p className="text-sm text-gray-500 dark:text-white/50 leading-relaxed mb-4 flex-1">{ind.desc}</p>
                <div className="flex flex-wrap gap-1.5">
                  {ind.tags.map((tag, j) => (
                    <span key={j} className="text-xs text-gray-500 dark:text-zinc-500 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
                {ind.slug && !ind.comingSoon && (
                  <div className="mt-4 flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 group-hover:text-blue-500 dark:group-hover:text-blue-300 transition-colors">
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
        <div className="bg-blue-600/5 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 rounded-2xl p-8 text-center mb-12">
          <h2 className="text-xl font-bold mb-2">Don&apos;t see your industry?</h2>
          <p className="text-gray-500 dark:text-white/50 text-sm mb-5">OpenHelix AI works for any business with repetitive customer questions. Start free and configure it for your use case.</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 transition-colors px-6 py-3 rounded-xl font-semibold text-white">
            Try It Free <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Related */}
        <div className="grid sm:grid-cols-3 gap-3">
          <Link href="/compare" className="flex items-center gap-3 bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06] hover:border-blue-200 dark:hover:border-blue-500/20 rounded-xl p-4 group">
            <div className="flex-1"><div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">Compare Alternatives</div><div className="text-xs text-gray-500 dark:text-white/50 mt-0.5">vs Tidio, Intercom, Crisp</div></div>
            <ArrowRight className="w-4 h-4 text-gray-400 dark:text-zinc-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0" />
          </Link>
          <Link href="/integrations" className="flex items-center gap-3 bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06] hover:border-blue-200 dark:hover:border-blue-500/20 rounded-xl p-4 group">
            <div className="flex-1"><div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">Integrations</div><div className="text-xs text-gray-500 dark:text-white/50 mt-0.5">Telegram, WhatsApp, Discord</div></div>
            <ArrowRight className="w-4 h-4 text-gray-400 dark:text-zinc-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0" />
          </Link>
          <Link href="/pricing" className="flex items-center gap-3 bg-white dark:bg-white/[0.02] border border-gray-100 dark:border-white/[0.06] hover:border-blue-200 dark:hover:border-blue-500/20 rounded-xl p-4 group">
            <div className="flex-1"><div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-300 transition-colors">Pricing</div><div className="text-xs text-gray-500 dark:text-white/50 mt-0.5">Free plan · No credit card</div></div>
            <ArrowRight className="w-4 h-4 text-gray-400 dark:text-zinc-600 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0" />
          </Link>
        </div>

      </main>
    </div>
  );
}
