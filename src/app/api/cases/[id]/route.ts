import { parseIdParam } from "@/lib/api/contracts";
import { requireAuthedUser } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const rawParams = await context.params;
  const parsedParams = parseIdParam(rawParams);
  if (!parsedParams.success) return apiError("invalid_params");

  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const { data, error } = await authed.supabase
    .from("cases")
    .select(
      "id, case_type, status, display_name, tax_year, deadline, estimated_refund, actual_refund, paid_at, wizard_data, wizard_completed, machtiging_status, machtiging_code, stripe_payment_id, created_at, updated_at",
    )
    .eq("id", parsedParams.data.id)
    .eq("user_id", authed.user.id)
    .maybeSingle();

  if (error) return apiError("internal");
  if (!data) return apiError("not_found");

  return apiSuccess(data);
}
