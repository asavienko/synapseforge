"use client";

import { useState } from "react";
import Link from "next/link";
import { Loader2, CheckCircle2, Send } from "lucide-react";

const SUBJECT_OPTIONS = [
  { value: "", label: "Select a subject..." },
  { value: "general", label: "General Inquiry" },
  { value: "sales", label: "Sales / Enterprise" },
  { value: "support", label: "Technical Support" },
  { value: "partnership", label: "Partnership" },
];

export function ContactFormClient() {
  const [form, setForm] = useState({ 
    name: "", 
    email: "", 
    subject: "", 
    message: "" 
  });
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

  if (success) {
    return (
      <div className="glow-border rounded-2xl bg-white/[0.02] p-8 md:p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center mx-auto mb-6">
          <CheckCircle2 className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Message sent!</h2>
        <p className="text-zinc-400 mb-6 max-w-sm mx-auto">
          Thanks for reaching out. We&apos;ll get back to you within 24 hours.
        </p>
        
        <button
          onClick={() => { 
            setSuccess(false); 
            setForm({ name: "", email: "", subject: "", message: "" }); 
          }}
          className="text-violet-400 hover:text-violet-300 transition-colors text-sm"
        >
          Send another message
        </button>
      </div>
    );
  }

  return (
    <div className="glow-border rounded-2xl bg-white/[0.02] p-8 md:p-10">
      <h2 className="text-2xl font-bold text-white mb-6">Send us a message</h2>

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Name *
            </label>
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
            <label className="block text-sm font-medium text-zinc-300 mb-2">
              Email *
            </label>
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
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Subject *
          </label>
          <select
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors appearance-none cursor-pointer"
            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%236b7280'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', backgroundSize: '20px' }}
          >
            {SUBJECT_OPTIONS.map((option) => (
              <option 
                key={option.value} 
                value={option.value}
                className="bg-[#0a0a0f] text-white"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-zinc-300 mb-2">
            Message *
          </label>
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            placeholder="Tell us how we can help you..."
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
          className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-white font-semibold px-6 py-4 rounded-xl text-sm"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send message
            </>
          )}
        </button>

        <p className="text-center text-xs text-zinc-500">
          By submitting, you agree to our{" "}
          <Link href="/privacy" className="text-violet-400 hover:text-violet-300 transition-colors">Privacy Policy</Link>
          {" "}and{" "}
          <Link href="/terms" className="text-violet-400 hover:text-violet-300 transition-colors">Terms of Service</Link>.
        </p>
      </form>
    </div>
  );
}
