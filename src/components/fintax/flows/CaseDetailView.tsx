"use client";

import { TaxReturnDocumentWorkspace } from "@/components/fintax/flows/tax-return/TaxReturnDocumentWorkspace";

export function CaseDetailView({ caseId }: { caseId: string }) {
  return <TaxReturnDocumentWorkspace caseId={caseId} />;
}
