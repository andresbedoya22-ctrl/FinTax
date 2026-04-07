import type { AdminCase } from "@/types/database";

export type PaginatedAdminCases = {
  items: AdminCase[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
};
