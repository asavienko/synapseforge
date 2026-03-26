import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { HelixLogo } from "@/components/icons/BrandIcons";
import { ArrowLeft, Mail, Clock, MessageSquare } from "lucide-react";
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
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="border-b border-gray-200/50 dark:border-white/[0.06] backdrop-blur-sm sticky top-0 z-50 bg-white/80 dark:bg-[#0a0a0f]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <HelixLogo className="w-7 h-7 text-blue-600 dark:text-blue-400" size={28} />
            <span className="font-bold text-lg tracking-tight text-gray-900 dark:text-white">OpenHelix<span className="text-blue-600 dark:text-blue-400">.</span></span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-gray-500 dark:text-white/50 hover:text-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to home
          </Link>
        </div>
      </nav>

      {/* ── Content ───────────────────────────────────────────────────────── */}
      <main className="max-w-6xl mx-auto px-6 py-16">
        <div className="grid lg:grid-cols-5 gap-12">
          {/* Left column - Info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-200 dark:border-blue-500/30 bg-blue-500/10 text-blue-600 dark:text-blue-300 text-xs font-medium mb-6">
                <MessageSquare className="w-3.5 h-3.5" />
                Get in Touch
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
              <p className="text-gray-500 dark:text-white/50 text-lg leading-relaxed">
                Have a question about OpenHelix AI? We&apos;re here to help you deploy your AI agents.
              </p>
            </div>

            <div className="glow-border rounded-2xl bg-white dark:bg-white/[0.02] p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Email us</h3>
                  <p className="text-gray-500 dark:text-white/50 text-sm mb-2">For general inquiries and support</p>
                  <a
                    href="mailto:hello@openhelixai.com"
                    className="text-blue-400 hover:text-blue-300 transition-colors text-sm"
                  >
                    hello@openhelixai.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                  <Clock className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">Response time</h3>
                  <p className="text-gray-500 dark:text-white/50 text-sm"></p>
                  <p className="text-emerald-400 font-medium text-sm">
                    We respond within 24 hours
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-gray-50 dark:bg-zinc-900/50 border border-gray-100 dark:border-white/[0.06] p-6">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-3">What can we help with?</h3>
              <ul className="space-y-2 text-sm text-gray-500 dark:text-white/50">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Technical support and troubleshooting
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Sales inquiries and enterprise plans
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Partnership opportunities
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-400"></span>
                  Feature requests and feedback
                </li>
              </ul>
            </div>
          </div>

          {/* Right column - Form */}
          <div className="lg:col-span-3">
            <ContactFormClient />
          </div>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 dark:border-white/[0.06] py-10 mt-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-white/50">
          <div className="flex items-center gap-2">
            <HelixLogo className="w-7 h-7 text-blue-600 dark:text-blue-400" size={28} />
            <span className="font-semibold text-gray-500 dark:text-white/50">OpenHelix AI</span>
            <span>{t("footer.copyright", { year: 2026 })}</span>
          </div>
          <div className="flex gap-6">
            <Link href="/status" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("footer.status")}</Link>
            <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("footer.privacy")}</Link>
            <Link href="/terms" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("footer.terms")}</Link>
            <Link href="/contact" className="text-gray-900 dark:text-white transition-colors">{t("footer.contact")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
