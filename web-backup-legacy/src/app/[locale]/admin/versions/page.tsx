import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { AdminVersionsClient } from "@/components/AdminVersionsClient";
import { getTranslations } from "next-intl/server";

export default async function AdminVersionsPage() {
  const session = await auth();
  const adminEmails = (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((e) => e.trim())
    .filter(Boolean);

  if (!session?.user?.email || !adminEmails.includes(session.user.email)) {
    redirect("/dashboard");
  }

  const t = await getTranslations("admin");

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-white mb-6">{t("versionManagement")}</h1>
      <AdminVersionsClient />
    </div>
  );
}
