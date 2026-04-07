import { headers } from "next/headers";

import { PremiumLandingPage } from "@/components/fintax/landing";
import type { AppLocale } from "@/i18n/routing";
import { getPageMetadataCopy } from "@/lib/page-metadata";
import { buildPublicMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  const copy = getPageMetadataCopy(locale);
  return buildPublicMetadata({
    locale,
    pathname: "/",
    title: copy.home.title,
    description: copy.home.description,
    keywords: ["Dutch tax return", "Netherlands benefits", "international households", "FinTax"],
    ogImage: {
      url: "/visuals/hero-dashboard.png",
      width: 1600,
      height: 1000,
      alt: "FinTax case operations dashboard showing status, checklist and filing workflow",
    },
  });
}

export default async function HomePage() {
  const cspNonce = (await headers()).get("x-nonce") ?? undefined;
  return <PremiumLandingPage cspNonce={cspNonce} />;
}
