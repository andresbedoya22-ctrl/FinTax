import { notFound } from "next/navigation";

import { DashboardShell } from "@/components/fintax/dashboard";
import { CaseDetailView } from "@/components/fintax/flows";
import { getMockCase } from "@/lib/mock-data";

export default async function BenefitsCasePage({ params }: { params: Promise<{ caseId: string }> }) {
  const { caseId } = await params;
  if (!getMockCase(caseId)) notFound();
  return (
    <DashboardShell>
      <CaseDetailView caseId={caseId} />
    </DashboardShell>
  );
}
