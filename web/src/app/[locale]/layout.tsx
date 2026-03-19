import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { ThemeProvider } from "@/components/ThemeProvider";
import "../globals.css";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Suspense } from "react";
import { PostHogProvider } from "@/components/PostHogProvider";
import { PostHogPageView } from "@/components/PostHogPageView";
import { Analytics } from "@vercel/analytics/react";
import { SpeedInsights } from "@vercel/speed-insights/next";

const inter = Inter({ subsets: ["latin", "cyrillic"] });

export const viewport: Viewport = {
  themeColor: "#7c3aed",
};

export const metadata: Metadata = {
  title: {
    default: "SynapseForge — AI Agent for Your Business on Telegram & WhatsApp",
    template: "%s | SynapseForge",
  },
  description:
    "Deploy a 24/7 AI agent that answers customer questions on Telegram and WhatsApp. Set up in under 10 minutes. No developers needed. Start free.",
  keywords: ["AI agent", "Telegram bot", "WhatsApp bot", "customer support AI", "AI chatbot for business", "managed AI agent"],
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "SynapseForge",
  },
  openGraph: {
    type: "website",
    siteName: "SynapseForge",
    title: "AI Agent for Your Business — Live on Telegram & WhatsApp in 10 Minutes",
    description:
      "Stop missing customer messages. Deploy a 24/7 AI agent that handles FAQs, bookings, and support on Telegram and WhatsApp. Start free, no card required.",
    url: "https://synapseforge-mu.vercel.app",
    images: [
      {
        url: "/api/og",
        width: 1200,
        height: 630,
        alt: "SynapseForge — AI Agent for Telegram & WhatsApp",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Agent for Your Business — Live in 10 Minutes",
    description:
      "Stop missing customer messages. Deploy a 24/7 AI agent on Telegram and WhatsApp. Start free.",
    images: ["/api/og"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

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
      <body className={`${inter.className} antialiased`}>
        <PostHogProvider>
          <NextIntlClientProvider messages={messages}>
            <Suspense fallback={null}>
              <PostHogPageView />
            </Suspense>
            {children}
          </NextIntlClientProvider>
        </PostHogProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
