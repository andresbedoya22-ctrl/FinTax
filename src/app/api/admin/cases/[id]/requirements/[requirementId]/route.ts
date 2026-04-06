import { z } from "zod";

import { createAdminClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { adminRequirementReviewSchema } from "@/lib/tax-documents/contracts";
import { getCaseForAdminOrNull, reviewRequirement } from "@/lib/tax-documents/service";

const paramsSchema = z.object({
  id: z.string().uuid(),
  requirementId: z.string().uuid(),
});

export async function PATCH(request: Request, context: { params: Promise<{ id: string; requirementId: string }> }) {
  const parsedParams = paramsSchema.safeParse(await context.params);
  if (!parsedParams.success) return apiError("invalid_params");

  const adminUser = await requireAdminUser();
  if ("errorResponse" in adminUser) return adminUser.errorResponse;

  const parsedBody = adminRequirementReviewSchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) return apiError("invalid_payload", "invalid_admin_requirement_review");

  const admin = await createAdminClient().catch(() => null);
  if (!admin) return apiError("internal", "admin_client_unavailable");

  const caseRecord = await getCaseForAdminOrNull(admin, parsedParams.data.id).catch(() => null);
  if (!caseRecord) return apiError("not_found");

  try {
    await reviewRequirement({
      supabase: admin,
      caseRecord,
      adminId: adminUser.user.id,
      requirementId: parsedParams.data.requirementId,
      status: parsedBody.data.status,
      reviewNotes: parsedBody.data.reviewNotes,
      rejectionReason: parsedBody.data.rejectionReason,
    });

    return apiSuccess({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "admin_requirement_review_failed";
    if (message === "requirement_not_found") return apiError("not_found", message);
    return apiError("internal", "admin_requirement_review_failed");
  }
}
