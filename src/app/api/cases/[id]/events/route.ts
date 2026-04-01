import { createAdminClient } from "@/lib/supabase/server";
import { requireAuthedUser } from "@/lib/api/auth";
import { parseIdParam } from "@/lib/api/contracts";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getOwnedCaseOrNull, listCaseEvents } from "@/lib/tax-documents/service";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const parsedParams = parseIdParam(await context.params);
  if (!parsedParams.success) return apiError("invalid_params");

  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const admin = await createAdminClient().catch(() => null);
  if (!admin) return apiError("internal", "admin_client_unavailable");

  const caseRecord = await getOwnedCaseOrNull(admin, parsedParams.data.id, authed.user.id).catch(() => null);
  if (!caseRecord) return apiError("not_found");

  try {
    return apiSuccess(await listCaseEvents(admin, caseRecord.id));
  } catch {
    return apiError("internal", "case_events_fetch_failed");
  }
}
