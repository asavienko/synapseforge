import Link from "next/link";
import { Zap } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white">
      <nav className="border-b border-white/5 backdrop-blur-sm sticky top-0 z-50 bg-[#0a0a0f]/80">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Zap className="w-6 h-6 text-violet-400" />
            <span className="font-bold text-lg tracking-tight">OpenHelix AI</span>
          </Link>
        </div>
      </nav>

      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-4xl font-bold mb-2">Terms of Service</h1>
        <p className="text-zinc-500 text-sm mb-10">Last updated: March 2026</p>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Acceptance</h2>
            <p>By creating an account on OpenHelix AI, you agree to these Terms of Service. If you do not agree, do not use the service.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. Service Description</h2>
            <p>OpenHelix AI provides AI infrastructure management services, including AI instance deployment, LLM integrations, automation pipelines, and dedicated manager support. The free plan includes one minimal AI instance and access to a dedicated manager.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Account Responsibilities</h2>
            <p>You are responsible for maintaining the security of your account credentials. You must not share API keys or allow unauthorized access to your account. You are responsible for all activity that occurs under your account.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Acceptable Use</h2>
            <p>You may not use OpenHelix AI to engage in illegal activities, send spam, violate third-party rights, or attempt to gain unauthorized access to our systems. We reserve the right to terminate accounts that violate these terms.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Plan Upgrades</h2>
            <p>Plan upgrades (Free → Pro → Enterprise) are handled by request through your dedicated manager. Pricing and availability are subject to change with reasonable notice.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">6. Limitation of Liability</h2>
            <p>OpenHelix AI is provided &quot;as is.&quot; We are not liable for indirect or consequential damages arising from use of the service. Our total liability is limited to the amount paid by you in the three months preceding the claim.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">7. Contact</h2>
            <p>Questions about these terms? Email{" "}
              <a href="mailto:hello@openhelixai.com" className="text-violet-400 hover:text-violet-300">hello@openhelixai.com</a>.
            </p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10">
          <Link href="/" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">← Back to home</Link>
        </div>
      </main>
    </div>
  );
}
