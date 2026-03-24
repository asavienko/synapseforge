import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Pricing - LyricLingo | Affordable Language Learning Through Music",
  description: "Choose the perfect LyricLingo plan for your language learning journey. Start free, upgrade when ready. Plans from $0 to $19.99/month.",
  openGraph: {
    title: "LyricLingo Pricing Plans",
    description: "Affordable plans for every learner. Start free and upgrade as you grow.",
  },
}

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    description: "Perfect for trying out LyricLingo and casual learners.",
    features: [
      "5 songs per month",
      "2 languages",
      "Basic vocabulary tracking",
      "Standard audio quality",
      "Community support",
    ],
    limitations: [
      "Limited song generation",
      "Ads between songs",
    ],
    cta: "Get Started",
    href: "/get-started",
    popular: false,
  },
  {
    name: "Pro",
    price: "$9.99",
    period: "per month",
    description: "For dedicated learners who want unlimited access.",
    features: [
      "Unlimited songs",
      "All 100+ languages",
      "Advanced vocabulary analytics",
      "HD audio quality",
      "Offline downloads",
      "Priority support",
      "No ads",
      "Custom playlists",
    ],
    limitations: [],
    cta: "Start Free Trial",
    href: "/get-started?plan=pro",
    popular: true,
  },
  {
    name: "Team",
    price: "$19.99",
    period: "per user/month",
    description: "For schools, teams, and organizations.",
    features: [
      "Everything in Pro",
      "Team management dashboard",
      "Progress reports",
      "Shared vocabulary lists",
      "Custom branding",
      "API access",
      "Dedicated account manager",
      "SSO/SAML",
    ],
    limitations: [],
    cta: "Contact Sales",
    href: "/contact?subject=team",
    popular: false,
  },
]

const faqs = [
  {
    q: "Can I switch plans at any time?",
    a: "Yes! You can upgrade or downgrade your plan at any time. Changes take effect at the start of your next billing cycle.",
  },
  {
    q: "Is there a free trial for Pro?",
    a: "Absolutely! All Pro features are available free for 14 days. No credit card required to start.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept all major credit cards, PayPal, and cryptocurrency (BTC, ETH, SOL). Annual plans get a 20% discount.",
  },
  {
    q: "Can I cancel anytime?",
    a: "Yes, you can cancel your subscription at any time. You'll retain access until the end of your billing period.",
  },
  {
    q: "Do you offer student discounts?",
    a: "Yes! Students get 50% off Pro plans with a valid .edu email address or student ID verification.",
  },
  {
    q: "What happens to my songs if I downgrade?",
    a: "All your generated songs are yours to keep forever, even if you downgrade to Free. You just won't be able to create new ones beyond the free limit.",
  },
]

const comparisons = [
  { feature: "Songs per month", free: "5", pro: "Unlimited", team: "Unlimited" },
  { feature: "Languages", free: "2", pro: "100+", team: "100+" },
  { feature: "Audio quality", free: "Standard", pro: "HD", team: "HD" },
  { feature: "Offline downloads", free: "No", pro: "Yes", team: "Yes" },
  { feature: "Vocabulary analytics", free: "Basic", pro: "Advanced", team: "Advanced + Reports" },
  { feature: "Support", free: "Community", pro: "Priority", team: "Dedicated" },
  { feature: "API access", free: "No", pro: "No", team: "Yes" },
  { feature: "Custom branding", free: "No", pro: "No", team: "Yes" },
]

export default function PricingPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-mint/5 via-transparent to-transparent" />
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                Simple, Transparent
                <span className="block text-mint mt-1">Pricing</span>
              </h1>
              <p className="mt-6 text-lg text-muted-foreground max-w-2xl mx-auto">
                Start free and upgrade when you're ready. No hidden fees, no surprises.
              </p>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="py-8 sm:py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
              {plans.map((plan) => (
                <div
                  key={plan.name}
                  className={`relative rounded-2xl p-6 sm:p-8 ${
                    plan.popular
                      ? "bg-foreground text-background border-2 border-foreground"
                      : "bg-card border border-border/50"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="px-4 py-1 rounded-full bg-coral text-background text-sm font-medium">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div className="mb-6">
                    <h3 className={`text-lg font-semibold ${plan.popular ? "text-background" : "text-foreground"}`}>
                      {plan.name}
                    </h3>
                    <div className="mt-2 flex items-baseline gap-1">
                      <span className={`text-4xl font-bold ${plan.popular ? "text-background" : "text-foreground"}`}>
                        {plan.price}
                      </span>
                      <span className={plan.popular ? "text-background/70" : "text-muted-foreground"}>
                        /{plan.period}
                      </span>
                    </div>
                    <p className={`mt-2 text-sm ${plan.popular ? "text-background/70" : "text-muted-foreground"}`}>
                      {plan.description}
                    </p>
                  </div>
                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-3 text-sm">
                        <svg
                          className={`w-5 h-5 flex-shrink-0 ${plan.popular ? "text-coral" : "text-mint"}`}
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className={plan.popular ? "text-background/90" : "text-muted-foreground"}>
                          {feature}
                        </span>
                      </li>
                    ))}
                    {plan.limitations.map((limitation) => (
                      <li key={limitation} className="flex items-start gap-3 text-sm">
                        <svg
                          className="w-5 h-5 flex-shrink-0 text-muted-foreground/50"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                        <span className="text-muted-foreground/70">{limitation}</span>
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={plan.href}
                    className={`block w-full text-center py-3 rounded-xl font-medium transition-colors ${
                      plan.popular
                        ? "bg-background text-foreground hover:bg-background/90"
                        : "bg-foreground text-background hover:bg-foreground/90"
                    }`}
                  >
                    {plan.cta}
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Comparison Table */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
              Compare Plans
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 pr-4 text-sm font-semibold text-foreground">Feature</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-foreground">Free</th>
                    <th className="text-center py-4 px-4 text-sm font-semibold text-coral">Pro</th>
                    <th className="text-center py-4 pl-4 text-sm font-semibold text-foreground">Team</th>
                  </tr>
                </thead>
                <tbody>
                  {comparisons.map((row) => (
                    <tr key={row.feature} className="border-b border-border/50">
                      <td className="py-4 pr-4 text-sm text-muted-foreground">{row.feature}</td>
                      <td className="py-4 px-4 text-center text-sm text-muted-foreground">{row.free}</td>
                      <td className="py-4 px-4 text-center text-sm text-foreground font-medium">{row.pro}</td>
                      <td className="py-4 pl-4 text-center text-sm text-muted-foreground">{row.team}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-16 sm:py-24 bg-secondary/30">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground text-center mb-12">
              Frequently Asked Questions
            </h2>
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="p-6 rounded-2xl bg-card border border-border/50">
                  <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
                  <p className="text-sm text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-16 sm:py-24">
          <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-4">
              Still Have Questions?
            </h2>
            <p className="text-muted-foreground mb-8">
              Our team is here to help you find the perfect plan for your needs.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 rounded-xl border border-border hover:bg-secondary transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
