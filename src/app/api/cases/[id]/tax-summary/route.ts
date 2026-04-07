import { requireAuthedUser } from "@/lib/api/auth";
import { parseIdParam } from "@/lib/api/contracts";
import { apiError, apiSuccess } from "@/lib/api/response";
import { buildTaxSummary, getCurrentIntakeSnapshot, getOwnedCaseOrNull } from "@/lib/tax-documents/service";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const parsedParams = parseIdParam(await context.params);
  if (!parsedParams.success) return apiError("invalid_params");

  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const caseRecord = await getOwnedCaseOrNull(authed.supabase, parsedParams.data.id, authed.user.id).catch(() => null);
  if (!caseRecord) return apiError("not_found");

  try {
    const snapshot = await getCurrentIntakeSnapshot(authed.supabase, caseRecord.id);
    return apiSuccess(buildTaxSummary({ caseRecord, snapshot }));
  } catch {
    return apiError("internal", "tax_summary_fetch_failed");
  }
}
