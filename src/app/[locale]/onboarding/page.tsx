import { OnboardingScreen } from "@/components/fintax/auth/OnboardingScreen";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolved = await searchParams;
  const next = Array.isArray(resolved.next) ? resolved.next[0] : resolved.next;
  return <OnboardingScreen initialNextPath={next} />;
}
