import Link from "next/link";
import { Zap } from "lucide-react";

export default function PrivacyPage() {
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
        <h1 className="text-4xl font-bold mb-2">Privacy Policy</h1>
        <p className="text-zinc-500 text-sm mb-10">Last updated: March 2026</p>

        <div className="prose prose-invert prose-zinc max-w-none space-y-8 text-zinc-300 leading-relaxed">
          <section>
            <h2 className="text-xl font-semibold text-white mb-3">1. Information We Collect</h2>
            <p>When you create an account, we collect your name, email address, and password (stored hashed). During onboarding you may provide business context (company name, industry, use case) which we use solely to help your assigned manager prepare a relevant setup.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">2. How We Use Your Information</h2>
            <p>We use your information to provide and improve the OpenHelix AI service, communicate with you about your account, assign a dedicated manager, and send transactional emails (welcome, manager assignment, password reset). We do not sell your data to third parties.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">3. Data Storage</h2>
            <p>Your data is stored securely on servers in the EU/US. Passwords are hashed using bcrypt and never stored in plain text. API keys are hashed before storage.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">4. Communications</h2>
            <p>We send transactional emails related to your account (welcome, manager assignment, system notifications). You can contact us at{" "}
              <a href="mailto:hello@openhelixai.com" className="text-violet-400 hover:text-violet-300">hello@openhelixai.com</a>{" "}
              to request data export or deletion.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-white mb-3">5. Contact</h2>
            <p>Questions about this policy? Email us at{" "}
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
