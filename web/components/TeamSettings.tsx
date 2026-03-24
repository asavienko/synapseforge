"use client";

import { useEffect, useState } from "react";
import { Users, Plus, X, Loader2, Mail, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamMember {
  id: string;
  email: string;
  role: "admin" | "viewer";
  status: "active" | "pending";
  joinedAt?: string;
}

export function TeamSettings() {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState<"admin" | "viewer">("viewer");
  const [sending, setSending] = useState(false);
  const [showInviteForm, setShowInviteForm] = useState(false);
  const [error, setError] = useState("");

  // Fetch team members on mount
  useEffect(() => {
    fetchMembers();
  }, []);

  async function fetchMembers() {
    try {
      const res = await fetch("/api/team");
      if (res.ok) {
        const data = await res.json();
        setMembers(data.members);
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  async function sendInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    setSending(true);
    setError("");
    
    try {
      const res = await fetch("/api/team", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });

      const data = await res.json();

      if (res.ok) {
        setMembers((prev) => [...prev, data.member]);
        setInviteEmail("");
        setShowInviteForm(false);
      } else {
        setError(data.error || "Failed to send invite");
      }
    } catch {
      setError("Failed to send invite");
    } finally {
      setSending(false);
    }
  }

  async function removeMember(id: string) {
    try {
      const res = await fetch(`/api/team?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setMembers((prev) => prev.filter((m) => m.id !== id));
      }
    } catch {
      // Silently fail
    }
  }

  if (loading) {
    return (
      <section className="glow-border rounded-2xl bg-white/[0.02] p-6 mb-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 text-violet-400 animate-spin" />
        </div>
      </section>
    );
  }

  return (
    <section className="glow-border rounded-2xl bg-white/[0.02] p-6 mb-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
            <Users className="w-5 h-5 text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold text-white">Team Members</h2>
            <p className="text-sm text-zinc-500">Invite others to collaborate on your instances</p>
          </div>
        </div>
        <button
          onClick={() => setShowInviteForm(true)}
          className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg text-sm font-semibold text-white"
        >
          <Plus className="w-4 h-4" />
          Invite
        </button>
      </div>

      {/* Invite Form */}
      {showInviteForm && (
        <form onSubmit={sendInvite} className="mb-6 p-4 bg-white/5 border border-white/10 rounded-xl">
          {error && (
            <p className="text-sm text-red-400 mb-3">{error}</p>
          )}
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="colleague@company.com"
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:border-violet-500 transition-colors"
                />
              </div>
            </div>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value as "admin" | "viewer")}
              className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-violet-500 transition-colors"
            >
              <option value="viewer">Viewer — View only</option>
              <option value="admin">Admin — Full access</option>
            </select>
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={sending}
                className="flex items-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors px-4 py-2.5 rounded-lg text-sm font-semibold text-white"
              >
                {sending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  "Send Invite"
                )}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowInviteForm(false);
                  setError("");
                }}
                className="p-2.5 text-zinc-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
          <p className="text-xs text-zinc-500 mt-2">
            <Shield className="w-3 h-3 inline mr-1" />
            Admins can manage instances and billing. Viewers can only monitor.
          </p>
        </form>
      )}

      {/* Members List */}
      <div className="space-y-2">
        {members.map((member) => (
          <div
            key={member.id}
            className="flex items-center justify-between p-3 bg-white/5 border border-white/10 rounded-lg"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-sm font-medium text-violet-400">
                {member.email[0].toUpperCase()}
              </div>
              <div>
                <p className="text-sm font-medium text-white">{member.email}</p>
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "text-xs px-1.5 py-0.5 rounded",
                    member.role === "admin" 
                      ? "bg-violet-500/20 text-violet-400" 
                      : "bg-zinc-600/20 text-zinc-400"
                  )}>
                    {member.role}
                  </span>
                  {member.status === "pending" && (
                    <span className="text-xs text-amber-400">Pending</span>
                  )}
                </div>
              </div>
            </div>
            
            {member.role !== "admin" && (
              <button
                onClick={() => removeMember(member.id)}
                className="p-2 text-zinc-500 hover:text-red-400 transition-colors"
                title="Remove member"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        ))}
      </div>

      {members.length === 0 && (
        <div className="text-center py-8 text-zinc-500">
          <Users className="w-8 h-8 mx-auto mb-2 opacity-50" />
          <p className="text-sm">No team members yet</p>
          <p className="text-xs">Invite colleagues to collaborate</p>
        </div>
      )}
    </section>
  );
}
