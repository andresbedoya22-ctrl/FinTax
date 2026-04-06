import { createAdminClient } from "@/lib/supabase/server";
import { requireAuthedUser } from "@/lib/api/auth";
import { parseIdParam } from "@/lib/api/contracts";
import { apiError, apiSuccess } from "@/lib/api/response";
import { uploadSessionCreateSchema } from "@/lib/tax-documents/contracts";
import { createUploadSession, getOwnedCaseOrNull, listCaseRequirements } from "@/lib/tax-documents/service";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const parsedParams = parseIdParam(await context.params);
  if (!parsedParams.success) return apiError("invalid_params");

  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const parsedBody = uploadSessionCreateSchema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) return apiError("invalid_payload", "invalid_upload_session_payload");

  const admin = await createAdminClient().catch(() => null);
  if (!admin) return apiError("internal", "admin_client_unavailable");

  const caseRecord = await getOwnedCaseOrNull(admin, parsedParams.data.id, authed.user.id).catch(() => null);
  if (!caseRecord) return apiError("not_found");

  const requirements = await listCaseRequirements(admin, caseRecord.id).catch(() => []);
  const requirement = requirements.find((item) => item.id === parsedBody.data.requirementId);
  if (!requirement) return apiError("not_found", "requirement_not_found");

  try {
    const session = await createUploadSession({
      supabase: admin,
      caseRecord,
      userId: authed.user.id,
      requirement,
      fileName: parsedBody.data.fileName,
      mimeType: parsedBody.data.mimeType,
      fileSizeBytes: parsedBody.data.fileSizeBytes,
      replacesDocumentId: parsedBody.data.replacesDocumentId,
    });

    return apiSuccess(session);
  } catch (error) {
    const message = error instanceof Error ? error.message : "document_upload_session_failed";
    if (
      message === "unsupported_mime_type" ||
      message === "file_too_large" ||
      message === "requirement_does_not_accept_documents" ||
      message === "requirement_not_uploadable" ||
      message === "replace_document_not_allowed"
    ) {
      return apiError("conflict", message);
    }
    if (message === "requirement_not_found" || message === "replace_document_not_found") {
      return apiError("not_found", message);
    }
    return apiError("internal", message);
  }
}
