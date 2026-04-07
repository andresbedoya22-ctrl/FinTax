"use client";

import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/hooks/api-client";
import type { PaginatedAdminCases } from "@/types/pagination";

export function useAdminCases(page: number, limit = 25) {
  return useQuery({
    queryKey: ["admin-cases", page, limit],
    queryFn: () => apiGet<PaginatedAdminCases>(`/api/admin/cases?page=${page}&limit=${limit}`),
  });
}
