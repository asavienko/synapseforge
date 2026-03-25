import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Suspense } from "react";
import { PostHogProvider } from "@/components/PostHogProvider";
import { PostHogPageView } from "@/components/PostHogPageView";
import { AnalyticsProvider } from "@/components/AnalyticsProvider";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const viewport: Viewport = {
  themeColor: "#7c3aed",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
};

const BASE_URL = "https://openhelixai.com";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations("siteMetadata");

  // Build hreflang alternates for all locale variants
  const localeUrlMap: Record<string, string> = {
    "x-default": BASE_URL,
    en: BASE_URL,
    es: `${BASE_URL}/es`,
    ru: `${BASE_URL}/ru`,
    uk: `${BASE_URL}/uk`,
  };
  const canonicalUrl = locale === "en" ? BASE_URL : `${BASE_URL}/${locale}`;

  return {
    title: {
      default: t("defaultTitle"),
      template: t("titleTemplate"),
    },
    description: t("description"),
    keywords: ["AI agent", "Telegram bot", "WhatsApp bot", "customer support AI", "AI chatbot for business", "managed AI agent"],
    manifest: "/manifest.json",
    metadataBase: new URL(BASE_URL),
    alternates: {
      canonical: canonicalUrl,
      languages: localeUrlMap,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: "black-translucent",
      title: "OpenHelix AI",
    },
    openGraph: {
      type: "website",
      siteName: "OpenHelix AI",
      title: t("ogTitle"),
      description: t("ogDescription"),
      url: canonicalUrl,
      images: [{ url: "/api/og", width: 1200, height: 630, alt: "OpenHelix AI — AI Agent for Telegram & WhatsApp" }],
    },
    twitter: {
      card: "summary_large_image",
      title: t("twitterTitle"),
      description: t("twitterDescription"),
      images: ["/api/og"],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true },
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as typeof routing.locales[number])) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <head>
        <link rel="alternate" hrefLang="en" href={`https://openhelixai.com/en`} />
        <link rel="alternate" hrefLang="es" href={`https://openhelixai.com/es`} />
        <link rel="alternate" hrefLang="x-default" href={`https://openhelixai.com/en`} />
      </head>
      <body className={`${inter.className} antialiased`}>
        <PostHogProvider>
          <NextIntlClientProvider messages={messages}>
            <AnalyticsProvider>
              <Suspense fallback={null}>
                <PostHogPageView />
              </Suspense>
              <ThemeProvider>
                {children}
              </ThemeProvider>
            </AnalyticsProvider>
          </NextIntlClientProvider>
        </PostHogProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
