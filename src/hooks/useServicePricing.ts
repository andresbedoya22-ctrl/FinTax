"use client";

import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/hooks/api-client";
import type { ServicePricing } from "@/types/database";

export function useServicePricing() {
  return useQuery({
    queryKey: ["service-pricing"],
    queryFn: () => apiGet<ServicePricing[]>("/api/service-pricing"),
  });
}
