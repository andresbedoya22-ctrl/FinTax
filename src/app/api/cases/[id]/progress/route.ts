import { requireAuthedUser } from "@/lib/api/auth";
import { parseIdParam } from "@/lib/api/contracts";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getOwnedCaseOrNull, listCaseRequirements, summarizeRequirementProgress } from "@/lib/tax-documents/service";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const parsedParams = parseIdParam(await context.params);
  if (!parsedParams.success) return apiError("invalid_params");

  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const caseRecord = await getOwnedCaseOrNull(authed.supabase, parsedParams.data.id, authed.user.id).catch(() => null);
  if (!caseRecord) return apiError("not_found");

  try {
    return apiSuccess(summarizeRequirementProgress(await listCaseRequirements(authed.supabase, caseRecord.id)));
  } catch {
    return apiError("internal", "case_progress_fetch_failed");
  }
}
