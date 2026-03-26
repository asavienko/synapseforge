import { Link } from "@/i18n/navigation";
import { HelixLogo } from "@/components/icons/BrandIcons";
import { Check } from "lucide-react";
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

  // Main plans — must match landing page
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
      {/* Nav */}
      <nav className="border-b border-gray-200/50 dark:border-white/[0.06] backdrop-blur-sm sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0f]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <HelixLogo className="w-7 h-7 text-blue-600 dark:text-blue-400" size={28} />
            <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">OpenHelix<span className="text-blue-600 dark:text-blue-400">.</span></span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors px-4 py-2">
              ← {t("common.back")}
            </Link>
            <Link
              href="/sign-in"
              className="text-sm bg-blue-600 hover:bg-blue-700 transition-colors px-4 py-2 rounded-lg font-medium text-white"
            >
              {t("nav.signIn")}
            </Link>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="max-w-7xl mx-auto px-6 pt-20 pb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
          {t("pricing.title")}
        </h1>
        <p className="text-xl text-gray-500 dark:text-white/50 max-w-xl mx-auto">
          {t("pricing.subtitle")}
        </p>
      </section>

      {/* Plans grid — matches landing page */}
      <section className="max-w-5xl mx-auto px-6 pb-16">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const highlighted = plan.highlight;
            return (
              <div
                key={plan.key}
                className={`rounded-2xl p-7 flex flex-col ${
                  highlighted
                    ? "bg-blue-600/10 dark:bg-blue-600/20 border border-blue-500/50 shadow-xl shadow-blue-500/10"
                    : "glow-border bg-white dark:bg-white/[0.02]"
                }`}
              >
                {highlighted && (
                  <div className="text-xs font-semibold text-blue-300 mb-3 uppercase tracking-widest">
                    {t("pricing.popular")}
                  </div>
                )}
                <div className="font-bold text-xl mb-1">
                  {t(`pricing.${plan.key}.name` as Parameters<typeof t>[0])}
                </div>
                <div className="text-4xl font-bold mb-1">
                  {t(`pricing.${plan.key}.price` as Parameters<typeof t>[0])}
                </div>
                <div className="text-gray-500 dark:text-white/50 text-sm mb-6">
                  {t(`pricing.${plan.key}.desc` as Parameters<typeof t>[0])}
                </div>

                <ul className="space-y-3 mb-8 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-gray-600 dark:text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      {t(`pricing.features.${f}` as Parameters<typeof t>[0])}
                    </li>
                  ))}
                </ul>

                {plan.isEmail ? (
                  <a
                    href={plan.href}
                    className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                      highlighted
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-600 dark:text-zinc-300"
                    }`}
                  >
                    {t(`pricing.${plan.key}.cta` as Parameters<typeof t>[0])}
                  </a>
                ) : (
                  <Link
                    href={plan.href}
                    className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                      highlighted
                        ? "bg-blue-600 hover:bg-blue-700 text-white"
                        : "border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 text-gray-600 dark:text-zinc-300"
                    }`}
                  >
                    {t(`pricing.${plan.key}.cta` as Parameters<typeof t>[0])}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Annual note */}
      <p className="text-sm text-gray-500 dark:text-white/50 mt-10 text-center pb-20">
        {t("pricingAnnual.note")}{" "}
        <a href="mailto:hello@openhelixai.com" className="text-blue-400 hover:text-blue-300 transition-colors">
          {t("pricingAnnual.contactUs")}
        </a>{" "}
        {t("pricingAnnual.forDetails")}
      </p>

      {/* Footer */}
      <footer className="border-t border-gray-100 dark:border-white/[0.06] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-white/50">
          <div className="flex items-center gap-2">
            <HelixLogo className="w-7 h-7 text-blue-600 dark:text-blue-400" size={28} />
            <span>{t("footer.copyright", { year: 2026 })}</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              {t("footer.terms")}
            </Link>
            <a href="mailto:hello@openhelixai.com" className="hover:text-gray-900 dark:hover:text-white transition-colors">
              {t("footer.contact")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
