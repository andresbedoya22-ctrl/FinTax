"use client";

import { TaxReturnDocumentWorkspace } from "@/components/fintax/flows/tax-return/TaxReturnDocumentWorkspace";

export function TaxReturnFlow({ initialService }: { initialService?: string | null } = {}) {
  return <TaxReturnDocumentWorkspace initialService={initialService} />;
}
