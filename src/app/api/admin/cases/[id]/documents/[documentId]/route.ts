import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { adminDocumentReviewSchema } from "@/lib/tax-documents/contracts";
import { getCaseForAdminOrNull, reviewDocument } from "@/lib/tax-documents/service";

const paramsSchema = z.object({
  id: z.string().uuid(),
  documentId: z.string().uuid(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string; documentId: string }> }) {
  const parsedParams = paramsSchema.safeParse(await context.params);
  if (!parsedParams.success) return apiError("invalid_params");

  const adminUser = await requireAdminUser();
  if ("errorResponse" in adminUser) return adminUser.errorResponse;

  const parsedBody = adminDocumentReviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) return apiError("invalid_payload", "invalid_admin_document_review");

  const admin = await createAdminClient().catch(() => null);
  if (!admin) return apiError("internal", "admin_client_unavailable");

  const caseRecord = await getCaseForAdminOrNull(admin, parsedParams.data.id).catch(() => null);
  if (!caseRecord) return apiError("not_found");

  try {
    const document = await reviewDocument({
      supabase: admin,
      caseRecord,
      adminId: adminUser.user.id,
      documentId: parsedParams.data.documentId,
      status: parsedBody.data.status,
      reviewNotes: parsedBody.data.reviewNotes,
    });

    return apiSuccess(document);
  } catch {
    return apiError("internal", "admin_document_review_failed");
  }
}
