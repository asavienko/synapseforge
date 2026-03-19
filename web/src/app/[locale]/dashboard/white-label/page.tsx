import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WhiteLabelForm } from "@/components/WhiteLabelForm";

export default async function WhiteLabelPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const t = await getTranslations("whiteLabel");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { whiteLabelConfig: true },
  });

  const config = user?.whiteLabelConfig ?? {
    brandName: "SynapseForge",
    brandColor: "#7c3aed",
    logoUrl: null,
    customDomain: null,
    hidePoweredBy: false,
  };

  const isAgency = user?.plan === "enterprise";

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-2">{t("title")}</h1>
      <p className="text-zinc-400 mb-8">{t("subtitle")}</p>
      <WhiteLabelForm
        initialConfig={{
          brandName: config.brandName,
          brandColor: config.brandColor,
          logoUrl: config.logoUrl ?? "",
          customDomain: config.customDomain ?? "",
          hidePoweredBy: config.hidePoweredBy,
        }}
        isAgency={isAgency}
      />
    </div>
  );
}
