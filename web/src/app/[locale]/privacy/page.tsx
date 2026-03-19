import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";
import { Zap, ArrowLeft, Shield, Database, Users, Lock } from "lucide-react";

export default async function PrivacyPage() {
  const t = await getTranslations();

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white grid-bg">
      {/* ── Nav ──────────────────────────────────────────────────────────── */}
      <nav className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-[#0a0a0f]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-violet-400" />
            <span className="font-bold text-lg tracking-tight">SynapseForge</span>
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
      <main className="max-w-3xl mx-auto px-6 py-16">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-medium mb-6">
            <Shield className="w-3.5 h-3.5" />
            Your Data, Your Control
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-zinc-500">Effective Date: March 2026</p>
        </div>

        <div className="glow-border rounded-2xl bg-white/[0.02] p-8 md:p-10 space-y-10">
          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Database className="w-5 h-5 text-violet-400" />
              What Data We Collect
            </h2>
            <div className="space-y-3 text-zinc-400 leading-relaxed">
              <p>We collect the following types of information:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong className="text-zinc-300">Account Information:</strong> Your name, email address, and company details when you register.</li>
                <li><strong className="text-zinc-300">Usage Data:</strong> How you interact with our platform, including pages visited, features used, and API calls made.</li>
                <li><strong className="text-zinc-300">AI Chat Messages:</strong> Conversations between your AI agents and end users, stored to provide the service and improve response quality.</li>
                <li><strong className="text-zinc-300">Technical Data:</strong> IP addresses, browser type, device information, and cookies for security and analytics.</li>
                <li><strong className="text-zinc-300">Billing Information:</strong> Payment details processed securely by Stripe (we do not store full card numbers).</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" />
              How We Use Your Data
            </h2>
            <div className="space-y-3 text-zinc-400 leading-relaxed">
              <p>We use your data to:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li>Provide and maintain the SynapseForge service</li>
                <li>Process transactions and manage billing</li>
                <li>Improve AI response quality and platform features</li>
                <li>Communicate with you about your account and service updates</li>
                <li>Ensure security and prevent fraud</li>
                <li>Comply with legal obligations</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Lock className="w-5 h-5 text-violet-400" />
              Data Storage & Security
            </h2>
            <div className="space-y-3 text-zinc-400 leading-relaxed">
              <p>
                Your data is stored in <strong className="text-zinc-300">PostgreSQL databases</strong> hosted on 
                <strong className="text-zinc-300"> US-based servers</strong> (Hetzner Cloud, Virginia region). 
                All data is encrypted at rest using AES-256 and in transit via TLS 1.3.
              </p>
              <p>
                API keys for AI providers (OpenAI, Anthropic, etc.) are encrypted with AES-256-GCM 
                and only decrypted when needed to process requests. We never store raw API keys in plaintext.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" />
              Third-Party Services
            </h2>
            <div className="space-y-3 text-zinc-400 leading-relaxed">
              <p>We share limited data with trusted third parties solely to operate our service:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong className="text-zinc-300">OpenAI / Anthropic:</strong> AI chat messages are sent to your configured AI provider to generate responses.</li>
                <li><strong className="text-zinc-300">Stripe:</strong> Processes all payments and stores billing information securely.</li>
                <li><strong className="text-zinc-300">Resend:</strong> Handles transactional and notification emails.</li>
                <li><strong className="text-zinc-300">Hetzner:</strong> Cloud infrastructure and server hosting.</li>
              </ul>
              <p className="text-sm text-zinc-500 mt-3">
                We never sell your data to third parties for marketing purposes.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Your Rights (GDPR & CCPA)</h2>
            <div className="space-y-3 text-zinc-400 leading-relaxed">
              <p>You have the right to:</p>
              <ul className="list-disc list-inside space-y-2 ml-2">
                <li><strong className="text-zinc-300">Access:</strong> Request a copy of all data we hold about you</li>
                <li><strong className="text-zinc-300">Correction:</strong> Update or correct inaccurate information</li>
                <li><strong className="text-zinc-300">Deletion:</strong> Delete your account and all associated data</li>
                <li><strong className="text-zinc-300">Export:</strong> Download your data in a portable format</li>
                <li><strong className="text-zinc-300">Object:</strong> Opt-out of certain data processing activities</li>
                <li><strong className="text-zinc-300">Withdraw Consent:</strong> Revoke permissions at any time</li>
              </ul>
              <p className="mt-3">
                To exercise these rights, contact us at{" "}
                <a href="mailto:privacy@synapseforge.ai" className="text-violet-400 hover:text-violet-300 transition-colors">
                  privacy@synapseforge.ai
                </a>
                . We respond to all requests within 30 days.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Data Retention</h2>
            <div className="space-y-3 text-zinc-400 leading-relaxed">
              <p>
                We retain your data for as long as your account is active. Upon account deletion, 
                all personal data is permanently removed within 30 days, except where we are legally 
                obligated to retain records (e.g., billing information for tax purposes, retained for 7 years).
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Cookies</h2>
            <div className="space-y-3 text-zinc-400 leading-relaxed">
              <p>
                We use essential cookies for authentication and session management. 
                Analytics cookies are optional and can be disabled. See our Cookie Policy for details.
              </p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-4">Contact Us</h2>
            <div className="space-y-3 text-zinc-400 leading-relaxed">
              <p>
                For privacy-related questions or to exercise your rights, contact our Data Protection Officer:
              </p>
              <p className="text-zinc-300">
                Email: <a href="mailto:privacy@synapseforge.ai" className="text-violet-400 hover:text-violet-300 transition-colors">privacy@synapseforge.ai</a>
              </p>
              <p className="text-sm text-zinc-500">
                SynapseForge — Alicante, Spain
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 py-10 mt-16">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-zinc-500">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-violet-400" />
            <span className="font-semibold text-zinc-400">SynapseForge</span>
            <span>© 2026</span>
          </div>
          <div className="flex gap-6">
            <Link href="/privacy" className="text-white transition-colors">{t("footer.privacy")}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{t("footer.terms")}</Link>
            <Link href="/contact" className="hover:text-white transition-colors">{t("footer.contact")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
