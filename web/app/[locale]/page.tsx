import { Link } from "@/i18n/navigation";
import { Metadata } from "next";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { MobileNav } from "@/components/MobileNav";
import { LandingDemoChat } from "@/components/LandingDemoChat";
import { DemoChat } from "@/components/DemoChat";
import { FadeInView } from "@/components/animations/FadeInView";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  HelixLogo,
  ArrowRightIcon,
  CheckIcon,
  ShieldCheckIcon,
  RefreshIcon,
  MessagesIcon,
  CodeIcon,
  AnalyticsIcon,
  KeyIcon,
} from "@/components/icons/BrandIcons";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("homePage");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    keywords: ["AI", "chatbot", "customer support", "automation", "business AI", "virtual assistant"],
    openGraph: {
      title: t("metaTitle"),
      description: t("metaDescription"),
      type: "website",
    },
  };
}

export default async function LandingPage() {
  const t = await getTranslations();
  const tl = await getTranslations("landing");
  const { auth } = await import("@/lib/auth");
  const { prisma } = await import("@/lib/prisma");
  const session = await auth().catch(() => null);
  const isLoggedIn = !!session?.user;
  const userPlan = isLoggedIn && session?.user?.id
    ? await prisma.user.findUnique({ where: { id: session.user.id }, select: { plan: true } }).then(u => u?.plan ?? "free").catch(() => "free")
    : "free";

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": tl("faq.q1"), "acceptedAnswer": { "@type": "Answer", "text": tl("faq.a1") } },
      { "@type": "Question", "name": tl("faq.q2"), "acceptedAnswer": { "@type": "Answer", "text": tl("faq.a2") } },
      { "@type": "Question", "name": tl("faq.q3"), "acceptedAnswer": { "@type": "Answer", "text": tl("faq.a3") } },
      { "@type": "Question", "name": tl("faq.q4"), "acceptedAnswer": { "@type": "Answer", "text": tl("faq.a4") } },
    ],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "OpenHelix AI",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://openhelixai.com",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD",
      "description": "Free plan with 2,000 messages/month",
    },
    "description": "Deploy AI customer support agents in minutes. Multi-channel support for Telegram, WhatsApp and web.",
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "SynapseForge",
    "url": "https://openhelixai.com",
    "contactPoint": {
      "@type": "ContactPoint",
      "contactType": "customer support",
      "url": "https://openhelixai.com/contact",
    },
  };

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7] relative overflow-hidden transition-colors duration-500">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.04]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HelixLogo className="w-6 h-6 text-blue-600 dark:text-blue-400" size={24} />
            <span className="font-semibold text-[15px] tracking-tight text-gray-900 dark:text-white/90">OpenHelix AI</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-gray-500 dark:text-white/50">
            <a href="#how" className="hover:text-gray-900 dark:hover:text-white/90 transition-colors">{t("nav.services")}</a>
            <a href="#demo" className="hover:text-gray-900 dark:hover:text-white/90 transition-colors">Demo</a>
            <a href="#pricing" className="hover:text-gray-900 dark:hover:text-white/90 transition-colors">{t("nav.pricing")}</a>
            <Link href="/contact" className="hover:text-gray-900 dark:hover:text-white/90 transition-colors">{t("nav.contact")}</Link>
          </div>
          <div className="flex items-center gap-2">
            <LocaleSwitcher />
            <ThemeToggle />
            {isLoggedIn ? (
              <Link href="/dashboard" className="text-[13px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
                {t("nav.dashboard")}
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="hidden md:block text-[13px] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white/90 transition-colors px-3 py-2">
                  {t("nav.signIn")}
                </Link>
                <Link href="/sign-up" className="text-[13px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity">
                  {t("nav.getStarted")}
                </Link>
              </>
            )}
            <MobileNav labels={{
              services: t("nav.services"),
              pricing: t("nav.pricing"),
              about: t("nav.about"),
              contact: t("nav.contact"),
              signIn: t("nav.signIn"),
            }} />
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <FadeInView direction="up" duration={1000}>
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-28 md:pt-40 pb-20 text-center">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight mb-6 leading-[1.08] text-gray-900 dark:text-white">
            {t("hero.title").split('\n')[0]}
            {t("hero.title").includes('\n') && (
              <>
                <br />
                <span className="text-gray-400 dark:text-white/40">{t("hero.title").split('\n')[1]}</span>
              </>
            )}
          </h1>

          <p className="text-lg text-gray-500 dark:text-white/50 max-w-xl mx-auto mb-10 leading-relaxed">
            {t("hero.subtitle")}
          </p>

          <div className="flex items-center justify-center gap-3">
            <Link
              href={isLoggedIn ? "/dashboard" : "/sign-up"}
              className="flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-7 py-3.5 rounded-lg font-semibold text-[15px] hover:opacity-90 transition-opacity"
            >
              {isLoggedIn ? t("nav.dashboard") : t("hero.cta")} <ArrowRightIcon className="w-4 h-4" />
            </Link>
            <a
              href="#demo"
              className="px-7 py-3.5 rounded-lg font-medium text-[15px] text-gray-600 dark:text-white/60 border border-gray-200 dark:border-white/[0.08] hover:border-gray-300 dark:hover:border-white/[0.15] transition-colors"
            >
              Try Demo
            </a>
          </div>

          <p className="text-[13px] text-gray-400 dark:text-white/30 mt-5">{t("hero.footnote")}</p>

          <div className="flex flex-wrap items-center justify-center gap-2 mt-14">
            {["Telegram", "WhatsApp", "Discord", "Web Chat", "REST API"].map((ch) => (
              <span
                key={ch}
                className="text-[12px] px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/[0.06] text-gray-400 dark:text-white/40"
              >
                {ch}
              </span>
            ))}
          </div>
        </section>
      </FadeInView>

      {/* ── Trust Bar ────────────────────────────────────────────────────── */}
      <FadeInView direction="up" delay={200}>
        <section className="border-y border-gray-100 dark:border-white/[0.04] py-8">
          <div className="max-w-4xl mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-[13px] text-gray-400 dark:text-white/40">
              {[
                { value: "24/7", label: t("trust.alwaysOn") },
                { value: "<3min", label: t("trust.setupTime") },
                { value: "€0", label: t("trust.startFree") },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-2.5">
                  <span className="text-xl font-semibold text-gray-900 dark:text-white/70">{item.value}</span>
                  <span>{item.label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeInView>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how" className="max-w-4xl mx-auto px-4 sm:px-6 py-28">
        <FadeInView direction="up">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{t("how.title")}</h2>
            <p className="text-gray-500 dark:text-white/50 text-[15px]">{t("how.subtitle")}</p>
          </div>
        </FadeInView>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: "01", icon: KeyIcon, title: t("how.step1title"), desc: t("how.step1desc") },
            { step: "02", icon: MessagesIcon, title: t("how.step2title"), desc: t("how.step2desc") },
            { step: "03", icon: MessagesIcon, title: t("how.step3title"), desc: t("how.step3desc") },
          ].map((s, i) => (
            <FadeInView key={i} direction="up" delay={i * 100}>
              <div className="p-6 rounded-2xl border border-gray-100 dark:border-white/[0.04] bg-gray-50/50 dark:bg-white/[0.02]">
                <div className="text-[11px] text-gray-400 dark:text-white/30 font-mono mb-4 tracking-wider">Step {s.step}</div>
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center mb-4">
                  <s.icon className="w-5 h-5 text-gray-600 dark:text-white/60" />
                </div>
                <h3 className="font-semibold text-[15px] mb-2">{s.title}</h3>
                <p className="text-gray-500 dark:text-white/45 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </FadeInView>
          ))}
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────────── */}
      <section id="features" className="max-w-4xl mx-auto px-4 sm:px-6 py-28">
        <FadeInView direction="up">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{t("features.title")}</h2>
            <p className="text-gray-500 dark:text-white/50 text-[15px]">{t("features.subtitle")}</p>
          </div>
        </FadeInView>

        <div className="grid sm:grid-cols-2 gap-5">
          {[
            { icon: MessagesIcon, title: t("features.f1title"), desc: t("features.f1desc") },
            { icon: CodeIcon, title: t("features.f2title"), desc: t("features.f2desc") },
            { icon: ShieldCheckIcon, title: t("features.f5title"), desc: t("features.f5desc") },
            { icon: AnalyticsIcon, title: t("features.f6title"), desc: t("features.f6desc") },
          ].map((f, i) => (
            <FadeInView key={i} direction="up" delay={i * 80}>
              <div className="p-6 rounded-2xl border border-gray-100 dark:border-white/[0.04] bg-gray-50/50 dark:bg-white/[0.02] h-full">
                <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-white/[0.05] flex items-center justify-center mb-4">
                  <f.icon className="w-5 h-5 text-gray-600 dark:text-white/60" />
                </div>
                <h3 className="font-semibold text-[15px] mb-2">{f.title}</h3>
                <p className="text-gray-500 dark:text-white/45 text-sm leading-relaxed">{f.desc}</p>
              </div>
            </FadeInView>
          ))}
        </div>
      </section>

      {/* ── Live Demo ────────────────────────────────────────────────────── */}
      <FadeInView direction="up">
        <section id="demo" className="py-28 px-4 sm:px-6">
          <div className="max-w-3xl mx-auto text-center mb-14">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">See it in action</h2>
            <p className="text-gray-500 dark:text-white/50 text-lg">Chat with a real AI agent — no sign-up required.</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <DemoChat />
          </div>
        </section>
      </FadeInView>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-28">
        <FadeInView direction="up">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{t("testimonials.title")}</h2>
            <p className="text-gray-500 dark:text-white/50 text-[15px]">{t("testimonials.subtitle")}</p>
          </div>
        </FadeInView>
        <div className="grid md:grid-cols-3 gap-5">
          {([1, 2, 3] as const).map((n, i) => (
            <FadeInView key={n} direction="up" delay={i * 80}>
              <div className="p-6 rounded-2xl border border-gray-100 dark:border-white/[0.04] bg-gray-50/50 dark:bg-white/[0.02] flex flex-col gap-4 h-full">
                <div className="flex gap-0.5">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <svg key={j} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  ))}
                </div>
                <blockquote className="text-[13px] text-gray-600 dark:text-white/55 leading-relaxed flex-1">
                  &ldquo;{t(`testimonials.quote${n}` as Parameters<typeof t>[0])}&rdquo;
                </blockquote>
                <div className="pt-2 border-t border-gray-100 dark:border-white/[0.04]">
                  <div className="text-[13px] font-medium text-gray-800 dark:text-white/80">{t(`testimonials.name${n}` as Parameters<typeof t>[0])}</div>
                  <div className="text-[11px] text-gray-400 dark:text-white/35">{t(`testimonials.role${n}` as Parameters<typeof t>[0])}</div>
                </div>
              </div>
            </FadeInView>
          ))}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="max-w-4xl mx-auto px-4 sm:px-6 py-28">
        <FadeInView direction="up">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{t("pricing.title")}</h2>
            <p className="text-gray-500 dark:text-white/50 text-[15px]">{t("pricing.subtitle")}</p>
          </div>
        </FadeInView>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {(["free", "pro", "enterprise"] as const).map((plan, i) => {
            const highlighted = plan === "pro";
            const features: string[] = plan === "free"
              ? ["freeInstance", "managerAssigned", "inAppMsg", "communitySupport"]
              : plan === "pro"
              ? ["proInstances", "humanManager", "response24h", "customConfig", "integrations", "sla99"]
              : ["unlimitedInstances", "managerTeam", "sla4h", "customIntegrations", "teamTraining", "whiteLabel"];

            return (
              <FadeInView key={plan} direction="up" delay={i * 100}>
                <div
                  className={`rounded-2xl p-7 flex flex-col relative h-full border ${
                    highlighted
                      ? "border-gray-900 dark:border-white/20 order-first sm:order-none"
                      : "border-gray-100 dark:border-white/[0.04] bg-gray-50/50 dark:bg-white/[0.02]"
                  }`}
                >
                  {highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] font-medium rounded-full">
                      Most Popular
                    </div>
                  )}
                  <div className="font-semibold text-lg mb-1">{t(`pricing.${plan}.name` as Parameters<typeof t>[0])}</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold">{t(`pricing.${plan}.price` as Parameters<typeof t>[0])}</span>
                    {plan !== "enterprise" && <span className="text-gray-400 dark:text-white/35 text-sm">/mo</span>}
                  </div>
                  <div className="text-gray-500 dark:text-white/50 text-[13px] mb-6">{t(`pricing.${plan}.desc` as Parameters<typeof t>[0])}</div>
                  <ul className="space-y-3 mb-8 flex-1">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2.5 text-[13px] text-gray-600 dark:text-white/55">
                        <CheckIcon className="w-4 h-4 text-gray-400 dark:text-white/30 shrink-0 mt-0.5" />
                        {t(`pricing.features.${f}` as Parameters<typeof t>[0])}
                      </li>
                    ))}
                  </ul>
                  {plan === "enterprise" ? (
                    <Link
                      href="/contact"
                      className="block text-center py-3 rounded-lg font-medium text-[13px] border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-white/60 hover:border-gray-300 dark:hover:border-white/[0.15] transition-colors"
                    >
                      {t(`pricing.${plan}.cta` as Parameters<typeof t>[0])}
                    </Link>
                  ) : isLoggedIn ? (
                    userPlan === plan ? (
                      <div className="block text-center py-3 rounded-lg text-[13px] font-medium text-gray-400 dark:text-white/40 border border-gray-200 dark:border-white/[0.06]">
                        ✓ {t("pricing.currentPlan")}
                      </div>
                    ) : plan === "pro" ? (
                      <Link
                        href="/dashboard/billing"
                        className="block text-center py-3 rounded-lg font-medium text-[13px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity"
                      >
                        {t("pricing.upgradeToPro")}
                      </Link>
                    ) : (
                      <Link
                        href="/dashboard"
                        className="block text-center py-3 rounded-lg font-medium text-[13px] border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-white/60 hover:border-gray-300 transition-colors"
                      >
                        {t("nav.dashboard")}
                      </Link>
                    )
                  ) : (
                    <Link
                      href="/sign-up"
                      className={`block text-center py-3 rounded-lg font-medium text-[13px] transition-all ${
                        highlighted
                          ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90"
                          : "border border-gray-200 dark:border-white/[0.08] text-gray-600 dark:text-white/60 hover:border-gray-300 dark:hover:border-white/[0.15]"
                      }`}
                    >
                      {t(`pricing.${plan}.cta` as Parameters<typeof t>[0])}
                    </Link>
                  )}
                </div>
              </FadeInView>
            );
          })}
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-28">
        <FadeInView direction="up">
          <h2 className="text-3xl md:text-4xl font-bold mb-14 text-center tracking-tight">{tl("faq.title")}</h2>
        </FadeInView>
        {[
          { q: tl("faq.q1"), a: tl("faq.a1") },
          { q: tl("faq.q2"), a: tl("faq.a2") },
          { q: tl("faq.q3"), a: tl("faq.a3") },
          { q: tl("faq.q4"), a: tl("faq.a4") },
        ].map((item, i) => (
          <FadeInView key={i} direction="up" delay={i * 60}>
            <details className="border-b border-gray-100 dark:border-white/[0.04] py-5 group">
              <summary className="cursor-pointer list-none flex items-center justify-between text-[14px] font-medium text-gray-800 dark:text-white/80 hover:text-gray-900 dark:hover:text-white transition-colors">
                {item.q}
                <span className="text-gray-300 dark:text-white/20 text-lg group-open:rotate-45 transition-transform duration-300 shrink-0 ml-4">+</span>
              </summary>
              <div className="text-[13px] text-gray-500 dark:text-white/45 mt-4 leading-relaxed">{item.a}</div>
            </details>
          </FadeInView>
        ))}
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────────── */}
      <FadeInView direction="up">
        <section className="max-w-3xl mx-auto px-4 sm:px-6 py-20 mb-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">{t("cta.title")}</h2>
          <p className="text-gray-500 dark:text-white/50 mb-8 max-w-md mx-auto text-[15px]">{t("cta.subtitle")}</p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-8 py-4 rounded-lg font-semibold text-base hover:opacity-90 transition-opacity"
          >
            {t("hero.cta")} <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </section>
      </FadeInView>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 dark:border-white/[0.04] pt-12 pb-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 mb-12">
            <div className="col-span-2 sm:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <HelixLogo className="w-5 h-5 text-blue-600 dark:text-blue-400" size={20} />
                <span className="font-semibold text-[13px]">OpenHelix AI</span>
              </div>
              <p className="text-[12px] text-gray-400 dark:text-white/35 leading-relaxed">
                AI customer support agents for Telegram, WhatsApp, and web.
              </p>
            </div>
            <div>
              <div className="text-[11px] font-medium text-gray-400 dark:text-white/40 uppercase tracking-[0.1em] mb-4">Product</div>
              <ul className="space-y-2.5 text-[13px] text-gray-500 dark:text-white/50">
                <li><Link href="/pricing" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">Pricing</Link></li>
                <li><Link href="/templates" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">Templates</Link></li>
                <li><Link href="/api-docs" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">{t("footer.api")}</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-[11px] font-medium text-gray-400 dark:text-white/40 uppercase tracking-[0.1em] mb-4">Integrations</div>
              <ul className="space-y-2.5 text-[13px] text-gray-500 dark:text-white/50">
                <li><Link href="/integrations/telegram" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">Telegram</Link></li>
                <li><Link href="/integrations/whatsapp" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">WhatsApp</Link></li>
                <li><Link href="/integrations" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">All →</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-[11px] font-medium text-gray-400 dark:text-white/40 uppercase tracking-[0.1em] mb-4">Company</div>
              <ul className="space-y-2.5 text-[13px] text-gray-500 dark:text-white/50">
                <li><Link href="/blog" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">Blog</Link></li>
                <li><Link href="/contact" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">{t("nav.contact")}</Link></li>
                <li><Link href="/privacy" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">{t("footer.privacy")}</Link></li>
                <li><Link href="/terms" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">{t("footer.terms")}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 dark:border-white/[0.04] pt-6 flex items-center justify-between text-[11px] text-gray-400 dark:text-white/30">
            <span>{t("footer.copyright", { year: 2026 })}</span>
            <Link href="/status" className="flex items-center gap-1.5 hover:text-gray-500 dark:hover:text-white/40 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
              {t("footer.systemStatus")}
            </Link>
          </div>
        </div>
      </footer>

      <LandingDemoChat />
    </div>
  );
}
