"use client";

import { useState, useEffect } from "react";
import { Copy, Check, Twitter, Gift, Users, DollarSign, TrendingUp, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface ReferralStats {
  signups: number;
  conversions: number;
  pendingCommissionUsd: number;
  earnedCommissionUsd: number;
}

interface ConversionRow {
  id: string;
  maskedEmail: string;
  plan: string;
  status: string;
  commissionUsd: number | null;
  createdAt: string;
  convertedAt: string | null;
}

interface ReferralData {
  code: string;
  link: string;
  stats: ReferralStats;
  conversions: ConversionRow[];
}

const STATUS_BADGE: Record<string, string> = {
  pending: "bg-zinc-700/50 text-zinc-400",
  converted: "bg-yellow-500/20 text-yellow-300",
  paid: "bg-emerald-500/20 text-emerald-300",
};

export default function ReferralPage() {
  const t = useTranslations("referral");
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  useEffect(() => {
    fetch("/api/referral")
      .then((r) => r.json())
      .then((d) => setData(d))
      .finally(() => setLoading(false));
  }, []);

  function copyText(text: string, which: "code" | "link") {
    navigator.clipboard.writeText(text);
    if (which === "code") {
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } else {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <Loader2 className="w-6 h-6 animate-spin text-violet-400" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-8 text-zinc-500">Failed to load referral data.</div>
    );
  }

  const { code, link, stats, conversions } = data;

  const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(
    `I've been using SynapseForge to deploy AI agents — it's great! Sign up with my link and get 1 free month:\n${link}`
  )}`;

  return (
    <div className="p-6 md:p-8 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Gift className="w-6 h-6 text-violet-400" />
          <h1 className="text-2xl font-bold text-white">{t("pageTitle")}</h1>
        </div>
        <p className="text-zinc-400 text-sm">
          Earn <span className="text-violet-300 font-semibold">10% of every subscription</span> you refer for 6 months.
          Your referred friends get <span className="text-emerald-300 font-semibold">1 free month</span> when they upgrade.
        </p>
      </div>

      {/* Referral code + link */}
      <div className="glow-border rounded-2xl p-6 bg-white/[0.02] mb-6">
        <h2 className="text-sm font-semibold text-zinc-400 uppercase tracking-wider mb-4">{t("yourReferralLink")}</h2>

        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Code */}
          <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 flex-1">
            <span className="font-mono text-lg font-bold text-white tracking-widest">{code}</span>
            <button
              onClick={() => copyText(code, "code")}
              className="ml-auto text-zinc-500 hover:text-violet-400 transition-colors"
              title={t("copyCode")}
            >
              {copiedCode ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Share link */}
        <div className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-4">
          <span className="text-sm text-zinc-400 truncate flex-1">{link}</span>
          <button
            onClick={() => copyText(link, "link")}
            className="text-zinc-500 hover:text-violet-400 transition-colors shrink-0"
            title={t("copyLink")}
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
          </button>
        </div>

        {/* Share buttons */}
        <div className="flex gap-3">
          <a
            href={twitterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#1d9bf0]/10 hover:bg-[#1d9bf0]/20 border border-[#1d9bf0]/20 text-[#1d9bf0] rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            <Twitter className="w-4 h-4" />
            {t("shareOnX")}
          </a>
          <button
            onClick={() => copyText(link, "link")}
            className="flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 rounded-xl px-4 py-2.5 text-sm font-medium transition-colors"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            {t("copyLinkBtn")}
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Users, label: t("signUps"), value: stats.signups, color: "text-violet-400" },
          { icon: TrendingUp, label: t("conversions"), value: stats.conversions, color: "text-blue-400" },
          {
            icon: DollarSign,
            label: t("pendingEarnings"),
            value: `$${stats.pendingCommissionUsd.toFixed(2)}`,
            color: "text-yellow-400",
          },
          {
            icon: DollarSign,
            label: t("paidOut"),
            value: `$${stats.earnedCommissionUsd.toFixed(2)}`,
            color: "text-emerald-400",
          },
        ].map((s) => (
          <div key={s.label} className="glow-border rounded-2xl p-5 bg-white/[0.02]">
            <s.icon className={cn("w-5 h-5 mb-3", s.color)} />
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-zinc-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Conversions table */}
      <div className="glow-border rounded-2xl bg-white/[0.02] overflow-hidden">
        <div className="p-5 border-b border-white/5">
          <h2 className="font-semibold text-white">Referred Users</h2>
          <p className="text-xs text-zinc-500 mt-0.5">Emails are partially masked for privacy.</p>
        </div>

        {conversions.length === 0 ? (
          <div className="p-8 text-center">
            <Gift className="w-10 h-10 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400 font-medium mb-1">{t("noReferralsYet")}</p>
            <p className="text-zinc-600 text-sm">{t("noReferralsDesc")}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-zinc-500 text-xs uppercase tracking-wider border-b border-white/5">
                  <th className="px-5 py-3 text-left font-medium">User</th>
                  <th className="px-5 py-3 text-left font-medium">Plan</th>
                  <th className="px-5 py-3 text-left font-medium">Status</th>
                  <th className="px-5 py-3 text-left font-medium">Commission</th>
                  <th className="px-5 py-3 text-left font-medium">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {conversions.map((c) => (
                  <tr key={c.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-3.5 font-mono text-zinc-300">{c.maskedEmail}</td>
                    <td className="px-5 py-3.5">
                      <span className="capitalize text-zinc-300">{c.plan}</span>
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={cn(
                          "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                          STATUS_BADGE[c.status] ?? "bg-zinc-700/50 text-zinc-400"
                        )}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-zinc-300">
                      {c.commissionUsd != null ? `$${c.commissionUsd.toFixed(2)}` : "—"}
                    </td>
                    <td className="px-5 py-3.5 text-zinc-500 text-xs">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* How it works */}
      <div className="mt-6 glow-border rounded-2xl p-6 bg-white/[0.02]">
        <h2 className="font-semibold text-white mb-4">{t("howItWorks")}</h2>
        <div className="grid sm:grid-cols-3 gap-4">
          {[
            { step: "1", title: t("shareYourLink"), desc: t("shareDesc") },
            { step: "2", title: t("theySignUp"), desc: t("theySignUpDesc") },
            { step: "3", title: t("earnCommissions"), desc: t("earnCommissionsDesc") },
          ].map((s) => (
            <div key={s.step} className="flex gap-3">
              <div className="w-7 h-7 rounded-full bg-violet-600/20 border border-violet-500/30 flex items-center justify-center text-xs font-bold text-violet-400 shrink-0">
                {s.step}
              </div>
              <div>
                <div className="text-sm font-medium text-white mb-0.5">{s.title}</div>
                <div className="text-xs text-zinc-500">{s.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
