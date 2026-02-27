import { PremiumLandingPage } from "@/components/fintax/landing";
import type { AppLocale } from "@/i18n/routing";
import { buildPublicMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  return buildPublicMetadata({
    locale,
    pathname: "/",
    title: "FinTax | Dutch taxes and benefits explained in your language",
    description:
      "File your tax return, manage ZZP and VAT, apply for toeslagen, and track progress with human-reviewed support.",
    ogImage: {
      url: "/visuals/app-mock.png",
      width: 1600,
      height: 1000,
      alt: "FinTax dashboard and filing workflow preview",
    },
  });
}

export default function HomePage() {
  return <PremiumLandingPage />;
}
