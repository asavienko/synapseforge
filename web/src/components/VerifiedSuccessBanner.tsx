"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { CheckCircle2, X } from "lucide-react";
import { useTranslations } from "next-intl";

export function VerifiedSuccessBanner() {
  const t = useTranslations("common");
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (params.get("verified") === "1") {
      setShow(true);
      // Strip the query param from URL without triggering navigation
      const url = new URL(window.location.href);
      url.searchParams.delete("verified");
      router.replace(pathname, { scroll: false });
    }
  }, [params, router, pathname]);

  if (!show) return null;

  return (
    <div className="bg-emerald-500/10 border-b border-emerald-500/20 px-4 py-2.5 flex items-center gap-3">
      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
      <p className="text-sm text-emerald-200 flex-1">
        🎉 {t("emailVerifiedSuccess")}
      </p>
      <button
        onClick={() => setShow(false)}
        className="text-emerald-500 hover:text-emerald-300 transition-colors shrink-0"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
