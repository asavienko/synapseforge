import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FadeInView } from "@/components/animations/FadeInView";
import { CheckIcon } from "@/components/icons/BrandIcons";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("pricing");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function PricingPage() {
  const t = await getTranslations();

  const plans = [
    {
      key: "free" as const,
      features: ["freeInstance", "communitySupport", "integrations"],
      highlight: false,
      href: "/sign-up",
      isEmail: false,
    },
    {
      key: "pro" as const,
      features: ["proInstances", "humanManager", "response24h", "customConfig", "integrations", "sla99"],
      highlight: true,
      href: "/sign-up",
      isEmail: false,
    },
    {
      key: "enterprise" as const,
      features: ["unlimitedInstances", "managerTeam", "sla4h", "customIntegrations", "whiteLabel", "teamTraining"],
      highlight: false,
      href: "mailto:hello@openhelixai.com",
      isEmail: true,
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      <SiteHeader />

      {/* Hero */}
      <section className="relative mesh-gradient grid-bg py-16 sm:py-24 md:py-32">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <FadeInView direction="up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/20 text-[12px] text-blue-600 dark:text-blue-400 mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Simple, Transparent Pricing
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="gradient-text">{t("pricing.title")}</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-white/50 max-w-xl mx-auto">
              {t("pricing.subtitle")}
            </p>
          </FadeInView>
        </div>
      </section>

      {/* Plans grid */}
      <section className="py-16 sm:py-24">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
            {plans.map((plan, i) => {
              const highlighted = plan.highlight;
              return (
                <FadeInView key={plan.key} direction="up" delay={i * 100}>
                  <div
                    className={`relative rounded-2xl p-7 flex flex-col h-full transition-all duration-300 hover:-translate-y-1 ${
                      highlighted
                        ? "glass-card border-2 border-blue-500/50 shadow-xl shadow-blue-500/10"
                        : "glass-card"
                    }`}
                  >
                    {highlighted && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-blue-600 text-white text-[11px] font-semibold rounded-full">
                        {t("pricing.popular")}
                      </div>
                    )}
                    <div className="font-bold text-xl mb-1">
                      {t(`pricing.${plan.key}.name` as Parameters<typeof t>[0])}
                    </div>
                    <div className="flex items-baseline gap-1 mb-1">
                      <span className="text-4xl font-bold">
                        {t(`pricing.${plan.key}.price` as Parameters<typeof t>[0])}
                      </span>
                      {plan.key !== "enterprise" && <span className="text-gray-400 dark:text-white/30 text-sm">/mo</span>}
                    </div>
                    <div className="text-gray-500 dark:text-white/50 text-sm mb-6">
                      {t(`pricing.${plan.key}.desc` as Parameters<typeof t>[0])}
                    </div>

                    <ul className="space-y-3 mb-8 flex-1">
                      {plan.features.map((f) => (
                        <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-white/55">
                          <CheckIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
                          {t(`pricing.features.${f}` as Parameters<typeof t>[0])}
                        </li>
                      ))}
                    </ul>

                    {plan.isEmail ? (
                      <a
                        href={plan.href}
                        className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                          highlighted
                            ? "glass-btn-primary text-white"
                            : "glass-btn-secondary"
                        }`}
                      >
                        {t(`pricing.${plan.key}.cta` as Parameters<typeof t>[0])}
                      </a>
                    ) : (
                      <Link
                        href={plan.href}
                        className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                          highlighted
                            ? "glass-btn-primary text-white"
                            : "glass-btn-secondary"
                        }`}
                      >
                        {t(`pricing.${plan.key}.cta` as Parameters<typeof t>[0])}
                      </Link>
                    )}
                  </div>
                </FadeInView>
              );
            })}
          </div>
        </div>
      </section>

      {/* Annual note */}
      <section className="pb-24">
        <FadeInView direction="up">
          <p className="text-sm text-gray-500 dark:text-white/50 text-center">
            {t("pricingAnnual.note")}{" "}
            <a href="mailto:hello@openhelixai.com" className="text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors">
              {t("pricingAnnual.contactUs")}
            </a>{" "}
            {t("pricingAnnual.forDetails")}
          </p>
        </FadeInView>
      </section>

      <SiteFooter />
    </div>
  );
}
