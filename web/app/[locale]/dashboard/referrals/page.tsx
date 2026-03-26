"use client";

import { useState, useEffect } from "react";
import { Gift, Copy, Check, Share2, Users, DollarSign, Clock } from "lucide-react";
import { toast } from "sonner";
import { useAnalytics } from "@/components/AnalyticsProvider";
import { useTranslations } from "next-intl";

interface Conversion {
  id: string;
  email: string;
  date: string;
  status: "converted" | "paid" | "pending";
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
  conversionsList: Conversion[];
}

export default function ReferralsPage() {
  const t = useTranslations("referral");
  const [data, setData] = useState<ReferralData | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { track } = useAnalytics();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/referrals");
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch {
        // Silent fail
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const copyReferralLink = () => {
    if (!data?.referralUrl) return;
    
    navigator.clipboard.writeText(data.referralUrl);
    setCopied(true);
    toast.success(t("linkCopied"));
    track("referral_link_copied", { code: data.code });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-50 dark:bg-white/5 rounded w-1/3"></div>
          <div className="h-32 bg-gray-50 dark:bg-white/5 rounded"></div>
        </div>
      </div>
    );
  }

  const totalEarnings = (data?.paidEarnings || 0) + (data?.pendingEarnings || 0);

  return (
    <div className="max-w-4xl mx-auto px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold mb-2">{t("pageTitle")}</h1>
        <p className="text-gray-500 dark:text-zinc-400">{t("pageSubtitle")}</p>
      </div>

      {/* Referral Code Card */}
      <div className="p-6 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Gift className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h2 className="font-semibold">{t("yourReferralLink")}</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-500">{t("shareDescription")}</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 px-4 py-3 bg-gray-100 dark:bg-black/50 rounded-lg font-mono text-sm text-gray-700 dark:text-zinc-300 break-all">
            {data?.referralUrl || t("loading")}
          </div>
          <button
            onClick={copyReferralLink}
            disabled={!data?.referralUrl}
            className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-lg font-medium"
          >
            {copied ? (
              <><Check className="w-4 h-4" /> {t("copied")}</>
            ) : (
              <><Copy className="w-4 h-4" /> {t("copyLink")}</>
            )}
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="p-4 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Users className="w-4 h-4 text-gray-500 dark:text-zinc-500" />
            <span className="text-sm text-gray-500 dark:text-zinc-500">{t("totalReferrals")}</span>
          </div>
          <p className="text-2xl font-bold">{data?.totalReferrals || 0}</p>
        </div>

        <div className="p-4 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Share2 className="w-4 h-4 text-amber-500" />
            <span className="text-sm text-gray-500 dark:text-zinc-500">{t("conversions")}</span>
          </div>
          <p className="text-2xl font-bold">{data?.conversions || 0}</p>
        </div>

        <div className="p-4 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="w-4 h-4 text-emerald-500" />
            <span className="text-sm text-gray-500 dark:text-zinc-500">{t("pendingEarnings")}</span>
          </div>
          <p className="text-2xl font-bold">${data?.pendingEarnings?.toFixed(2) || "0.00"}</p>
        </div>

        <div className="p-4 bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm text-gray-500 dark:text-zinc-500">{t("totalEarnings")}</span>
          </div>
          <p className="text-2xl font-bold">${totalEarnings.toFixed(2)}</p>
        </div>
      </div>

      {/* Conversions List */}
      {data?.conversionsList && data.conversionsList.length > 0 && (
        <div className="bg-white dark:bg-white/[0.02] border border-gray-200 dark:border-white/5 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-white/5">
            <h3 className="font-semibold">{t("recentConversions")}</h3>
          </div>
          <div className="divide-y divide-white/5">
            {data.conversionsList.map((conv) => (
              <div key={conv.id} className="px-6 py-4 flex items-center justify-between">
                <div>
                  <p className="font-medium">{conv.email}</p>
                  <p className="text-sm text-gray-500 dark:text-zinc-500">{conv.plan}</p>
                </div>
                <div className="text-right">
                  <p className="font-semibold">${conv.amount.toFixed(2)}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    conv.status === "paid" 
                      ? "bg-emerald-500/10 text-emerald-400" 
                      : conv.status === "converted"
                      ? "bg-amber-500/10 text-amber-400"
                      : "bg-zinc-500/10 text-gray-500 dark:text-zinc-400"
                  }`}>
                    {t(`status.${conv.status}`)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
