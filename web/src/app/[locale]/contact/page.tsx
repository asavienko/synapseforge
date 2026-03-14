"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, ArrowLeft } from "lucide-react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error ?? "Something went wrong. Please try again.");
    } else {
      setSuccess(true);
    }
  }

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center px-6 py-24">
      <div className="w-full max-w-lg">
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8">
          <ArrowLeft className="w-4 h-4" /> Back to home
        </Link>

        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-8 text-center">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-white mb-2">Message sent!</h2>
            <p className="text-zinc-400 text-sm">We'll get back to you within 24 hours.</p>
            <button
              onClick={() => { setSuccess(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
              className="mt-6 text-sm text-violet-400 hover:text-violet-300 transition-colors"
            >
              Send another message
            </button>
          </div>
        ) : (
          <>
            <h1 className="text-4xl font-bold mb-2 text-white">Contact us</h1>
            <p className="text-zinc-400 mb-8">Have a question? We'll reply within 24 hours.</p>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Name *</label>
                  <input
                    type="text"
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Your name"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email *</label>
                  <input
                    type="email"
                    required
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="you@example.com"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Subject</label>
                <input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                  placeholder="What's this about?"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-1.5">Message *</label>
                <textarea
                  required
                  rows={5}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Tell us how we can help..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors resize-none"
                />
              </div>

              {error && (
                <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-xl px-4 py-3">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors text-white font-semibold px-6 py-3.5 rounded-xl text-sm"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {loading ? "Sending…" : "Send message"}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-zinc-600">
              Prefer email?{" "}
              <a href="mailto:hello@synapseforge.ai" className="text-violet-400 hover:text-violet-300 transition-colors">
                hello@synapseforge.ai
              </a>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
