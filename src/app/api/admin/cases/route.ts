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

export async function GET() {
  const admin = await requireAdminUser();
  if ("errorResponse" in admin) return admin.errorResponse;

  const service = await createAdminClient().catch(() => null);
  if (!service) return apiError("internal", "admin_client_unavailable");

  const { data, error } = await service
    .from("cases")
    .select(ADMIN_CASE_SELECT)
    .order("created_at", { ascending: false });

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

  return apiSuccess(cases);
}
