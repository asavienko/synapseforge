"use client"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const faqs = [
  {
    question: "How does the AI song generation work?",
    answer: "Our AI analyzes your vocabulary and creates original songs that naturally incorporate each word. You choose genre, mood, and voice - the AI handles the rest."
  },
  {
    question: "Which languages are supported?",
    answer: "We support 100+ languages including Spanish, French, German, Japanese, Korean, Mandarin, and many more. New languages are added regularly."
  },
  {
    question: "Can I use LyricLingo for my classroom?",
    answer: "Yes! Our Pro plan includes classroom features - student rosters, progress tracking, collaborative playlists, and detailed analytics."
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit cards, PayPal, and cryptocurrency including Bitcoin, Ethereum, and USDC."
  },
]

export function FAQSection() {
  return (
    <section id="faq" className="py-24 lg:py-32 bg-card">
      <div className="mx-auto max-w-2xl px-6 lg:px-8">
        <div className="text-center mb-12">
          <p className="text-sm font-medium text-coral tracking-wide uppercase mb-3">FAQ</p>
          <h2 className="font-serif text-3xl sm:text-4xl font-medium tracking-tight text-foreground">
            Common questions
          </h2>
        </div>

        <Accordion type="single" collapsible className="space-y-3">
          {faqs.map((faq, index) => (
            <AccordionItem 
              key={index} 
              value={`item-${index}`}
              className="rounded-xl border border-border bg-background px-5 data-[state=open]:border-foreground/30 transition-colors"
            >
              <AccordionTrigger className="text-left text-foreground hover:text-foreground hover:no-underline py-4 text-sm font-medium">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground pb-4 text-sm leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  )
}
