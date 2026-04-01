import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/server";
import { requireAuthedUser } from "@/lib/api/auth";
import { parseIdParam } from "@/lib/api/contracts";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getOwnedCaseOrNull, listCaseRequirements } from "@/lib/tax-documents/service";

const paramsSchema = z.object({
  id: z.string().uuid(),
  requirementId: z.string().uuid(),
});

export async function GET(_: Request, context: { params: Promise<{ id: string; requirementId: string }> }) {
  const parsedParams = paramsSchema.safeParse(await context.params);
  if (!parsedParams.success) return apiError("invalid_params");

  const parsedId = parseIdParam({ id: parsedParams.data.id });
  if (!parsedId.success) return apiError("invalid_params");

  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const admin = await createAdminClient().catch(() => null);
  if (!admin) return apiError("internal", "admin_client_unavailable");

  const caseRecord = await getOwnedCaseOrNull(admin, parsedParams.data.id, authed.user.id).catch(() => null);
  if (!caseRecord) return apiError("not_found");

  try {
    const requirement = (await listCaseRequirements(admin, caseRecord.id)).find((item) => item.id === parsedParams.data.requirementId);
    if (!requirement) return apiError("not_found");
    return apiSuccess(requirement.help_content);
  } catch {
    return apiError("internal", "requirement_help_fetch_failed");
  }
}
