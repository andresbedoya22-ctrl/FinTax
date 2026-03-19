import type { MetadataRoute } from "next";

import { routing } from "@/i18n/routing";
import { buildAbsoluteUrl } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  const disallowedPaths = routing.locales.flatMap((locale) => [
    `/${locale}/dashboard`,
    `/${locale}/tax-return`,
    `/${locale}/benefits`,
    `/${locale}/settings`,
    `/${locale}/admin`,
    `/${locale}/app`,
  ]);

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/api/", ...disallowedPaths],
      },
    ],
    sitemap: buildAbsoluteUrl("/sitemap.xml"),
  };
}
