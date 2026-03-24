import type { Metadata } from "next"
import Link from "next/link"
import { Navbar } from "@/components/navbar"
import { Footer } from "@/components/footer"

export const metadata: Metadata = {
  title: "Privacy Policy - LyricLingo",
  description: "Learn how LyricLingo collects, uses, and protects your personal information. Read our comprehensive privacy policy.",
}

const sections = [
  {
    title: "Information We Collect",
    content: [
      "Account Information: When you create an account, we collect your email address, username, and password. If you sign up through a third-party service (Google, GitHub), we receive your name and email from that service.",
      "Learning Data: We collect information about your language learning activities, including songs you generate, vocabulary you practice, progress metrics, and learning preferences.",
      "Usage Information: We automatically collect data about how you use LyricLingo, including pages visited, features used, time spent, and interaction patterns.",
      "Device Information: We collect device type, operating system, browser type, IP address, and general location (country/region) for analytics and security purposes.",
    ],
  },
  {
    title: "How We Use Your Information",
    content: [
      "Personalization: We use your learning data to personalize song generation, recommend content, and optimize your learning experience through our AI systems.",
      "Service Improvement: Usage data helps us understand how people use LyricLingo so we can improve features, fix bugs, and develop new functionality.",
      "Communication: We may send you service-related emails (account verification, password resets, important updates) and, with your consent, marketing communications about new features.",
      "Security: We use collected information to detect and prevent fraud, abuse, and security threats to protect you and our community.",
    ],
  },
  {
    title: "AI and Data Processing",
    content: [
      "Song Generation: When you request a song, your vocabulary input is processed by our AI systems to generate personalized content. This data is used to improve our AI models.",
      "Learning Analytics: We use machine learning to analyze your learning patterns and provide personalized recommendations and progress insights.",
      "Data Anonymization: For AI training and analytics, we anonymize and aggregate user data to protect individual privacy while improving our services.",
    ],
  },
  {
    title: "Data Sharing",
    content: [
      "Service Providers: We share data with trusted third-party services that help us operate LyricLingo, including cloud hosting, analytics, and payment processing. These providers are bound by strict data protection agreements.",
      "Legal Requirements: We may disclose information if required by law, legal process, or government request, or to protect the rights, property, or safety of LyricLingo, our users, or the public.",
      "Business Transfers: In the event of a merger, acquisition, or sale of assets, user information may be transferred as part of that transaction.",
      "No Selling of Data: We do not sell your personal information to third parties for advertising or marketing purposes.",
    ],
  },
  {
    title: "Data Security",
    content: [
      "Encryption: All data transmitted between your device and our servers is encrypted using TLS. Sensitive data is encrypted at rest.",
      "Access Controls: We implement strict access controls and authentication measures to limit who can access user data within our organization.",
      "Regular Audits: We conduct regular security assessments and penetration testing to identify and address vulnerabilities.",
      "Incident Response: We have procedures in place to detect, respond to, and notify users of any data breaches in accordance with applicable laws.",
    ],
  },
  {
    title: "Your Rights and Choices",
    content: [
      "Access and Portability: You can access your personal data through your account settings and request a copy of your data in a portable format.",
      "Correction: You can update or correct your account information at any time through your profile settings.",
      "Deletion: You can request deletion of your account and associated data. Some data may be retained for legal or legitimate business purposes.",
      "Marketing Opt-out: You can unsubscribe from marketing emails at any time using the link in any marketing communication.",
      "Cookie Preferences: You can manage cookie preferences through your browser settings or our cookie consent tool.",
    ],
  },
  {
    title: "International Data Transfers",
    content: [
      "Our servers are located in the United States. If you access LyricLingo from outside the US, your information will be transferred to and processed in the US.",
      "We implement appropriate safeguards for international data transfers, including standard contractual clauses approved by relevant data protection authorities.",
    ],
  },
  {
    title: "Children's Privacy",
    content: [
      "LyricLingo is not intended for children under 13 years of age. We do not knowingly collect personal information from children under 13.",
      "If we learn we have collected information from a child under 13, we will delete that information promptly. Parents who believe we may have collected information from their child can contact us.",
    ],
  },
  {
    title: "Changes to This Policy",
    content: [
      "We may update this Privacy Policy from time to time. We will notify you of material changes by posting the new policy on this page and updating the effective date.",
      "For significant changes, we may provide additional notice such as an email notification or in-app alert.",
    ],
  },
  {
    title: "Contact Us",
    content: [
      "If you have questions about this Privacy Policy or our data practices, please contact us at privacy@lyriclingo.com.",
      "For data protection inquiries in the EU, you may also contact our Data Protection Officer at dpo@lyriclingo.com.",
    ],
  },
]

export default function PrivacyPage() {
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
                Privacy Policy
              </h1>
              <p className="mt-4 text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto">
                Your privacy matters to us. This policy explains how we collect, use, and protect your information.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                Last updated: March 1, 2026
              </p>
            </div>
          </div>
        </section>

        {/* Content */}
        <section className="pb-16 sm:pb-20 md:pb-24">
          <div className="mx-auto max-w-4xl px-4 sm:px-6">
            <div className="bg-card/40 backdrop-blur-sm border border-border/50 rounded-2xl p-6 sm:p-8 md:p-10">
              <div className="prose prose-sm sm:prose-base prose-neutral dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  LyricLingo (&quot;we&quot;, &quot;our&quot;, or &quot;us&quot;) is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our language learning platform and services.
                </p>

                {sections.map((section, index) => (
                  <div key={index} className="mt-8 sm:mt-10">
                    <h2 className="text-lg sm:text-xl font-semibold text-foreground mb-4">
                      {index + 1}. {section.title}
                    </h2>
                    <ul className="space-y-3">
                      {section.content.map((item, itemIndex) => (
                        <li key={itemIndex} className="text-muted-foreground leading-relaxed pl-4 border-l-2 border-border">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Related Links */}
              <div className="mt-12 pt-8 border-t border-border/50">
                <h3 className="text-sm font-medium text-foreground mb-4">Related Pages</h3>
                <div className="flex flex-wrap gap-3">
                  <Link 
                    href="/terms" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg bg-secondary/50 hover:bg-secondary"
                  >
                    Terms of Service
                  </Link>
                  <Link 
                    href="/contact" 
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2 rounded-lg bg-secondary/50 hover:bg-secondary"
                  >
                    Contact Us
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}
