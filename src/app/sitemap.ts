import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";

const appUrl = process.env.NEXT_PUBLIC_APP_URL;
const publicPaths = ["", "/legal/privacy", "/legal/terms"];

export default function sitemap(): MetadataRoute.Sitemap {
  if (!appUrl) {
    if (process.env.NODE_ENV === "development") {
      console.warn("[seo] NEXT_PUBLIC_APP_URL is not set. Returning empty sitemap.");
    }
    return [];
  }

  const now = new Date();

  return routing.locales.flatMap((locale) =>
    publicPaths.map((path) => ({
      url: `${appUrl}/${locale}${path}`,
      lastModified: now,
      changeFrequency: path === "" ? "weekly" : "monthly",
      priority: path === "" ? 1 : 0.6,
    })),
  );
}
