import { CaseDetailView } from "@/components/fintax/flows";

export default async function BenefitsCasePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  return <CaseDetailView caseId={caseId} />;
}
