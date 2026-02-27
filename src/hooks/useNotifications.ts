"use client";

import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/hooks/api-client";
import type { Notification } from "@/types/database";

export function useNotifications(limit = 8) {
  return useQuery({
    queryKey: ["notifications", limit],
    queryFn: () => apiGet<Notification[]>(`/api/notifications?limit=${limit}`),
  });
}
