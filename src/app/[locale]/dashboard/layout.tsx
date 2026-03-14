import { AuthenticatedRouteTransition } from "@/components/fintax/motion/AuthenticatedRouteTransition";
import { DashboardShell } from "@/components/fintax/dashboard";
import type { AppLocale } from "@/i18n/routing";
import { buildNoIndexMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  return buildNoIndexMetadata({
    locale,
    pathname: "/dashboard",
    title: "FinTax | Dashboard",
    description: "Authenticated workspace for case tracking and filing progress.",
  });
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <DashboardShell><AuthenticatedRouteTransition>{children}</AuthenticatedRouteTransition></DashboardShell>;
}
