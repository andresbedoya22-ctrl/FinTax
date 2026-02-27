import type { MetadataRoute } from "next";

const appUrl = process.env.NEXT_PUBLIC_APP_URL;

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
      },
    ],
    sitemap: appUrl ? [`${appUrl}/sitemap.xml`] : ["/sitemap.xml"],
  };
}
