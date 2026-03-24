import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Legal - LyricLingo",
  description: "Access LyricLingo's legal documents including Privacy Policy, Terms of Service, and other important policies.",
}

const legalPages = [
  {
    title: "Privacy Policy",
    description: "Learn how we collect, use, and protect your personal information. We're committed to keeping your data safe and being transparent about our practices.",
    href: "/privacy",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
      </svg>
    ),
    color: "coral",
  },
  {
    title: "Terms of Service",
    description: "Understand your rights and responsibilities when using LyricLingo. These terms govern your use of our platform and services.",
    href: "/terms",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
    color: "lavender",
  },
  {
    title: "Cookie Policy",
    description: "Information about how we use cookies and similar technologies to improve your experience and analyze site usage.",
    href: "/privacy#cookies",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    color: "mint",
  },
  {
    title: "Acceptable Use Policy",
    description: "Guidelines for appropriate use of LyricLingo. Learn what's allowed and what's not on our platform.",
    href: "/terms#user-content-and-conduct",
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    color: "coral",
  },
]

const contactInfo = [
  {
    label: "General Inquiries",
    email: "support@lyriclingo.com",
  },
  {
    label: "Legal Department",
    email: "legal@lyriclingo.com",
  },
  {
    label: "Privacy Concerns",
    email: "privacy@lyriclingo.com",
  },
  {
    label: "Data Protection Officer",
    email: "dpo@lyriclingo.com",
  },
]

export default function LegalPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      
      <main className="flex-1">
        {/* Hero */}
        <section className="relative py-16 sm:py-20 md:py-24 overflow-hidden">
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-lavender/10 blur-3xl" />
            <div className="absolute -bottom-40 -left-40 w-[500px] h-[500px] rounded-full bg-coral/10 blur-3xl" />
          </div>
          
          <div className="relative z-10 mx-auto max-w-4xl px-4 sm:px-6">
            <div className="text-center">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold text-foreground tracking-tight">
                Legal Center
              </h1>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Access our policies and legal documents. We believe in transparency and want you to understand how LyricLingo works.
              </p>
            </div>
          </div>
        </section>

        {/* Legal Pages Grid */}
        <section className="pb-12 sm:pb-16">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              {legalPages.map((page) => (
                <Link
                  key={page.href}
                  href={page.href}
                  className="group relative bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-6 hover:border-foreground/20 transition-all duration-300 hover:shadow-lg"
                >
                  <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl mb-4 ${
                    page.color === 'coral' ? 'bg-coral/10 text-coral' :
                    page.color === 'lavender' ? 'bg-lavender/10 text-lavender' :
                    'bg-mint/10 text-mint'
                  }`}>
                    {page.icon}
                  </div>
                  <h2 className="text-lg font-semibold text-foreground mb-2 group-hover:text-coral transition-colors">
                    {page.title}
                  </h2>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {page.description}
                  </p>
                  <div className="mt-4 flex items-center text-sm font-medium text-foreground/70 group-hover:text-coral transition-colors">
                    Read more
                    <svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Contact Section */}
        <section className="pb-16 sm:pb-20 md:pb-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8">
              <h2 className="text-xl font-semibold text-foreground mb-2">
                Questions about our policies?
              </h2>
              <p className="text-muted-foreground mb-6">
                We're here to help. Reach out to the appropriate team for your inquiry.
              </p>
              
              <div className="grid sm:grid-cols-2 gap-4">
                {contactInfo.map((contact) => (
                  <div key={contact.email} className="flex items-center gap-3 p-4 rounded-xl bg-secondary/30 border border-border/30">
                    <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-foreground/5 flex items-center justify-center">
                      <svg className="w-5 h-5 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{contact.label}</p>
                      <a 
                        href={`mailto:${contact.email}`}
                        className="text-sm text-muted-foreground hover:text-coral transition-colors"
                      >
                        {contact.email}
                      </a>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-6 pt-6 border-t border-border/50">
                <p className="text-xs text-muted-foreground">
                  For urgent matters, please include &quot;URGENT&quot; in your email subject line. We typically respond within 1-2 business days.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
