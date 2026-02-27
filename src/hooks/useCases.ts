"use client";

import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/hooks/api-client";
import type { Case } from "@/types/database";

export function useCases() {
  return useQuery({
    queryKey: ["cases"],
    queryFn: () => apiGet<Case[]>("/api/cases"),
  });
}
