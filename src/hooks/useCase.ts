"use client";

import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/hooks/api-client";
import type { Case } from "@/types/database";

export function useCase(caseId: string) {
  return useQuery({
    queryKey: ["case", caseId],
    queryFn: () => apiGet<Case>(`/api/cases/${caseId}`),
    enabled: Boolean(caseId),
  });
}
