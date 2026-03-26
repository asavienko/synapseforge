import { Metadata } from "next";
import NextLink from "next/link";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FadeInView } from "@/components/animations/FadeInView";
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
      <SiteHeader />

      {/* Hero */}
      <section className="relative mesh-gradient grid-bg py-16 sm:py-24 md:py-32">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <FadeInView direction="up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/20 text-[12px] text-blue-600 dark:text-blue-400 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Industries & Business Types
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              AI Chatbot <span className="gradient-text">Use Cases</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-white/50 max-w-2xl mx-auto leading-relaxed">
              OpenHelix AI adapts to any business type. Explore how companies like yours deploy AI customer support agents — and what they automate.
            </p>
          </FadeInView>
        </div>
      </section>

      {/* Industries Grid */}
      <section className="py-12 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-16">
            {industries.map((ind, i) => {
              const Card = (
                <div className={`relative glass-card rounded-xl p-6 h-full flex flex-col transition-all duration-300 hover:-translate-y-0.5 group ${ind.highlight ? "glow-border" : ""}`}>
                  {ind.comingSoon && (
                    <span className="absolute top-4 right-4 text-xs text-gray-400 dark:text-white/30 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">Coming soon</span>
                  )}
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${ind.highlight ? "bg-blue-500/10 border border-blue-200 dark:border-blue-500/20" : "bg-gray-100 dark:bg-white/5"}`}>
                    <ind.icon className={`w-5 h-5 ${ind.highlight ? "text-blue-600 dark:text-blue-400" : "text-gray-500 dark:text-white/40"}`} />
                  </div>
                  <h2 className="font-bold text-lg mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{ind.title}</h2>
                  <p className="text-sm text-gray-500 dark:text-white/50 leading-relaxed mb-4 flex-1">{ind.desc}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {ind.tags.map((tag, j) => (
                      <span key={j} className="text-xs text-gray-500 dark:text-white/40 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">{tag}</span>
                    ))}
                  </div>
                  {ind.slug && !ind.comingSoon && (
                    <div className="mt-4 flex items-center gap-1 text-sm text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
                      Explore <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              );

              return (
                <FadeInView key={i} direction="up" delay={i * 60}>
                  {ind.slug ? (
                    <NextLink href={`/use-cases/${ind.slug}`} className="block h-full">
                      {Card}
                    </NextLink>
                  ) : (
                    <div className="h-full">{Card}</div>
                  )}
                </FadeInView>
              );
            })}
          </div>

          {/* Quick CTA */}
          <FadeInView direction="up">
            <div className="glass-card glow-border rounded-2xl p-8 text-center mb-12">
              <h2 className="text-xl font-bold mb-2">Don&apos;t see your industry?</h2>
              <p className="text-gray-500 dark:text-white/50 text-sm mb-5">OpenHelix AI works for any business with repetitive customer questions. Start free and configure it for your use case.</p>
              <Link href="/sign-up" className="glass-btn-primary inline-flex items-center gap-2 px-6 py-3 font-semibold text-white text-sm">
                Try It Free <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </FadeInView>

          {/* Related */}
          <FadeInView direction="up" delay={100}>
            <div className="grid sm:grid-cols-3 gap-3">
              <Link href="/compare" className="flex items-center gap-3 glass-card rounded-xl p-4 group">
                <div className="flex-1"><div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Compare Alternatives</div><div className="text-xs text-gray-500 dark:text-white/50 mt-0.5">vs Tidio, Intercom, Crisp</div></div>
                <ArrowRight className="w-4 h-4 text-gray-400 dark:text-white/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0" />
              </Link>
              <Link href="/integrations" className="flex items-center gap-3 glass-card rounded-xl p-4 group">
                <div className="flex-1"><div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Integrations</div><div className="text-xs text-gray-500 dark:text-white/50 mt-0.5">Telegram, WhatsApp, Discord</div></div>
                <ArrowRight className="w-4 h-4 text-gray-400 dark:text-white/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0" />
              </Link>
              <Link href="/pricing" className="flex items-center gap-3 glass-card rounded-xl p-4 group">
                <div className="flex-1"><div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">Pricing</div><div className="text-xs text-gray-500 dark:text-white/50 mt-0.5">Free plan · No credit card</div></div>
                <ArrowRight className="w-4 h-4 text-gray-400 dark:text-white/30 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors shrink-0" />
              </Link>
            </div>
          </FadeInView>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
