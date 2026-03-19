import { Link } from "@/i18n/navigation";
import { Zap, Check, Sparkles } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function PricingPage() {
  const t = await getTranslations();

  // Self-Service Plans
  const selfServicePlans = [
    {
      key: "free" as const,
      messages: 2000,
      instances: 1,
      supportHours: 0,
      features: ["freeInstance", "communitySupport"],
      highlight: false,
      href: "/sign-up",
    },
    {
      key: "starter_10k" as const,
      messages: 10000,
      instances: 3,
      supportHours: 0,
      features: ["messages10k", "instances3", "aiManagerOnly", "integrations", "sla99"],
      highlight: false,
      href: "/sign-up",
    },
    {
      key: "growth_30k" as const,
      messages: 30000,
      instances: 3,
      supportHours: 0,
      features: ["messages30k", "instances3", "aiManagerOnly", "integrations", "sla99"],
      highlight: true,
      href: "/sign-up",
    },
    {
      key: "scale_100k" as const,
      messages: 100000,
      instances: 5,
      supportHours: 0,
      features: ["messages100k", "instances5", "aiManagerOnly", "integrations", "sla99"],
      highlight: false,
      href: "/sign-up",
    },
    {
      key: "business_200k" as const,
      messages: 200000,
      instances: 10,
      supportHours: 0,
      features: ["messages200k", "instances10", "aiManagerOnly", "integrations", "sla99"],
      highlight: false,
      href: "/sign-up",
    },
  ];

  // Managed Plans
  const managedPlans = [
    {
      key: "managed_starter" as const,
      messages: 10000,
      instances: 3,
      supportHours: 4,
      features: ["messages10k", "instances3", "support4h", "humanManager", "customConfig", "sla99"],
      highlight: false,
      href: "mailto:hello@openhelixai.com",
      isEmail: true,
    },
    {
      key: "managed_growth" as const,
      messages: 30000,
      instances: 3,
      supportHours: 8,
      features: ["messages30k", "instances3", "support8h", "humanManager", "weeklyCheckins", "sla99"],
      highlight: true,
      href: "mailto:hello@openhelixai.com",
      isEmail: true,
    },
    {
      key: "managed_scale" as const,
      messages: 100000,
      instances: 5,
      supportHours: 18,
      features: ["messages100k", "instances5", "support18h", "humanManager", "weeklyCheckins", "customIntegrations", "teamTraining", "sla99"],
      highlight: false,
      href: "mailto:hello@openhelixai.com",
      isEmail: true,
    },
  ];

  const formatNumber = (num: number) => num.toLocaleString("en-US");

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white grid-bg">
      {/* Nav */}
      <nav className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-[#0a0a0f]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <Zap className="w-6 h-6 text-violet-400" />
            <span className="font-bold text-lg tracking-tight">OpenHelix AI</span>
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

      {/* Self-Service Plans */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-violet-600/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-violet-400" />
          </div>
          <h2 className="text-xl font-semibold">{t("pricing.selfService")}</h2>
          <span className="text-sm text-zinc-500">— {t("pricing.aiManager")}</span>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-4">
          {selfServicePlans.map((plan) => {
            const highlighted = plan.highlight;
            return (
              <div
                key={plan.key}
                className={`rounded-2xl p-6 ${
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
                <div className="font-bold text-lg mb-1">
                  {t(`pricing.${plan.key}.name` as Parameters<typeof t>[0])}
                </div>
                <div className="text-2xl font-bold mb-1">
                  {t(`pricing.${plan.key}.price` as Parameters<typeof t>[0])}
                </div>
                <div className="text-zinc-500 text-sm mb-4">
                  {t(`pricing.${plan.key}.desc` as Parameters<typeof t>[0])}
                </div>

                {/* Key metrics */}
                <div className="space-y-1 mb-4 text-sm">
                  <div className="text-zinc-300">{formatNumber(plan.messages)} messages/mo</div>
                  <div className="text-zinc-300">{plan.instances} {plan.instances === 1 ? "instance" : "instances"}</div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      {t(`pricing.features.${f}` as Parameters<typeof t>[0])}
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                    highlighted
                      ? "bg-violet-600 hover:bg-violet-500 text-white"
                      : "border border-white/10 hover:border-white/20 text-zinc-300"
                  }`}
                >
                  {t(`pricing.${plan.key}.cta` as Parameters<typeof t>[0])}
                </Link>
              </div>
            );
          })}
        </div>
      </section>

      {/* Managed Plans */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 rounded-lg bg-emerald-600/20 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </div>
          <h2 className="text-xl font-semibold">{t("pricing.managed")}</h2>
          <span className="text-sm text-zinc-500">— {t("pricing.humanManager")}</span>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-4xl">
          {managedPlans.map((plan) => {
            const highlighted = plan.highlight;
            return (
              <div
                key={plan.key}
                className={`rounded-2xl p-6 ${
                  highlighted
                    ? "bg-emerald-600/20 border border-emerald-500/50 shadow-lg shadow-emerald-500/10"
                    : "glow-border bg-white/[0.02]"
                }`}
              >
                {highlighted && (
                  <div className="text-xs font-semibold text-emerald-300 mb-3 uppercase tracking-widest">
                    {t("pricing.popular")}
                  </div>
                )}
                <div className="font-bold text-lg mb-1">
                  {t(`pricing.${plan.key}.name` as Parameters<typeof t>[0])}
                </div>
                <div className="text-2xl font-bold mb-1">
                  {t(`pricing.${plan.key}.price` as Parameters<typeof t>[0])}
                </div>
                <div className="text-zinc-500 text-sm mb-4">
                  {t(`pricing.${plan.key}.desc` as Parameters<typeof t>[0])}
                </div>

                {/* Key metrics */}
                <div className="space-y-1 mb-4 text-sm">
                  <div className="text-zinc-300">{formatNumber(plan.messages)} messages/mo</div>
                  <div className="text-zinc-300">{plan.instances} {plan.instances === 1 ? "instance" : "instances"}</div>
                  <div className="text-emerald-400 font-medium">{plan.supportHours} hours support/mo</div>
                </div>

                <ul className="space-y-2 mb-6">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      {t(`pricing.features.${f}` as Parameters<typeof t>[0])}
                    </li>
                  ))}
                </ul>
                {plan.isEmail ? (
                  <a
                    href={plan.href}
                    className="block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors border border-white/10 hover:border-white/20 text-zinc-300"
                  >
                    {t(`pricing.${plan.key}.cta` as Parameters<typeof t>[0])}
                  </a>
                ) : (
                  <Link
                    href={plan.href}
                    className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition-colors ${
                      highlighted
                        ? "bg-emerald-600 hover:bg-emerald-500 text-white"
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
      </section>

      {/* Support Add-on Section */}
      <section className="max-w-4xl mx-auto px-6 pb-16">
        <div className="glow-border rounded-2xl p-6 bg-white/[0.02] text-center">
          <h3 className="text-lg font-semibold mb-2">{t("pricing.supportAddon")}</h3>
          <p className="text-zinc-400 text-sm mb-4">{t("pricing.supportAddonDesc")}</p>
          <div className="flex justify-center gap-8">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">$100</div>
              <div className="text-sm text-zinc-500">per hour</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-emerald-400">$50</div>
              <div className="text-sm text-zinc-500">with managed plans</div>
            </div>
          </div>
        </div>
      </section>

      {/* Annual note */}
      <p className="text-sm text-zinc-500 mt-10 text-center pb-20">
        Annual plans available — 2 months free.{" "}
        <a href="mailto:hello@openhelixai.com" className="text-violet-400 hover:text-violet-300 transition-colors">
          Contact us
        </a>{" "}
        for details.
      </p>

      {/* Footer */}
      <footer className="border-t border-white/5 py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-400" />
            <span>OpenHelix AI © 2026</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" className="hover:text-white transition-colors">
              {t("footer.terms")}
            </Link>
            <a href="mailto:hello@openhelixai.com" className="hover:text-white transition-colors">
              {t("footer.contact")}
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
