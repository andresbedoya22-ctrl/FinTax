import { createAdminClient } from "@/lib/supabase/server";
import { requireAuthedUser } from "@/lib/api/auth";
import { parseIdParam } from "@/lib/api/contracts";
import { apiError, apiSuccess } from "@/lib/api/response";
import { taxReturnIntakeSchema } from "@/lib/tax-documents/contracts";
import { getCurrentIntakeSnapshot, getOwnedCaseOrNull, saveCaseIntake } from "@/lib/tax-documents/service";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const parsedParams = parseIdParam(await context.params);
  if (!parsedParams.success) return apiError("invalid_params");

  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const caseRecord = await getOwnedCaseOrNull(authed.supabase, parsedParams.data.id, authed.user.id).catch(() => null);
  if (!caseRecord) return apiError("not_found");

  const snapshot = await getCurrentIntakeSnapshot(authed.supabase, caseRecord.id).catch(() => null);
  if (!snapshot) return apiSuccess(null);

  return apiSuccess(snapshot);
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const parsedParams = parseIdParam(await context.params);
  if (!parsedParams.success) return apiError("invalid_params");

  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const parsedBody = taxReturnIntakeSchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) return apiError("invalid_payload", "invalid_tax_return_intake");

  const admin = await createAdminClient().catch(() => null);
  if (!admin) return apiError("internal", "admin_client_unavailable");

  const caseRecord = await getOwnedCaseOrNull(admin, parsedParams.data.id, authed.user.id).catch(() => null);
  if (!caseRecord) return apiError("not_found");

  try {
    const result = await saveCaseIntake({
      supabase: admin,
      caseRecord,
      actorId: authed.user.id,
      source: "api",
      payload: parsedBody.data,
    });

    return apiSuccess(result);
  } catch {
    return apiError("internal", "case_intake_save_failed");
  }
}
