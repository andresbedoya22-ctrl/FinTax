import { createAdminClient } from "@/lib/supabase/server";
import { requireAdminUser } from "@/lib/api/auth";
import { parseIdParam } from "@/lib/api/contracts";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  buildTaxSummary,
  getCaseForAdminOrNull,
  getCurrentIntakeSnapshot,
  listCaseDocuments,
  listCaseEvents,
  listCaseRequirements,
  summarizeRequirementProgress,
} from "@/lib/tax-documents/service";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const parsedParams = parseIdParam(await context.params);
  if (!parsedParams.success) return apiError("invalid_params");

  const adminUser = await requireAdminUser();
  if ("errorResponse" in adminUser) return adminUser.errorResponse;

  const admin = await createAdminClient().catch(() => null);
  if (!admin) return apiError("internal", "admin_client_unavailable");

  const caseRecord = await getCaseForAdminOrNull(admin, parsedParams.data.id).catch(() => null);
  if (!caseRecord) return apiError("not_found");

  try {
    const [snapshot, requirements, documents, events] = await Promise.all([
      getCurrentIntakeSnapshot(admin, caseRecord.id),
      listCaseRequirements(admin, caseRecord.id),
      listCaseDocuments(admin, caseRecord.id),
      listCaseEvents(admin, caseRecord.id, true),
    ]);

    return apiSuccess({
      case: caseRecord,
      intake: snapshot,
      requirements,
      documents,
      events,
      progress: summarizeRequirementProgress(requirements),
      taxSummary: buildTaxSummary({ caseRecord, snapshot }),
    });
  } catch {
    return apiError("internal", "admin_case_summary_failed");
  }
}
