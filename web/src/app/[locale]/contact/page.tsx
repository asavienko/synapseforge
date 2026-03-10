import { getTranslations } from "next-intl/server";

export default async function ContactPage() {
  const t = await getTranslations("contact");
  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center px-6 py-24">
      <div className="max-w-xl w-full">
        <h1 className="text-4xl font-bold mb-4 text-white">{t("title")}</h1>
        <p className="text-zinc-400 mb-8">{t("subtitle")}</p>
        <a
          href="mailto:hello@synapseforge.ai"
          className="inline-flex items-center gap-2 bg-violet-600 hover:bg-violet-500 transition-colors text-white font-semibold px-6 py-3 rounded-xl text-sm"
        >
          hello@synapseforge.ai
        </a>
      </div>
    </main>
  );
}
