import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/server";
import { requireAuthedUser } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { getOwnedCaseOrNull, softDeleteDocument } from "@/lib/tax-documents/service";

const paramsSchema = z.object({
  id: z.string().uuid(),
  documentId: z.string().uuid(),
});

export async function DELETE(_: Request, context: { params: Promise<{ id: string; documentId: string }> }) {
  const parsedParams = paramsSchema.safeParse(await context.params);
  if (!parsedParams.success) return apiError("invalid_params");

  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const admin = await createAdminClient().catch(() => null);
  if (!admin) return apiError("internal", "admin_client_unavailable");

  const caseRecord = await getOwnedCaseOrNull(admin, parsedParams.data.id, authed.user.id).catch(() => null);
  if (!caseRecord) return apiError("not_found");

  try {
    await softDeleteDocument({
      supabase: admin,
      caseRecord,
      userId: authed.user.id,
      documentId: parsedParams.data.documentId,
    });
    return apiSuccess({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "document_delete_failed";
    if (message === "document_not_found") return apiError("not_found", message);
    if (message === "approved_document_cannot_be_deleted") return apiError("conflict", message);
    return apiError("internal", message);
  }
}
