import { apiError, apiSuccess } from "@/lib/api/response";
import { requireAuthedUser } from "@/lib/api/auth";

export async function GET() {
  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const { data, error } = await authed.supabase
    .from("cases")
    .select(
      "id, case_type, status, display_name, tax_year, deadline, estimated_refund, actual_refund, wizard_completed, machtiging_status, created_at, updated_at",
    )
    .eq("user_id", authed.user.id)
    .order("created_at", { ascending: false });

  if (error) return apiError("internal");

  return apiSuccess(data ?? []);
}
