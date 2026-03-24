import { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { ArrowRight, Zap, Check, UtensilsCrossed, Clock, CalendarCheck, Star, MessageSquare, Globe } from "lucide-react";

export const metadata: Metadata = {
  title: "AI Chatbot for Restaurants — Automate Reservations, Orders & FAQs",
  description:
    "Deploy an AI chatbot for your restaurant in 10 minutes. Handle reservations, answer menu questions, share hours and location — 24/7 on WhatsApp, Telegram & web. Free plan available.",
  openGraph: {
    title: "AI Chatbot for Restaurants",
    description: "Automate customer questions 24/7. Reservations, menu Q&A, opening hours, location — answered instantly on WhatsApp and Telegram.",
    type: "website",
  },
};

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "How can a restaurant use an AI chatbot?",
      acceptedAnswer: { "@type": "Answer", text: "Restaurants use AI chatbots to handle the most common customer queries 24/7: hours and location, menu questions, reservation availability, dietary information, and special event bookings. The AI answers instantly on WhatsApp, Telegram, or web chat — no staff needed for routine inquiries." },
    },
    {
      "@type": "Question",
      name: "Can the AI chatbot take reservations?",
      acceptedAnswer: { "@type": "Answer", text: "The AI can collect reservation details (date, time, party size, contact info) and confirm availability based on your knowledge base. For full reservation management, it integrates with your booking system via webhook. Many restaurants use it to capture reservation requests that the team confirms manually." },
    },
    {
      "@type": "Question",
      name: "Does it work on WhatsApp?",
      acceptedAnswer: { "@type": "Answer", text: "Yes. OpenHelix AI connects to WhatsApp Business via Twilio. Customers can message your WhatsApp number and get instant AI responses — menu questions, hours, directions, reservation requests. Setup takes about 10 minutes." },
    },
    {
      "@type": "Question",
      name: "What languages does it support?",
      acceptedAnswer: { "@type": "Answer", text: "Any language supported by GPT-4 or Claude — which is essentially all major languages. Many restaurants in tourist areas configure the AI to detect the customer's language and respond accordingly." },
    },
    {
      "@type": "Question",
      name: "How much does it cost for a restaurant?",
      acceptedAnswer: { "@type": "Answer", text: "The free plan includes 2,000 messages/month — enough for a small restaurant. The Pro plan at $79/month handles unlimited messages. Most restaurants find the free plan sufficient to start, then upgrade based on volume." },
    },
  ],
};

const useCases = [
  {
    icon: CalendarCheck,
    title: "Reservation Requests",
    desc: "Collect date, time, party size, and contact details automatically. Confirm availability from your FAQ or escalate to staff for manual booking.",
    example: "Customer: 'Can I book a table for 4 on Saturday at 8pm?' → AI collects details and confirms or escalates",
  },
  {
    icon: UtensilsCrossed,
    title: "Menu Questions",
    desc: "Upload your menu once. The AI answers ingredient questions, allergen info, daily specials, and pricing — instantly.",
    example: "Customer: 'Is the pasta gluten-free?' → AI answers from your uploaded menu and allergen guide",
  },
  {
    icon: Clock,
    title: "Hours & Location",
    desc: "#1 restaurant inquiry. The AI answers opening hours, last orders, location, parking, and directions 24/7 — no staff needed.",
    example: "Customer: 'Are you open on Sunday?' → instant answer, every time",
  },
  {
    icon: Star,
    title: "Special Events & Offers",
    desc: "Private dining, birthday packages, set menus, happy hour times — train the AI once and it handles the inquiry volume without you.",
    example: "Customer: 'Do you do private events for 20 people?' → AI explains your private dining offering and takes contact details",
  },
  {
    icon: MessageSquare,
    title: "Multilingual Support",
    desc: "Tourists and international customers get answers in their own language automatically. GPT-4 handles translation natively.",
    example: "A German tourist messages in German, gets an accurate reply in German — no bilingual staff needed",
  },
  {
    icon: Globe,
    title: "Google & Social Reviews",
    desc: "When customers message asking how to leave a review, the AI shares your Google review link and thanks them — converting happy guests to reviews.",
    example: "Customer: 'How do I leave a review?' → AI shares link and message",
  },
];

export default function RestaurantPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

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

        <nav className="text-sm text-zinc-500 pt-8 mb-8">
          <Link href="/" className="hover:text-zinc-300 transition-colors">Home</Link>
          <span className="mx-2">/</span>
          <Link href="/use-cases" className="hover:text-zinc-300 transition-colors">Use Cases</Link>
          <span className="mx-2">/</span>
          <span className="text-zinc-300">Restaurant</span>
        </nav>

        {/* Hero */}
        <section className="py-12 sm:py-16">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 text-xs font-medium px-3 py-1 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/20 mb-6">
              <UtensilsCrossed className="w-3.5 h-3.5" />
              Restaurant AI Chatbot
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold mb-5 leading-tight">
              AI Chatbot for <span className="text-violet-400">Restaurants</span>
            </h1>
            <p className="text-lg text-zinc-400 mb-8 leading-relaxed max-w-2xl">
              Answer reservations, menu questions, and opening hours 24/7 — on WhatsApp, Telegram, and your website. Your staff handles food. The AI handles messages.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-xl font-semibold">
                Start Free <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/integrations/whatsapp" className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 px-6 py-3 rounded-xl text-zinc-300 transition-colors text-sm">
                WhatsApp Setup Guide
              </Link>
            </div>
            <p className="text-xs text-zinc-500 mt-4">No credit card · 2,000 messages free · Live in 10 minutes</p>
          </div>
        </section>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-16">
          {[
            { value: "68%", label: "of restaurant queries are about hours, location, or menu" },
            { value: "24/7", label: "coverage — including late-night booking requests" },
            { value: "10 min", label: "average setup time for a restaurant agent" },
            { value: "5+", label: "languages answered automatically with GPT-4" },
          ].map((s, i) => (
            <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-violet-400 mb-1">{s.value}</div>
              <div className="text-xs text-zinc-500 leading-relaxed">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Use cases */}
        <section className="mb-16">
          <h2 className="text-2xl sm:text-3xl font-bold mb-3">What Your Restaurant AI Handles</h2>
          <p className="text-zinc-400 mb-8 max-w-2xl">Train it on your menu and policies once. It handles customer messages around the clock.</p>
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

        {/* Setup */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-8">Set Up in 4 Steps — No Tech Skills Needed</h2>
          <div className="space-y-4">
            {[
              { n: "1", title: "Create your free account", desc: "Sign up at openhelixai.com — takes 30 seconds. No credit card required." },
              { n: "2", title: "Add your restaurant info", desc: "Paste your menu, opening hours, location/parking info, and FAQs. The AI learns everything instantly." },
              { n: "3", title: "Connect WhatsApp or Telegram", desc: "Link your WhatsApp Business number (via Twilio) or create a Telegram bot with BotFather — step-by-step guide included." },
              { n: "4", title: "Add the web chat to your site", desc: "Copy-paste one line of code to add a chat bubble to your website. Works on Wix, Squarespace, WordPress — any platform." },
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

        {/* Channels */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">Where Customers Can Message You</h2>
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { name: "WhatsApp Business", desc: "The most popular messaging channel. Customers already use it — just give them your number.", linkText: "WhatsApp setup guide →", link: "/integrations/whatsapp", highlight: true },
              { name: "Telegram", desc: "Great for tech-savvy customers. Add a 'Message on Telegram' button to your Google Maps listing.", linkText: "Telegram setup guide →", link: "/integrations/telegram", highlight: false },
              { name: "Website Chat", desc: "A chat bubble on your website. Works even if you're closed — collects the inquiry for follow-up.", linkText: null, link: null, highlight: false },
            ].map((ch, i) => (
              <div key={i} className={`bg-white/[0.02] border rounded-xl p-5 ${ch.highlight ? "border-violet-500/20" : "border-white/5"}`}>
                <h3 className="font-semibold mb-2">{ch.name}</h3>
                <p className="text-sm text-zinc-400 mb-3 leading-relaxed">{ch.desc}</p>
                {ch.link && (
                  <Link href={ch.link as never} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">{ch.linkText}</Link>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* What to train */}
        <section className="mb-16">
          <h2 className="text-2xl font-bold mb-6">What to Put in Your AI&apos;s Knowledge Base</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {[
              { title: "Opening hours", example: "Mon–Fri 12:00–22:00, Sat 11:00–23:00, Sun 11:00–21:00. Last orders 30 min before close." },
              { title: "Full menu + prices", example: "All dishes, descriptions, prices, portion sizes, daily specials, and drink list." },
              { title: "Allergen information", example: "Which dishes contain gluten, dairy, nuts, etc. Vegan/vegetarian options clearly labeled." },
              { title: "Booking policy", example: "How to reserve, minimum party size, deposit requirements, cancellation policy." },
              { title: "Location & parking", example: "Address, Google Maps link, nearest tube/metro, parking options, accessibility info." },
              { title: "Private dining & events", example: "Capacity, packages, pricing, lead time, and contact person for group bookings." },
            ].map((item, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                <div className="flex gap-2 mb-2">
                  <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span className="font-medium text-sm">{item.title}</span>
                </div>
                <p className="text-xs text-zinc-500 ml-6 leading-relaxed">{item.example}</p>
              </div>
            ))}
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
          <h2 className="text-2xl font-bold mb-2">Let AI handle customer messages — you handle the food</h2>
          <p className="text-zinc-400 text-sm mb-6">Free plan · 2,000 messages · WhatsApp + Telegram + web · 10-minute setup</p>
          <Link href="/sign-up" className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-8 py-4 rounded-xl font-semibold text-lg">
            Set Up Your Restaurant AI <ArrowRight className="w-5 h-5" />
          </Link>
        </section>

        {/* Related */}
        <section className="mb-16 pt-8 border-t border-white/5">
          <div className="text-sm text-zinc-500 mb-4">Related guides</div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Link href="/integrations/whatsapp" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">WhatsApp Integration Guide</div><div className="text-xs text-zinc-500 mt-0.5">Connect AI to your WhatsApp Business number</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/use-cases/ecommerce" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">AI for Ecommerce</div><div className="text-xs text-zinc-500 mt-0.5">Order tracking, returns, cart recovery</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/blog/how-to-build-telegram-chatbot" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Telegram Chatbot Tutorial</div><div className="text-xs text-zinc-500 mt-0.5">Step-by-step, 10 minutes</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
            <Link href="/blog/reduce-customer-support-costs-with-ai" className="flex items-center gap-3 bg-white/[0.02] border border-white/5 hover:border-violet-500/20 rounded-xl p-4 group">
              <div className="flex-1"><div className="text-sm font-medium text-white group-hover:text-violet-300 transition-colors">Cut Support Costs by 60%</div><div className="text-xs text-zinc-500 mt-0.5">ROI breakdown for local businesses</div></div>
              <ArrowRight className="w-4 h-4 text-zinc-600 group-hover:text-violet-400 transition-colors shrink-0" />
            </Link>
          </div>
        </section>

      </main>
    </div>
  );
}
