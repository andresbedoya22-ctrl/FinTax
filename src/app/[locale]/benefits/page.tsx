import { BenefitsFlow } from "@/components/fintax/flows";

export default async function BenefitsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  const caseId = typeof resolvedSearchParams.caseId === "string" ? resolvedSearchParams.caseId : null;
  const mode = resolvedSearchParams.mode === "postPayment" ? "postPayment" : "prePayment";

  return <BenefitsFlow initialCaseId={caseId} initialMode={mode} />;
}
