import { Link } from "@/i18n/navigation";
import { Metadata } from "next";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { MobileNav } from "@/components/MobileNav";
import { LandingDemoChat } from "@/components/LandingDemoChat";
import { DemoChat } from "@/components/DemoChat";
import { LiveStats } from "@/components/LiveStats";
import { getFeaturedTemplates, categoryColors } from "@/lib/templates";
import { ROICalculator } from "@/components/ROICalculator";
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
  AIBrainIcon,
} from "@/components/icons/BrandIcons";
import { getTranslations } from "next-intl/server";

export const metadata: Metadata = {
  title: "SynapseForge — AI Agents for Business",
  description: "Deploy AI agents in minutes. Managed setup, human oversight, and seamless integrations. Start free with 2,000 messages.",
  keywords: ["AI", "chatbot", "customer support", "automation", "business AI", "virtual assistant"],
  openGraph: {
    title: "SynapseForge — AI Agents for Business",
    description: "Deploy AI agents in minutes. Managed setup, human oversight, and seamless integrations.",
    type: "website",
  },
};

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
      {
        "@type": "Question",
        "name": tl("faq.q1"),
        "acceptedAnswer": { "@type": "Answer", "text": tl("faq.a1") },
      },
      {
        "@type": "Question",
        "name": tl("faq.q2"),
        "acceptedAnswer": { "@type": "Answer", "text": tl("faq.a2") },
      },
      {
        "@type": "Question",
        "name": tl("faq.q3"),
        "acceptedAnswer": { "@type": "Answer", "text": tl("faq.a3") },
      },
      {
        "@type": "Question",
        "name": tl("faq.q4"),
        "acceptedAnswer": { "@type": "Answer", "text": tl("faq.a4") },
      },
      {
        "@type": "Question",
        "name": tl("faq.q5"),
        "acceptedAnswer": { "@type": "Answer", "text": tl("faq.a5") },
      },
      {
        "@type": "Question",
        "name": tl("faq.q6"),
        "acceptedAnswer": { "@type": "Answer", "text": tl("faq.a6") },
      },
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
    <div className="min-h-screen bg-[#050507] text-[#f5f5f7] relative overflow-hidden">
      {/* ── JSON-LD Structured Data ───────────────────────────────────────── */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(softwareSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
      />

      {/* ── Ambient background glow ──────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="glow-orb w-[500px] h-[500px] bg-violet-600/[0.07] top-[-10%] left-[20%]" />
        <div className="glow-orb w-[600px] h-[600px] bg-indigo-500/[0.05] top-[30%] right-[-10%]" style={{ animationDelay: '5s' }} />
        <div className="glow-orb w-[400px] h-[400px] bg-violet-500/[0.04] bottom-[10%] left-[-5%]" style={{ animationDelay: '10s' }} />
      </div>

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="glass-nav sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center justify-center sm:justify-start gap-2.5">
            <HelixLogo className="w-6 h-6 text-violet-400" size={24} />
            <span className="font-semibold text-[15px] tracking-tight hidden sm:block text-white/90">OpenHelix AI</span>
            <span className="font-semibold text-[15px] tracking-tight sm:hidden text-white/90">OpenHelix</span>
          </div>
          <div className="hidden md:flex items-center gap-7 text-[13px] text-white/50">
            <Link href="/templates" className="hover:text-white/90 transition-colors duration-300">Templates</Link>
            <Link href="/blog" className="hover:text-white/90 transition-colors duration-300">Blog</Link>
            <a href="#demo" className="hover:text-white/90 transition-colors duration-300">Demo</a>
            <a href="#how" className="hover:text-white/90 transition-colors duration-300">{t("nav.services")}</a>
            <a href="#pricing" className="hover:text-white/90 transition-colors duration-300">{t("nav.pricing")}</a>
            <a href="#about" className="hover:text-white/90 transition-colors duration-300">{t("nav.about")}</a>
            <Link href="/use-cases" className="hover:text-white/90 transition-colors duration-300">Use Cases</Link>
            <Link href="/compare" className="hover:text-white/90 transition-colors duration-300">Compare</Link>
            <Link href="/contact" className="hover:text-white/90 transition-colors duration-300">{t("nav.contact")}</Link>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <LocaleSwitcher />
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="text-[13px] glass-btn-primary px-4 py-2 font-medium whitespace-nowrap text-white"
              >
                <span className="hidden sm:inline">{t("nav.dashboard")}</span>
                <span className="sm:hidden">Dashboard</span>
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="hidden md:block text-[13px] text-white/50 hover:text-white/90 transition-colors duration-300 px-4 py-2">
                  {t("nav.signIn")}
                </Link>
                <Link
                  href="/sign-up"
                  className="text-[13px] glass-btn-primary px-4 py-2 font-medium whitespace-nowrap text-white"
                >
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
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 md:pt-36 pb-16 md:pb-24 text-center relative">
        <div className="glass-badge text-white/60 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-subtle-pulse" />
          {t("hero.badge")}
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-[72px] font-bold tracking-tight mb-6 leading-[1.05]">
          <span className="bg-gradient-to-b from-white via-white/90 to-white/60 bg-clip-text text-transparent">
            {t("hero.title").split('\n')[0]}
          </span>
          {t("hero.title").includes('\n') && (
            <>
              <br />
              <span className="bg-gradient-to-b from-white/70 to-white/40 bg-clip-text text-transparent">{t("hero.title").split('\n')[1]}</span>
            </>
          )}
        </h1>

        <p className="text-lg md:text-xl text-white/40 max-w-2xl mx-auto mb-10 leading-relaxed font-light">
          {t("hero.subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-6">
          <Link
            href={isLoggedIn ? "/dashboard" : "/sign-up"}
            className="w-full sm:w-auto flex items-center justify-center gap-2 glass-btn-primary px-8 py-4 font-semibold text-base text-white"
          >
            {isLoggedIn ? t("nav.dashboard") : t("hero.cta")} <ArrowRightIcon className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Link
              href="/templates"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 glass-btn-secondary px-5 sm:px-6 py-4 font-medium text-[15px] text-white/70 whitespace-nowrap"
            >
              <SparklesIcon className="w-4 h-4" />
              {t("hero.ctaSecondary")}
            </Link>
            <Link
              href="/contact?subject=Demo+Request"
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 glass-btn-secondary px-5 sm:px-6 py-4 font-medium text-[15px] text-white/70 whitespace-nowrap"
            >
              <CalendarIcon className="w-4 h-4" />
              {t("hero.bookDemo")}
            </Link>
          </div>
        </div>

        <p className="text-[13px] text-white/25">{t("hero.footnote")}</p>

        {/* Channel badges */}
        <div className="flex flex-wrap items-center justify-center gap-2 mt-12">
          {["Telegram", "Discord", "Slack", "Web Chat", "REST API"].map((ch) => (
            <span
              key={ch}
              className="text-[12px] px-3 py-1.5 rounded-full bg-white/[0.03] border border-white/[0.06] text-white/35 backdrop-blur-sm"
            >
              {ch}
            </span>
          ))}
        </div>

        {/* Live Stats */}
        <div className="mt-16">
          <LiveStats />
        </div>
      </section>

      {/* ── Trust Signal Bar ─────────────────────────────────────────────── */}
      <section className="py-8 relative">
        <div className="glass-divider" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="flex flex-wrap items-center justify-center gap-10 text-[13px] text-white/35">
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-semibold text-white/80">12+</span>
              <span>{t("trust.businessesRunning")}</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-white/[0.06]" />
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-semibold text-white/80">24/7</span>
              <span>{t("trust.alwaysOn")}</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-white/[0.06]" />
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-semibold text-white/80">{"<3min"}</span>
              <span>{t("trust.setupTime")}</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-white/[0.06]" />
            <div className="flex items-center gap-3">
              <span className="text-2xl sm:text-3xl font-semibold text-white/80">{"\u20AC0"}</span>
              <span>{t("trust.startFree")}</span>
            </div>
            <div className="hidden sm:block w-px h-6 bg-white/[0.06]" />
            <div className="flex items-center gap-2">
              <span className="text-emerald-400/80">{"\u2713"}</span>
              <span>{t("trust.noCard")}</span>
            </div>
          </div>
        </div>
        <div className="glass-divider" />
      </section>

      {/* ── How it Works (SMB steps) ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <h2 className="text-3xl md:text-4xl font-bold mb-16 text-center tracking-tight">
          {tl("howItWorks.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {[
            { num: tl("howItWorks.step1.num"), icon: MessagesIcon, title: tl("howItWorks.step1.title"), desc: tl("howItWorks.step1.desc") },
            { num: tl("howItWorks.step2.num"), icon: SettingsIcon, title: tl("howItWorks.step2.title"), desc: tl("howItWorks.step2.desc") },
            { num: tl("howItWorks.step3.num"), icon: RocketLaunchIcon, title: tl("howItWorks.step3.title"), desc: tl("howItWorks.step3.title") },
          ].map((step, i) => (
            <div key={i} className="glass-card rounded-2xl p-7">
              <div className="text-5xl font-bold text-white/[0.04] mb-5">{step.num}</div>
              <div className="w-11 h-11 rounded-[14px] bg-white/[0.05] border border-white/[0.06] flex items-center justify-center mb-5">
                <step.icon className="w-5 h-5 text-violet-400/80" />
              </div>
              <h3 className="font-semibold text-[15px] mb-2 text-white/90">{step.title}</h3>
              <p className="text-white/35 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Templates Section ────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <div className="glass-badge text-violet-300/70 mb-5">
              <SparklesIcon className="w-3.5 h-3.5" />
              Pre-Built Templates
            </div>
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight">
              Deploy in Minutes, Not Days
            </h2>
            <p className="text-white/35 mt-3 max-w-xl text-[15px]">
              Skip the setup. Start with a proven template and customize it to fit your needs.
            </p>
          </div>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 text-violet-400/80 hover:text-violet-300 font-medium text-sm transition-colors duration-300"
          >
            View All Templates
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {featuredTemplates.map((template) => (
            <Link key={template.id} href={`/templates/${template.id}`} className="group">
              <div className="glass-card rounded-2xl p-6 h-full flex flex-col">
                <div className="flex items-start justify-between mb-5">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-500">
                    {template.icon}
                  </span>
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${categoryColors[template.category]}`}>
                    {template.category}
                  </span>
                </div>
                <h3 className="font-semibold text-white/90 text-[15px] mb-2 group-hover:text-violet-300/90 transition-colors duration-300">
                  {template.name}
                </h3>
                <p className="text-[13px] text-white/35 flex-1 line-clamp-2">
                  {template.shortDescription}
                </p>
                <div className="flex items-center justify-between mt-5 pt-5 border-t border-white/[0.05]">
                  <span className={`text-[11px] px-2.5 py-1 rounded-full font-medium border ${
                    template.difficulty === "beginner"
                      ? "bg-emerald-500/10 text-emerald-400/80 border-emerald-500/15"
                      : template.difficulty === "intermediate"
                      ? "bg-amber-500/10 text-amber-400/80 border-amber-500/15"
                      : "bg-red-500/10 text-red-400/80 border-red-500/15"
                  }`}>
                    {template.difficulty}
                  </span>
                  <span className="text-[13px] text-violet-400/70 font-medium flex items-center gap-1 group-hover:gap-2 transition-all duration-300">
                    Use
                    <ArrowRightIcon className="w-3.5 h-3.5" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how" className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{t("how.title")}</h2>
          <p className="text-white/35 text-[15px]">{t("how.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {[
            {
              step: "01",
              icon: KeyIcon,
              color: "text-violet-400/80",
              title: t("how.step1title"),
              desc: t("how.step1desc"),
            },
            {
              step: "02",
              icon: MessagesIcon,
              color: "text-emerald-400/80",
              title: t("how.step2title"),
              desc: t("how.step2desc"),
            },
            {
              step: "03",
              icon: MessagesIcon,
              color: "text-blue-400/80",
              title: t("how.step3title"),
              desc: t("how.step3desc"),
            },
          ].map((s, i) => (
            <div key={i} className="relative">
              {i < 2 && (
                <div className="hidden md:block absolute top-10 left-[calc(100%+8px)] w-[calc(100%-16px)] h-px bg-gradient-to-r from-white/[0.06] to-transparent z-10" />
              )}
              <div className="glass-card rounded-2xl p-7 h-full">
                <div className="w-11 h-11 rounded-[14px] bg-white/[0.05] border border-white/[0.06] flex items-center justify-center mb-6">
                  <s.icon className={`w-5 h-5 ${s.color}`} />
                </div>
                <div className="text-[11px] text-white/20 font-mono mb-2 tracking-wider">Step {s.step}</div>
                <h3 className="text-base font-semibold text-white/90 mb-3">{s.title}</h3>
                <p className="text-white/35 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Terminal demo */}
        <div className="mt-16 max-w-2xl mx-auto">
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.05]">
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span className="ml-3 text-[11px] text-white/20 font-mono">{t("demo.terminalTitle")}</span>
            </div>
            <div className="px-5 py-6 font-mono text-[13px] space-y-2">
              {[
                { text: t("demo.line1"), delay: "0ms" },
                { text: t("demo.line2"), delay: "400ms" },
                { text: t("demo.line3"), delay: "800ms" },
                { text: t("demo.line4"), delay: "1200ms" },
                { text: t("demo.line5"), delay: "1600ms" },
              ].map((line, i) => (
                <div key={i} className="text-emerald-400/70">{line.text}</div>
              ))}
              <div className="text-white/80 font-medium pt-3 border-t border-white/[0.05] mt-4">
                {t("demo.done")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Video Demo ──────────────────────────────────────────────────── */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-14">
          <div className="glass-badge text-violet-300/60 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-violet-400/70 animate-subtle-pulse" />
            Watch Demo
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">See it in action</h2>
          <p className="text-white/35 max-w-xl mx-auto text-[15px]">
            Deploy your AI agent in under 3 minutes. No DevOps required.
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="glass-card rounded-2xl overflow-hidden aspect-video group cursor-pointer relative">
            {/* Video thumbnail / dashboard preview */}
            <div className="absolute inset-0 bg-[#050507]">
              <div className="absolute inset-0 opacity-30">
                <div className="h-full flex">
                  <div className="w-16 border-r border-white/[0.04] h-full" />
                  <div className="flex-1 p-6">
                    <div className="h-8 w-48 bg-white/[0.03] rounded-xl mb-6" />
                    <div className="grid grid-cols-3 gap-4 mb-6">
                      <div className="h-24 bg-white/[0.03] rounded-xl" />
                      <div className="h-24 bg-white/[0.03] rounded-xl" />
                      <div className="h-24 bg-white/[0.03] rounded-xl" />
                    </div>
                    <div className="h-64 bg-white/[0.03] rounded-xl" />
                  </div>
                </div>
              </div>
            </div>

            {/* Play button */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-16 h-16 rounded-full bg-white/[0.08] backdrop-blur-xl border border-white/[0.1] flex items-center justify-center group-hover:scale-110 group-hover:bg-white/[0.12] transition-all duration-500">
                <svg className="w-6 h-6 text-white/80 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </div>
            </div>

            <div className="absolute bottom-4 left-4">
              <span className="text-[11px] bg-black/40 backdrop-blur-md text-white/40 px-3 py-1.5 rounded-full border border-white/[0.06]">
                Video coming soon — Book a live demo below
              </span>
            </div>
          </div>
        </div>

        <div className="text-center mt-10">
          <Link
            href="/contact?subject=Demo+Request"
            className="inline-flex items-center gap-2 glass-btn-primary px-6 py-3 font-semibold text-sm text-white"
          >
            Book Live Demo
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── Product Preview ──────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Your AI command center</h2>
          <p className="text-white/35 max-w-xl mx-auto text-[15px]">Everything you need to deploy, monitor, and chat with your AI agent — in one clean dashboard.</p>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="glass-card rounded-2xl overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-white/[0.05]">
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <span className="w-2.5 h-2.5 rounded-full bg-white/10" />
              <div className="flex-1 mx-4">
                <div className="bg-white/[0.03] border border-white/[0.06] rounded-lg px-3 py-1.5 text-[11px] text-white/25 font-mono max-w-xs mx-auto text-center">
                  app.openhelixai.com/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard layout */}
            <div className="flex" style={{ minHeight: 420 }}>
              {/* Sidebar */}
              <div className="w-52 border-r border-white/[0.04] p-3 shrink-0 hidden md:block">
                <div className="flex items-center gap-2 px-2 py-3 mb-4">
                  <div className="w-6 h-6 rounded-lg bg-violet-500/20 flex items-center justify-center">
                    <span className="text-white/80 text-[10px] font-bold">S</span>
                  </div>
                  <span className="text-[12px] font-semibold text-white/70">OpenHelix AI</span>
                </div>
                {[
                  { label: "Overview", active: false, dot: null },
                  { label: "AI Instances", active: true, dot: null },
                  { label: "Messages", active: false, dot: "2" },
                  { label: "Billing", active: false, dot: null },
                  { label: "Settings", active: false, dot: null },
                ].map((item) => (
                  <div key={item.label} className={`flex items-center justify-between px-3 py-2 rounded-xl mb-0.5 text-[12px] transition-colors ${item.active ? "bg-white/[0.06] text-white/80" : "text-white/30"}`}>
                    <span>{item.label}</span>
                    {item.dot && (
                      <span className="w-4 h-4 rounded-full bg-violet-500/30 text-violet-300/80 text-[9px] flex items-center justify-center font-bold">{item.dot}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-5 overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-[13px] font-semibold text-white/80">AI Instances</h2>
                  <div className="text-[11px] glass-btn-primary text-white/90 px-3 py-1.5 rounded-xl font-medium">+ New Instance</div>
                </div>

                {[
                  { name: "Customer Support Bot", type: "Support", status: "running", health: "healthy", model: "GPT-4o", msgs: "1,248" },
                  { name: "Sales Assistant", type: "Sales", status: "running", health: "healthy", model: "Claude Sonnet", msgs: "893" },
                  { name: "Internal Helpdesk", type: "Internal", status: "stopped", health: null, model: "GPT-4 Turbo", msgs: "412" },
                ].map((inst) => (
                  <div key={inst.name} className="flex items-center gap-3 p-3 rounded-xl border border-white/[0.04] bg-white/[0.02] mb-2 hover:bg-white/[0.04] transition-all duration-300 cursor-pointer">
                    <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/[0.06] flex items-center justify-center shrink-0">
                      <span className="text-white/40 text-[11px]">{"\uD83E\uDD16"}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-white/80 truncate">{inst.name}</div>
                      <div className="text-[10px] text-white/25">{inst.type} · {inst.model}</div>
                    </div>
                    <div className="text-[10px] text-white/25 hidden sm:block">{inst.msgs} msgs</div>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${inst.status === "running" ? "bg-emerald-500/10 text-emerald-400/70" : "bg-white/[0.04] text-white/30"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${inst.status === "running" ? "bg-emerald-400/70" : "bg-white/20"}`} />
                      {inst.status}
                    </div>
                  </div>
                ))}

                <div className="mt-4 flex items-center gap-3 p-3 rounded-xl border border-violet-500/15 bg-violet-500/[0.04]">
                  <div className="w-8 h-8 rounded-full bg-violet-500/10 border border-violet-500/15 flex items-center justify-center shrink-0">
                    <span className="text-violet-300/70 text-[11px] font-bold">M</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-white/30 mb-0.5">Your dedicated manager</div>
                    <div className="text-[12px] font-medium text-white/80">Alex Kim · alex@openhelixai.com</div>
                  </div>
                  <div className="text-[10px] bg-violet-500/10 text-violet-300/70 px-2.5 py-1 rounded-lg border border-violet-500/15">Message</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature callouts */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
            {[
              { emoji: "\u26A1", label: "Live in 3 minutes", desc: "One click to deploy" },
              { emoji: "\uD83E\uDD16", label: "Any LLM model", desc: "OpenAI, Claude, custom" },
              { emoji: "\uD83D\uDC64", label: "Human manager", desc: "Real expert on your account" },
              { emoji: "\uD83D\uDCCA", label: "Full analytics", desc: "Usage, tokens, uptime" },
            ].map((item) => (
              <div key={item.label} className="glass-surface rounded-xl p-4 text-center">
                <div className="text-lg mb-1.5">{item.emoji}</div>
                <div className="text-[12px] font-semibold text-white/80">{item.label}</div>
                <div className="text-[11px] text-white/25 mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trusted By ─────────────────────────────────────────────────── */}
      <section className="py-20 px-4 sm:px-6">
        <div className="glass-divider mb-12" />
        <div className="max-w-5xl mx-auto">
          <p className="text-center text-[11px] font-medium tracking-[0.15em] text-white/25 uppercase mb-10">
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
              <div key={company.name} className="flex items-center gap-2.5 text-white/20">
                <span className="text-lg">{company.icon}</span>
                <span className="text-[13px] font-medium">{company.name}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="glass-divider mt-12" />
      </section>

      {/* ── Features grid ────────────────────────────────────────────────── */}
      <section id="features" className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{t("features.title")}</h2>
          <p className="text-white/35 max-w-xl mx-auto text-[15px]">{t("features.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: MessagesIcon, color: "text-violet-400/80", title: t("features.f1title"), desc: t("features.f1desc") },
            { icon: CodeIcon, color: "text-blue-400/80", title: t("features.f2title"), desc: t("features.f2desc") },
            { icon: RefreshIcon, color: "text-emerald-400/80", title: t("features.f3title"), desc: t("features.f3desc") },
            { icon: UserIcon, color: "text-pink-400/80", title: t("features.f4title"), desc: t("features.f4desc") },
            { icon: ShieldCheckIcon, color: "text-amber-400/80", title: t("features.f5title"), desc: t("features.f5desc") },
            { icon: AnalyticsIcon, color: "text-cyan-400/80", title: t("features.f6title"), desc: t("features.f6desc") },
          ].map((f, i) => (
            <div key={i} className="glass-card rounded-2xl p-7">
              <div className="w-11 h-11 rounded-[14px] bg-white/[0.05] border border-white/[0.06] flex items-center justify-center mb-5">
                <f.icon className={`w-5 h-5 ${f.color}`} />
              </div>
              <h3 className="font-semibold text-[15px] mb-2 text-white/90">{f.title}</h3>
              <p className="text-white/35 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live Demo ── */}
      <section id="demo" className="py-28 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto text-center mb-14">
          <div className="text-[11px] font-medium tracking-[0.15em] text-violet-400/60 uppercase mb-4">Live Demo</div>
          <h2 className="text-3xl md:text-4xl font-bold mt-2 mb-4 tracking-tight">See it in action</h2>
          <p className="text-white/35 text-lg font-light">Chat with a real AI agent — no sign-up required.</p>
        </div>
        <div className="max-w-2xl mx-auto">
          <DemoChat />
        </div>
      </section>

      {/* ── Case Study ──────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-14">
          <div className="glass-badge text-violet-300/60 mb-5">
            <span>{"\u2605"}</span>
            <span>{t("caseStudy.badge")}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{t("caseStudy.title")}</h2>
          <p className="text-white/35 max-w-xl mx-auto text-[15px]">{t("caseStudy.subtitle")}</p>
        </div>

        <div className="glass-card rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
          {/* Metrics row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10 pb-10 border-b border-white/[0.05]">
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-violet-400/80 mb-1">{t("caseStudy.metric1value")}</div>
              <div className="text-[12px] text-white/30">{t("caseStudy.metric1label")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-emerald-400/80 mb-1">{t("caseStudy.metric2value")}</div>
              <div className="text-[12px] text-white/30">{t("caseStudy.metric2label")}</div>
            </div>
            <div className="text-center">
              <div className="text-2xl sm:text-3xl font-bold text-amber-400/80 mb-1">{t("caseStudy.metric3value")}</div>
              <div className="text-[12px] text-white/30">{t("caseStudy.metric3label")}</div>
            </div>
          </div>

          <blockquote className="text-lg text-white/50 italic mb-8 leading-relaxed font-light">
            &ldquo;{t("caseStudy.quote")}&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-500/10 border border-violet-500/15 flex items-center justify-center text-violet-400/70 font-semibold text-[13px]">EM</div>
            <div>
              <div className="text-white/80 font-medium text-[13px]">{t("caseStudy.name")}</div>
              <div className="text-white/30 text-[12px]">{t("caseStudy.role")}</div>
            </div>
            <div className="ml-auto flex gap-2">
              <span className="text-[11px] bg-emerald-500/8 text-emerald-400/60 px-2.5 py-1 rounded-full border border-emerald-500/15">WhatsApp</span>
              <span className="text-[11px] bg-pink-500/8 text-pink-400/60 px-2.5 py-1 rounded-full border border-pink-500/15">Instagram</span>
              <span className="hidden sm:block text-[11px] bg-violet-500/8 text-violet-400/60 px-2.5 py-1 rounded-full border border-violet-500/15">{t("caseStudy.webWidget")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── ROI Calculator ───────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="max-w-2xl mx-auto">
          <ROICalculator />
        </div>
      </section>

      {/* ── Trusted By ──────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16">
        <div className="glass-divider mb-10" />
        <p className="text-center text-[11px] text-white/25 uppercase tracking-[0.15em] mb-8">Trusted by teams at</p>
        <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-14">
          {["Shopify Store", "SaaS Startup", "Ecommerce Brand", "Tech Agency", "Consulting Firm"].map((company) => (
            <div key={company} className="text-white/20 font-medium text-[13px]">{company}</div>
          ))}
        </div>
        <div className="glass-divider mt-10" />
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20 sm:py-24">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-4 tracking-tight">{t("testimonials.title")}</h2>
          <p className="text-white/35 text-sm sm:text-[15px]">{t("testimonials.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {([1, 2, 3, 4, 5, 6] as const).map((n) => (
            <div key={n} className="glass-card rounded-2xl p-5 sm:p-6 flex flex-col gap-4">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-3.5 h-3.5 text-amber-400/70 fill-amber-400/70" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-[13px] text-white/45 leading-relaxed break-words font-light">
                &ldquo;{t(`testimonials.quote${n}` as Parameters<typeof t>[0])}&rdquo;
              </blockquote>
              <div className="mt-auto pt-2">
                <div className="text-[13px] font-medium text-white/80">{t(`testimonials.name${n}` as Parameters<typeof t>[0])}</div>
                <div className="text-[11px] text-white/25">{t(`testimonials.role${n}` as Parameters<typeof t>[0])}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
      <section id="pricing" className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">{t("pricing.title")}</h2>
          <p className="text-white/35 text-[15px]">{t("pricing.subtitle")}</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
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
                className={`rounded-2xl p-8 flex flex-col relative ${
                  highlighted
                    ? "glass-card border-violet-500/20 shadow-[0_0_60px_-15px_rgba(139,92,246,0.15)] order-first sm:order-none"
                    : "glass-card"
                }`}
              >
                {highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-violet-500/20 backdrop-blur-md text-violet-300/80 text-[11px] font-medium rounded-full border border-violet-500/20">
                    Most Popular
                  </div>
                )}
                <div className="font-semibold text-lg mb-1 text-white/90">{t(`pricing.${plan}.name` as Parameters<typeof t>[0])}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-3xl font-bold text-white/90">{t(`pricing.${plan}.price` as Parameters<typeof t>[0])}</span>
                  {plan !== "enterprise" && <span className="text-white/25 text-sm">/mo</span>}
                </div>
                <div className="text-white/30 text-[13px] mb-7">{t(`pricing.${plan}.desc` as Parameters<typeof t>[0])}</div>
                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-[13px] text-white/50">
                      <CheckIcon className="w-4 h-4 text-emerald-400/60 shrink-0 mt-0.5" />
                      {t(`pricing.features.${f}` as Parameters<typeof t>[0])}
                    </li>
                  ))}
                </ul>
                {plan === "enterprise" ? (
                  <Link
                    href="/contact"
                    className="block text-center py-3 rounded-xl font-medium text-[13px] transition-all duration-300 glass-btn-secondary text-white/60"
                  >
                    {t(`pricing.${plan}.cta` as Parameters<typeof t>[0])}
                  </Link>
                ) : isLoggedIn ? (
                  userPlan === plan ? (
                    <div className="block text-center py-3 rounded-xl text-[13px] font-medium text-emerald-400/70 border border-emerald-500/15 bg-emerald-500/[0.04]">
                      {"\u2713"} {t("pricing.currentPlan")}
                    </div>
                  ) : plan === "pro" ? (
                    <Link
                      href="/dashboard/billing"
                      className="block text-center py-3 rounded-xl font-medium text-[13px] transition-all duration-300 glass-btn-primary text-white"
                    >
                      {t("pricing.upgradeToPro")}
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      className="block text-center py-3 rounded-xl font-medium text-[13px] transition-all duration-300 glass-btn-secondary text-white/60"
                    >
                      {t("nav.dashboard")}
                    </Link>
                  )
                ) : (
                  <Link
                    href="/sign-up"
                    className={`block text-center py-3 rounded-xl font-medium text-[13px] transition-all duration-300 ${
                      highlighted
                        ? "glass-btn-primary text-white"
                        : "glass-btn-secondary text-white/60"
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

      {/* ── Resources ────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3 tracking-tight">Guides &amp; Resources</h2>
          <p className="text-white/35 text-[13px] max-w-xl mx-auto">Tutorials, comparisons, and integration guides to help you get the most out of AI customer support.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-8">
          {[
            { href: "/blog/how-to-build-telegram-chatbot", tag: "Tutorial", tagColor: "text-blue-400/70 bg-blue-400/8", title: "How to Build a Telegram AI Chatbot in 10 Minutes", desc: "Step-by-step setup with BotFather, API keys, and going live." },
            { href: "/blog/best-ai-models-for-customer-support", tag: "Comparison", tagColor: "text-violet-400/70 bg-violet-400/8", title: "GPT-4o vs Claude vs Gemini: Best AI for Customer Support", desc: "Which LLM wins on accuracy, tone, speed, and cost?" },
            { href: "/integrations/telegram", tag: "Integration", tagColor: "text-white/40 bg-white/[0.04]", title: "Telegram AI Chatbot — Full Integration Guide", desc: "Connect GPT-4 to your Telegram channel in 3 minutes." },
            { href: "/integrations/whatsapp", tag: "Integration", tagColor: "text-white/40 bg-white/[0.04]", title: "WhatsApp Business AI Chatbot Setup Guide", desc: "Add AI to your WhatsApp Business number via Twilio." },
            { href: "/compare/tidio", tag: "Compare", tagColor: "text-white/40 bg-white/[0.04]", title: "OpenHelix vs Tidio — Full Feature Comparison", desc: "Features, pricing, and when to choose each." },
            { href: "/compare/intercom", tag: "Compare", tagColor: "text-white/40 bg-white/[0.04]", title: "OpenHelix vs Intercom — Is the Price Worth It?", desc: "Honest comparison for SMBs evaluating Intercom." },
            { href: "/use-cases/ecommerce", tag: "Use Case", tagColor: "text-emerald-400/70 bg-emerald-400/8", title: "AI Chatbot for Ecommerce Stores", desc: "Order tracking, returns, and cart recovery — automated." },
            { href: "/compare/zendesk", tag: "Compare", tagColor: "text-white/40 bg-white/[0.04]", title: "OpenHelix vs Zendesk — 90% Cheaper Alternative", desc: "$55/agent/month vs $0 to start. Full comparison." },
            { href: "/compare/livechat", tag: "Compare", tagColor: "text-white/40 bg-white/[0.04]", title: "OpenHelix vs LiveChat — 80% Cost Reduction", desc: "$52/agent/month vs AI at $29/month. See the difference." },
            { href: "/use-cases/restaurant", tag: "Use Case", tagColor: "text-orange-400/70 bg-orange-400/8", title: "AI Chatbot for Restaurants", desc: "Reservations, menu Q&A, hours — answered 24/7." },
            { href: "/use-cases/healthcare", tag: "Use Case", tagColor: "text-rose-400/70 bg-rose-400/8", title: "AI Support for Healthcare & Clinics", desc: "Patient inquiries, appointments, FAQs — automated." },
            { href: "/use-cases/fintech", tag: "Use Case", tagColor: "text-cyan-400/70 bg-cyan-400/8", title: "AI Support for Fintech", desc: "Account FAQs, transactions, onboarding — 24/7." },
            { href: "/use-cases/real-estate", tag: "Use Case", tagColor: "text-amber-400/70 bg-amber-400/8", title: "AI Chatbot for Real Estate", desc: "Lead qualification, property Q&A, viewings." },
            { href: "/blog/how-to-automate-ecommerce-customer-support", tag: "Playbook", tagColor: "text-blue-400/70 bg-blue-400/8", title: "Ecommerce Support Automation Playbook", desc: "Step-by-step: audit → knowledge base → 80% automated." },
          ].map((item) => (
            <Link key={item.href} href={item.href} className="group glass-surface rounded-xl p-5 hover:bg-white/[0.05] transition-all duration-300">
              <div className={`text-[11px] ${item.tagColor} px-2 py-0.5 rounded-full inline-block mb-3 border border-white/[0.04]`}>{item.tag}</div>
              <h3 className="font-medium text-white/80 group-hover:text-violet-300/80 transition-colors duration-300 mb-1.5 text-[13px] leading-snug">{item.title}</h3>
              <p className="text-[11px] text-white/25">{item.desc}</p>
            </Link>
          ))}
        </div>
        <div className="text-center">
          <Link href="/blog" className="text-[13px] text-violet-400/60 hover:text-violet-300/80 transition-colors duration-300">{`View all guides \u2192`}</Link>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-14 text-center tracking-tight">{tl("faq.title")}</h2>
          {[
            { q: tl("faq.q1"), a: tl("faq.a1") },
            { q: tl("faq.q2"), a: tl("faq.a2") },
            { q: tl("faq.q3"), a: tl("faq.a3") },
            { q: tl("faq.q4"), a: tl("faq.a4") },
            { q: tl("faq.q5"), a: tl("faq.a5") },
            { q: tl("faq.q6"), a: tl("faq.a6") },
          ].map((item, i) => (
            <details key={i} className="border-b border-white/[0.04] py-6 group">
              <summary className="cursor-pointer list-none flex items-center justify-between text-[14px] font-medium text-white/80">
                {item.q}
                <span className="text-white/20 text-lg group-open:rotate-45 transition-transform duration-300 inline-block shrink-0 ml-4">+</span>
              </summary>
              <div className="text-[13px] text-white/35 mt-4 leading-relaxed">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* ── About / Stats ─────────────────────────────────────────────────── */}
      <section id="about" className="max-w-6xl mx-auto px-4 sm:px-6 py-24">
        <div className="grid md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-5 tracking-tight">{t("about.title")}</h2>
            <p className="text-white/35 leading-relaxed mb-8 text-[15px]">{t("about.subtitle")}</p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 glass-btn-primary px-6 py-3 font-semibold text-[14px] text-white"
            >
              {t("hero.cta")} <ArrowRightIcon className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-4">
            {[
              { icon: RocketLaunchIcon, color: "text-violet-400/80", stat: t("about.setup"), label: t("about.setupLabel") },
              { icon: UserIcon, color: "text-emerald-400/80", stat: t("about.response"), label: t("about.responseLabel") },
              { icon: ShieldCheckIcon, color: "text-blue-400/80", stat: t("about.uptime"), label: t("about.uptimeLabel") },
            ].map((item) => (
              <div key={item.label} className="glass-card rounded-2xl p-5 flex items-center gap-5">
                <div className="w-11 h-11 rounded-[14px] bg-white/[0.05] border border-white/[0.06] flex items-center justify-center shrink-0">
                  <item.icon className={`w-5 h-5 ${item.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white/90">{item.stat}</div>
                  <div className="text-white/30 text-[13px]">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-12 pb-20 sm:pb-12 mb-8">
        <div className="glass-card rounded-2xl p-12 md:p-16 text-center relative overflow-hidden">
          {/* Ambient glow inside CTA */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[200px] bg-violet-500/[0.06] rounded-full blur-[80px]" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-5 relative tracking-tight">
            {t("cta.title")}
          </h2>
          <p className="text-white/35 mb-10 max-w-lg mx-auto relative text-[15px]">
            {t("cta.subtitle")}
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 glass-btn-primary px-8 py-4 font-semibold text-base relative text-white"
          >
            {t("hero.cta")} <ArrowRightIcon className="w-4 h-4" />
          </Link>
          <p className="text-white/15 text-[13px] mt-5 relative">{t("hero.footnote")}</p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="pt-16 pb-8">
        <div className="glass-divider" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12">
          {/* Link columns */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
            {/* Brand */}
            <div className="col-span-2 sm:col-span-3 lg:col-span-1">
              <div className="flex items-center gap-2 mb-3">
                <HelixLogo className="w-5 h-5 text-violet-400/80" size={20} />
                <span className="font-semibold text-white/80 text-[13px]">OpenHelix AI</span>
              </div>
              <p className="text-[12px] text-white/25 leading-relaxed max-w-xs">
                Deploy AI customer support agents for Telegram, WhatsApp, and web. Powered by GPT-4 and Claude.
              </p>
            </div>
            {/* Product */}
            <div>
              <div className="text-[11px] font-medium text-white/30 uppercase tracking-[0.1em] mb-4">Product</div>
              <ul className="space-y-2.5 text-[13px] text-white/30">
                <li><Link href="/pricing" className="hover:text-white/70 transition-colors duration-300">Pricing</Link></li>
                <li><Link href="/templates" className="hover:text-white/70 transition-colors duration-300">Templates</Link></li>
                <li><Link href="/changelog" className="hover:text-white/70 transition-colors duration-300">{t("footer.changelog")}</Link></li>
                <li><Link href="/status" className="hover:text-white/70 transition-colors duration-300">{t("footer.status")}</Link></li>
                <li><Link href="/api-docs" className="hover:text-white/70 transition-colors duration-300">{t("footer.api")}</Link></li>
              </ul>
            </div>
            {/* Integrations */}
            <div>
              <div className="text-[11px] font-medium text-white/30 uppercase tracking-[0.1em] mb-4">Integrations</div>
              <ul className="space-y-2.5 text-[13px] text-white/30">
                <li><Link href="/integrations/telegram" className="hover:text-white/70 transition-colors duration-300">Telegram</Link></li>
                <li><Link href="/integrations/whatsapp" className="hover:text-white/70 transition-colors duration-300">WhatsApp</Link></li>
                <li><Link href="/integrations/discord" className="hover:text-white/70 transition-colors duration-300">Discord</Link></li>
                <li><Link href="/integrations" className="hover:text-white/70 transition-colors duration-300">{`All integrations \u2192`}</Link></li>
              </ul>
            </div>
            {/* Use Cases */}
            <div>
              <div className="text-[11px] font-medium text-white/30 uppercase tracking-[0.1em] mb-4">Use Cases</div>
              <ul className="space-y-2.5 text-[13px] text-white/30">
                <li><Link href="/use-cases/ecommerce" className="hover:text-white/70 transition-colors duration-300">Ecommerce</Link></li>
                <li><Link href="/use-cases/saas" className="hover:text-white/70 transition-colors duration-300">SaaS</Link></li>
                <li><Link href="/use-cases/healthcare" className="hover:text-white/70 transition-colors duration-300">Healthcare</Link></li>
                <li><Link href="/use-cases/fintech" className="hover:text-white/70 transition-colors duration-300">Fintech</Link></li>
                <li><Link href="/use-cases/real-estate" className="hover:text-white/70 transition-colors duration-300">Real Estate</Link></li>
                <li><Link href="/use-cases" className="hover:text-white/70 transition-colors duration-300">{`All use cases \u2192`}</Link></li>
              </ul>
            </div>
            {/* Compare */}
            <div>
              <div className="text-[11px] font-medium text-white/30 uppercase tracking-[0.1em] mb-4">Compare</div>
              <ul className="space-y-2.5 text-[13px] text-white/30">
                <li><Link href="/compare/zendesk" className="hover:text-white/70 transition-colors duration-300">vs Zendesk</Link></li>
                <li><Link href="/compare/freshdesk" className="hover:text-white/70 transition-colors duration-300">vs Freshdesk</Link></li>
                <li><Link href="/compare/tidio" className="hover:text-white/70 transition-colors duration-300">vs Tidio</Link></li>
                <li><Link href="/compare/intercom" className="hover:text-white/70 transition-colors duration-300">vs Intercom</Link></li>
                <li><Link href="/compare/crisp" className="hover:text-white/70 transition-colors duration-300">vs Crisp</Link></li>
                <li><Link href="/compare" className="hover:text-white/70 transition-colors duration-300">{`All comparisons \u2192`}</Link></li>
              </ul>
            </div>
            {/* Resources */}
            <div>
              <div className="text-[11px] font-medium text-white/30 uppercase tracking-[0.1em] mb-4">Resources</div>
              <ul className="space-y-2.5 text-[13px] text-white/30">
                <li><Link href="/blog" className="hover:text-white/70 transition-colors duration-300">Blog</Link></li>
                <li><Link href="/blog/how-to-build-telegram-chatbot" className="hover:text-white/70 transition-colors duration-300">Telegram chatbot guide</Link></li>
                <li><Link href="/blog/best-ai-models-for-customer-support" className="hover:text-white/70 transition-colors duration-300">Best AI models</Link></li>
                <li><Link href="/blog/reduce-customer-support-costs-with-ai" className="hover:text-white/70 transition-colors duration-300">Reduce support costs</Link></li>
                <li><Link href="/contact" className="hover:text-white/70 transition-colors duration-300">{t("nav.contact")}</Link></li>
                <li><Link href="/privacy" className="hover:text-white/70 transition-colors duration-300">{t("footer.privacy")}</Link></li>
                <li><Link href="/terms" className="hover:text-white/70 transition-colors duration-300">{t("footer.terms")}</Link></li>
              </ul>
            </div>
          </div>
          {/* Bottom bar */}
          <div className="glass-divider" />
          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-white/20">
            <span>{t("footer.copyright", { year: 2026 })}</span>
            <Link href="/status" className="flex items-center gap-1.5 hover:text-white/40 transition-colors duration-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500/70" />
              <span>{t("footer.systemStatus")}</span>
            </Link>
          </div>
        </div>
      </footer>

      {/* ── Demo chat widget (fixed position, outside layout flow) ─────── */}
      <LandingDemoChat />
    </div>
  );
}
