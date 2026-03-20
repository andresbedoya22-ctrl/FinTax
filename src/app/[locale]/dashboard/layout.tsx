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
    pathname: "/dashboard",
    title: copy.dashboard.title,
    description: copy.dashboard.description,
  });
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell><AuthenticatedRouteTransition>{children}</AuthenticatedRouteTransition></DashboardShell>;
}
