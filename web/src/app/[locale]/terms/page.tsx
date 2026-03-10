import { getTranslations } from "next-intl/server";

export default async function TermsPage() {
  const t = await getTranslations("terms");

  const sectionKeys = ["service", "account", "payment", "ip", "termination", "liability", "contact"] as const;

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white px-6 py-24">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-4xl font-bold mb-2">{t("title")}</h1>
        <p className="text-zinc-500 text-sm mb-10">{t("lastUpdated")}</p>
        <p className="text-zinc-300 leading-relaxed mb-10">{t("intro")}</p>
        <div className="space-y-8">
          {sectionKeys.map((key) => (
            <section key={key}>
              <h2 className="text-lg font-semibold text-white mb-2">{t(`sections.${key}.title` as Parameters<typeof t>[0])}</h2>
              <p className="text-zinc-400 leading-relaxed">{t(`sections.${key}.body` as Parameters<typeof t>[0])}</p>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
