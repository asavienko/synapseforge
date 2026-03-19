import { getTranslations } from "next-intl/server";
import Link from "next/link";
import {
  ArrowLeft,
  UserPlus,
  Key,
  ClipboardPaste,
  ExternalLink,
  Copy,
} from "lucide-react";
import { SetupKeyForm } from "@/components/SetupKeyForm";
import { Suspense } from "react";

export default async function SetupKeyPage() {
  const t = await getTranslations("setupKey");

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        {/* Back link */}
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-300 transition-colors mb-8"
        >
          <ArrowLeft className="w-4 h-4" />
          {t("back")}
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-zinc-400">{t("subtitle")}</p>
        </div>

        {/* Steps */}
        <div className="space-y-4">
          {/* Step 1 */}
          <div className="glow-border rounded-2xl bg-white/[0.02] p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <UserPlus className="w-5 h-5 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                    Step 1
                  </span>
                </div>
                <h2 className="text-white font-semibold text-base mb-2">
                  {t("step1.title")}
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  {t("step1.desc")}
                </p>
                <a
                  href="https://platform.openai.com/signup"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 border border-violet-500/40 hover:border-violet-400/70 text-violet-400 hover:text-violet-300 text-sm font-medium px-4 py-2.5 rounded-xl transition-colors"
                >
                  {t("step1.cta")}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Step 2 */}
          <div className="glow-border rounded-2xl bg-white/[0.02] p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <Key className="w-5 h-5 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                    Step 2
                  </span>
                </div>
                <h2 className="text-white font-semibold text-base mb-2">
                  {t("step2.title")}
                </h2>
                <p className="text-zinc-400 text-sm leading-relaxed mb-4">
                  {t("step2.desc")}
                </p>

                {/* Visual key hint */}
                <div className="flex items-center gap-2 bg-white/5 border border-white/10 rounded-lg px-3 py-2 mb-4 w-fit">
                  <code className="text-zinc-400 text-sm font-mono">sk-...</code>
                  <Copy className="w-3.5 h-3.5 text-zinc-600" />
                </div>

                <a
                  href="https://platform.openai.com/api-keys"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm text-violet-400 hover:text-violet-300 transition-colors"
                >
                  {t("step2.link")}
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>
          </div>

          {/* Step 3 */}
          <div className="glow-border rounded-2xl bg-white/[0.02] p-6">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-violet-600/20 border border-violet-500/20 flex items-center justify-center shrink-0 mt-0.5">
                <ClipboardPaste className="w-5 h-5 text-violet-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-semibold text-violet-400 uppercase tracking-wider">
                    Step 3
                  </span>
                </div>
                <h2 className="text-white font-semibold text-base mb-1">
                  {t("step3.title")}
                </h2>
                <p className="text-zinc-400 text-sm mb-5">{t("step3.desc")}</p>

                <Suspense fallback={<div className="h-32 bg-white/5 rounded-xl animate-pulse" />}>
                  <SetupKeyForm />
                </Suspense>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
