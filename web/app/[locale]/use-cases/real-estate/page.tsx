import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Zap, Check, Building, Clock, Calendar, MessageSquare, Globe, Home } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Chatbots for Real Estate Agencies",
  description:
    "Answer property questions, qualify leads, book viewings automatically. AI support for real estate that works while your agents sleep.",
  openGraph: {
    title: "AI Chatbots for Real Estate Agencies",
    description: "AI support for real estate — qualify leads, answer property questions, and book viewings 24/7 while your agents focus on closing deals.",
    type: "website",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Can the AI chatbot answer specific questions about my property listings?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Upload your property catalog with details like square footage, bedrooms, amenities, pricing, and availability. The AI can answer specific questions about any listing and suggest alternatives if a property doesn't match the buyer's criteria." },
    },
    {
      "@type": "Question",
      name: "How does the AI qualify leads?",
      acceptedAnswer: { "@type": "Answer", text: "The AI asks qualifying questions like budget range, timeline, preferred locations, and must-have features. It scores leads based on responses and can prioritize hot leads for immediate agent follow-up while nurturing longer-term prospects automatically." },
    },
    {
      "@type": "Question",
      name: "Can it integrate with my calendar to book viewings?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. Connect your Google Calendar or Outlook, and the AI can check availability and schedule viewings directly. It sends confirmation details to prospects and calendar invites to your agents automatically." },
    },
    {
      "@type": "Question",
      name: "Does it work for both buyers and renters?",
      acceptedAnswer: { "@type": "Answer", text: "Absolutely. The AI can handle inquiries for sales listings, rental properties, and commercial real estate. Configure different conversation flows or let the AI determine the prospect's needs naturally." },
    },
    {
      "@type": "Question",
      name: "What happens when a lead is ready to make an offer?",
      acceptedAnswer: { "@type": "Answer", text: "The AI recognizes buying signals and escalates immediately to your agents with full context — property interests, viewing history, budget, timeline, and all prior conversation details. Your agents pick up exactly where the AI left off." },
    },
  ],
};

const howToSchema = {
  "@context": "https://schema.org",
  "@type": "HowTo",
  name: "How to Set Up AI Support for Your Real Estate Agency",
  description: "Deploy lead-qualifying AI for your real estate business in under 30 minutes",
  step: [
    { "@type": "HowToStep", name: "Create your OpenHelix account", text: "Sign up free — no credit card needed. Your free plan includes 2,000 messages/month." },
    { "@type": "HowToStep", name: "Upload your property catalog", text: "Add your listings with photos, descriptions, pricing, amenities, and availability. The AI learns your inventory instantly." },
    { "@type": "HowToStep", name: "Configure qualification rules", text: "Set the questions and criteria for qualifying leads. Define what makes a hot lead vs. a long-term prospect." },
    { "@type": "HowToStep", name: "Connect calendar and channels", text: "Link your calendar for booking and deploy the AI on your website, WhatsApp, or Facebook Messenger." },
  ],
};

const stats = [
  { value: "78%", label: "of real estate inquiries come after hours" },
  { value: "24/7", label: "instant response to every inquiry" },
  { value: "3x", label: "faster lead qualification" },
  { value: "50%", label: "more viewings booked automatically" },
];

const useCases = [
  {
    icon: MessageSquare,
    title: "Property Q&A",
    desc: "Answer detailed questions about listings — square footage, bedrooms, amenities, neighborhood info, and availability — instantly and accurately.",
    example: "Prospect: 'Does this home have a pool?&apos; → AI checks listing and provides answer with photos, plus suggests similar properties with pools",
  },
  {
    icon: Zap,
    title: "Lead Qualification",
    desc: "Ask budget, timeline, and requirements to separate serious buyers from browsers. Hot leads get flagged for immediate agent attention.",
    example: "AI asks: 'What's your budget range?' and 'When are you looking to move?' → Scores lead and alerts agent for qualified prospects",
  },
  {
    icon: Calendar,
    title: "Viewing Scheduling",
    desc: "Check agent availability and book viewings directly into calendars. Send confirmations and reminders automatically to reduce no-shows.",
    example: "Prospect: 'Can I see the property this weekend?&apos; → AI checks calendar and books Saturday 2 PM showing with confirmation email",
  },
  {
    icon: Globe,
    title: "Multilingual Buyers",
    desc: "Serve international buyers and diverse communities in their preferred language. Expand your market without language barriers.",
    example: "Prospect asks in Spanish, Chinese, or Arabic → AI responds naturally, making your agency accessible to more buyers",
  },
  {
    icon: Clock,
    title: "After-Hours Coverage",
    desc: "Capture and engage inquiries that come in evenings and weekends. Never lose a lead because your office was closed.",
    example: "Sunday evening inquiry answered immediately, lead qualified, and viewing booked for Monday — before competitors respond",
  },
  {
    icon: Home,
    title: "Neighborhood Expertise",
    desc: "Answer questions about schools, commute times, nearby amenities, and neighborhood features — positioning your agency as the local expert.",
    example: "Prospect: 'How are the schools in this area?&apos; → AI provides school ratings, district info, and family-friendly neighborhood highlights",
  },
];

export default function RealEstatePage() {
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
          <span className="text-zinc-300">Real Estate</span>
        </nav>

        {/* Hero */}
        <section className="py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-6">
              <Building className="w-3.5 h-3.5" />
              Real Estate AI Chatbot
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight">
              AI Chatbots for <span className="text-violet-400">Real Estate Agencies</span>
            </h1>
            <p className="text-lg text-zinc-400 mb-8 leading-relaxed max-w-2xl">
              Answer property questions, qualify leads, and book viewings — automatically, 24/7. AI support that works while your agents focus on closing deals.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-xl font-semibold">
                Start Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/integrations/whatsapp" className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 px-6 py-3 rounded-xl text-zinc-300 transition-colors text-sm">
                WhatsApp Integration
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-4">No credit card · 2,000 messages free · Calendar integration included</p>
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
          <p className="text-zinc-400 mb-8 max-w-2xl">Upload your property catalog once. The AI becomes your 24/7 assistant — answering questions, qualifying buyers, and booking viewings.</p>
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
              { n: "1", title: "Create your account", desc: "Sign up free — no credit card. Your free plan includes 2,000 messages/month and calendar integration." },
              { n: "2", title: "Upload your listings", desc: "Add your property catalog with descriptions, photos, pricing, amenities, and neighborhood details. The AI learns your inventory." },
              { n: "3", title: "Set qualification criteria", desc: "Configure the questions that identify serious buyers. Define hot lead triggers for immediate agent notification." },
              { n: "4", title: "Connect calendar and go live", desc: "Link your calendar for booking, deploy the chatbot on your website or WhatsApp, and start capturing leads 24/7." },
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
          <h2 className="text-2xl font-bold mb-6">Solving Real Estate&apos;s Biggest Challenges</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Zap className="w-4 h-4 text-violet-400" />
                Lead Qualification
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Agents waste time on unqualified inquiries. The AI asks budget, timeline, and requirement questions to identify serious buyers before they ever speak to an agent.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-violet-400" />
                Property FAQs
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Buyers ask the same questions repeatedly — square footage, bedrooms, pet policy, parking. The AI provides instant, accurate answers from your listing data.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="w-4 h-4 text-violet-400" />
                Viewing Scheduling
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                Coordinating viewings consumes hours of agent time. The AI checks availability and books directly into calendars, sending confirmations automatically.
              </p>
            </div>
            <div className="bg-white/[0.02] border border-white/5 rounded-xl p-5">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Globe className="w-4 h-4 text-violet-400" />
                Multilingual Buyers
              </h3>
              <p className="text-sm text-zinc-400 leading-relaxed">
                International buyers and diverse communities prefer their native language. The AI communicates in 50+ languages, expanding your potential market.
              </p>
            </div>
          </div>
        </section>

        {/* ROI section */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">The ROI for Real Estate</h2>
          <div className="bg-white/[0.02] border border-white/10 rounded-xl overflow-hidden">
            <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-white/5">
              <div className="p-6">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-4">Without AI (Traditional)</div>
                {[
                  { label: "Average response time", value: "4-24 hours" },
                  { label: "Lead qualification", value: "Manual only" },
                  { label: "After-hours inquiries", value: "Voicemail/tag" },
                  { label: "Viewing coordination", value: "Phone/email back-and-forth" },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between py-2 text-sm border-b border-white/5 last:border-0">
                    <span className="text-zinc-400">{row.label}</span>
                    <span className="text-zinc-300">{row.value}</span>
                  </div>
                ))}
              </div>
              <div className="p-6">
                <div className="text-xs text-zinc-500 uppercase tracking-wider mb-4">With OpenHelix AI</div>
                {[
                  { label: "Average response time", value: "< 3 seconds", highlight: true },
                  { label: "Lead qualification", value: "Automatic 24/7" },
                  { label: "After-hours inquiries", value: "Instant response" },
                  { label: "Viewing coordination", value: "Self-service booking" },
                ].map((row, i) => (
                  <div key={i} className="flex justify-between py-2 text-sm border-b border-white/5 last:border-0">
                    <span className="text-zinc-400">{row.label}</span>
                    <span className={row.highlight ? "text-emerald-400 font-bold" : "text-zinc-300"}>{row.value}</span>
                  </div>
                ))}
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
          <h2 className="text-2xl font-bold mb-2">Start capturing more real estate leads today</h2>
          <p className="text-zinc-400 text-sm mb-6">Free plan · 2,000 messages · Calendar integration · Live in 30 minutes</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-4 rounded-xl font-semibold text-lg">
            Deploy Your Real Estate AI <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        {/* Related */}
        <section className="mb-16 pt-8 border-t border-white/5">
          <div className="text-sm text-zinc-500 mb-4">Related guides</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/use-cases/ecommerce" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">AI Chatbot for Ecommerce</div><div className="text-xs text-zinc-500 mt-0.5">Order tracking, returns, product questions</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/integrations/whatsapp" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">WhatsApp for Real Estate</div><div className="text-xs text-zinc-500 mt-0.5">Reach buyers on their preferred channel</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/blog/how-to-add-ai-chatbot-to-your-website" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">How to Add AI Chatbot to Your Website</div><div className="text-xs text-zinc-500 mt-0.5">Step-by-step implementation guide</div></div>
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
