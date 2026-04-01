import { createAdminClient } from "@/lib/supabase/server";
import { requireAuthedUser } from "@/lib/api/auth";
import { parseIdParam } from "@/lib/api/contracts";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  getCurrentIntakeSnapshot,
  getOwnedCaseOrNull,
  regenerateCaseRequirements,
  summarizeRequirementProgress,
} from "@/lib/tax-documents/service";

export async function POST(_: Request, context: { params: Promise<{ id: string }> }) {
  const parsedParams = parseIdParam(await context.params);
  if (!parsedParams.success) return apiError("invalid_params");

  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const admin = await createAdminClient().catch(() => null);
  if (!admin) return apiError("internal", "admin_client_unavailable");

  const caseRecord = await getOwnedCaseOrNull(admin, parsedParams.data.id, authed.user.id).catch(() => null);
  if (!caseRecord) return apiError("not_found");

  const snapshot = await getCurrentIntakeSnapshot(admin, caseRecord.id).catch(() => null);
  if (!snapshot) return apiError("conflict", "missing_intake_snapshot");

  try {
    const requirements = await regenerateCaseRequirements({
      supabase: admin,
      caseRecord,
      snapshot,
      actorId: authed.user.id,
    });

    return apiSuccess({
      requirements,
      progress: summarizeRequirementProgress(requirements),
    });
  } catch {
    return apiError("internal", "requirements_regeneration_failed");
  }
}
