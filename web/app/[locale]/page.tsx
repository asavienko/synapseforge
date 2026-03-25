import { Link } from "@/i18n/navigation";
import { Metadata } from "next";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { MobileNav } from "@/components/MobileNav";
import { LandingDemoChat } from "@/components/LandingDemoChat";
import { DemoChat } from "@/components/DemoChat";
import { LiveStats } from "@/components/LiveStats";
import { getFeaturedTemplates, categoryColors } from "@/lib/templates";
import { ROICalculator } from "@/components/ROICalculator";
import { FadeInView } from "@/components/animations/FadeInView";
import { ParallaxSection } from "@/components/animations/ParallaxSection";
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
  UserIcon,
  KeyIcon,
  SettingsIcon,
  RocketLaunchIcon,
  SparklesIcon,
  CalendarIcon,
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

  const featuredTemplates = getFeaturedTemplates().slice(0, 4);

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      { "@type": "Question", "name": tl("faq.q1"), "acceptedAnswer": { "@type": "Answer", "text": tl("faq.a1") } },
      { "@type": "Question", "name": tl("faq.q2"), "acceptedAnswer": { "@type": "Answer", "text": tl("faq.a2") } },
      { "@type": "Question", "name": tl("faq.q3"), "acceptedAnswer": { "@type": "Answer", "text": tl("faq.a3") } },
      { "@type": "Question", "name": tl("faq.q4"), "acceptedAnswer": { "@type": "Answer", "text": tl("faq.a4") } },
      { "@type": "Question", "name": tl("faq.q5"), "acceptedAnswer": { "@type": "Answer", "text": tl("faq.a5") } },
      { "@type": "Question", "name": tl("faq.q6"), "acceptedAnswer": { "@type": "Answer", "text": tl("faq.a6") } },
    ],
  };

  const softwareSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "OpenHelix AI",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web",
    "url": "https://openhelixai.com",
    "offers": { "@type": "Offer", "price": "0", "priceCurrency": "USD", "description": "Free plan with 2,000 messages/month" },
    "description": "Deploy AI customer support agents in minutes. Multi-channel support for Telegram, WhatsApp and web. Powered by GPT-4, Claude, and 50+ models.",
    "featureList": [
      "Telegram & WhatsApp integration",
      "GPT-4, Claude, OpenRouter support",
      "Real-time manager dashboard",
      "Knowledge base & AI suggestions",
      "White-label ready",
      "Usage analytics",
    ],
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
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7] transition-colors duration-300">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }} />

      {/* ── Ambient background glow ──────────────────────────────────────── */}
      <ParallaxSection speed={0.1}>
        <div className="fixed inset-0 pointer-events-none -z-10 opacity-20 dark:opacity-100">
          <div className="glow-orb w-[500px] h-[500px] bg-blue-600/[0.05] top-[-10%] left-[20%]" />
          <div className="glow-orb w-[600px] h-[600px] bg-indigo-500/[0.04] top-[30%] right-[-10%]" style={{ animationDelay: '5s' }} />
          <div className="glow-orb w-[400px] h-[400px] bg-blue-500/[0.03] bottom-[10%] left-[-5%]" style={{ animationDelay: '10s' }} />
        </div>
      </ParallaxSection>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-gray-100 dark:border-white/[0.06]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <HelixLogo className="w-6 h-6 text-blue-600 dark:text-blue-400" size={24} />
            <span className="font-semibold text-[15px] tracking-tight hidden sm:block">OpenHelix AI</span>
            <span className="font-semibold text-[15px] tracking-tight sm:hidden">OpenHelix</span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-[13px] font-medium text-gray-500 dark:text-white/50">
            <Link href="/templates" className="hover:text-gray-900 dark:hover:text-white transition-colors">Templates</Link>
            <Link href="/blog" className="hover:text-gray-900 dark:hover:text-white transition-colors">Blog</Link>
            <a href="#demo" className="hover:text-gray-900 dark:hover:text-white transition-colors">Demo</a>
            <a href="#how" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("nav.services")}</a>
            <a href="#pricing" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("nav.pricing")}</a>
            <a href="#about" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("nav.about")}</a>
            <Link href="/use-cases" className="hover:text-gray-900 dark:hover:text-white transition-colors">Use Cases</Link>
            <Link href="/compare" className="hover:text-gray-900 dark:hover:text-white transition-colors">Compare</Link>
            <Link href="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("nav.contact")}</Link>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <LocaleSwitcher />
            <ThemeToggle />
            {isLoggedIn ? (
              <Link href="/dashboard" className="text-[13px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
                <span className="hidden sm:inline">{t("nav.dashboard")}</span>
                <span className="sm:hidden">Dashboard</span>
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="hidden md:block text-[13px] text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors px-4 py-2">
                  {t("nav.signIn")}
                </Link>
                <Link href="/sign-up" className="text-[13px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-4 py-2 rounded-lg font-medium hover:opacity-90 transition-opacity whitespace-nowrap">
                  <span className="hidden sm:inline">{t("nav.getStarted")}</span>
                  <span className="sm:hidden">Start</span>
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
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-20 md:pt-28 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/[0.08] text-[12px] text-gray-500 dark:text-white/50 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
          {t("hero.badge")}
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-[56px] font-bold tracking-tight mb-5 leading-[1.1]">
          {t("hero.title").split('\n').map((line: string, i: number) => (
            <span key={i}>
              {i > 0 && <br />}
              {line}
            </span>
          ))}
        </h1>

        <p className="text-[17px] text-gray-500 dark:text-white/55 max-w-lg mx-auto mb-8 leading-relaxed">
          {t("hero.subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-4">
          <Link
            href={isLoggedIn ? "/dashboard" : "/sign-up"}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-7 py-3.5 rounded-lg font-semibold text-[15px] hover:opacity-90 transition-opacity"
          >
            {isLoggedIn ? t("nav.dashboard") : t("hero.cta")} <ArrowRightIcon className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/templates"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-lg font-medium text-[15px] text-gray-600 dark:text-white/60 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
            >
              <SparklesIcon className="w-4 h-4" />
              {t("hero.ctaSecondary")}
            </Link>
            <Link
              href="/contact?subject=Demo+Request"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 rounded-lg font-medium text-[15px] text-gray-600 dark:text-white/60 border border-gray-200 dark:border-white/10 hover:border-gray-300 dark:hover:border-white/20 transition-colors"
            >
              <CalendarIcon className="w-4 h-4" />
              {t("hero.bookDemo")}
            </Link>
          </div>
        </div>

        <p className="text-[12px] text-gray-400 dark:text-white/30">{t("hero.footnote")}</p>

        <div className="flex flex-wrap items-center justify-center gap-2 mt-10">
          {["Telegram", "Discord", "Slack", "Web Chat", "REST API"].map((ch) => (
            <span key={ch} className="text-[11px] px-2.5 py-1 rounded-full border border-gray-200 dark:border-white/[0.08] text-gray-400 dark:text-white/35">
              {ch}
            </span>
          ))}
        </div>

        <div className="mt-14">
          <LiveStats />
        </div>
      </section>

      {/* ── Trust Signal Bar ─────────────────────────────────────────────── */}
      <FadeInView direction="up" delay={200}>
        <section className="border-y border-gray-100 dark:border-white/[0.06] py-6">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12 text-[13px]">
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-bold text-gray-900 dark:text-white">12+</span>
                <span className="text-gray-400 dark:text-white/40">{t("trust.businessesRunning")}</span>
              </div>
              <div className="hidden sm:block w-px h-5 bg-gray-200 dark:bg-white/[0.06]" />
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-bold text-gray-900 dark:text-white">24/7</span>
                <span className="text-gray-400 dark:text-white/40">{t("trust.alwaysOn")}</span>
              </div>
              <div className="hidden sm:block w-px h-5 bg-gray-200 dark:bg-white/[0.06]" />
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-bold text-gray-900 dark:text-white">{"<3min"}</span>
                <span className="text-gray-400 dark:text-white/40">{t("trust.setupTime")}</span>
              </div>
              <div className="hidden sm:block w-px h-5 bg-gray-200 dark:bg-white/[0.06]" />
              <div className="flex items-center gap-2.5">
                <span className="text-xl font-bold text-gray-900 dark:text-white">{"\u20AC0"}</span>
                <span className="text-gray-400 dark:text-white/40">{t("trust.startFree")}</span>
              </div>
              <div className="hidden sm:block w-px h-5 bg-gray-200 dark:bg-white/[0.06]" />
              <div className="flex items-center gap-2">
                <span className="text-emerald-500">{"\u2713"}</span>
                <span className="text-gray-400 dark:text-white/40">{t("trust.noCard")}</span>
              </div>
            </div>
          </div>
        </section>
      </FadeInView>

      {/* ── How it Works (SMB steps) ─────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <FadeInView direction="up">
          <h2 className="text-2xl md:text-3xl font-bold mb-12 text-center tracking-tight">
            {tl("howItWorks.title")}
          </h2>
        </FadeInView>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { num: tl("howItWorks.step1.num"), icon: MessagesIcon, title: tl("howItWorks.step1.title"), desc: tl("howItWorks.step1.desc") },
            { num: tl("howItWorks.step2.num"), icon: SettingsIcon, title: tl("howItWorks.step2.title"), desc: tl("howItWorks.step2.desc") },
            { num: tl("howItWorks.step3.num"), icon: RocketLaunchIcon, title: tl("howItWorks.step3.title"), desc: tl("howItWorks.step3.title") },
          ].map((step, i) => (
            <FadeInView key={i} direction="up" delay={i * 100}>
              <div className="p-6 rounded-xl border border-gray-100 dark:border-white/[0.06] h-full">
                <div className="text-4xl font-bold text-gray-100 dark:text-white/[0.04] mb-4">{step.num}</div>
                <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-4">
                  <step.icon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <h3 className="font-semibold text-[15px] mb-2">{step.title}</h3>
                <p className="text-gray-500 dark:text-white/45 text-[13px] leading-relaxed">{step.desc}</p>
              </div>
            </FadeInView>
          ))}
        </div>
      </section>

      {/* ── Templates Section ────────────────────────────────────────────── */}
      <FadeInView direction="up" delay={100}>
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/[0.08] text-[12px] text-blue-600 dark:text-blue-400 mb-4">
                <SparklesIcon className="w-3.5 h-3.5" />
                Pre-Built Templates
              </div>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Deploy in Minutes, Not Days</h2>
              <p className="text-gray-500 dark:text-white/45 mt-2 max-w-xl text-[14px]">
                Skip the setup. Start with a proven template and customize it to fit your needs.
              </p>
            </div>
            <Link
              href="/templates"
              className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-500 font-medium text-sm transition-colors"
            >
              View All Templates
              <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {featuredTemplates.map((template) => (
              <Link key={template.id} href={`/templates/${template.id}`} className="group">
                <div className="rounded-xl border border-gray-100 dark:border-white/[0.06] p-5 h-full flex flex-col hover:border-gray-200 dark:hover:border-white/[0.12] transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <span className="text-2xl group-hover:scale-110 transition-transform duration-300">{template.icon}</span>
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${categoryColors[template.category]}`}>
                      {template.category}
                    </span>
                  </div>
                  <h3 className="font-semibold text-[14px] mb-1.5 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {template.name}
                  </h3>
                  <p className="text-[12px] text-gray-500 dark:text-white/45 flex-1 line-clamp-2">{template.shortDescription}</p>
                  <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100 dark:border-white/[0.06]">
                    <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${
                      template.difficulty === "beginner"
                        ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/15"
                        : template.difficulty === "intermediate"
                        ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/15"
                        : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/15"
                    }`}>
                      {template.difficulty}
                    </span>
                    <span className="text-[12px] text-blue-600 dark:text-blue-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Use
                      <ArrowRightIcon className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      </FadeInView>

      {/* ── How it works (detailed) ───────────────────────────────────────── */}
      <section id="how" className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <FadeInView direction="up">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">{t("how.title")}</h2>
            <p className="text-gray-500 dark:text-white/50 text-[15px]">{t("how.subtitle")}</p>
          </div>
        </FadeInView>

        <div className="grid md:grid-cols-3 gap-5 max-w-4xl mx-auto">
          {[
            { step: "01", icon: KeyIcon, color: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400", title: t("how.step1title"), desc: t("how.step1desc") },
            { step: "02", icon: MessagesIcon, color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", title: t("how.step2title"), desc: t("how.step2desc") },
            { step: "03", icon: MessagesIcon, color: "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400", title: t("how.step3title"), desc: t("how.step3desc") },
          ].map((s, i) => (
            <FadeInView key={i} direction="up" delay={i * 100}>
              <div className="relative">
                {i < 2 && (
                  <div className="hidden md:block absolute top-10 left-[calc(100%+8px)] w-[calc(100%-16px)] h-px bg-gradient-to-r from-gray-200 dark:from-white/[0.06] to-transparent z-10" />
                )}
                <div className="p-6 rounded-xl border border-gray-100 dark:border-white/[0.06] h-full">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-5 ${s.color}`}>
                    <s.icon className="w-5 h-5" />
                  </div>
                  <div className="text-[11px] text-gray-300 dark:text-white/20 font-mono mb-2 tracking-wider">Step {s.step}</div>
                  <h3 className="text-base font-semibold mb-2">{s.title}</h3>
                  <p className="text-gray-500 dark:text-white/45 text-[13px] leading-relaxed">{s.desc}</p>
                </div>
              </div>
            </FadeInView>
          ))}
        </div>

        {/* Terminal demo */}
        <FadeInView direction="up" delay={200}>
          <div className="mt-14 max-w-2xl mx-auto">
            <div className="rounded-xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-white/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-white/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-white/10" />
                <span className="ml-3 text-[11px] text-gray-400 dark:text-white/30 font-mono">{t("demo.terminalTitle")}</span>
              </div>
              <div className="px-5 py-5 font-mono text-[13px] space-y-2">
                {[
                  { text: t("demo.line1") },
                  { text: t("demo.line2") },
                  { text: t("demo.line3") },
                  { text: t("demo.line4") },
                  { text: t("demo.line5") },
                ].map((line, i) => (
                  <div key={i} className="text-emerald-600 dark:text-emerald-400">{line.text}</div>
                ))}
                <div className="text-gray-800 dark:text-white/80 font-medium pt-3 border-t border-gray-100 dark:border-white/[0.06] mt-4">
                  {t("demo.done")}
                </div>
              </div>
            </div>
          </div>
        </FadeInView>
      </section>

      {/* ── Video Demo ──────────────────────────────────────────────────── */}
      <FadeInView direction="up" blur={true}>
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/[0.08] text-[12px] text-blue-600 dark:text-blue-400 mb-4">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse" />
              Watch Demo
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">See it in action</h2>
            <p className="text-gray-500 dark:text-white/50 max-w-xl mx-auto text-[15px]">
              Deploy your AI agent in under 3 minutes. No DevOps required.
            </p>
          </div>

          <div className="max-w-3xl mx-auto">
            <div className="rounded-xl border border-gray-100 dark:border-white/[0.06] overflow-hidden aspect-video group cursor-pointer relative bg-gray-50 dark:bg-white/[0.02]">
              <div className="absolute inset-0 opacity-30">
                <div className="h-full flex">
                  <div className="w-16 border-r border-gray-200 dark:border-white/[0.04] h-full" />
                  <div className="flex-1 p-6">
                    <div className="h-8 w-48 bg-gray-200/50 dark:bg-white/[0.03] rounded-xl mb-6" />
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="h-24 bg-gray-200/50 dark:bg-white/[0.03] rounded-xl" />
                      <div className="h-24 bg-gray-200/50 dark:bg-white/[0.03] rounded-xl" />
                      <div className="h-24 bg-gray-200/50 dark:bg-white/[0.03] rounded-xl" />
                    </div>
                    <div className="h-64 bg-gray-200/50 dark:bg-white/[0.03] rounded-xl" />
                  </div>
                </div>
              </div>
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/[0.08] border border-gray-200 dark:border-white/[0.1] flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-5 h-5 text-gray-600 dark:text-white/70 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                </div>
              </div>
              <div className="absolute bottom-4 left-4">
                <span className="text-[11px] bg-white/80 dark:bg-black/40 backdrop-blur-md text-gray-500 dark:text-white/50 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/[0.06]">
                  Video coming soon — Book a live demo below
                </span>
              </div>
            </div>
          </div>

          <div className="text-center mt-8">
            <Link
              href="/contact?subject=Demo+Request"
              className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-lg font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              Book Live Demo
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        </section>
      </FadeInView>

      {/* ── Product Preview ──────────────────────────────────────────────── */}
      <FadeInView direction="up" delay={100}>
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-10">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">Your AI command center</h2>
            <p className="text-gray-500 dark:text-white/50 max-w-xl mx-auto text-[15px]">Everything you need to deploy, monitor, and chat with your AI agent — in one clean dashboard.</p>
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="rounded-xl border border-gray-100 dark:border-white/[0.06] overflow-hidden">
              <div className="flex items-center gap-2 px-5 py-3 border-b border-gray-100 dark:border-white/[0.06]">
                <span className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-white/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-white/10" />
                <span className="w-2.5 h-2.5 rounded-full bg-gray-200 dark:bg-white/10" />
                <div className="flex-1 mx-4">
                  <div className="bg-gray-50 dark:bg-white/[0.03] border border-gray-200 dark:border-white/[0.06] rounded-lg px-3 py-1.5 text-[11px] text-gray-400 dark:text-white/35 font-mono max-w-xs mx-auto text-center">
                    app.openhelixai.com/dashboard
                  </div>
                </div>
              </div>

              <div className="flex" style={{ minHeight: 420 }}>
                <div className="w-52 border-r border-gray-100 dark:border-white/[0.06] p-3 shrink-0 hidden md:block">
                  <div className="flex items-center gap-2 px-2 py-3 mb-4">
                    <div className="w-6 h-6 rounded-lg bg-blue-500/20 flex items-center justify-center">
                      <span className="text-gray-800 dark:text-white/80 text-[10px] font-bold">S</span>
                    </div>
                    <span className="text-[12px] font-semibold text-gray-600 dark:text-white/70">OpenHelix AI</span>
                  </div>
                  {[
                    { label: "Overview", active: false, dot: null },
                    { label: "AI Instances", active: true, dot: null },
                    { label: "Messages", active: false, dot: "2" },
                    { label: "Billing", active: false, dot: null },
                    { label: "Settings", active: false, dot: null },
                  ].map((item) => (
                    <div key={item.label} className={`flex items-center justify-between px-3 py-2 rounded-lg mb-0.5 text-[12px] transition-colors ${item.active ? "bg-gray-100 dark:bg-white/[0.06] text-gray-800 dark:text-white/80" : "text-gray-500 dark:text-white/50"}`}>
                      <span>{item.label}</span>
                      {item.dot && (
                        <span className="w-4 h-4 rounded-full bg-blue-500/20 text-blue-600 dark:text-blue-400 text-[9px] flex items-center justify-center font-bold">{item.dot}</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex-1 p-5 overflow-hidden">
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="text-[13px] font-semibold">AI Instances</h2>
                    <div className="text-[11px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-3 py-1.5 rounded-lg font-medium">+ New Instance</div>
                  </div>

                  {[
                    { name: "Customer Support Bot", type: "Support", status: "running", model: "GPT-4o", msgs: "1,248" },
                    { name: "Sales Assistant", type: "Sales", status: "running", model: "Claude Sonnet", msgs: "893" },
                    { name: "Internal Helpdesk", type: "Internal", status: "stopped", model: "GPT-4 Turbo", msgs: "412" },
                  ].map((inst) => (
                    <div key={inst.name} className="flex items-center gap-3 p-3 rounded-lg border border-gray-100 dark:border-white/[0.06] mb-2 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-lg bg-gray-50 dark:bg-white/[0.04] border border-gray-100 dark:border-white/[0.06] flex items-center justify-center shrink-0">
                        <span className="text-[11px]">{"\uD83E\uDD16"}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[12px] font-medium truncate">{inst.name}</div>
                        <div className="text-[10px] text-gray-400 dark:text-white/35">{inst.type} · {inst.model}</div>
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-white/35 hidden sm:block">{inst.msgs} msgs</div>
                      <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${inst.status === "running" ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400" : "bg-gray-100 dark:bg-white/[0.04] text-gray-500 dark:text-white/50"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${inst.status === "running" ? "bg-emerald-500" : "bg-gray-300 dark:bg-white/20"}`} />
                        {inst.status}
                      </div>
                    </div>
                  ))}

                  <div className="mt-4 flex items-center gap-3 p-3 rounded-lg border border-blue-200 dark:border-blue-500/15 bg-blue-50/50 dark:bg-blue-500/[0.04]">
                    <div className="w-8 h-8 rounded-full bg-blue-500/10 border border-blue-200 dark:border-blue-500/15 flex items-center justify-center shrink-0">
                      <span className="text-blue-600 dark:text-blue-400 text-[11px] font-bold">M</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[10px] text-gray-500 dark:text-white/50 mb-0.5">Your dedicated manager</div>
                      <div className="text-[12px] font-medium">Alex Kim · alex@openhelixai.com</div>
                    </div>
                    <div className="text-[10px] bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-lg border border-blue-200 dark:border-blue-500/15">Message</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
              {[
                { emoji: "\u26A1", label: "Live in 3 minutes", desc: "One click to deploy" },
                { emoji: "\uD83E\uDD16", label: "Any LLM model", desc: "OpenAI, Claude, custom" },
                { emoji: "\uD83D\uDC64", label: "Human manager", desc: "Real expert on your account" },
                { emoji: "\uD83D\uDCCA", label: "Full analytics", desc: "Usage, tokens, uptime" },
              ].map((item) => (
                <div key={item.label} className="rounded-lg border border-gray-100 dark:border-white/[0.06] p-4 text-center">
                  <div className="text-lg mb-1.5">{item.emoji}</div>
                  <div className="text-[12px] font-semibold">{item.label}</div>
                  <div className="text-[11px] text-gray-400 dark:text-white/35 mt-0.5">{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeInView>

      {/* ── Trusted By ───────────────────────────────────────────────────── */}
      <FadeInView direction="up">
        <section className="py-16 px-4 sm:px-6">
          <div className="border-y border-gray-100 dark:border-white/[0.06] py-10">
            <div className="max-w-4xl mx-auto">
              <p className="text-center text-[11px] font-medium tracking-[0.15em] text-gray-400 dark:text-white/30 uppercase mb-8">
                {t("trustedBy")}
              </p>
              <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
                {[
                  { name: "Lumina Wellness", icon: "\u2726" },
                  { name: "TechStart Inc", icon: "\u25C6" },
                  { name: "GreenLeaf Co", icon: "\u2756" },
                  { name: "Urban Fitness", icon: "\u2739" },
                  { name: "CloudNine Labs", icon: "\u273B" },
                ].map((company) => (
                  <div key={company.name} className="flex items-center gap-2.5 text-gray-400 dark:text-white/30">
                    <span className="text-lg">{company.icon}</span>
                    <span className="text-[13px] font-medium">{company.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      </FadeInView>

      {/* ── Features grid ────────────────────────────────────────────────── */}
      <section id="features" className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <FadeInView direction="up">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">{t("features.title")}</h2>
            <p className="text-gray-500 dark:text-white/50 max-w-lg mx-auto text-[15px]">{t("features.subtitle")}</p>
          </div>
        </FadeInView>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: MessagesIcon, color: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400", title: t("features.f1title"), desc: t("features.f1desc") },
            { icon: CodeIcon, color: "bg-violet-50 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400", title: t("features.f2title"), desc: t("features.f2desc") },
            { icon: RefreshIcon, color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", title: t("features.f3title"), desc: t("features.f3desc") },
            { icon: UserIcon, color: "bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400", title: t("features.f4title"), desc: t("features.f4desc") },
            { icon: ShieldCheckIcon, color: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400", title: t("features.f5title"), desc: t("features.f5desc") },
            { icon: AnalyticsIcon, color: "bg-cyan-50 dark:bg-cyan-500/10 text-cyan-600 dark:text-cyan-400", title: t("features.f6title"), desc: t("features.f6desc") },
          ].map((f, i) => (
            <FadeInView key={i} direction="up" delay={i * 80}>
              <div className="p-6 rounded-xl border border-gray-100 dark:border-white/[0.06] h-full">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center mb-4 ${f.color}`}>
                  <f.icon className="w-5 h-5" />
                </div>
                <h3 className="font-semibold text-[15px] mb-2">{f.title}</h3>
                <p className="text-gray-500 dark:text-white/45 text-[13px] leading-relaxed">{f.desc}</p>
              </div>
            </FadeInView>
          ))}
        </div>
      </section>

      {/* ── Live Demo ────────────────────────────────────────────────────── */}
      <FadeInView direction="up">
        <section id="demo" className="py-20 px-4 sm:px-6 bg-gray-50/50 dark:bg-white/[0.02]">
          <div className="max-w-3xl mx-auto text-center mb-10">
            <div className="text-[11px] font-medium tracking-[0.15em] text-blue-600 dark:text-blue-400 uppercase mb-3">Live Demo</div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">See it in action</h2>
            <p className="text-gray-500 dark:text-white/50 text-lg">Chat with a real AI agent — no sign-up required.</p>
          </div>
          <div className="max-w-2xl mx-auto">
            <DemoChat />
          </div>
        </section>
      </FadeInView>

      {/* ── Case Study ──────────────────────────────────────────────────── */}
      <FadeInView direction="up">
        <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gray-200 dark:border-white/[0.08] text-[12px] text-blue-600 dark:text-blue-400 mb-4">
              <span>{"\u2605"}</span>
              <span>{t("caseStudy.badge")}</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">{t("caseStudy.title")}</h2>
            <p className="text-gray-500 dark:text-white/50 max-w-xl mx-auto text-[15px]">{t("caseStudy.subtitle")}</p>
          </div>

          <div className="rounded-xl border border-gray-100 dark:border-white/[0.06] p-8 md:p-10 max-w-3xl mx-auto">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 pb-8 border-b border-gray-100 dark:border-white/[0.06]">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">{t("caseStudy.metric1value")}</div>
                <div className="text-[12px] text-gray-500 dark:text-white/50">{t("caseStudy.metric1label")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mb-1">{t("caseStudy.metric2value")}</div>
                <div className="text-[12px] text-gray-500 dark:text-white/50">{t("caseStudy.metric2label")}</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-amber-600 dark:text-amber-400 mb-1">{t("caseStudy.metric3value")}</div>
                <div className="text-[12px] text-gray-500 dark:text-white/50">{t("caseStudy.metric3label")}</div>
              </div>
            </div>

            <blockquote className="text-lg text-gray-600 dark:text-white/60 italic mb-6 leading-relaxed">
              &ldquo;{t("caseStudy.quote")}&rdquo;
            </blockquote>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/15 flex items-center justify-center text-blue-600 dark:text-blue-400 font-semibold text-[13px]">EM</div>
              <div>
                <div className="font-medium text-[13px]">{t("caseStudy.name")}</div>
                <div className="text-gray-500 dark:text-white/50 text-[12px]">{t("caseStudy.role")}</div>
              </div>
              <div className="ml-auto flex gap-2">
                <span className="text-[11px] bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/15">WhatsApp</span>
                <span className="text-[11px] bg-pink-50 dark:bg-pink-500/10 text-pink-600 dark:text-pink-400 px-2.5 py-1 rounded-full border border-pink-200 dark:border-pink-500/15">Instagram</span>
                <span className="hidden sm:block text-[11px] bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-500/15">{t("caseStudy.webWidget")}</span>
              </div>
            </div>
          </div>
        </section>
      </FadeInView>

      {/* ── ROI Calculator ───────────────────────────────────────────────── */}
      <FadeInView direction="up">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-20">
          <div className="max-w-2xl mx-auto">
            <ROICalculator />
          </div>
        </section>
      </FadeInView>

      {/* ── Trusted By 2 ─────────────────────────────────────────────────── */}
      <FadeInView direction="up">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
          <div className="border-y border-gray-100 dark:border-white/[0.06] py-8">
            <p className="text-center text-[11px] text-gray-400 dark:text-white/30 uppercase tracking-[0.15em] mb-6">Trusted by teams at</p>
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
              {["Shopify Store", "SaaS Startup", "Ecommerce Brand", "Tech Agency", "Consulting Firm"].map((company) => (
                <div key={company} className="text-gray-400 dark:text-white/30 font-medium text-[13px]">{company}</div>
              ))}
            </div>
          </div>
        </section>
      </FadeInView>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <FadeInView direction="up">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">{t("testimonials.title")}</h2>
            <p className="text-gray-500 dark:text-white/50 text-[15px]">{t("testimonials.subtitle")}</p>
          </div>
        </FadeInView>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {([1, 2, 3, 4, 5, 6] as const).map((n, i) => (
            <FadeInView key={n} direction="up" delay={i * 60}>
              <div className="p-5 rounded-xl border border-gray-100 dark:border-white/[0.06] flex flex-col gap-3 h-full">
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
                <div className="pt-3 border-t border-gray-100 dark:border-white/[0.06]">
                  <div className="text-[13px] font-medium">{t(`testimonials.name${n}` as Parameters<typeof t>[0])}</div>
                  <div className="text-[11px] text-gray-400 dark:text-white/35">{t(`testimonials.role${n}` as Parameters<typeof t>[0])}</div>
                </div>
              </div>
            </FadeInView>
          ))}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
        <FadeInView direction="up">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-3 tracking-tight">{t("pricing.title")}</h2>
            <p className="text-gray-500 dark:text-white/50 text-[15px]">{t("pricing.subtitle")}</p>
          </div>
        </FadeInView>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-4xl mx-auto">
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
                  className={`rounded-xl p-6 flex flex-col relative h-full ${
                    highlighted
                      ? "border-2 border-gray-900 dark:border-white/30 order-first sm:order-none"
                      : "border border-gray-100 dark:border-white/[0.06]"
                  }`}
                >
                  {highlighted && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 bg-gray-900 dark:bg-white text-white dark:text-gray-900 text-[11px] font-semibold rounded-full">
                      Most Popular
                    </div>
                  )}
                  <div className="font-semibold text-lg mb-1">{t(`pricing.${plan}.name` as Parameters<typeof t>[0])}</div>
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-3xl font-bold">{t(`pricing.${plan}.price` as Parameters<typeof t>[0])}</span>
                    {plan !== "enterprise" && <span className="text-gray-400 dark:text-white/35 text-sm">/mo</span>}
                  </div>
                  <div className="text-gray-500 dark:text-white/45 text-[13px] mb-6">{t(`pricing.${plan}.desc` as Parameters<typeof t>[0])}</div>
                  <ul className="space-y-2.5 mb-6 flex-1">
                    {features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-[13px] text-gray-600 dark:text-white/55">
                        <CheckIcon className="w-4 h-4 text-emerald-500 dark:text-emerald-400 shrink-0 mt-0.5" />
                        {t(`pricing.features.${f}` as Parameters<typeof t>[0])}
                      </li>
                    ))}
                  </ul>
                  {plan === "enterprise" ? (
                    <Link href="/contact" className="block text-center py-2.5 rounded-lg font-medium text-[13px] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 hover:border-gray-300 dark:hover:border-white/20 transition-colors">
                      {t(`pricing.${plan}.cta` as Parameters<typeof t>[0])}
                    </Link>
                  ) : isLoggedIn ? (
                    userPlan === plan ? (
                      <div className="block text-center py-2.5 rounded-lg text-[13px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20">
                        ✓ {t("pricing.currentPlan")}
                      </div>
                    ) : plan === "pro" ? (
                      <Link href="/dashboard/billing" className="block text-center py-2.5 rounded-lg font-medium text-[13px] bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90 transition-opacity">
                        {t("pricing.upgradeToPro")}
                      </Link>
                    ) : (
                      <Link href="/dashboard" className="block text-center py-2.5 rounded-lg font-medium text-[13px] border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 hover:border-gray-300 transition-colors">
                        {t("nav.dashboard")}
                      </Link>
                    )
                  ) : (
                    <Link
                      href="/sign-up"
                      className={`block text-center py-2.5 rounded-lg font-medium text-[13px] transition-all ${
                        highlighted
                          ? "bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:opacity-90"
                          : "border border-gray-200 dark:border-white/10 text-gray-600 dark:text-white/60 hover:border-gray-300 dark:hover:border-white/20"
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

      {/* ── Resources ────────────────────────────────────────────────────── */}
      <FadeInView direction="up">
        <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold mb-2 tracking-tight">Guides &amp; Resources</h2>
            <p className="text-gray-500 dark:text-white/50 text-[13px] max-w-xl mx-auto">Tutorials, comparisons, and integration guides to help you get the most out of AI customer support.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
            {[
              { href: "/blog/how-to-build-telegram-chatbot", tag: "Tutorial", tagColor: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10", title: "How to Build a Telegram AI Chatbot in 10 Minutes", desc: "Step-by-step setup with BotFather, API keys, and going live." },
              { href: "/blog/best-ai-models-for-customer-support", tag: "Comparison", tagColor: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10", title: "GPT-4o vs Claude vs Gemini: Best AI for Customer Support", desc: "Which LLM wins on accuracy, tone, speed, and cost?" },
              { href: "/integrations/telegram", tag: "Integration", tagColor: "text-gray-500 dark:text-white/50 bg-gray-50 dark:bg-white/[0.04]", title: "Telegram AI Chatbot — Full Integration Guide", desc: "Connect GPT-4 to your Telegram channel in 3 minutes." },
              { href: "/integrations/whatsapp", tag: "Integration", tagColor: "text-gray-500 dark:text-white/50 bg-gray-50 dark:bg-white/[0.04]", title: "WhatsApp Business AI Chatbot Setup Guide", desc: "Add AI to your WhatsApp Business number via Twilio." },
              { href: "/compare/tidio", tag: "Compare", tagColor: "text-gray-500 dark:text-white/50 bg-gray-50 dark:bg-white/[0.04]", title: "OpenHelix vs Tidio — Full Feature Comparison", desc: "Features, pricing, and when to choose each." },
              { href: "/compare/intercom", tag: "Compare", tagColor: "text-gray-500 dark:text-white/50 bg-gray-50 dark:bg-white/[0.04]", title: "OpenHelix vs Intercom — Is the Price Worth It?", desc: "Honest comparison for SMBs evaluating Intercom." },
              { href: "/use-cases/ecommerce", tag: "Use Case", tagColor: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10", title: "AI Chatbot for Ecommerce Stores", desc: "Order tracking, returns, and cart recovery — automated." },
              { href: "/compare/zendesk", tag: "Compare", tagColor: "text-gray-500 dark:text-white/50 bg-gray-50 dark:bg-white/[0.04]", title: "OpenHelix vs Zendesk — 90% Cheaper Alternative", desc: "$55/agent/month vs $0 to start. Full comparison." },
              { href: "/compare/livechat", tag: "Compare", tagColor: "text-gray-500 dark:text-white/50 bg-gray-50 dark:bg-white/[0.04]", title: "OpenHelix vs LiveChat — 80% Cost Reduction", desc: "$52/agent/month vs AI at $29/month. See the difference." },
              { href: "/use-cases/restaurant", tag: "Use Case", tagColor: "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-500/10", title: "AI Chatbot for Restaurants", desc: "Reservations, menu Q&A, hours — answered 24/7." },
              { href: "/use-cases/healthcare", tag: "Use Case", tagColor: "text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-500/10", title: "AI Support for Healthcare & Clinics", desc: "Patient inquiries, appointments, FAQs — automated." },
              { href: "/use-cases/fintech", tag: "Use Case", tagColor: "text-cyan-600 dark:text-cyan-400 bg-cyan-50 dark:bg-cyan-500/10", title: "AI Support for Fintech", desc: "Account FAQs, transactions, onboarding — 24/7." },
              { href: "/use-cases/real-estate", tag: "Use Case", tagColor: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-500/10", title: "AI Chatbot for Real Estate", desc: "Lead qualification, property Q&A, viewings." },
              { href: "/blog/how-to-automate-ecommerce-customer-support", tag: "Playbook", tagColor: "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-500/10", title: "Ecommerce Support Automation Playbook", desc: "Step-by-step: audit → knowledge base → 80% automated." },
            ].map((item) => (
              <Link key={item.href} href={item.href} className="group rounded-lg border border-gray-100 dark:border-white/[0.06] p-4 hover:border-gray-200 dark:hover:border-white/[0.12] transition-colors">
                <div className={`text-[11px] ${item.tagColor} px-2 py-0.5 rounded-full inline-block mb-2 border border-transparent`}>{item.tag}</div>
                <h3 className="font-medium group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors mb-1 text-[13px] leading-snug">{item.title}</h3>
                <p className="text-[11px] text-gray-400 dark:text-white/35">{item.desc}</p>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <Link href="/blog" className="text-[13px] text-blue-600 dark:text-blue-400 hover:text-blue-500 transition-colors">{`View all guides \u2192`}</Link>
          </div>
        </section>
      </FadeInView>

      {/* ── FAQ ───────────────────────────────────────────────────────────── */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 py-20">
        <FadeInView direction="up">
          <h2 className="text-2xl md:text-3xl font-bold mb-10 text-center tracking-tight">{tl("faq.title")}</h2>
        </FadeInView>
        {[
          { q: tl("faq.q1"), a: tl("faq.a1") },
          { q: tl("faq.q2"), a: tl("faq.a2") },
          { q: tl("faq.q3"), a: tl("faq.a3") },
          { q: tl("faq.q4"), a: tl("faq.a4") },
          { q: tl("faq.q5"), a: tl("faq.a5") },
          { q: tl("faq.q6"), a: tl("faq.a6") },
        ].map((item, i) => (
          <FadeInView key={i} direction="up" delay={i * 60}>
            <details className="border-b border-gray-100 dark:border-white/[0.06] py-4 group">
              <summary className="cursor-pointer list-none flex items-center justify-between text-[14px] font-medium hover:text-gray-900 dark:hover:text-white transition-colors">
                {item.q}
                <span className="text-gray-300 dark:text-white/20 text-lg group-open:rotate-45 transition-transform duration-200 shrink-0 ml-4">+</span>
              </summary>
              <div className="text-[13px] text-gray-500 dark:text-white/45 mt-3 leading-relaxed">{item.a}</div>
            </details>
          </FadeInView>
        ))}
      </section>

      {/* ── About / Stats ─────────────────────────────────────────────────── */}
      <FadeInView direction="up">
        <section id="about" className="max-w-4xl mx-auto px-4 sm:px-6 py-20">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 tracking-tight">{t("about.title")}</h2>
              <p className="text-gray-500 dark:text-white/50 leading-relaxed mb-6 text-[15px]">{t("about.subtitle")}</p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-6 py-3 rounded-lg font-semibold text-[14px] hover:opacity-90 transition-opacity"
              >
                {t("hero.cta")} <ArrowRightIcon className="w-4 h-4" />
              </Link>
            </div>
            <div className="grid grid-cols-1 gap-4">
              {[
                { icon: RocketLaunchIcon, color: "bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400", stat: t("about.setup"), label: t("about.setupLabel") },
                { icon: UserIcon, color: "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400", stat: t("about.response"), label: t("about.responseLabel") },
                { icon: ShieldCheckIcon, color: "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400", stat: t("about.uptime"), label: t("about.uptimeLabel") },
              ].map((item) => (
                <div key={item.label} className="p-5 rounded-xl border border-gray-100 dark:border-white/[0.06] flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${item.color}`}>
                    <item.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{item.stat}</div>
                    <div className="text-gray-500 dark:text-white/50 text-[13px]">{item.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </FadeInView>

      {/* ── CTA banner ───────────────────────────────────────────────────── */}
      <ParallaxSection speed={0.08}>
        <FadeInView direction="up">
          <section className="max-w-4xl mx-auto px-4 sm:px-6 py-12 pb-20 sm:pb-12 mb-8">
            <div className="rounded-xl border border-gray-100 dark:border-white/[0.06] p-10 md:p-14 text-center relative overflow-hidden">
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-blue-500/[0.04] rounded-full blur-[80px]" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold mb-4 relative tracking-tight">{t("cta.title")}</h2>
              <p className="text-gray-500 dark:text-white/50 mb-8 max-w-md mx-auto relative text-[15px]">{t("cta.subtitle")}</p>
              <Link
                href="/sign-up"
                className="inline-flex items-center gap-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 px-7 py-3.5 rounded-lg font-semibold text-[15px] relative hover:opacity-90 transition-opacity"
              >
                {t("hero.cta")} <ArrowRightIcon className="w-4 h-4" />
              </Link>
              <p className="text-gray-400 dark:text-white/20 text-[12px] mt-4 relative">{t("hero.footnote")}</p>
            </div>
          </section>
        </FadeInView>
      </ParallaxSection>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 dark:border-white/[0.06] pt-12 pb-8">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-10">
            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <HelixLogo className="w-5 h-5 text-blue-600 dark:text-blue-400" size={20} />
                <span className="font-semibold text-[13px]">OpenHelix AI</span>
              </div>
              <p className="text-[12px] text-gray-400 dark:text-white/35 leading-relaxed max-w-xs">
                Deploy AI customer support agents for Telegram, WhatsApp, and web. Powered by GPT-4 and Claude.
              </p>
            </div>
            <div>
              <div className="text-[11px] font-medium text-gray-400 dark:text-white/40 uppercase tracking-[0.1em] mb-4">Product</div>
              <ul className="space-y-2.5 text-[13px] text-gray-500 dark:text-white/50">
                <li><Link href="/pricing" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">Pricing</Link></li>
                <li><Link href="/templates" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">Templates</Link></li>
                <li><Link href="/changelog" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">{t("footer.changelog")}</Link></li>
                <li><Link href="/status" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">{t("footer.status")}</Link></li>
                <li><Link href="/api-docs" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">{t("footer.api")}</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-[11px] font-medium text-gray-400 dark:text-white/40 uppercase tracking-[0.1em] mb-4">Integrations</div>
              <ul className="space-y-2.5 text-[13px] text-gray-500 dark:text-white/50">
                <li><Link href="/integrations/telegram" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">Telegram</Link></li>
                <li><Link href="/integrations/whatsapp" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">WhatsApp</Link></li>
                <li><Link href="/integrations/discord" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">Discord</Link></li>
                <li><Link href="/integrations" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">{`All integrations \u2192`}</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-[11px] font-medium text-gray-400 dark:text-white/40 uppercase tracking-[0.1em] mb-4">Use Cases</div>
              <ul className="space-y-2.5 text-[13px] text-gray-500 dark:text-white/50">
                <li><Link href="/use-cases/ecommerce" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">Ecommerce</Link></li>
                <li><Link href="/use-cases/saas" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">SaaS</Link></li>
                <li><Link href="/use-cases/healthcare" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">Healthcare</Link></li>
                <li><Link href="/use-cases/fintech" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">Fintech</Link></li>
                <li><Link href="/use-cases/real-estate" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">Real Estate</Link></li>
                <li><Link href="/use-cases" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">{`All use cases \u2192`}</Link></li>
              </ul>
            </div>
            <div>
              <div className="text-[11px] font-medium text-gray-400 dark:text-white/40 uppercase tracking-[0.1em] mb-4">Resources</div>
              <ul className="space-y-2.5 text-[13px] text-gray-500 dark:text-white/50">
                <li><Link href="/blog" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">Blog</Link></li>
                <li><Link href="/compare" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">Comparisons</Link></li>
                <li><Link href="/contact" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">{t("nav.contact")}</Link></li>
                <li><Link href="/privacy" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">{t("footer.privacy")}</Link></li>
                <li><Link href="/terms" className="hover:text-gray-700 dark:hover:text-white/70 transition-colors">{t("footer.terms")}</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-100 dark:border-white/[0.06] pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-gray-400 dark:text-white/25">
            <span>{t("footer.copyright", { year: 2026 })}</span>
            <Link href="/status" className="flex items-center gap-1.5 hover:text-gray-500 dark:hover:text-white/40 transition-colors">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              {t("footer.systemStatus")}
            </Link>
          </div>
        </div>
      </footer>

      <LandingDemoChat />
    </div>
  );
}
