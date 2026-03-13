/**
 * Layout for the public /chat/[instanceId] route.
 *
 * This route is outside the [locale] segment (it's a public, unbranded URL),
 * so it has no NextIntlClientProvider from the locale layout. We provide one
 * here using the default locale (English) so client components like
 * <PublicChatUI> can call useTranslations() without throwing.
 */
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";

export default async function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Always serve the public chat in English — it's a shared, unlocalized URL.
  const messages = await getMessages({ locale: "en" } as Parameters<typeof getMessages>[0]);

  return (
    <NextIntlClientProvider locale="en" messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
}
