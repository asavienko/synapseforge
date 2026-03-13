import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ZapierIntegrationClient } from "@/components/ZapierIntegrationClient";

export default async function IntegrationsPage() {
  const session = await auth();
  if (!session?.user) redirect("/sign-in");

  const t = await getTranslations("integrations");

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">{t("title")}</h1>
      <p className="text-zinc-400 mb-8">{t("subtitle")}</p>
      <ZapierIntegrationClient />
    </div>
  );
}
