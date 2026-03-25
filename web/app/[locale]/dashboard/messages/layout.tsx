import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.messages");
  return {
    title: t("metaTitle"),
  };
}

export default function MessagesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
