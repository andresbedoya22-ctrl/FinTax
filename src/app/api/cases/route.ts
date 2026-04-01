import { apiError, apiSuccess } from "@/lib/api/response";
import { requireAuthedUser } from "@/lib/api/auth";

export async function GET() {
  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const { data, error } = await authed.supabase
    .from("cases")
    .select(
      "id, user_id, case_type, status, display_name, tax_year, origin_country_code, residency_pattern, filing_route, deadline, estimated_refund, actual_refund, paid_at, wizard_data, wizard_completed, current_intake_snapshot_id, active_rule_set_id, requirements_completion_ratio, blocking_requirements_count, requirements_summary, last_client_submission_at, last_requirement_refresh_at, machtiging_status, machtiging_code, stripe_payment_id, assigned_admin, notes_internal, created_at, updated_at",
    )
    .eq("user_id", authed.user.id)
    .order("created_at", { ascending: false });

  if (error) return apiError("internal");

  return apiSuccess(data ?? []);
}
