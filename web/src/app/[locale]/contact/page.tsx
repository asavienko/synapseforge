import { getTranslations } from "next-intl/server";
import { ContactForm } from "@/components/ContactForm";

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <main className="min-h-screen bg-[#0a0a0f] text-white flex flex-col items-center justify-center px-6 py-24">
      <ContactForm
        labels={{
          title: t("title"),
          subtitle: t("subtitle"),
          nameLabel: t("nameLabel"),
          namePlaceholder: t("namePlaceholder"),
          emailLabel: t("emailLabel"),
          emailPlaceholder: t("emailPlaceholder"),
          subjectLabel: t("subjectLabel"),
          subjectPlaceholder: t("subjectPlaceholder"),
          messageLabel: t("messageLabel"),
          messagePlaceholder: t("messagePlaceholder"),
          send: t("send"),
          sending: t("sending"),
          successTitle: t("successTitle"),
          successDesc: t("successDesc"),
          successReset: t("successReset"),
          fallback: t("fallback"),
          backHome: t("backHome"),
        }}
      />
    </main>
  );
}
