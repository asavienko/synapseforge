import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Zap, Check, HeartPulse, Clock, Shield, MessageSquare, Globe, UserPlus } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Customer Support for Healthcare & Clinics",
  description:
    "Automate patient inquiries, appointment booking, FAQ responses for clinics and healthcare providers. HIPAA-aware AI support that works 24/7.",
  openGraph: {
    title: "AI Customer Support for Healthcare & Clinics",
    description: "HIPAA-aware AI support for healthcare — automate patient inquiries, appointment booking, and FAQ responses 24/7.",
    type: "website",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Is OpenHelix AI HIPAA compliant?",
      acceptedAnswer: { "@type": "Answer", text: "OpenHelix AI can be configured for HIPAA compliance with a BAA (Business Associate Agreement). We offer encryption at rest and in transit, audit logging, and data retention controls. Contact our team for healthcare-specific security requirements." },
    },
    {
      "@type": "Question",
      name: "Can the AI schedule patient appointments?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. The AI can integrate with your practice management system to check availability and book appointments. It can also handle rescheduling, cancellations, and appointment reminders via SMS or email." },
    },
    {
      "@type": "Question",
      name: "What types of healthcare questions can the AI handle?",
      acceptedAnswer: { "@type": "Answer", text: "The AI excels at administrative questions: appointment scheduling, office hours, insurance acceptance, preparation instructions for procedures, and general clinic policies. It does not provide medical advice and escalates clinical questions to your staff." },
    },
    {
      "@type": "Question",
      name: "Does it support multiple languages for diverse patient populations?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. OpenHelix AI supports 50+ languages out of the box. Patients can ask questions in their preferred language, and the AI responds naturally — no additional configuration needed." },
    },
    {
      "@type": "Question",
      name: "How does escalation to human staff work?",
      acceptedAnswer: { "@type": "Answer", text: "You configure escalation triggers — e.g., when a patient mentions pain symptoms, medication questions, or requests to speak with a doctor. The AI captures the full conversation context and routes to the appropriate department with patient details intact." },
    },
  ],
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Set Up AI Patient Support for Your Clinic",
  description: "Deploy HIPAA-aware AI support for your healthcare practice in under 30 minutes",
  step: [
    { "@type": "HowToStep", name: "Create your OpenHelix account", text: "Sign up free — no credit card needed. Contact sales for BAA and HIPAA configuration." },
    { "@type": "HowToStep", name: "Upload your clinic knowledge base", text: "Include office hours, accepted insurance, appointment policies, preparation instructions, and FAQ." },
    { "@type": "HowToStep", name: "Configure escalation rules", text: "Set triggers for medical questions, urgent requests, and patients asking to speak with staff." },
    { "@type": "HowToStep", name: "Connect your channels", text: "Add web chat to your patient portal, connect SMS, or deploy on WhatsApp for convenient access." },
  ],
};

const stats = [
  { value: "60%", label: "of patient calls are appointment-related" },
  { value: "24/7", label: "availability for patient inquiries" },
  { value: "50+", label: "languages supported natively" },
  { value: "80%", label: "reduction in front-desk call volume" },
];

const useCases = [
  {
    icon: Clock,
    title: "Appointment Booking & Reminders",
    desc: "Patients can check availability and book appointments anytime. Automatic reminders reduce no-shows by up to 30%.",
    example: "Patient: 'When is the next available slot for Dr. Smith?' → AI checks calendar and books the appointment instantly",
  },
  {
    icon: Shield,
    title: "Insurance & Billing Questions",
    desc: "Answer questions about accepted insurance, co-pays, payment options, and billing policies — instantly and accurately.",
    example: "Patient: 'Do you accept Blue Cross?' → AI provides insurance information and verifies coverage requirements",
  },
  {
    icon: MessageSquare,
    title: "Pre-Visit Instructions",
    desc: "Automatically provide preparation instructions for procedures, required documents, and what to bring to appointments.",
    example: "Patient: 'What do I need to bring for my MRI?' → AI provides preparation checklist and facility directions",
  },
  {
    icon: Globe,
    title: "Multilingual Patient Support",
    desc: "Serve diverse patient populations in their preferred language. No additional staff or translation services needed.",
    example: "Patient asks in Spanish, Mandarin, or Arabic → AI responds naturally in the same language",
  },
  {
    icon: HeartPulse,
    title: "After-Hours Coverage",
    desc: "Capture patient inquiries after hours, provide immediate answers for routine questions, and escalate urgent requests appropriately.",
    example: "10 PM inquiry about office hours answered instantly; urgent requests routed to on-call staff",
  },
  {
    icon: UserPlus,
    title: "New Patient Onboarding",
    desc: "Guide new patients through registration, intake forms, and first appointment scheduling — reducing administrative overhead.",
    example: "New patient: 'How do I become a patient?' → AI sends intake forms and schedules initial consultation",
  },
];

export default function HealthcarePage() {
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
          <span className="text-zinc-300">Healthcare</span>
        </nav>

        {/* Hero */}
        <section className="py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-6">
              <HeartPulse className="w-3.5 h-3.5" />
              Healthcare AI Chatbot
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight">
              AI Customer Support for <span className="text-violet-400">Healthcare & Clinics</span>
            </h1>
            <p className="text-lg text-zinc-400 mb-8 leading-relaxed max-w-2xl">
              Automate patient inquiries, appointment booking, and FAQ responses — 24/7. HIPAA-aware AI support designed for clinics, practices, and healthcare providers.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-xl font-semibold">
                Start Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 px-6 py-3 rounded-xl text-zinc-300 transition-colors text-sm">
                HIPAA Compliance Info
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-4">No credit card · 2,000 messages free · BAA available</p>
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
          <p className="text-zinc-400 mb-8 max-w-2xl">Train it once on your clinic&apos;s policies and procedures. It handles administrative tasks — while escalating clinical questions to your staff.</p>
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
              { n: "1", title: "Create your account", desc: "Sign up free — no credit card. Contact us for BAA execution and HIPAA configuration guidance." },
              { n: "2", title: "Upload your clinic knowledge", desc: "Include office hours, accepted insurance plans, appointment policies, preparation instructions, and frequently asked questions." },
              { n: "3", title: "Configure escalation rules", desc: "Set up automatic handoff to staff when patients ask clinical questions, mention symptoms, or request to speak with a provider." },
              { n: "4", title: "Go live on your channels", desc: "Deploy web chat on your patient portal, enable SMS responses, or connect WhatsApp Business for convenient patient access." },
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
          <h2 className="text-2xl font-bold mb-6">Solving Healthcare&apos;s Biggest Support Challenges</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-400" />
                Appointment FAQs
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Your front desk spends hours daily answering appointment questions. AI handles availability checks, booking, rescheduling, and reminders — freeing staff for in-office patients.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Shield className="w-4 h-4 text-violet-400" />
                Insurance Questions
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Patients constantly ask about coverage, co-pays, and accepted plans. The AI provides accurate, consistent answers from your verified insurance information.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Clock className="w-4 h-4 text-violet-400" />
                After-Hours Coverage
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Many patients research healthcare outside business hours. Capture their inquiries immediately, answer routine questions, and escalate urgent matters to on-call staff.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-violet-400" />
                Multilingual Support
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Serve diverse communities without hiring multilingual staff. The AI communicates naturally in 50+ languages, improving access for non-English speaking patients.
              </p>
            </div>
          </div>
        </section>

        {/* Security section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Security & Compliance</h2>
          <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
              <div className="p-6">
                <h3 className="font-semibold mb-4">Data Protection</h3>
                <ul className="space-y-2">
                  {["Encryption at rest and in transit", "Audit logging of all conversations", "Configurable data retention periods", "SOC 2 Type II certified infrastructure"].map((item, i) => (
                    <li key={i} className="flex gap-2 text-sm text-zinc-300">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />{item}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-6">
                <h3 className="font-semibold mb-4">Healthcare Ready</h3>
                <ul className="space-y-2">
                  {["Business Associate Agreement (BAA) available", "No medical advice by default", "Automatic escalation for clinical questions", "Staff notification for urgent inquiries"].map((item, i) => (
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
          <h2 className="text-2xl font-bold mb-2">Start automating your patient support today</h2>
          <p className="text-zinc-400 text-sm mb-6">Free plan · 2,000 messages · HIPAA configuration available · Live in 30 minutes</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-4 rounded-xl font-semibold text-lg">
            Deploy Your Healthcare AI <ArrowRight className="w-5 h-5" />
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
            <Link href="/integrations/whatsapp" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">WhatsApp for Healthcare</div><div className="text-xs text-zinc-500 mt-0.5">Reach patients on their preferred channel</div></div>
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
