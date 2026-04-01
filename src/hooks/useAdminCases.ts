"use client";

import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/hooks/api-client";
import type { AdminCase } from "@/types/database";

export function useAdminCases() {
  return useQuery({
    queryKey: ["admin-cases"],
    queryFn: () => apiGet<AdminCase[]>("/api/admin/cases"),
  });
}
