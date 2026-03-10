import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { Zap, Bot, BarChart3, Headphones, Shield, ArrowRight, Check, Users } from "lucide-react";
import { getTranslations } from "next-intl/server";

export default async function LandingPage() {
  const t = await getTranslations();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white grid-bg">
      {/* Nav */}
      <nav className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-[#0a0a0f]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-violet-400" />
            <span className="font-bold text-lg tracking-tight">SynapseForge</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <a href="#services" className="hover:text-white transition-colors">{t("nav.services")}</a>
            <a href="#pricing" className="hover:text-white transition-colors">{t("nav.pricing")}</a>
            <a href="#about" className="hover:text-white transition-colors">{t("nav.about")}</a>
          </div>
          <div className="flex items-center gap-3">
            <LocaleSwitcher />
            <Link href="/sign-in" className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2">
              {t("nav.signIn")}
            </Link>
            <Link href="/sign-up" className="text-sm bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg font-medium">
              {t("nav.getStarted")}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-8">
          <Zap className="w-3 h-3" />
          {t("hero.badge")}
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
          {t("hero.title")}
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t("hero.subtitle")}
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-all px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-violet-500/20"
          >
            {t("hero.cta")} <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#services"
            className="flex items-center gap-2 border border-white/10 hover:border-white/20 transition-colors px-8 py-4 rounded-xl font-semibold text-lg text-zinc-300"
          >
            {t("hero.ctaSecondary")}
          </a>
        </div>
        <p className="mt-4 text-sm text-zinc-500">Free plan includes 1 AI instance · No credit card required</p>
      </section>

      {/* Services */}
      <section id="services" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("services.title")}</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">{t("services.subtitle")}</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: Bot, key: "agents", color: "text-violet-400" },
            { icon: BarChart3, key: "integrations", color: "text-blue-400" },
            { icon: Zap, key: "automation", color: "text-emerald-400" },
            { icon: Headphones, key: "consulting", color: "text-pink-400" },
          ].map((s) => (
            <div key={s.key} className="glow-border rounded-2xl p-6 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <s.icon className={`w-8 h-8 ${s.color} mb-4`} />
              <h3 className="font-semibold text-lg mb-2">{t(`services.${s.key}.title` as Parameters<typeof t>[0])}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{t(`services.${s.key}.desc` as Parameters<typeof t>[0])}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("pricing.title")}</h2>
          <p className="text-zinc-400">{t("pricing.subtitle")}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {(["free", "pro", "enterprise"] as const).map((plan) => {
            const highlighted = plan === "pro";
            const features: string[] = plan === "free"
              ? ["freeInstance", "managerAssigned", "inAppMsg", "communitySupport"]
              : plan === "pro"
              ? ["proInstances", "humanManager", "response24h", "customConfig", "integrations", "sla99"]
              : ["unlimitedInstances", "managerTeam", "sla4h", "customIntegrations", "teamTraining", "whiteLabel"];

            return (
              <div
                key={plan}
                className={`rounded-2xl p-8 ${highlighted
                  ? "bg-violet-600/20 border border-violet-500/50 shadow-lg shadow-violet-500/10"
                  : "glow-border bg-white/[0.02]"}`}
              >
                {highlighted && (
                  <div className="text-xs font-semibold text-violet-300 mb-3 uppercase tracking-widest">{t("pricing.popular")}</div>
                )}
                <div className="font-bold text-2xl mb-1">{t(`pricing.${plan}.name` as Parameters<typeof t>[0])}</div>
                <div className="text-3xl font-bold mb-1">{t(`pricing.${plan}.price` as Parameters<typeof t>[0])}</div>
                <div className="text-zinc-400 text-sm mb-6">{t(`pricing.${plan}.desc` as Parameters<typeof t>[0])}</div>
                <ul className="space-y-3 mb-8">
                  {features.map((f) => (
                    <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                      {t(`pricing.features.${f}` as Parameters<typeof t>[0])}
                    </li>
                  ))}
                </ul>
                {plan === "enterprise" ? (
                  <a
                    href="mailto:hello@synapseforge.ai"
                    className="block text-center py-3 rounded-xl font-semibold text-sm transition-colors border border-white/10 hover:border-white/20 text-zinc-300"
                  >
                    {t(`pricing.${plan}.cta` as Parameters<typeof t>[0])}
                  </a>
                ) : (
                  <Link
                    href="/sign-up"
                    className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                      highlighted ? "bg-violet-600 hover:bg-violet-500" : "border border-white/10 hover:border-white/20 text-zinc-300"
                    }`}
                  >
                    {t(`pricing.${plan}.cta` as Parameters<typeof t>[0])}
                  </Link>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* About */}
      <section id="about" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("about.title")}</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">{t("about.subtitle")}</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            { icon: Users, color: "text-violet-400", stat: t("about.setup"), label: t("about.setupLabel") },
            { icon: Zap, color: "text-emerald-400", stat: t("about.response"), label: t("about.responseLabel") },
            { icon: Shield, color: "text-blue-400", stat: t("about.uptime"), label: t("about.uptimeLabel") },
          ].map((item) => (
            <div key={item.label} className="glow-border rounded-2xl p-6 bg-white/[0.02] text-center">
              <item.icon className={`w-7 h-7 ${item.color} mb-4 mx-auto`} />
              <div className="text-3xl font-bold text-white mb-1">{item.stat}</div>
              <div className="text-zinc-400 text-sm">{item.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-400" />
            <span>SynapseForge © 2026</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">{t("footer.privacy")}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{t("footer.terms")}</Link>
            <a href="mailto:hello@synapseforge.ai" className="hover:text-white transition-colors">{t("footer.contact")}</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
