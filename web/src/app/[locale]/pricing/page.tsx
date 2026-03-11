import { Link } from "@/i18n/navigation";
import { Zap, Check } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function PricingPage() {
  const t = await getTranslations();

  const plans = [
    {
      key: "free" as const,
      features: ["freeInstance", "managerAssigned", "inAppMsg", "communitySupport"],
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
      features: ["unlimitedInstances", "managerTeam", "sla4h", "customIntegrations", "teamTraining", "whiteLabel"],
      highlight: false,
      href: "mailto:hello@synapseforge.ai",
      isEmail: true,
    },
  ] as const;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white grid-bg">
      {/* Nav */}
      <nav className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-[#0a0a0f]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Zap className="w-6 h-6 text-violet-400" />
            <span className="font-bold text-lg tracking-tight">SynapseForge</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2">
              ← {t("common.back")}
            </Link>
            <Link
              href="/sign-in"
              className="text-sm bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg font-medium"
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
        <p className="text-xl text-zinc-400 max-w-xl mx-auto">
          {t("pricing.subtitle")}
        </p>
      </section>

      {/* Pricing grid */}
      <section className="max-w-5xl mx-auto px-6 pb-20">
        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => {
            const highlighted = plan.highlight;
            return (
              <div
                key={plan.key}
                className={`rounded-2xl p-8 ${
                  highlighted
                    ? "bg-violet-600/20 border border-violet-500/50 shadow-lg shadow-violet-500/10"
                    : "glow-border bg-white/[0.02]"
                }`}
              >
                {highlighted && (
                  <div className="text-xs font-semibold text-violet-300 mb-3 uppercase tracking-widest">
                    {t("pricing.popular")}
                  </div>
                )}
                <div className="font-bold text-2xl mb-1">
                  {t(`pricing.${plan.key}.name` as Parameters<typeof t>[0])}
                </div>
                <div className="text-3xl font-bold mb-1">
                  {t(`pricing.${plan.key}.price` as Parameters<typeof t>[0])}
                </div>
                <div className="text-zinc-400 text-sm mb-6">
                  {t(`pricing.${plan.key}.desc` as Parameters<typeof t>[0])}
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      {t(`pricing.features.${f}` as Parameters<typeof t>[0])}
                    </li>
                  ))}
                </ul>
                {plan.isEmail ? (
                  <a
                    href={plan.href}
                    className="block text-center py-3 rounded-xl font-semibold text-sm transition-colors border border-white/10 hover:border-white/20 text-zinc-300"
                  >
                    {t(`pricing.${plan.key}.cta` as Parameters<typeof t>[0])}
                  </a>
                ) : (
                  <Link
                    href={plan.href}
                    className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                      highlighted
                        ? "bg-violet-600 hover:bg-violet-500 text-white"
                        : "border border-white/10 hover:border-white/20 text-zinc-300"
                    }`}
                  >
                    {t(`pricing.${plan.key}.cta` as Parameters<typeof t>[0])}
                  </Link>
                )}
              </div>
            );
          })}
        </div>

        {/* Annual note */}
        <p className="text-sm text-zinc-500 mt-10 text-center">
          Annual plans available — 2 months free.{" "}
          <a href="mailto:hello@synapseforge.ai" className="text-violet-400 hover:text-violet-300 transition-colors">
            Contact us
          </a>{" "}
          or your dedicated manager to set up.
        </p>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-400" />
            <span>SynapseForge © 2026</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              {t("footer.terms")}
            </Link>
            <a href="mailto:hello@synapseforge.ai" className="hover:text-white transition-colors">
              {t("footer.contact")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
