"use client";

import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/hooks/api-client";
import type { Case } from "@/types/database";

export function useCases(enabled = true) {
  return useQuery({
    queryKey: ["cases"],
    enabled,
    queryFn: () => apiGet<Case[]>("/api/cases"),
  });
}
