import { createAdminClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import type { AdminCase } from "@/types/database";

const ADMIN_CASE_SELECT = `
  id,
  user_id,
  case_type,
  status,
  display_name,
  tax_year,
  deadline,
  estimated_refund,
  actual_refund,
  paid_at,
  wizard_data,
  wizard_completed,
  machtiging_status,
  machtiging_code,
  stripe_payment_id,
  assigned_admin,
  notes_internal,
  legal_hold,
  legal_hold_reason,
  legal_hold_set_at,
  created_at,
  updated_at,
  profiles!cases_user_id_fkey(full_name,email,preferred_language)
`;

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export async function GET(request: Request) {
  const admin = await requireAdminUser();
  if ("errorResponse" in admin) return admin.errorResponse;

  const service = await createAdminClient().catch(() => null);
  if (!service) return apiError("internal", "admin_client_unavailable");

  const url = new URL(request.url);
  const page = parsePositiveInt(url.searchParams.get("page"), 1);
  const limit = Math.min(parsePositiveInt(url.searchParams.get("limit"), 25), 100);
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  const { data, error, count } = await service
    .from("cases")
    .select(ADMIN_CASE_SELECT, { count: "exact" })
    .order("created_at", { ascending: false })
    .range(from, to);

  if (error) return apiError("internal", "admin_cases_fetch_failed");

  const cases = ((data ?? []) as Array<Record<string, unknown>>).map((item) => {
    const profile = Array.isArray(item.profiles) ? item.profiles[0] : item.profiles;
    return {
      ...(item as Omit<AdminCase, "profile">),
      profile: profile
        ? {
            full_name: String((profile as Record<string, unknown>).full_name ?? ""),
            email: String((profile as Record<string, unknown>).email ?? ""),
            preferred_language: String((profile as Record<string, unknown>).preferred_language ?? "en"),
          }
        : null,
    };
  });

  const total = count ?? 0;
  const totalPages = total === 0 ? 0 : Math.ceil(total / limit);

  return apiSuccess({
    items: cases,
    page,
    limit,
    total,
    totalPages,
    hasNextPage: page < totalPages,
    hasPreviousPage: page > 1,
  });
}
