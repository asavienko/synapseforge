"use client";

import { useState, useEffect } from "react";
import {
  Gift,
  Copy,
  Check,
  Twitter,
  Users,
  DollarSign,
  TrendingUp,
  Clock,
  Share2,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReferralConversion {
  id: string;
  email: string;
  date: string;
  status: "pending" | "converted" | "paid";
  amount: number;
  plan: string;
}

interface ReferralData {
  code: string;
  referralUrl: string;
  totalReferrals: number;
  conversions: number;
  pendingEarnings: number;
  paidEarnings: number;
  conversionsList: ReferralConversion[];
}

function StatCard({
  title,
  value,
  icon: Icon,
  color,
}: {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: "violet" | "emerald" | "amber" | "blue";
}) {
  const colorClasses = {
    violet: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  };

  return (
    <div className="glow-border rounded-xl p-6 bg-white/[0.02]">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-zinc-400 text-sm mb-1">{title}</p>
          <p className="text-2xl font-bold text-white">{value}</p>
        </div>
        <div className={cn("p-3 rounded-lg border", colorClasses[color])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: ReferralConversion["status"] }) {
  const styles = {
    pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    converted: "bg-violet-500/10 text-violet-400 border-violet-500/20",
    paid: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  };

  const labels = {
    pending: "Pending",
    converted: "Converted",
    paid: "Paid",
  };

  return (
    <span
      className={cn(
        "px-2.5 py-1 rounded-full text-xs font-medium border",
        styles[status]
      )}
    >
      {labels[status]}
    </span>
  );
}

export default function ReferralsPage() {
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("/api/referrals")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch(() => {
        toast.error("Failed to load referral data");
        setLoading(false);
      });
  }, []);

  const handleCopy = async () => {
    if (!data?.referralUrl) return;
    try {
      await navigator.clipboard.writeText(data.referralUrl);
      setCopied(true);
      toast.success("Referral link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleTwitterShare = () => {
    if (!data?.referralUrl) return;
    const text = encodeURIComponent(
      `Build AI agents with OpenHelix AI! 🤖 Get 1 free month when you upgrade using my referral link:`
    );
    const url = encodeURIComponent(data.referralUrl);
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      "_blank",
      "width=600,height=400"
    );
  };

  const handleWhatsAppShare = () => {
    if (!data?.referralUrl) return;
    const text = encodeURIComponent(
      `Build AI agents with OpenHelix AI! 🤖 Get 1 free month when you upgrade using my referral link: ${data.referralUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-5xl mx-auto">
          <div className="h-8 w-48 bg-white/5 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="h-24 bg-white/5 rounded-xl animate-pulse"
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-6 md:p-8">
        <div className="max-w-5xl mx-auto text-center py-16">
          <Gift className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">
            Something went wrong
          </h2>
          <p className="text-zinc-400">
            Failed to load your referral data. Please try again later.
          </p>
        </div>
      </div>
    );
  }

  const totalEarnings = data.paidEarnings + data.pendingEarnings;

  return (
    <div className="p-6 md:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-white mb-2">Referrals</h1>
          <p className="text-zinc-400">
            Invite friends and earn 20% of their first payment
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            title="Total Referrals"
            value={data.totalReferrals}
            icon={Users}
            color="blue"
          />
          <StatCard
            title="Conversions"
            value={data.conversions}
            icon={TrendingUp}
            color="violet"
          />
          <StatCard
            title="Pending Earnings"
            value={`$${data.pendingEarnings.toFixed(2)}`}
            icon={Clock}
            color="amber"
          />
          <StatCard
            title="Paid Earnings"
            value={`$${data.paidEarnings.toFixed(2)}`}
            icon={DollarSign}
            color="emerald"
          />
        </div>

        {/* Referral Link Section */}
        <div className="glow-border rounded-xl p-6 bg-white/[0.02] mb-8">
          <h2 className="text-lg font-semibold text-white mb-4">
            Your Referral Link
          </h2>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1 bg-black/30 border border-white/10 rounded-lg px-4 py-3 text-zinc-300 font-mono text-sm truncate">
              {data.referralUrl}
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center justify-center gap-2 bg-violet-600 hover:bg-violet-500 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4" />
                  Copy Link
                </>
              )}
            </button>
          </div>

          {/* Share Buttons */}
          <div className="flex flex-wrap gap-3 mt-4">
            <button
              onClick={handleTwitterShare}
              className="flex items-center gap-2 bg-[#1DA1F2]/10 hover:bg-[#1DA1F2]/20 text-[#1DA1F2] border border-[#1DA1F2]/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <Twitter className="w-4 h-4" />
              Share on X
            </button>
            <button
              onClick={handleWhatsAppShare}
              className="flex items-center gap-2 bg-[#25D366]/10 hover:bg-[#25D366]/20 text-[#25D366] border border-[#25D366]/20 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              <MessageCircle className="w-4 h-4" />
              Share on WhatsApp
            </button>
          </div>
        </div>

        {/* How It Works */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          {[
            {
              step: "1",
              title: "Share Your Link",
              desc: "Send your unique referral link to friends and colleagues",
            },
            {
              step: "2",
              title: "They Sign Up",
              desc: "They create an account and upgrade to a paid plan",
            },
            {
              step: "3",
              title: "You Earn",
              desc: "Get 20% of their first payment as a thank you",
            },
          ].map((item) => (
            <div
              key={item.step}
              className="glow-border rounded-xl p-5 bg-white/[0.02]"
            >
              <div className="w-8 h-8 rounded-full bg-violet-600 flex items-center justify-center text-sm font-bold text-white mb-3">
                {item.step}
              </div>
              <h3 className="text-white font-medium mb-1">{item.title}</h3>
              <p className="text-zinc-400 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Conversions Table */}
        <div className="glow-border rounded-xl overflow-hidden bg-white/[0.02]">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold text-white">
              Referral History
            </h2>
          </div>

          {data.conversionsList.length === 0 ? (
            <div className="p-8 text-center">
              <Gift className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
              <h3 className="text-white font-medium mb-1">
                No referrals yet
              </h3>
              <p className="text-zinc-400 text-sm">
                Share your link to start earning!
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-white/5">
                    <th className="text-left px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Referred User
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="text-left px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="text-right px-6 py-3 text-xs font-medium text-zinc-400 uppercase tracking-wider">
                      Amount
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {data.conversionsList.map((conversion) => (
                    <tr key={conversion.id} className="hover:bg-white/[0.02]">
                      <td className="px-6 py-4 text-sm text-zinc-300">
                        {conversion.email}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-400">
                        {new Date(conversion.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <StatusBadge status={conversion.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-white text-right font-medium">
                        ${conversion.amount.toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Commission Info */}
        <div className="mt-6 p-4 bg-violet-500/10 border border-violet-500/20 rounded-xl">
          <div className="flex items-start gap-3">
            <Share2 className="w-5 h-5 text-violet-400 shrink-0 mt-0.5" />
            <div>
              <h4 className="text-violet-300 font-medium mb-1">
                Commission Structure
              </h4>
              <p className="text-zinc-400 text-sm">
                Earn 20% of the first payment from every user you refer. 
                Commissions are paid out monthly after the referred user&apos;s payment is confirmed.
              </p>
              <ul className="mt-2 text-sm text-zinc-400 space-y-1">
                <li>• Starter plan: ~$9.80 per conversion</li>
                <li>• Growth plan: ~$19.80 per conversion</li>
                <li>• Scale plan: ~$39.80 per conversion</li>
                <li>• Business plan: ~$79.80 per conversion</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
