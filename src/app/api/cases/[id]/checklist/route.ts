import { parseIdParam } from "@/lib/api/contracts";
import { requireAuthedUser } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const rawParams = await context.params;
  const parsedParams = parseIdParam(rawParams);
  if (!parsedParams.success) return apiError("invalid_params");

  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const { data: caseMatch, error: caseError } = await authed.supabase
    .from("cases")
    .select("id")
    .eq("id", parsedParams.data.id)
    .eq("user_id", authed.user.id)
    .maybeSingle();

  if (caseError) return apiError("internal");
  if (!caseMatch) return apiError("not_found");

  const { data, error } = await authed.supabase
    .from("checklist_items")
    .select(
      "id, case_id, label, label_key, description, is_document_upload, is_completed, completed_at, completed_by, document_id, sort_order, created_at",
    )
    .eq("case_id", parsedParams.data.id)
    .order("sort_order", { ascending: true });

  if (error) return apiError("internal");

  return apiSuccess(data ?? []);
}
