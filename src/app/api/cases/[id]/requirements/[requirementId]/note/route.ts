import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/server";
import { requireAuthedUser } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { requirementNoteSchema } from "@/lib/tax-documents/contracts";
import { addRequirementCustomerNote, getOwnedCaseOrNull } from "@/lib/tax-documents/service";

const paramsSchema = z.object({
  id: z.string().uuid(),
  requirementId: z.string().uuid(),
});

export async function POST(request: Request, context: { params: Promise<{ id: string; requirementId: string }> }) {
  const parsedParams = paramsSchema.safeParse(await context.params);
  if (!parsedParams.success) return apiError("invalid_params");

  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const parsedBody = requirementNoteSchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) return apiError("invalid_payload", "invalid_requirement_note");

  const admin = await createAdminClient().catch(() => null);
  if (!admin) return apiError("internal", "admin_client_unavailable");

  const caseRecord = await getOwnedCaseOrNull(admin, parsedParams.data.id, authed.user.id).catch(() => null);
  if (!caseRecord) return apiError("not_found");

  try {
    await addRequirementCustomerNote({
      supabase: admin,
      caseRecord,
      userId: authed.user.id,
      requirementId: parsedParams.data.requirementId,
      note: parsedBody.data.note,
    });

    return apiSuccess({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "requirement_note_failed";
    if (message === "requirement_not_found") return apiError("not_found", message);
    return apiError("internal", "requirement_note_failed");
  }
}
