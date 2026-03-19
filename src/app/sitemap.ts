import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { buildAbsoluteUrl, getConfiguredBaseUrl } from "@/lib/seo";

const localizedPublicPaths = ["/", "/auth", "/legal/privacy", "/legal/terms"];
const WEEKLY = "weekly" as const;
const MONTHLY = "monthly" as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const metadataBase = getConfiguredBaseUrl();

  if (!metadataBase && process.env.NODE_ENV === "development") {
    console.warn("[seo] NEXT_PUBLIC_APP_URL is not set. Falling back to localhost sitemap URLs.");
  }

  const now = new Date();
  const localizedEntries = routing.locales.flatMap((locale) =>
    localizedPublicPaths.map((path) => ({
      url: buildAbsoluteUrl(`/${locale}${path === "/" ? "" : path}`),
      lastModified: now,
      changeFrequency: path === "/" ? WEEKLY : MONTHLY,
      priority: path === "/" ? 0.9 : 0.6,
    })),
  );

  if (!metadataBase && process.env.NODE_ENV !== "development") {
    return localizedEntries;
  }

  if (!metadataBase) {
    return [
      {
        url: buildAbsoluteUrl("/"),
        lastModified: now,
        changeFrequency: WEEKLY,
        priority: 1,
      },
      ...localizedEntries,
    ];
  }

  return [
    {
      url: buildAbsoluteUrl("/"),
      lastModified: now,
      changeFrequency: WEEKLY,
      priority: 1,
    },
    ...localizedEntries,
  ];
}
