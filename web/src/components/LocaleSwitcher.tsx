"use client";

import { useLocale } from "next-intl";
import { useRouter, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { Globe } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  es: "ES",
  uk: "UK",
  ru: "RU",
};

const LOCALE_FLAGS: Record<string, string> = {
  en: "🇬🇧",
  es: "🇪🇸",
  uk: "🇺🇦",
  ru: "🇷🇺",
};

export function LocaleSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  function switchLocale(next: string) {
    router.replace(pathname, { locale: next });
    setOpen(false);
  }

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
      >
        <Globe className="w-4 h-4" />
        <span className="font-medium">{LOCALE_FLAGS[locale]} {LOCALE_LABELS[locale]}</span>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 bg-[#111118] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden min-w-[120px]">
            {routing.locales.map((l) => (
              <button
                key={l}
                onClick={() => switchLocale(l)}
                className={cn(
                  "flex items-center gap-2 w-full px-4 py-2.5 text-sm transition-colors text-left",
                  l === locale
                    ? "bg-violet-600/20 text-violet-300"
                    : "text-zinc-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <span>{LOCALE_FLAGS[l]}</span>
                <span className="font-medium">{LOCALE_LABELS[l]}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
