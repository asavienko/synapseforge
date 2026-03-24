import Link from "next/link";
import { useTranslations } from "next-intl";
import { Zap, ArrowLeft, Home, Search } from "lucide-react";

export default function NotFound() {
  const t = useTranslations("notFound");

  return (
    <div className="min-h-screen bg-[#0a0a0f] grid-bg flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo */}
        <Link href="/" className="inline-flex items-center gap-2 mb-8">
          <Zap className="w-6 h-6 text-violet-400" />
          <span className="font-bold text-lg tracking-tight text-white">OpenHelix AI</span>
        </Link>

        {/* 404 Code */}
        <div className="text-8xl font-bold text-violet-500/20 mb-4">404</div>

        {/* Message */}
        <h1 className="text-2xl font-bold text-white mb-2">
          {t("title")}
        </h1>
        <p className="text-zinc-400 mb-8">
          {t("description")}
        </p>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/"
            className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors px-6 py-3 rounded-lg font-semibold text-white"
          >
            <Home className="w-4 h-4" />
            {t("goHome")}
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 border border-white/10 hover:border-white/20 hover:bg-white/[0.03] transition-colors px-6 py-3 rounded-lg font-semibold text-zinc-300"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("goDashboard")}
          </Link>
        </div>

        {/* Help Link */}
        <div className="mt-8 pt-8 border-t border-white/5">
          <p className="text-sm text-zinc-500">
            {t("needHelp")}{" "}
            <Link href="/contact" className="text-violet-400 hover:text-violet-300 transition-colors">
              {t("contactSupport")}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}