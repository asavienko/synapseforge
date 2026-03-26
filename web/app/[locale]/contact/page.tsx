import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FadeInView } from "@/components/animations/FadeInView";
import { Mail, Clock, MessageSquare } from "lucide-react";
import { ContactFormClient } from "./ContactFormClient";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("contact");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function ContactPage() {
  const t = await getTranslations();

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      <SiteHeader />

      {/* Hero */}
      <section className="relative mesh-gradient grid-bg py-16 sm:py-24 md:py-32">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <FadeInView direction="up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/20 text-[12px] text-blue-600 dark:text-blue-400 mb-6">
              <MessageSquare className="w-3.5 h-3.5" />
              Get in Touch
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="gradient-text">Contact Us</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-white/50 max-w-xl mx-auto">
              Have a question about OpenHelix AI? We&apos;re here to help you deploy your AI agents.
            </p>
          </FadeInView>
        </div>
      </section>

      {/* Content */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid lg:grid-cols-5 gap-8 lg:gap-12">
            {/* Left column - Info */}
            <div className="lg:col-span-2 space-y-6">
              <FadeInView direction="up" delay={100}>
                <div className="glass-card rounded-2xl p-6 space-y-6">
                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email us</h3>
                      <p className="text-gray-500 dark:text-white/50 text-sm mb-2">For general inquiries and support</p>
                      <a
                        href="mailto:hello@openhelixai.com"
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors text-sm"
                      >
                        hello@openhelixai.com
                      </a>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center justify-center shrink-0">
                      <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Response time</h3>
                      <p className="text-emerald-600 dark:text-emerald-400 font-medium text-sm">
                        We respond within 24 hours
                      </p>
                    </div>
                  </div>
                </div>
              </FadeInView>

              <FadeInView direction="up" delay={200}>
                <div className="glass-card rounded-2xl p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-3">What can we help with?</h3>
                  <ul className="space-y-2 text-sm text-gray-500 dark:text-white/50">
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Technical support and troubleshooting
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Sales inquiries and enterprise plans
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Partnership opportunities
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                      Feature requests and feedback
                    </li>
                  </ul>
                </div>
              </FadeInView>
            </div>

            {/* Right column - Form */}
            <div className="lg:col-span-3">
              <FadeInView direction="up" delay={150}>
                <ContactFormClient />
              </FadeInView>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
