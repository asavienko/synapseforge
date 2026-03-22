"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Users, Loader2, CheckCircle2, XCircle, ArrowRight } from "lucide-react";

export default function JoinTeamPage() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [invite, setInvite] = useState<{
    email: string;
    role: string;
    teamOwner: string;
  } | null>(null);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid invite link");
      setLoading(false);
      return;
    }

    fetch(`/api/team/join?token=${token}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setInvite(data.invite);
        }
      })
      .catch(() => setError("Failed to load invite"))
      .finally(() => setLoading(false));
  }, [token]);

  async function handleJoin() {
    if (!token) return;

    setJoining(true);
    try {
      const res = await fetch("/api/team/join", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        setJoined(true);
      } else {
        setError(data.error || "Failed to join team");
      }
    } catch {
      setError("Failed to join team");
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-white mb-2">Unable to join team</h1>
          <p className="text-zinc-400 mb-6">{error}</p>
          <Link
            href="/"
            className="text-violet-400 hover:text-violet-300"
          >
            Go to dashboard →
          </Link>
        </div>
      </div>
    );
  }

  if (joined) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Welcome to the team! 🎉</h1>
          <p className="text-zinc-400 mb-6">
            You've successfully joined {invite?.teamOwner}&apos;s team as a{" "}
            {invite?.role}.
          </p>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-xl font-semibold text-white"
          >
            Go to Dashboard
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="glow-border rounded-2xl bg-[#12121a] border border-white/10 p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-2xl bg-violet-600/20 border border-violet-500/30 flex items-center justify-center mx-auto mb-4">
              <Users className="w-8 h-8 text-violet-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Join Team</h1>
            <p className="text-zinc-400">
              You&apos;ve been invited to collaborate on SynapseForge
            </p>
          </div>

          {invite && (
            <>
              <div className="bg-white/5 border border-white/10 rounded-xl p-4 mb-6">
                <div className="text-sm text-zinc-500 mb-1">Team owner</div>
                <div className="font-medium text-white mb-3">{invite.teamOwner}</div>
                
                <div className="text-sm text-zinc-500 mb-1">Your role</div>
                <span className="inline-block px-2 py-1 bg-violet-500/20 text-violet-400 text-sm rounded">
                  {invite.role}
                </span>
              </div>

              <button
                onClick={handleJoin}
                disabled={joining}
                className="w-full flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-colors py-3 rounded-xl font-semibold text-white"
              >
                {joining ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Joining...
                  </>
                ) : (
                  "Accept Invitation"
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
