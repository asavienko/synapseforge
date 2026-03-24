import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Zap, ArrowLeft, Mail, Clock, MessageSquare } from "lucide-react";
import { ContactFormClient } from "./ContactFormClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact Us | OpenHelix AI",
  description:
    "Get in touch with the OpenHelix AI team. We're here to help with questions, support, or enterprise inquiries.",
};

export default async function ContactPage() {
  const t = await getTranslations();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white grid-bg">
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-[#0a0a0f]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-violet-400" />
            <span className="font-bold text-lg tracking-tight">OpenHelix AI</span>
          </Link>
          <Link
            href="/"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-colors"
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
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-6">
                <MessageSquare className="w-3.5 h-3.5" />
                Get in Touch
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
              <p className="text-zinc-400 text-lg leading-relaxed">
                Have a question about OpenHelix AI? We&apos;re here to help you deploy your AI agents.
              </p>
            </div>

            <div className="glow-border rounded-2xl bg-white/[0.02] p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0">
                  <Mail className="w-5 h-5 text-violet-400" />
                </div>
                <div>
                  <h3 className="font-semibold text-white mb-1">Email us</h3>
                  <p className="text-zinc-400 text-sm mb-2">For general inquiries and support</p>
                  <a 
                    href="mailto:hello@openhelixai.com" 
                    className="text-violet-400 hover:text-violet-300 transition-colors text-sm"
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
                  <h3 className="font-semibold text-white mb-1">Response time</h3>
                  <p className="text-zinc-400 text-sm"></p>
                  <p className="text-emerald-400 font-medium text-sm">
                    We respond within 24 hours
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-2xl bg-zinc-900/50 border border-white/5 p-6">
              <h3 className="font-semibold text-white mb-3">What can we help with?</h3>
              <ul className="space-y-2 text-sm text-zinc-400">
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                  Technical support and troubleshooting
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                  Sales inquiries and enterprise plans
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
                  Partnership opportunities
                </li>
                <li className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-400"></span>
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
      <footer className="border-t border-white/5 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-400" />
            <span className="font-semibold text-zinc-400">OpenHelix AI</span>
            <span>{t("footer.copyright", { year: 2026 })}</span>
          </div>
          <div className="flex gap-6">
            <Link href="/status" className="hover:text-white transition-colors">{t("footer.status")}</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">{t("footer.privacy")}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{t("footer.terms")}</Link>
            <Link href="/contact" className="text-white transition-colors">{t("footer.contact")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
