import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/server";
import { requireAuthedUser } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requirementAvailabilitySchema } from "@/lib/tax-documents/contracts";
import { getOwnedCaseOrNull, markRequirementNotYetAvailable } from "@/lib/tax-documents/service";

const paramsSchema = z.object({
  id: z.string().uuid(),
  requirementId: z.string().uuid(),
});

export async function POST(request: Request, context: { params: Promise<{ id: string; requirementId: string }> }) {
  const parsedParams = paramsSchema.safeParse(await context.params);
  if (!parsedParams.success) return apiError("invalid_params");

  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const parsedBody = requirementAvailabilitySchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) return apiError("invalid_payload", "invalid_requirement_availability_note");

  const admin = await createAdminClient().catch(() => null);
  if (!admin) return apiError("internal", "admin_client_unavailable");

  const caseRecord = await getOwnedCaseOrNull(admin, parsedParams.data.id, authed.user.id).catch(() => null);
  if (!caseRecord) return apiError("not_found");

  try {
    await markRequirementNotYetAvailable({
      supabase: admin,
      caseRecord,
      userId: authed.user.id,
      requirementId: parsedParams.data.requirementId,
      note: parsedBody.data.note,
    });

    return apiSuccess({ ok: true });
  } catch {
    return apiError("internal", "requirement_not_available_failed");
  }
}
