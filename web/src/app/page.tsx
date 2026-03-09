import Link from "next/link";
import { Zap, Bot, BarChart3, Headphones, Shield, ArrowRight, Check, Users } from "lucide-react";

export default function LandingPage() {
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
            <a href="#services" className="hover:text-white transition-colors">Services</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#about" className="hover:text-white transition-colors">About</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/sign-in"
              className="text-sm text-zinc-400 hover:text-white transition-colors px-4 py-2"
            >
              Sign in
            </Link>
            <Link
              href="/sign-up"
              className="text-sm bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg font-medium"
            >
              Get started free
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="max-w-7xl mx-auto px-6 pt-24 pb-20 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-8">
          <Zap className="w-3 h-3" />
          AI infrastructure, fully managed
        </div>
        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-tight">
          We forge the AI stack
          <br />
          <span className="gradient-text">so you don&apos;t have to.</span>
        </h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10 leading-relaxed">
          Deploy AI agents, automate workflows, and integrate LLMs into your
          business — without the complexity. Your dedicated manager handles everything.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/sign-up"
            className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-all px-8 py-4 rounded-xl font-semibold text-lg shadow-lg shadow-violet-500/20"
          >
            Start for free <ArrowRight className="w-5 h-5" />
          </Link>
          <a
            href="#services"
            className="flex items-center gap-2 border border-white/10 hover:border-white/20 transition-colors px-8 py-4 rounded-xl font-semibold text-lg text-zinc-300"
          >
            See what we build
          </a>
        </div>
        <p className="mt-4 text-sm text-zinc-500">Free plan includes 1 AI instance · No credit card required</p>
      </section>

      {/* Services */}
      <section id="services" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Everything AI, handled.</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">From simple integrations to full autonomous agent pipelines.</p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              icon: Bot,
              title: "Agent Deployment",
              desc: "Custom AI agents for customer support, ops, and sales — deployed and monitored by us.",
              color: "text-violet-400",
            },
            {
              icon: BarChart3,
              title: "LLM Integrations",
              desc: "Connect GPT-4, Claude, Gemini, or open-source models to your existing stack.",
              color: "text-blue-400",
            },
            {
              icon: Zap,
              title: "Automation Pipelines",
              desc: "Wire AI into your CRM, comms, and data tools. Set it and forget it.",
              color: "text-emerald-400",
            },
            {
              icon: Headphones,
              title: "Ongoing Support",
              desc: "Every account gets a dedicated manager. Not tickets — real humans.",
              color: "text-pink-400",
            },
          ].map((s) => (
            <div key={s.title} className="glow-border rounded-2xl p-6 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
              <s.icon className={`w-8 h-8 ${s.color} mb-4`} />
              <h3 className="font-semibold text-lg mb-2">{s.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Simple pricing.</h2>
          <p className="text-zinc-400">Start free. Scale when you need it.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {[
            {
              name: "Free",
              price: "$0",
              desc: "Perfect to get started",
              features: ["1 AI instance (minimal)", "Dedicated manager", "Community support", "Basic analytics"],
              cta: "Get started",
              highlighted: false,
            },
            {
              name: "Pro",
              price: "By request",
              desc: "For growing teams",
              features: ["Up to 5 AI instances", "Standard tier instances", "Priority support", "Advanced analytics", "Custom integrations"],
              cta: "Request access",
              highlighted: true,
            },
            {
              name: "Enterprise",
              price: "Custom",
              desc: "Full stack, fully managed",
              features: ["Unlimited instances", "Pro tier instances", "Dedicated team", "SLA guarantees", "White-label option", "On-premise available"],
              cta: "Contact us",
              highlighted: false,
            },
          ].map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 ${
                plan.highlighted
                  ? "bg-violet-600/20 border border-violet-500/50 shadow-lg shadow-violet-500/10"
                  : "glow-border bg-white/[0.02]"
              }`}
            >
              {plan.highlighted && (
                <div className="text-xs font-semibold text-violet-300 mb-3 uppercase tracking-widest">Most popular</div>
              )}
              <div className="font-bold text-2xl mb-1">{plan.name}</div>
              <div className="text-3xl font-bold mb-1">{plan.price}</div>
              <div className="text-zinc-400 text-sm mb-6">{plan.desc}</div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm text-zinc-300">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href="/sign-up"
                className={`block text-center py-3 rounded-xl font-semibold text-sm transition-colors ${
                  plan.highlighted
                    ? "bg-violet-600 hover:bg-violet-500"
                    : "border border-white/10 hover:border-white/20 text-zinc-300"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Trust */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="rounded-2xl glow-border bg-white/[0.02] p-12 text-center">
          <Shield className="w-10 h-10 text-violet-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-3">Built for reliability</h2>
          <p className="text-zinc-400 max-w-lg mx-auto">
            Every instance is monitored 24/7. Your dedicated manager proactively handles issues before they affect your business.
          </p>
        </div>
      </section>

      {/* About */}
      <section id="about" className="max-w-7xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">Who we are.</h2>
          <p className="text-zinc-400 max-w-xl mx-auto">
            A small team obsessed with making AI actually useful for real businesses.
          </p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {[
            {
              icon: Users,
              title: "Dedicated managers",
              desc: "Every client gets a real human manager — not a chatbot, not a ticketing system. Someone who actually knows your setup.",
              color: "text-violet-400",
            },
            {
              icon: Zap,
              title: "Fast deployment",
              desc: "We've deployed dozens of AI stacks. We skip the discovery theater and get you running in days, not months.",
              color: "text-emerald-400",
            },
            {
              icon: Shield,
              title: "No lock-in",
              desc: "We work with your existing tools and cloud. No proprietary black boxes — everything we build, you own.",
              color: "text-blue-400",
            },
          ].map((item) => (
            <div key={item.title} className="glow-border rounded-2xl p-6 bg-white/[0.02]">
              <item.icon className={`w-7 h-7 ${item.color} mb-4`} />
              <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
              <p className="text-zinc-400 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
        <div className="text-center mt-12">
          <p className="text-zinc-400 text-sm">
            Questions?{" "}
            <a href="mailto:hello@synapseforge.ai" className="text-violet-400 hover:text-violet-300 transition-colors">
              hello@synapseforge.ai
            </a>
          </p>
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
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="mailto:hello@synapseforge.ai" className="hover:text-white transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
