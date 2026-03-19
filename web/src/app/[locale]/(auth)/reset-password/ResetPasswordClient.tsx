"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";

interface ResetPasswordClientProps {
  token?: string;
}

export function ResetPasswordClient({ token }: ResetPasswordClientProps) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (!token) {
      setError("Invalid or expired reset link");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/en/sign-in");
        }, 2000);
      } else {
        setError(data.error || "Failed to reset password");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
        <div className="w-full max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Invalid Reset Link</h1>
          <p className="text-zinc-400 mb-6">
            This password reset link is invalid or has expired.
          </p>
          <Link
            href="/en/forgot-password"
            className="text-violet-400 hover:text-violet-300"
          >
            Request a new reset link
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0a0f] px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-violet-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <span className="text-xl font-bold">OpenHelix AI</span>
          </Link>
        </div>

        {success ? (
          <div className="glow-border rounded-2xl bg-white/[0.02] p-8 text-center">
            <CheckCircle className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Password Reset!</h1>
            <p className="text-zinc-400 mb-6">
              Your password has been successfully reset. Redirecting to sign in...
            </p>
          </div>
        ) : (
          <div className="glow-border rounded-2xl bg-white/[0.02] p-8">
            <h1 className="text-2xl font-bold text-center mb-2">Reset Password</h1>
            <p className="text-zinc-400 text-center mb-6">
              Create a new password for your account
            </p>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-2 text-sm text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* New Password */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">New Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                <p className="mt-1 text-xs text-zinc-500">Must be at least 8 characters</p>
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm text-zinc-400 mb-2">Confirm Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                  <input
                    type={showConfirm ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-zinc-600 focus:outline-none focus:border-violet-500"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 font-medium transition-colors"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
