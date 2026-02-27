"use client";

import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/hooks/api-client";
import type { ChecklistItem } from "@/types/database";

export function useChecklist(caseId: string) {
  return useQuery({
    queryKey: ["checklist", caseId],
    queryFn: () => apiGet<ChecklistItem[]>(`/api/cases/${caseId}/checklist`),
    enabled: Boolean(caseId),
  });
}
