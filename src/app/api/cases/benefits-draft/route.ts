import { requireAuthedUser } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { benefitsDraftRequestSchema } from "@/lib/benefits/contracts";
import { BENEFITS_CASE_SELECT, buildBenefitsInsertInput, buildBenefitsUpdateInput, findLatestBenefitsDraftCase } from "@/lib/benefits/server";

export async function GET() {
  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const { data, error } = await findLatestBenefitsDraftCase(authed.supabase, authed.user.id);

  if (error) return apiError("internal", "benefits_draft_fetch_failed");
  if (!data) return apiError("not_found", "benefits_draft_not_found");

  return apiSuccess(data);
}

export async function POST(request: Request) {
  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const parsed = benefitsDraftRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return apiError("invalid_payload", "invalid_benefits_draft");

  const existing = await findLatestBenefitsDraftCase(authed.supabase, authed.user.id);
  if (existing.error) return apiError("internal", "benefits_draft_lookup_failed");

  if (existing.data) {
    const { data: updated, error } = await authed.supabase
      .from("cases")
      .update(buildBenefitsUpdateInput(existing.data, parsed.data))
      .eq("id", existing.data.id)
      .eq("user_id", authed.user.id)
      .select(BENEFITS_CASE_SELECT)
      .maybeSingle();

    if (error || !updated) return apiError("internal", "benefits_draft_update_failed");
    return apiSuccess(updated);
  }

  const { data, error } = await authed.supabase
    .from("cases")
    .insert(buildBenefitsInsertInput(authed.user.id, parsed.data))
    .select(BENEFITS_CASE_SELECT)
    .single();

  if (error) return apiError("internal", "benefits_draft_create_failed");

  return apiSuccess(data);
}

export async function PATCH(request: Request) {
  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const parsed = benefitsDraftRequestSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !parsed.data.caseId) return apiError("invalid_payload", "invalid_benefits_draft");

  const { data: existingCase, error: existingError } = await authed.supabase
    .from("cases")
    .select("id, user_id, case_type, status")
    .eq("id", parsed.data.caseId)
    .eq("user_id", authed.user.id)
    .in("case_type", ["zorgtoeslag", "huurtoeslag", "kindgebonden_budget", "kinderopvangtoeslag"])
    .maybeSingle();

  if (existingError) return apiError("internal", "benefits_draft_lookup_failed");
  if (!existingCase) return apiError("not_found", "benefits_draft_not_found");

  const { data, error } = await authed.supabase
    .from("cases")
    .update(buildBenefitsUpdateInput(existingCase, parsed.data))
    .eq("id", parsed.data.caseId)
    .eq("user_id", authed.user.id)
    .select(BENEFITS_CASE_SELECT)
    .maybeSingle();

  if (error) return apiError("internal", "benefits_draft_update_failed");
  if (!data) return apiError("not_found", "benefits_draft_not_found");

  return apiSuccess(data);
}
