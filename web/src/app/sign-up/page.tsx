"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Zap, Loader2, Check } from "lucide-react";
import { signIn } from "next-auth/react";

export default function SignUpPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });

    const data = await res.json();

    if (!res.ok) {
      setLoading(false);
      setError(data.error || "Something went wrong.");
      return;
    }

    // Auto sign-in and go straight to onboarding
    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
    });

    setLoading(false);

    if (result?.error) {
      // Fallback: go to sign-in page
      router.push("/sign-in?registered=1");
    } else {
      router.push("/onboarding");
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Zap className="w-6 h-6 text-violet-400" />
            <span className="font-bold text-lg tracking-tight text-white">SynapseForge</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-zinc-400 mt-2 text-sm">Free plan · No credit card required</p>
        </div>

        <div className="glow-border rounded-2xl p-8 bg-white/[0.02]">
          {/* Free plan note */}
          <div className="flex items-start gap-3 bg-violet-500/10 border border-violet-500/20 rounded-xl p-4 mb-6">
            <Zap className="w-4 h-4 text-violet-400 mt-0.5 shrink-0" />
            <div className="text-sm">
              <div className="text-violet-300 font-medium mb-1">Free plan includes:</div>
              <div className="text-zinc-400 space-y-0.5">
                {["1 AI instance (minimal tier)", "Dedicated manager assigned", "Upgrade by request anytime"].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <Check className="w-3 h-3 text-emerald-400" />
                    {f}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Full name</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                placeholder="John Doe"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                placeholder="you@company.com"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-1.5">Password</label>
              <input
                type="password"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                minLength={8}
                placeholder="Min. 8 characters"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
            </div>

            {error && (
              <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors py-3 rounded-lg font-semibold text-white"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
              Create account
            </button>
          </form>
        </div>

        <p className="text-center text-sm text-zinc-500 mt-6">
          Already have an account?{" "}
          <Link href="/sign-in" className="text-violet-400 hover:text-violet-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
