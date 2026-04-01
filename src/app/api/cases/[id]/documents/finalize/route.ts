import { createAdminClient } from "@/lib/supabase/server";
import { requireAuthedUser } from "@/lib/api/auth";
import { parseIdParam } from "@/lib/api/contracts";
import { apiError, apiSuccess } from "@/lib/api/response";
import { finalizeUploadSchema } from "@/lib/tax-documents/contracts";
import { finalizeUpload, getOwnedCaseOrNull } from "@/lib/tax-documents/service";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const parsedParams = parseIdParam(await context.params);
  if (!parsedParams.success) return apiError("invalid_params");

  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const parsedBody = finalizeUploadSchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) return apiError("invalid_payload", "invalid_upload_finalize_payload");

  const admin = await createAdminClient().catch(() => null);
  if (!admin) return apiError("internal", "admin_client_unavailable");

  const caseRecord = await getOwnedCaseOrNull(admin, parsedParams.data.id, authed.user.id).catch(() => null);
  if (!caseRecord) return apiError("not_found");

  try {
    const document = await finalizeUpload({
      supabase: admin,
      caseRecord,
      userId: authed.user.id,
      uploadSessionId: parsedBody.data.uploadSessionId,
      checksumSha256: parsedBody.data.checksumSha256,
    });

    return apiSuccess(document);
  } catch (error) {
    const message = error instanceof Error ? error.message : "upload_finalize_failed";
    if (
      message === "upload_session_not_found" ||
      message === "upload_session_invalid_state" ||
      message === "upload_session_expired" ||
      message === "uploaded_object_not_found"
    ) {
      return apiError("conflict", message);
    }
    return apiError("internal", message);
  }
}
