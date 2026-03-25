import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.instances");
  return { title: t("instanceDetailMetaTitle") };
}

export default function InstanceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
