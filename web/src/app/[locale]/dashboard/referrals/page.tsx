"use client";

import { useState, useEffect } from "react";
import { Gift, Copy, Check, Share2, Users, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface ReferralStats {
  code: string;
  totalReferrals: number;
  pendingReferrals: number;
  completedReferrals: number;
  totalRewards: number;
}

export default function ReferralsPage() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("/api/referrals");
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const copyReferralLink = () => {
    if (!stats?.code) return;
    
    const link = `${window.location.origin}/?ref=${stats.code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    toast.success("Referral link copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-white/5 rounded w-1/3"></div>
          <div className="h-32 bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">Referrals</h1>
        <p className="text-zinc-400">Invite friends and earn rewards</p>
      </div>

      {/* Referral Code Card */}
      <div className="p-6 bg-white/[0.02] border border-white/5 rounded-xl mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <Gift className="w-5 h-5 text-violet-400" />
          </div>
          <div>
            <h2 className="font-semibold">Your Referral Code</h2>
            <p className="text-sm text-zinc-500">Share this link with friends</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 px-4 py-3 bg-black/50 rounded-lg font-mono text-sm text-zinc-300 break-all">
            {stats?.code 
              ? `${typeof window !== 'undefined' ? window.location.origin : ''}/?ref=${stats.code}`
              : "Loading..."}
          </div>
          <button
            onClick={copyReferralLink}
            disabled={!stats?.code}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg font-medium"
          >
            {copied ? (
              <><Check className="w-4 h-4" /> Copied!</>
            ) : (
              <><Copy className="w-4 h-4" /> Copy Link</>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-zinc-500" />
            <span className="text-sm text-zinc-500">Total Referrals</span>
          </div>
          <p className="text-2xl font-bold">{stats?.totalReferrals || 0}</p>
        </div>

        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-zinc-500">Pending</span>
          </div>
          <p className="text-2xl font-bold">{stats?.pendingReferrals || 0}</p>
        </div>

        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Check className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-zinc-500">Completed</span>
          </div>
          <p className="text-2xl font-bold">{stats?.completedReferrals || 0}</p>
        </div>

        <div className="p-4 bg-white/[0.02] border border-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-violet-400" />
            <span className="text-sm text-zinc-500">Total Rewards</span>
          </div>
          <p className="text-2xl font-bold">${stats?.totalRewards || 0}</p>
        </div>
      </div>
    </div>
  );
}