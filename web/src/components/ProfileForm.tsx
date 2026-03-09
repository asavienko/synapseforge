"use client";

import { useState } from "react";
import { Loader2, CheckCircle2 } from "lucide-react";

interface ProfileFormProps {
  initialName: string;
  email: string;
}

export function ProfileForm({ initialName, email }: ProfileFormProps) {
  const [name, setName] = useState(initialName);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    const res = await fetch("/api/user", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: name !== initialName ? name : undefined,
        currentPassword: currentPassword || undefined,
        newPassword: newPassword || undefined,
      }),
    });

    const data = await res.json();
    setLoading(false);

    if (!res.ok) {
      setError(data.error || "Something went wrong.");
    } else {
      setSuccess("Profile updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full text-sm text-zinc-300 bg-white/5 border border-white/10 rounded-lg px-4 py-3 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
        />
      </div>
      <div>
        <label className="block text-xs text-zinc-500 uppercase tracking-wider mb-1">Email</label>
        <div className="text-sm text-zinc-500 bg-white/[0.02] border border-white/10 rounded-lg px-4 py-3">
          {email}
        </div>
      </div>

      <div className="pt-2 border-t border-white/5">
        <p className="text-xs text-zinc-500 mb-3 uppercase tracking-wider">Change Password</p>
        <div className="space-y-3">
          <input
            type="password"
            value={currentPassword}
            onChange={(e) => setCurrentPassword(e.target.value)}
            placeholder="Current password"
            className="w-full text-sm text-zinc-300 bg-white/5 border border-white/10 rounded-lg px-4 py-3 placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
          />
          <input
            type="password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="New password (min. 8 characters)"
            minLength={8}
            className="w-full text-sm text-zinc-300 bg-white/5 border border-white/10 rounded-lg px-4 py-3 placeholder-zinc-600 focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
          />
        </div>
      </div>

      {error && (
        <div className="text-sm text-red-400 bg-red-400/10 border border-red-400/20 rounded-lg px-4 py-3">
          {error}
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 rounded-lg px-4 py-3">
          <CheckCircle2 className="w-4 h-4 shrink-0" />
          {success}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors px-5 py-2.5 rounded-lg text-sm font-semibold text-white"
      >
        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
        Save changes
      </button>
    </form>
  );
}
