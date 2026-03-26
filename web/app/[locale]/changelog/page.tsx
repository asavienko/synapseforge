import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Calendar, Sparkles, Bug, Shield, ZapIcon } from "lucide-react";
import { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { SubscribeSection } from "./SubscribeSection";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("changelog");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

interface ChangelogEntry {
  date: string;
  version?: string;
  changes: {
    type: "feature" | "improvement" | "fix" | "security";
    description: string;
  }[];
}

const changelog: ChangelogEntry[] = [
  {
    date: "2026-03-21",
    changes: [
      { type: "feature", description: "Added real-time notification system for instance events" },
      { type: "feature", description: "Added usage warning banners when approaching limits" },
      { type: "feature", description: "Added credential reveal functionality" },
      { type: "feature", description: "Added system status page and health check endpoint" },
      { type: "improvement", description: "Auto-start instances in sandbox mode (no manual deploy)" },
      { type: "improvement", description: "Complete loading state coverage for all pages" },
      { type: "improvement", description: "Error boundaries for dashboard, admin, and manager sections" },
      { type: "improvement", description: "Enhanced SEO with sitemap and robots.txt" },
    ],
  },
  {
    date: "2026-03-20",
    changes: [
      { type: "feature", description: "Added registration success banner" },
      { type: "feature", description: "Added template suggestions to empty state" },
      { type: "improvement", description: "Fixed all cron jobs to run on schedule" },
      { type: "fix", description: "Updated tests to match new UI behavior" },
    ],
  },
  {
    date: "2026-03-19",
    changes: [
      { type: "feature", description: "Added password reset flow" },
      { type: "feature", description: "Added email verification system" },
      { type: "feature", description: "Added in-app messaging between clients and managers" },
      { type: "improvement", description: "Enhanced onboarding flow with use case capture" },
    ],
  },
];

const typeIcons = {
  feature: Sparkles,
  improvement: ZapIcon,
  fix: Bug,
  security: Shield,
};

const typeColors = {
  feature: "text-emerald-700 dark:text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  improvement: "text-blue-700 dark:text-blue-400 bg-blue-500/10 border-blue-500/20",
  fix: "text-amber-700 dark:text-amber-400 bg-amber-500/10 border-amber-500/20",
  security: "text-red-700 dark:text-red-400 bg-red-500/10 border-red-500/20",
};

export default async function ChangelogPage() {
  const t = await getTranslations("footer");

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      <SiteHeader />

      {/* Content */}
      <main className="max-w-4xl mx-auto px-6 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold mb-4">Changelog</h1>
          <p className="text-gray-500 dark:text-white/50">See what&apos;s new in OpenHelix AI</p>
        </div>

        <div className="space-y-12">
          {changelog.map((entry, index) => (
            <div key={entry.date} className="relative">
              {/* Date header */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                  <Calendar className="w-5 h-5 text-gray-500 dark:text-white/50" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold">
                    {new Date(entry.date).toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </h2>
                  {entry.version && (
                    <span className="text-sm text-gray-500 dark:text-white/50">{entry.version}</span>
                  )}
                </div>
              </div>

              {/* Changes */}
              <div className="space-y-3 pl-14">
                {entry.changes.map((change, changeIndex) => {
                  const Icon = typeIcons[change.type];
                  return (
                    <div
                      key={changeIndex}
                      className={`flex items-start gap-3 p-4 rounded-xl border ${typeColors[change.type]}`}
                    >
                      <Icon className="w-5 h-5 shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-medium uppercase tracking-wider opacity-70">
                          {change.type}
                        </span>
                        <p className="text-sm mt-1">{change.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Divider */}
              {index < changelog.length - 1 && (
                <div className="absolute left-5 top-16 bottom-0 w-px bg-gray-200 dark:bg-white/10" />
              )}
            </div>
          ))}
        </div>

        {/* Subscribe */}
        <SubscribeSection />

      </main>

      <SiteFooter />
    </div>
  );
}
