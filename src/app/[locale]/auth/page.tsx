import { AuthScreen } from "@/components/fintax/auth";
import type { AppLocale } from "@/i18n/routing";
import { buildNoIndexMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: AppLocale }> }) {
  const { locale } = await params;
  return buildNoIndexMetadata({
    locale,
    pathname: "/auth",
    title: "FinTax | Secure account access",
    description: "Sign in or create an account to access your FinTax case workspace.",
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
