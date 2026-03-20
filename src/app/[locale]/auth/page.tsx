import { AuthScreen } from "@/components/fintax/auth/AuthScreen";
import type { AppLocale } from "@/i18n/routing";
import { getPageMetadataCopy } from "@/lib/page-metadata";
import { buildNoIndexMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  const copy = getPageMetadataCopy(locale);
  return buildNoIndexMetadata({
    locale,
    pathname: "/auth",
    title: copy.auth.title,
    description: copy.auth.description,
  });
}

export default async function AuthPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const pick = (value: string | string[] | undefined) => (Array.isArray(value) ? value[0] : value);
  return (
    <AuthScreen
      initialSearchParams={{
        intent: pick(resolved.intent),
        service: pick(resolved.service),
        next: pick(resolved.next),
        reason: pick(resolved.reason),
      }}
    />
  );
}
