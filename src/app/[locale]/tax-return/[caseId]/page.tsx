import { notFound } from "next/navigation";

import { CaseDetailView } from "@/components/fintax/flows";
import { getMockCase } from "@/lib/mock-data";

export default async function TaxReturnCasePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  if (!getMockCase(caseId)) notFound();
  return <CaseDetailView caseId={caseId} />;
}
