import { AuthScreen } from "@/components/fintax/auth";

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
      }}
    />
  );
}
