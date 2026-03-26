import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { ArrowLeft, FileText, CreditCard, AlertTriangle, Scale } from "lucide-react";
import { HelixLogo } from "@/components/icons/BrandIcons";

export default async function TermsPage() {
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
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-blue-500/30 bg-blue-500/10 text-blue-300 text-xs font-medium mb-6">
            <FileText className="w-3.5 h-3.5" />
            Legal Agreement
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{t("terms.title")}</h1>
          <p className="text-gray-500 dark:text-white/40">Effective Date: March 2026</p>
        </div>

        <div className="glow-border rounded-2xl bg-white dark:bg-white/[0.02] p-8 md:p-10 space-y-10">
          <section>
            <p className="text-gray-500 dark:text-white/50 leading-relaxed">
              Welcome to OpenHelix AI. By accessing or using our service, you agree to be bound by these Terms of Service.
              If you disagree with any part of these terms, you may not access the service.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-5 h-5 text-blue-400" />
              1. Service Description
            </h2>
            <div className="space-y-3 text-gray-500 dark:text-white/50 leading-relaxed">
              <p>
                OpenHelix AI provides a managed AI agent platform that allows users to deploy, configure, and manage
                AI-powered chat agents across multiple channels including Telegram, Discord, Slack, and web widgets.
              </p>
              <p>The service includes:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Cloud-based AI agent hosting and deployment</li>
                <li>Multi-channel integration capabilities</li>
                <li>Configuration management and synchronization</li>
                <li>Usage analytics and monitoring</li>
                <li>API access for programmatic control</li>
                <li>Dedicated manager support (on eligible plans)</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              2. Account Responsibilities
            </h2>
            <div className="space-y-3 text-gray-500 dark:text-white/50 leading-relaxed">
              <p>When you create an account with us, you must provide accurate and complete information. You are responsible for:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Maintaining the confidentiality of your account credentials</li>
                <li>All activities that occur under your account</li>
                <li>Ensuring your account information remains current</li>
                <li>Notifying us immediately of any unauthorized access</li>
              </ul>
              <p className="mt-3">
                <strong className="text-zinc-300">API Key Security:</strong> You are solely responsible for securing any API keys, bot tokens, or credentials
                associated with your account. Never share these credentials. OpenHelix AI encrypts stored credentials
                but cannot be held liable for breaches resulting from your failure to maintain security.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-blue-400" />
              3. Acceptable Use
            </h2>
            <div className="space-y-3 text-gray-500 dark:text-white/50 leading-relaxed">
              <p>You agree not to use the service to:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Send spam, unsolicited messages, or bulk communications without consent</li>
                <li>Distribute malware, viruses, or malicious code</li>
                <li>Engage in illegal activities or promote illegal content</li>
                <li>Harass, abuse, or harm others</li>
                <li>Impersonate any person or entity</li>
                <li>Attempt to gain unauthorized access to our systems</li>
                <li>Reverse engineer or extract source code</li>
                <li>Use the service in a manner that violates third-party terms (e.g., OpenAI, Telegram)</li>
              </ul>
              <p className="mt-3">
                We reserve the right to suspend or terminate accounts that violate these rules.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-blue-400" />
              4. Billing and Cancellation
            </h2>
            <div className="space-y-3 text-gray-500 dark:text-white/50 leading-relaxed">
              <p><strong className="text-zinc-300">Payments:</strong> All payments are processed securely through Stripe. By subscribing to a paid plan, you authorize us to charge your payment method.</p>
              <p><strong className="text-zinc-300">Billing Cycle:</strong> Subscriptions are billed monthly or annually in advance. You will be charged on the same date each billing period.</p>
              <p><strong className="text-zinc-300">Cancellation:</strong> You may cancel your subscription at any time through your dashboard. Cancellation takes effect at the end of the current billing period.</p>
              <p><strong className="text-zinc-300">Refunds:</strong> Refunds are handled on a case-by-case basis. Contact us within 14 days if you believe you are entitled to a refund.</p>
              <p><strong className="text-zinc-300">Price Changes:</strong> We may update pricing with 30 days notice. Your continued use after changes constitutes acceptance.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">5. Intellectual Property</h2>
            <div className="space-y-3 text-gray-500 dark:text-white/50 leading-relaxed">
              <p>
                <strong className="text-zinc-300">Your Content:</strong> You retain all rights to the data, prompts, and configurations you create.
                You grant us a limited license to host and process this data solely to provide the service.
              </p>
              <p>
                <strong className="text-zinc-300">Our Content:</strong> The OpenHelix AI platform, including code, designs, logos, and trademarks,
                is our property and protected by copyright and other laws.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">6. Service Level and Uptime</h2>
            <div className="space-y-3 text-gray-500 dark:text-white/50 leading-relaxed">
              <p>
                We aim for 99% uptime for Pro and Enterprise plans. However, the service is provided &quot;as is&quot; without
                warranties of uninterrupted service. We are not liable for downtime caused by:
              </p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Third-party service outages (e.g., OpenAI, cloud providers)</li>
                <li>Force majeure events</li>
                <li>Scheduled maintenance (with prior notice)</li>
                <li>Issues with your AI provider API keys</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Scale className="w-5 h-5 text-blue-400" />
              7. Limitation of Liability
            </h2>
            <div className="space-y-3 text-gray-500 dark:text-white/50 leading-relaxed">
              <p>
                To the maximum extent permitted by law, OpenHelix AI shall not be liable for any indirect, incidental,
                special, consequential, or punitive damages, including lost profits, data loss, or business interruption.
              </p>
              <p>
                Our total liability for any claim arising from these terms shall not exceed the amount you paid us
                in the 12 months preceding the claim, or &euro;100 if you have a free account.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">8. Termination</h2>
            <div className="space-y-3 text-gray-500 dark:text-white/50 leading-relaxed">
              <p><strong className="text-zinc-300">By You:</strong> You may delete your account at any time. All data will be permanently removed within 30 days.</p>
              <p><strong className="text-zinc-300">By Us:</strong> We may suspend or terminate your account for:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Violation of these Terms</li>
                <li>Fraudulent or illegal activity</li>
                <li>Non-payment (after grace period)</li>
                <li>Extended inactivity (free accounts)</li>
              </ul>
              <p className="mt-3">
                Where possible, we will provide notice before termination. Upon termination, your right to use the service ceases immediately.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">9. Governing Law</h2>
            <div className="space-y-3 text-gray-500 dark:text-white/50 leading-relaxed">
              <p>
                These Terms shall be governed by and construed in accordance with the laws of <strong className="text-zinc-300">Spain</strong>,
                without regard to conflict of law provisions. Any disputes shall be resolved in the courts of Alicante, Spain.
              </p>
              <p>
                For EU consumers, mandatory consumer protection laws of your country of residence apply.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">10. Changes to Terms</h2>
            <div className="space-y-3 text-gray-500 dark:text-white/50 leading-relaxed">
              <p>
                We may modify these Terms at any time. Changes will be effective immediately upon posting.
                We will notify you of material changes via email or through the service. Continued use after changes
                constitutes acceptance of the updated Terms.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">11. Contact</h2>
            <div className="space-y-3 text-gray-500 dark:text-white/50 leading-relaxed">
              <p>For questions about these Terms, contact us at:</p>
              <p className="text-zinc-300">
                Email: <a href="mailto:hello@openhelixai.com" className="text-blue-400 hover:text-blue-300 transition-colors">hello@openhelixai.com</a>
              </p>
              <p className="text-sm text-gray-500 dark:text-white/40">
                OpenHelix AI — Alicante, Spain
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 dark:border-white/[0.06] py-10 mt-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-gray-500 dark:text-white/40">
          <div className="flex items-center gap-2">
            <HelixLogo className="w-4 h-4 text-blue-600 dark:text-blue-400" size={16} />
            <span className="font-semibold text-gray-500 dark:text-white/50">OpenHelix AI</span>
            <span>{t("footer.copyright", { year: 2026 })}</span>
          </div>
          <div className="flex gap-6">
            <Link href="/status" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("footer.status")}</Link>
            <Link href="/privacy" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("footer.privacy")}</Link>
            <Link href="/terms" className="text-gray-900 dark:text-white transition-colors">{t("footer.terms")}</Link>
            <Link href="/contact" className="hover:text-gray-900 dark:hover:text-white transition-colors">{t("footer.contact")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
