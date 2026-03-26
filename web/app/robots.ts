import { MetadataRoute } from "next";

const locales = ["es", "ru", "uk"]; // 'en' is the default (no prefix)

// Build locale-aware disallow paths: covers /path and /es/path /ru/path /uk/path
function allLocales(path: string): string[] {
  return [path, ...locales.map((l) => `/${l}${path}`)];
}

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        // Auth flows — no SEO value
        ...allLocales("/sign-in"),
        ...allLocales("/sign-up"),
        ...allLocales("/forgot-password"),
        ...allLocales("/reset-password"),
        ...allLocales("/verify-email"),
        ...allLocales("/accept-invite"),
        // Private app pages
        ...allLocales("/onboarding"),
        ...allLocales("/dashboard/"),
        ...allLocales("/admin/"),
        ...allLocales("/manager/"),
        // API & internals
        "/api/",
        "/widget-chat/",
        "/internal/",
      ],
    },
    sitemap: "https://openhelixai.com/sitemap.xml",
  };
}
