"use client";

import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/hooks/api-client";
import type { ChecklistItem } from "@/types/database";

/**
 * @deprecated Legacy compatibility hook.
 * The tax-return main route must use `useCaseRequirements` / `useCaseProgress` from `useTaxReturnDocFlow`.
 */
export function useChecklist(caseId: string) {
  return useQuery({
    queryKey: ["legacy-checklist", caseId],
    queryFn: () => apiGet<ChecklistItem[]>(`/api/cases/${caseId}/checklist`),
    enabled: Boolean(caseId),
  });
}
