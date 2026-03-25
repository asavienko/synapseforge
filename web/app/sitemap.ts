import { MetadataRoute } from "next";

const baseUrl = "https://openhelixai.com";
const locales = ["en", "es", "ru", "uk"] as const;

// For default locale 'en', next-intl uses no prefix: / not /en/
function localePath(locale: string, path: string): string {
  const slug = path === "/" ? "" : path;
  return locale === "en" ? `${baseUrl}${slug}` : `${baseUrl}/${locale}${slug}`;
}

// Build a sitemap entry with all locale alternates
function entry(
  path: string,
  options: {
    changeFrequency?: MetadataRoute.Sitemap[number]["changeFrequency"];
    priority?: number;
  } = {}
): MetadataRoute.Sitemap[number][] {
  return locales.map((locale) => ({
    url: localePath(locale, path),
    lastModified: new Date(),
    changeFrequency: options.changeFrequency ?? "monthly",
    priority: locale === "en" ? (options.priority ?? 0.7) : (options.priority ?? 0.7) * 0.9,
    alternates: {
      languages: Object.fromEntries(
        locales.map((l) => [l === "en" ? "x-default" : l, localePath(l, path)])
      ),
    },
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    // Core pages
    ...entry("/", { changeFrequency: "weekly", priority: 1.0 }),
    ...entry("/pricing", { changeFrequency: "weekly", priority: 0.9 }),
    ...entry("/templates", { changeFrequency: "weekly", priority: 0.8 }),
    ...entry("/contact", { changeFrequency: "monthly", priority: 0.6 }),
    ...entry("/changelog", { changeFrequency: "weekly", priority: 0.5 }),
    ...entry("/api-docs", { changeFrequency: "weekly", priority: 0.6 }),
    ...entry("/status", { changeFrequency: "hourly", priority: 0.4 }),
    ...entry("/privacy", { changeFrequency: "yearly", priority: 0.3 }),
    ...entry("/terms", { changeFrequency: "yearly", priority: 0.3 }),

    // Blog (only EN — posts are English-only SEO content)
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/how-to-build-telegram-chatbot`,
      lastModified: new Date("2026-03-23"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/best-ai-models-for-customer-support`,
      lastModified: new Date("2026-03-23"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/reduce-customer-support-costs-with-ai`,
      lastModified: new Date("2026-03-23"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/how-to-automate-ecommerce-customer-support`,
      lastModified: new Date("2026-03-23"),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/blog/how-to-add-ai-chatbot-to-your-website`,
      lastModified: new Date("2026-03-23"),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/blog/ai-customer-support-roi-guide`,
      lastModified: new Date("2026-03-23"),
      changeFrequency: "monthly",
      priority: 0.8,
    },

    // Integrations (EN-only SEO pages)
    {
      url: `${baseUrl}/integrations`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/integrations/telegram`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/integrations/whatsapp`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/integrations/discord`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/integrations/slack`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },

    // Use cases (EN-only SEO pages)
    {
      url: `${baseUrl}/use-cases`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/use-cases/ecommerce`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/use-cases/saas`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/use-cases/restaurant`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/use-cases/healthcare`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/use-cases/fintech`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/use-cases/real-estate`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },

    // Comparisons (EN-only SEO pages)
    {
      url: `${baseUrl}/compare`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/compare/zendesk`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/compare/freshdesk`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/compare/tidio`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/compare/intercom`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/compare/crisp`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/compare/livechat`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/compare/helpscout`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/compare/gorgias`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.8,
    },
  ];
}
