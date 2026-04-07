import { requireAuthedUser } from "@/lib/api/auth";
import { parseIdParam } from "@/lib/api/contracts";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  getCurrentIntakeSnapshot,
  getOwnedCaseOrNull,
  listCaseRequirements,
  summarizeRequirementProgress,
} from "@/lib/tax-documents/service";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const parsedParams = parseIdParam(await context.params);
  if (!parsedParams.success) return apiError("invalid_params");

  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const caseRecord = await getOwnedCaseOrNull(authed.supabase, parsedParams.data.id, authed.user.id).catch(() => null);
  if (!caseRecord) return apiError("not_found");

  try {
    const [requirements, snapshot] = await Promise.all([
      listCaseRequirements(authed.supabase, caseRecord.id),
      getCurrentIntakeSnapshot(authed.supabase, caseRecord.id),
    ]);

    const grouped = requirements.reduce<Record<string, typeof requirements>>((accumulator, requirement) => {
      const group = accumulator[requirement.section] ?? [];
      group.push(requirement);
      accumulator[requirement.section] = group;
      return accumulator;
    }, {});

    return apiSuccess({
      snapshotId: snapshot?.id ?? null,
      requirements,
      grouped,
      progress: summarizeRequirementProgress(requirements),
    });
  } catch {
    return apiError("internal", "case_requirements_fetch_failed");
  }
}
