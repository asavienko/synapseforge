import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Zap, Check, Landmark, Clock, Shield, MessageSquare, Globe, FileText } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Support for Fintech & Financial Services",
  description:
    "Automate account FAQs, transaction questions, onboarding flows for fintech apps and financial services. Compliant, accurate, always available.",
  openGraph: {
    title: "AI Support for Fintech & Financial Services",
    description: "Compliant AI support for fintech — automate account FAQs, transaction questions, and onboarding 24/7 with full audit trails.",
    type: "website",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is OpenHelix AI suitable for financial services compliance?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. OpenHelix AI provides audit logging, data retention controls, and conversation history for compliance requirements. We support GDPR, SOC 2, and can accommodate specific regulatory frameworks. Full audit trails are maintained for all customer interactions." },
    },
    {
      "@type": "Question",
      name: "Can the AI handle sensitive financial account questions?",
      acceptedAnswer: { "@type": "Answer", text: "The AI handles general FAQs about account types, fees, features, and policies. For account-specific inquiries (balances, transactions), the AI can guide users to secure authentication flows or escalate to authenticated support channels. We recommend configuring strict escalation for any account-specific data requests." },
    },
    {
      "@type": "Question",
      name: "Does it support multiple languages for global customers?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. OpenHelix AI supports 50+ languages, enabling you to serve global customers in their preferred language without maintaining separate support teams for each region." },
    },
    {
      "@type": "Question",
      name: "How does the AI escalate complex issues?",
      acceptedAnswer: { "@type": "Answer", text: "You configure escalation triggers based on keywords, sentiment, or conversation complexity. When triggered, the AI provides a warm handoff with full conversation context to your support team, including customer details and prior responses." },
    },
    {
      "@type": "Question",
      name: "Can I integrate this with my existing support systems?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. OpenHelix AI offers REST API and webhook integrations. Connect to your CRM, ticketing system, or existing support stack. We also support embedding via web widget, Telegram, WhatsApp, Discord, and custom channels." },
    },
  ],
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Set Up AI Support for Your Fintech",
  description: "Deploy compliant AI support for financial services in under 30 minutes",
  step: [
    { "@type": "HowToStep", name: "Create your OpenHelix account", text: "Sign up free — no credit card needed. Configure compliance settings for your regulatory requirements." },
    { "@type": "HowToStep", name: "Build your structured knowledge base", text: "Upload account FAQs, fee schedules, feature documentation, and compliance policies. Structure data for accurate retrieval." },
    { "@type": "HowToStep", name: "Configure escalation rules", text: "Set triggers for account-specific questions, regulatory inquiries, and sensitive requests that require human review." },
    { "@type": "HowToStep", name: "Connect your channels and systems", text: "Deploy on web, mobile apps, or messaging platforms. Integrate with your CRM and ticketing systems via API." },
  ],
};

const stats = [
  { value: "70%", label: "of fintech support inquiries are repetitive FAQs" },
  { value: "24/7", label: "availability across all time zones" },
  { value: "<3s", label: "average response time" },
  { value: "100%", label: "conversation audit trail" },
];

const useCases = [
  {
    icon: FileText,
    title: "Account & Feature FAQs",
    desc: "Answer questions about account types, features, eligibility requirements, and platform capabilities instantly and consistently.",
    example: "Customer: 'What's the difference between Basic and Pro accounts?' → AI provides detailed comparison with fees and features",
  },
  {
    icon: MessageSquare,
    title: "Transaction Support",
    desc: "Guide customers through transaction statuses, processing times, and general troubleshooting without accessing sensitive data.",
    example: "Customer: 'How long do wire transfers take?' → AI explains processing times and cut-off requirements",
  },
  {
    icon: Zap,
    title: "Onboarding & Verification",
    desc: "Walk new users through account setup, KYC requirements, and verification processes — reducing drop-off and support tickets.",
    example: "Customer: 'What documents do I need to verify?' → AI provides checklist and guides through submission process",
  },
  {
    icon: Globe,
    title: "Multilingual Global Support",
    desc: "Serve international customers in their native language. One AI agent handles 50+ languages without additional staffing.",
    example: "Customer asks in German, Portuguese, or Japanese → AI responds accurately in the same language",
  },
  {
    icon: Clock,
    title: "24/7 Coverage",
    desc: "Provide instant support outside business hours and across time zones. No customer waits hours for a simple answer.",
    example: "Weekend and holiday inquiries answered immediately with accurate policy information",
  },
  {
    icon: Shield,
    title: "Compliance-First Escalation",
    desc: "Automatically route sensitive requests, complaints, and regulatory questions to specialized teams with full context.",
    example: "Keywords like 'complaint' or 'regulator' trigger immediate escalation with conversation history attached",
  },
];

export default function FintechPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />

      <nav className="border-b border-white/5 bg-[#0a0a0f]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 font-bold text-white">
            <Zap className="w-5 h-5 text-violet-400" />OpenHelix AI
          </Link>
          <Link href="/sign-up" className="flex items-center gap-1.5 bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg text-sm font-semibold">
            Try Free <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </nav>

      <main className="max-w-5xl mx-auto px-4">

        {/* Breadcrumb */}
        <nav className="text-sm text-zinc-500 pt-8 mb-8">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/use-cases" className="hover:text-zinc-300 transition-colors">Use Cases</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">Fintech</span>
        </nav>

        {/* Hero */}
        <section className="py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-6">
              <Landmark className="w-3.5 h-3.5" />
              Fintech AI Chatbot
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight">
              AI Support for <span className="text-violet-400">Fintech & Financial Services</span>
            </h1>
            <p className="text-lg text-zinc-400 mb-8 leading-relaxed max-w-2xl">
              Automate account FAQs, transaction questions, and onboarding flows — 24/7. Compliant, accurate AI support with full audit trails for financial services.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-xl font-semibold">
                Start Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/api-docs" className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 px-6 py-3 rounded-xl text-zinc-300 transition-colors text-sm">
                API Documentation
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-4">No credit card · 2,000 messages free · Full audit trails</p>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {stats.map((s, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-violet-400 mb-1">{s.value}</div>
              <div className="text-xs text-zinc-500 leading-relaxed">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Use cases */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">What Your AI Agent Handles</h2>
          <p className="text-zinc-400 mb-8 max-w-2xl">Train it on your product documentation and policies. It handles routine inquiries while escalating sensitive matters to compliance-trained staff.</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {useCases.map((uc, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-3">
                  <uc.icon className="w-4 h-4 text-violet-400" />
                </div>
                <h3 className="font-semibold mb-2">{uc.title}</h3>
                <p className="text-sm text-zinc-400 mb-3 leading-relaxed">{uc.desc}</p>
                <div className="bg-black/30 rounded-lg p-3 text-xs text-zinc-500 italic leading-relaxed">
                  {uc.example}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-8">Set Up in 4 Steps</h2>
          <div className="space-y-4">
            {[
              { n: "1", title: "Create your account", desc: "Sign up free — no credit card. Configure compliance settings including data retention and audit logging for your regulatory requirements." },
              { n: "2", title: "Build structured knowledge base", desc: "Upload account types, fee schedules, feature documentation, policies, and FAQs. Organize content for accurate, consistent responses." },
              { n: "3", title: "Configure escalation rules", desc: "Set up triggers for account-specific data requests, complaints, regulatory inquiries, and sensitive topics requiring human review." },
              { n: "4", title: "Connect channels and systems", desc: "Deploy on your web app, mobile platform, or messaging channels. Integrate with your CRM, ticketing, and compliance systems via API." },
            ].map((step) => (
              <div key={step.n} className="flex gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-5">
                <div className="w-8 h-8 rounded-full bg-violet-500/20 text-violet-400 font-bold flex items-center justify-center shrink-0 text-sm">{step.n}</div>
                <div>
                  <div className="font-semibold mb-1">{step.title}</div>
                  <div className="text-sm text-zinc-400 leading-relaxed">{step.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Pain points */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Solving Fintech Support Challenges</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-violet-400" />
                High Support Volume
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Fintech apps face massive inquiry volumes around account setup, fees, and transactions. AI deflects 70%+ of routine questions, letting your team focus on complex cases.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-400" />
                Regulatory Compliance
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Financial services require careful handling of complaints and regulatory inquiries. Configurable escalation ensures sensitive matters reach the right team immediately.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-400" />
                24/7 Global Availability
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Customers expect instant answers at any hour. AI provides consistent, accurate responses around the clock across all time zones without staffing overhead.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-violet-400" />
                Multilingual Customers
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Global fintech platforms serve customers in dozens of languages. AI handles multilingual support natively, reducing the need for regional support centers.
              </p>
            </div>
          </div>
        </section>

        {/* Compliance section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Compliance & Security Features</h2>
          <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
              <div className="p-6">
                <h3 className="font-semibold mb-4">Audit & Accountability</h3>
                <ul className="space-y-2">
                  {["Complete conversation history", "Timestamped audit trails", "Agent response tracking", "Exportable compliance reports"].map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />{item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6">
                <h3 className="font-semibold mb-4">Data Protection</h3>
                <ul className="space-y-2">
                  {["SOC 2 Type II certified", "GDPR compliant", "Configurable data retention", "End-to-end encryption"].map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />{item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {faqSchema.mainEntity.map((item, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
                <div className="font-medium mb-2">{item.name}</div>
                <div className="text-sm text-zinc-400 leading-relaxed">{item.acceptedAnswer.text}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="bg-violet-500/10 border border-violet-500/20 rounded-2xl p-8 text-center mb-16">
          <h2 className="text-2xl font-bold mb-2">Start automating your fintech support today</h2>
          <p className="text-zinc-400 text-sm mb-6">Free plan · 2,000 messages · Full audit trails · Live in 30 minutes</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-4 rounded-xl font-semibold text-lg">
            Deploy Your Fintech AI <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        {/* Related */}
        <section className="mb-16 pt-8 border-t border-white/5">
          <div className="text-sm text-zinc-500 mb-4">Related guides</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/use-cases/saas" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">AI Chatbot for SaaS</div><div className="text-xs text-zinc-500 mt-0.5">Onboarding, churn prevention, feature questions</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/api-docs" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">API Documentation</div><div className="text-xs text-zinc-500 mt-0.5">Integrate with your existing systems</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/blog/reduce-customer-support-costs-with-ai" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Reduce Support Costs by 60%</div><div className="text-xs text-zinc-500 mt-0.5">ROI guide with real cost breakdown</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/blog/ai-customer-support-roi-guide" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">AI Customer Support ROI Guide</div><div className="text-xs text-zinc-500 mt-0.5">Calculate your return on investment</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
