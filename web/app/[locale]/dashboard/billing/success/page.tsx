import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import { SuccessContent } from "./SuccessContent";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("dashboard.billing.successPage");
  return {
    title: t("welcomePro"),
  };
}

export default function UpgradeSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-violet-600 border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <SuccessContent />
    </Suspense>
  );
}
