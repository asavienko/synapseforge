import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: [
        "/sign-in",
        "/sign-up",
        "/forgot-password",
        "/reset-password",
        "/verify-email",
        "/onboarding",
        "/dashboard/",
        "/admin/",
        "/manager/",
        "/api/",
        "/widget-chat/",
      ],
    },
    sitemap: "https://openhelixai.com/sitemap.xml",
  };
}