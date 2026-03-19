import { AuthenticatedRouteTransition } from "@/components/fintax/motion/AuthenticatedRouteTransition";
import { DashboardShell } from "@/components/fintax/dashboard";
import type { AppLocale } from "@/i18n/routing";
import { getPageMetadataCopy } from "@/lib/page-metadata";
import { buildNoIndexMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  const copy = getPageMetadataCopy(locale);
  return buildNoIndexMetadata({
    locale,
    pathname: "/tax-return",
    title: copy.taxReturn.title,
    description: copy.taxReturn.description,
  });
}

export default function TaxReturnLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell><AuthenticatedRouteTransition>{children}</AuthenticatedRouteTransition></DashboardShell>;
}
