import { Link } from "@/i18n/navigation";
import { LocaleSwitcher } from "@/components/LocaleSwitcher";
import { MobileNav } from "@/components/MobileNav";
import { LandingDemoChat } from "@/components/LandingDemoChat";
import { DemoChat } from "@/components/DemoChat";
import { getFeaturedTemplates, categoryColors } from "@/lib/templates";
import {
  Zap, Bot, ArrowRight, Check, Shield, RefreshCw,
  MessageSquare, Code2, Activity, Users, Key, Settings, Rocket,
  Sparkles, CalendarDays,
} from "lucide-react";
import { getTranslations } from "next-intl/server";

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

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white grid-bg">

      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-[#0a0a0f]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between relative">
          <div className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-violet-400" />
            <span className="font-bold text-lg tracking-tight">SynapseForge</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm text-zinc-400">
            <Link href="/templates" className="hover:text-white transition-colors">Templates</Link>
            <a href="#demo" className="hover:text-white transition-colors">Demo</a>
            <a href="#how" className="hover:text-white transition-colors">{t("nav.services")}</a>
            <a href="#pricing" className="hover:text-white transition-colors">{t("nav.pricing")}</a>
            <a href="#about" className="hover:text-white transition-colors">{t("nav.about")}</a>
            <Link href="/contact" className="hover:text-white transition-colors">{t("nav.contact")}</Link>
          </div>
          <div className="flex items-center gap-2 md:gap-3">
            <LocaleSwitcher />
            {isLoggedIn ? (
              <Link
                href="/dashboard"
                className="text-sm bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg font-medium whitespace-nowrap"
              >
                {t("nav.dashboard")}
              </Link>
            ) : (
              <>
                <Link href="/sign-in" className="hidden md:block text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2">
                  {t("nav.signIn")}
                </Link>
                <Link
                  href="/sign-up"
                  className="text-sm bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg font-medium whitespace-nowrap"
                >
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
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-16 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          {t("hero.badge")}
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1] whitespace-pre-line">
          {t("hero.title")}
        </h1>

        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          {t("hero.subtitle")}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6">
          <Link
            href={isLoggedIn ? "/dashboard" : "/sign-up"}
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-all px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-violet-500/20"
          >
            {isLoggedIn ? t("nav.dashboard") : t("hero.cta")} <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/templates"
            className="flex items-center gap-2 border border-white/10 hover:border-white/20 hover:bg-white/[0.03] transition-colors px-8 py-4 rounded-xl font-semibold text-lg text-zinc-300"
          >
            <Sparkles className="w-5 h-5" />
            {t("hero.ctaSecondary")}
          </Link>
          <Link
            href="/contact?subject=Demo+Request"
            className="flex items-center gap-2 border border-violet-500/30 hover:border-violet-500/60 bg-violet-500/5 hover:bg-violet-500/10 transition-colors px-8 py-4 rounded-xl font-semibold text-lg text-violet-300 hover:text-violet-200"
          >
            <CalendarDays className="w-5 h-5" />
            {t("hero.bookDemo")}
          </Link>
        </div>

        <p className="text-sm text-zinc-600">{t("hero.footnote")}</p>

        {/* Channel badges */}
        <div className="flex items-center justify-center gap-3 mt-10">
          {["✈️ Telegram", "🎮 Discord", "💬 Slack", "🌐 Web Chat", "⚡ REST API"].map((ch) => (
            <span
              key={ch}
              className="text-xs px-3 py-1.5 rounded-full border border-white/10 bg-white/[0.03] text-zinc-400"
            >
              {ch}
            </span>
          ))}
        </div>
      </section>

      {/* ── Trust Signal Bar ─────────────────────────────────────────────── */}
      <section className="border-y border-white/5 bg-zinc-900/50 py-4 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-zinc-500">
            <div className="flex items-center gap-2">
              <span className="text-violet-400 font-bold">12+</span>
              <span>{t("trust.businessesRunning")}</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-violet-400 font-bold">24/7</span>
              <span>{t("trust.alwaysOn")}</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-violet-400 font-bold">{"<3min"}</span>
              <span>{t("trust.setupTime")}</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-violet-400 font-bold">€0</span>
              <span>{t("trust.startFree")}</span>
            </div>
            <div className="hidden sm:block w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span>
              <span>{t("trust.noCard")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it Works (SMB steps) ─────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-bold mb-14 text-left md:text-center">
          {tl("howItWorks.title")}
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { num: tl("howItWorks.step1.num"), icon: MessageSquare, title: tl("howItWorks.step1.title"), desc: tl("howItWorks.step1.desc") },
            { num: tl("howItWorks.step2.num"), icon: Settings,      title: tl("howItWorks.step2.title"), desc: tl("howItWorks.step2.desc") },
            { num: tl("howItWorks.step3.num"), icon: Rocket,        title: tl("howItWorks.step3.title"), desc: tl("howItWorks.step3.desc") },
          ].map((step, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-2xl p-6">
              <div className="text-5xl font-bold text-violet-600/20 mb-4">{step.num}</div>
              <step.icon className="w-6 h-6 text-violet-400 mb-4" />
              <h3 className="font-semibold text-base mb-2 text-white">{step.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Templates Section ────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-4">
              <Sparkles className="w-3.5 h-3.5" />
              Pre-Built Templates
            </div>
            <h2 className="text-3xl md:text-4xl font-bold">
              Deploy in Minutes, Not Days
            </h2>
            <p className="text-zinc-400 mt-2 max-w-xl">
              Skip the setup. Start with a proven template and customize it to fit your needs.
            </p>
          </div>
          <Link
            href="/templates"
            className="inline-flex items-center gap-2 text-violet-400 hover:text-violet-300 font-medium"
          >
            View All Templates
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredTemplates.map((template) => (
            <Link key={template.id} href={`/templates/${template.id}`} className="group">
              <div className="glow-border rounded-2xl p-6 bg-white/[0.02] hover:bg-white/[0.04] transition-all duration-300 h-full flex flex-col">
                <div className="flex items-start justify-between mb-4">
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-300">
                    {template.icon}
                  </span>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium border ${categoryColors[template.category]}`}>
                    {template.category}
                  </span>
                </div>
                <h3 className="font-semibold text-white mb-2 group-hover:text-violet-300 transition-colors">
                  {template.name}
                </h3>
                <p className="text-sm text-zinc-400 flex-1 line-clamp-2">
                  {template.shortDescription}
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-white/5">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium border ${
                    template.difficulty === "beginner"
                      ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                      : template.difficulty === "intermediate"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-red-500/10 text-red-400 border-red-500/20"
                  }`}>
                    {template.difficulty}
                  </span>
                  <span className="text-sm text-violet-400 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                    Use
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("how.title")}</h2>
          <p className="text-zinc-400">{t("how.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {[
            {
              step: "01",
              icon: Key,
              color: "text-violet-400",
              bg: "bg-violet-600/10 border-violet-500/20",
              title: t("how.step1title"),
              desc: t("how.step1desc"),
            },
            {
              step: "02",
              icon: Zap,
              color: "text-emerald-400",
              bg: "bg-emerald-600/10 border-emerald-500/20",
              title: t("how.step2title"),
              desc: t("how.step2desc"),
            },
            {
              step: "03",
              icon: MessageSquare,
              color: "text-blue-400",
              bg: "bg-blue-600/10 border-blue-500/20",
              title: t("how.step3title"),
              desc: t("how.step3desc"),
            },
          ].map((s, i) => (
            <div key={i} className="relative">
              {/* Connector line */}
              {i < 2 && (
                <div className="hidden md:block absolute top-10 left-[calc(100%+8px)] w-[calc(100%-16px)] h-px bg-gradient-to-r from-white/10 to-transparent z-10" />
              )}
              <div className="glow-border rounded-2xl p-7 bg-white/[0.02] h-full">
                <div className={`w-12 h-12 rounded-xl border flex items-center justify-center mb-5 ${s.bg}`}>
                  <s.icon className={`w-6 h-6 ${s.color}`} />
                </div>
                <div className="text-xs text-zinc-600 font-mono mb-2">Step {s.step}</div>
                <h3 className="text-lg font-semibold text-white mb-3">{s.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Terminal demo */}
        <div className="mt-14 max-w-2xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-black/60 overflow-hidden shadow-2xl">
            <div className="flex items-center gap-2 px-5 py-3 border-b border-white/10 bg-white/[0.03]">
              <span className="w-3 h-3 rounded-full bg-red-500/60" />
              <span className="w-3 h-3 rounded-full bg-amber-500/60" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
              <span className="ml-3 text-xs text-zinc-500 font-mono">{t("demo.terminalTitle")}</span>
            </div>
            <div className="px-5 py-4 font-mono text-sm space-y-2">
              {[
                { text: t("demo.line1"), delay: "0ms" },
                { text: t("demo.line2"), delay: "400ms" },
                { text: t("demo.line3"), delay: "800ms" },
                { text: t("demo.line4"), delay: "1200ms" },
                { text: t("demo.line5"), delay: "1600ms" },
              ].map((line, i) => (
                <div key={i} className="text-emerald-400">{line.text}</div>
              ))}
              <div className="text-white font-semibold pt-2 border-t border-white/10 mt-3">
                {t("demo.done")}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Product Preview ──────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Your AI command center</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">Everything you need to deploy, monitor, and chat with your AI agent — in one clean dashboard.</p>
        </div>

        {/* Browser mockup */}
        <div className="max-w-5xl mx-auto">
          <div className="rounded-2xl border border-white/10 bg-black/60 overflow-hidden shadow-2xl shadow-violet-500/5">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.03]">
              <span className="w-3 h-3 rounded-full bg-red-500/60" />
              <span className="w-3 h-3 rounded-full bg-amber-500/60" />
              <span className="w-3 h-3 rounded-full bg-emerald-500/60" />
              <div className="flex-1 mx-4">
                <div className="bg-white/5 border border-white/10 rounded-md px-3 py-1 text-xs text-zinc-500 font-mono max-w-xs mx-auto text-center">
                  app.synapseforge.ai/dashboard
                </div>
              </div>
            </div>

            {/* Dashboard layout */}
            <div className="flex" style={{ minHeight: 420 }}>
              {/* Sidebar */}
              <div className="w-52 border-r border-white/5 bg-white/[0.01] p-3 shrink-0 hidden md:block">
                <div className="flex items-center gap-2 px-2 py-3 mb-4">
                  <div className="w-6 h-6 rounded bg-violet-600 flex items-center justify-center">
                    <span className="text-white text-xs font-bold">S</span>
                  </div>
                  <span className="text-xs font-semibold text-white">SynapseForge</span>
                </div>
                {[
                  { label: "Overview", active: false, dot: null },
                  { label: "AI Instances", active: true, dot: null },
                  { label: "Messages", active: false, dot: "2" },
                  { label: "Billing", active: false, dot: null },
                  { label: "Settings", active: false, dot: null },
                ].map((item) => (
                  <div key={item.label} className={`flex items-center justify-between px-3 py-2 rounded-lg mb-0.5 text-xs ${item.active ? "bg-violet-600/20 text-violet-300" : "text-zinc-500"}`}>
                    <span>{item.label}</span>
                    {item.dot && (
                      <span className="w-4 h-4 rounded-full bg-violet-600 text-white text-[10px] flex items-center justify-center font-bold">{item.dot}</span>
                    )}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="flex-1 p-5 overflow-hidden">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="text-sm font-semibold text-white">AI Instances</h2>
                  <div className="text-xs bg-violet-600/80 text-white px-3 py-1.5 rounded-lg font-medium">+ New Instance</div>
                </div>

                {/* Instance cards */}
                {[
                  { name: "Customer Support Bot", type: "Support", status: "running", health: "healthy", model: "GPT-4o", msgs: "1,248" },
                  { name: "Sales Assistant", type: "Sales", status: "running", health: "healthy", model: "Claude Sonnet", msgs: "893" },
                  { name: "Internal Helpdesk", type: "Internal", status: "stopped", health: null, model: "GPT-4 Turbo", msgs: "412" },
                ].map((inst) => (
                  <div key={inst.name} className="flex items-center gap-3 p-3 rounded-xl border border-white/5 bg-white/[0.02] mb-2 hover:bg-white/[0.04] transition-colors cursor-pointer">
                    <div className="w-8 h-8 rounded-lg bg-zinc-800 border border-white/5 flex items-center justify-center shrink-0">
                      <span className="text-zinc-400 text-xs">🤖</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium text-white truncate">{inst.name}</div>
                      <div className="text-[11px] text-zinc-600">{inst.type} · {inst.model}</div>
                    </div>
                    <div className="text-[11px] text-zinc-500 hidden sm:block">{inst.msgs} msgs</div>
                    <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium ${inst.status === "running" ? "bg-emerald-500/10 text-emerald-400" : "bg-zinc-700/50 text-zinc-500"}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${inst.status === "running" ? "bg-emerald-400" : "bg-zinc-500"}`} />
                      {inst.status}
                    </div>
                  </div>
                ))}

                {/* Manager card */}
                <div className="mt-4 flex items-center gap-3 p-3 rounded-xl border border-violet-500/20 bg-violet-500/5">
                  <div className="w-8 h-8 rounded-full bg-violet-600/30 border border-violet-500/30 flex items-center justify-center shrink-0">
                    <span className="text-violet-300 text-xs font-bold">M</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[11px] text-zinc-500 mb-0.5">Your dedicated manager</div>
                    <div className="text-xs font-medium text-white">Alex Kim · alex@synapseforge.ai</div>
                  </div>
                  <div className="text-[11px] bg-violet-600/20 text-violet-300 px-2 py-1 rounded-lg">Message</div>
                </div>
              </div>
            </div>
          </div>

          {/* Feature callouts below mockup */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
            {[
              { emoji: "⚡", label: "Live in 3 minutes", desc: "One click to deploy" },
              { emoji: "🤖", label: "Any LLM model", desc: "OpenAI, Claude, custom" },
              { emoji: "👤", label: "Human manager", desc: "Real expert on your account" },
              { emoji: "📊", label: "Full analytics", desc: "Usage, tokens, uptime" },
            ].map((item) => (
              <div key={item.label} className="rounded-xl border border-white/5 bg-white/[0.02] p-3 text-center">
                <div className="text-xl mb-1">{item.emoji}</div>
                <div className="text-xs font-semibold text-white">{item.label}</div>
                <div className="text-[11px] text-zinc-600 mt-0.5">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features grid ────────────────────────────────────────────────── */}
      <section id="features" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("features.title")}</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">{t("features.subtitle")}</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[
            { icon: MessageSquare, color: "text-violet-400", title: t("features.f1title"), desc: t("features.f1desc") },
            { icon: Code2,         color: "text-blue-400",   title: t("features.f2title"), desc: t("features.f2desc") },
            { icon: RefreshCw,     color: "text-emerald-400", title: t("features.f3title"), desc: t("features.f3desc") },
            { icon: Users,         color: "text-pink-400",   title: t("features.f4title"), desc: t("features.f4desc") },
            { icon: Shield,        color: "text-amber-400",  title: t("features.f5title"), desc: t("features.f5desc") },
            { icon: Activity,      color: "text-cyan-400",   title: t("features.f6title"), desc: t("features.f6desc") },
          ].map((f, i) => (
            <div key={i} className="glow-border rounded-2xl p-6 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <f.icon className={`w-7 h-7 ${f.color} mb-4`} />
              <h3 className="font-semibold text-base mb-2">{f.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Live Demo ── */}
      <section id="demo" className="py-24 px-6">
        <div className="max-w-4xl mx-auto text-center mb-12">
          <span className="text-xs font-semibold tracking-widest text-violet-400 uppercase">Live Demo</span>
          <h2 className="text-3xl md:text-4xl font-bold mt-3 mb-4">See it in action</h2>
          <p className="text-zinc-400 text-lg">Chat with a real AI agent — no sign-up required.</p>
        </div>
        <div className="max-w-2xl mx-auto">
          <DemoChat />
        </div>
      </section>

      {/* ── Case Study ──────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 text-xs text-violet-400 bg-violet-500/10 border border-violet-500/20 rounded-full px-3 py-1 mb-4">
            <span>★</span>
            <span>{t("caseStudy.badge")}</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("caseStudy.title")}</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">{t("caseStudy.subtitle")}</p>
        </div>

        <div className="bg-zinc-900 border border-white/5 rounded-2xl p-8 md:p-12 max-w-4xl mx-auto">
          {/* Metrics row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8 pb-8 border-b border-white/5">
            <div className="text-center">
              <div className="text-3xl font-bold text-violet-400 mb-1">{t("caseStudy.metric1value")}</div>
              <div className="text-xs text-zinc-500">{t("caseStudy.metric1label")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-emerald-400 mb-1">{t("caseStudy.metric2value")}</div>
              <div className="text-xs text-zinc-500">{t("caseStudy.metric2label")}</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-amber-400 mb-1">{t("caseStudy.metric3value")}</div>
              <div className="text-xs text-zinc-500">{t("caseStudy.metric3label")}</div>
            </div>
          </div>

          {/* Quote */}
          <blockquote className="text-lg text-zinc-300 italic mb-6 leading-relaxed">
            &ldquo;{t("caseStudy.quote")}&rdquo;
          </blockquote>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center text-violet-400 font-bold text-sm">EM</div>
            <div>
              <div className="text-white font-medium text-sm">{t("caseStudy.name")}</div>
              <div className="text-zinc-500 text-xs">{t("caseStudy.role")}</div>
            </div>
            <div className="ml-auto flex gap-2">
              {/* Channel badges */}
              <span className="text-xs bg-emerald-500/10 text-emerald-400 px-2 py-1 rounded-full border border-emerald-500/20">WhatsApp</span>
              <span className="text-xs bg-pink-500/10 text-pink-400 px-2 py-1 rounded-full border border-pink-500/20">Instagram</span>
              <span className="hidden sm:block text-xs bg-violet-500/10 text-violet-400 px-2 py-1 rounded-full border border-violet-500/20">{t("caseStudy.webWidget")}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">{t("testimonials.title")}</h2>
          <p className="text-zinc-400">{t("testimonials.subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {([1, 2, 3] as const).map((n) => (
            <div key={n} className="bg-white/[0.02] border border-white/8 rounded-2xl p-6 flex flex-col gap-4">
              <div className="flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <svg key={i} className="w-4 h-4 text-amber-400 fill-amber-400" viewBox="0 0 20 20" aria-hidden="true">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                ))}
              </div>
              <blockquote className="text-sm text-zinc-300 leading-relaxed flex-1">
                &ldquo;{t(`testimonials.quote${n}` as Parameters<typeof t>[0])}&rdquo;
              </blockquote>
              <div>
                <div className="text-sm font-semibold text-white">{t(`testimonials.name${n}` as Parameters<typeof t>[0])}</div>
                <div className="text-xs text-zinc-500">{t(`testimonials.role${n}` as Parameters<typeof t>[0])}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Pricing ──────────────────────────────────────────────────────── */}
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
                className={`rounded-2xl p-8 flex flex-col ${
                  highlighted
                    ? "bg-violet-600/20 border border-violet-500/50 shadow-lg shadow-violet-500/10 relative"
                    : "glow-border bg-white/[0.02]"
                }`}
              >
                {highlighted && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 text-xs font-semibold text-white bg-violet-600 px-3 py-1 rounded-full uppercase tracking-widest">
                    {t("pricing.popular")}
                  </div>
                )}
                <div className="font-bold text-xl mb-1">{t(`pricing.${plan}.name` as Parameters<typeof t>[0])}</div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-bold">{t(`pricing.${plan}.price` as Parameters<typeof t>[0])}</span>
                  {plan !== "enterprise" && <span className="text-zinc-500 text-sm">/mo</span>}
                </div>
                <div className="text-zinc-500 text-sm mb-6">{t(`pricing.${plan}.desc` as Parameters<typeof t>[0])}</div>
                <ul className="space-y-3 mb-8 flex-1">
                  {features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      {t(`pricing.features.${f}` as Parameters<typeof t>[0])}
                    </li>
                  ))}
                </ul>
                {plan === "enterprise" ? (
                  <Link
                    href="/contact"
                    className="block text-center py-3 rounded-xl font-semibold text-sm transition-colors border border-white/10 hover:border-white/20 text-zinc-300"
                  >
                    {t(`pricing.${plan}.cta` as Parameters<typeof t>[0])}
                  </Link>
                ) : isLoggedIn ? (
                  userPlan === plan ? (
                    <div className="block text-center py-3 rounded-xl text-sm font-semibold text-emerald-400 border border-emerald-500/30 bg-emerald-500/5">
                      ✓ {t("pricing.currentPlan")}
                    </div>
                  ) : plan === "pro" ? (
                    <Link
                      href="/dashboard/billing"
                      className="block text-center py-3 rounded-xl font-semibold text-sm transition-colors bg-violet-600 hover:bg-violet-500 text-white"
                    >
                      {t("pricing.upgradeToPro")}
                    </Link>
                  ) : (
                    <Link
                      href="/dashboard"
                      className="block text-center py-3 rounded-xl font-semibold text-sm transition-colors border border-white/10 hover:border-white/20 text-zinc-300"
                    >
                      {t("nav.dashboard")}
                    </Link>
                  )
                ) : (
                  <Link
                    href="/sign-up"
                    className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                      highlighted
                        ? "bg-violet-600 hover:bg-violet-500 text-white"
                        : "border border-white/10 hover:border-white/20 text-zinc-300"
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

      {/* ── FAQ ──────────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">{tl("faq.title")}</h2>
          {[
            { q: tl("faq.q1"), a: tl("faq.a1") },
            { q: tl("faq.q2"), a: tl("faq.a2") },
            { q: tl("faq.q3"), a: tl("faq.a3") },
            { q: tl("faq.q4"), a: tl("faq.a4") },
            { q: tl("faq.q5"), a: tl("faq.a5") },
            { q: tl("faq.q6"), a: tl("faq.a6") },
          ].map((item, i) => (
            <details key={i} className="border-b border-white/5 py-4 group">
              <summary className="cursor-pointer list-none flex items-center justify-between text-sm font-medium text-white">
                {item.q}
                <span className="text-zinc-500 text-lg group-open:rotate-45 transition-transform inline-block shrink-0 ml-4">+</span>
              </summary>
              <div className="text-sm text-zinc-400 mt-3 leading-relaxed">{item.a}</div>
            </details>
          ))}
        </div>
      </section>

      {/* ── About / Stats ─────────────────────────────────────────────────── */}
      <section id="about" className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center max-w-5xl mx-auto">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold mb-5">{t("about.title")}</h2>
            <p className="text-zinc-400 leading-relaxed mb-8">{t("about.subtitle")}</p>
            <Link
              href="/sign-up"
              className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-xl font-semibold text-sm"
            >
              {t("hero.cta")} <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-5">
            {[
              { icon: Zap,    color: "text-violet-400", stat: t("about.setup"),    label: t("about.setupLabel") },
              { icon: Users,  color: "text-emerald-400", stat: t("about.response"), label: t("about.responseLabel") },
              { icon: Shield, color: "text-blue-400",   stat: t("about.uptime"),   label: t("about.uptimeLabel") },
            ].map((item) => (
              <div key={item.label} className="glow-border rounded-2xl p-5 bg-white/[0.02] flex items-center gap-5">
                <div className="w-12 h-12 rounded-xl bg-white/[0.04] flex items-center justify-center shrink-0">
                  <item.icon className={`w-6 h-6 ${item.color}`} />
                </div>
                <div>
                  <div className="text-2xl font-bold text-white">{item.stat}</div>
                  <div className="text-zinc-500 text-sm">{item.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA banner ───────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 py-12 mb-8">
        <div className="rounded-2xl border border-violet-500/30 bg-violet-600/10 p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 to-transparent pointer-events-none" />
          <h2 className="text-3xl md:text-4xl font-bold mb-4 relative">
            Ready to deploy your AI agent?
          </h2>
          <p className="text-zinc-400 mb-8 max-w-lg mx-auto relative">
            Join teams that use SynapseForge to run AI agents 24/7 — without managing infrastructure.
          </p>
          <Link
            href="/sign-up"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-4 rounded-xl font-semibold text-lg relative"
          >
            {t("hero.cta")} <ArrowRight className="w-5 h-5" />
          </Link>
          <p className="text-zinc-600 text-sm mt-4 relative">{t("hero.footnote")}</p>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-400" />
            <span className="font-semibold text-zinc-400">SynapseForge</span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="hover:text-white transition-colors">{t("footer.privacy")}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{t("footer.terms")}</Link>
            <Link href="/contact" className="hover:text-white transition-colors">{t("footer.contact")}</Link>
          </div>
          <Link href="/status" className="flex items-center gap-1.5 hover:text-white transition-colors">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-xs">All systems operational</span>
          </Link>
        </div>
      </footer>

      {/* ── Demo chat widget (fixed position, outside layout flow) ─────── */}
      <LandingDemoChat />
    </div>
  );
}
