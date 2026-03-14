import { PremiumLandingPage } from "@/components/fintax/landing";
import type { AppLocale } from "@/i18n/routing";
import { buildPublicMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  return buildPublicMetadata({
    locale,
    pathname: "/",
    title: "FinTax | Dutch tax and benefits guidance for international households",
    description:
      "Structured support for Dutch tax returns, ZZP and VAT obligations, and benefits applications with human-reviewed delivery.",
    ogImage: {
      url: "/visuals/hero-dashboard.png",
      width: 1600,
      height: 1000,
      alt: "FinTax case operations dashboard showing status, checklist and filing workflow",
    },
  });
}

export default function HomePage() {
  return <PremiumLandingPage />;
}
