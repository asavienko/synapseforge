import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { FadeInView } from "@/components/animations/FadeInView";
import { StatusClient } from "./StatusClient";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("status");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

export default async function StatusPage() {
  const t = await getTranslations("status");

  return (
    <div className="min-h-screen bg-white dark:bg-[#0a0a0f] text-gray-900 dark:text-[#f5f5f7]">
      <SiteHeader />

      {/* Hero */}
      <section className="relative mesh-gradient grid-bg py-16 sm:py-24 md:py-32">
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 text-center">
          <FadeInView direction="up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-500/20 text-[12px] text-emerald-600 dark:text-emerald-400 mb-6">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              {t("allSystemsOperational")}
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4">
              <span className="gradient-text">{t("title")}</span>
            </h1>
            <p className="text-lg text-gray-500 dark:text-white/50 max-w-xl mx-auto">{t("subtitle")}</p>
          </FadeInView>
        </div>
      </section>

      {/* Status Content */}
      <section className="py-16 sm:py-24 md:py-32">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <FadeInView direction="up" delay={100}>
            <StatusClient />
          </FadeInView>

          {/* Footer */}
          <FadeInView direction="up" delay={200}>
            <div className="mt-16 text-center">
              <p className="text-sm text-gray-500 dark:text-white/50">
                {t("questions")}{" "}
                <a
                  href="mailto:hello@openhelixai.com"
                  className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  hello@openhelixai.com
                </a>
              </p>
            </div>
          </FadeInView>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
