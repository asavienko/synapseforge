import { Metadata } from "next";
import { getTranslations } from "next-intl/server";
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
    <div className="min-h-screen bg-[#0a0a0f]">
      <div className="max-w-4xl mx-auto px-4 py-16">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse"></div>
            <span className="text-emerald-400 font-medium">{t("allSystemsOperational")}</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
            {t("title")}
          </h1>
          <p className="text-zinc-400">{t("subtitle")}</p>
        </div>

        <StatusClient />

        {/* Footer */}
        <div className="mt-16 text-center">
          <p className="text-sm text-zinc-500">
            {t("questions")}{" "}
            <a
              href="mailto:hello@openhelixai.com"
              className="text-violet-400 hover:text-violet-300 transition-colors"
            >
              hello@openhelixai.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
