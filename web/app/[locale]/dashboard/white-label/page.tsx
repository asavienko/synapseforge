import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { WhiteLabelForm } from "@/components/WhiteLabelForm";
import { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("whiteLabelPage");
  return {
    title: t("metaTitle"),
  };
}

export default async function WhiteLabelPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in");

  const t = await getTranslations("whiteLabelPage");

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: { whiteLabelConfig: true },
  });

  const config = user?.whiteLabelConfig ?? {
    brandName: "OpenHelix AI",
    brandColor: "#7c3aed",
    logoUrl: null,
    customDomain: null,
    hidePoweredBy: false,
  };

  const isAgency = user?.plan === "enterprise";

  return (
    <div className="max-w-2xl mx-auto px-4 pt-14 pb-8 md:px-4 md:pt-6 md:pb-8">
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
