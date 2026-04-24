import { z } from "zod";

import { requireAuthedUser } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import {
  buildBenefitsCaseDisplayName,
  buildPrePaymentEstimateRange,
  mapBenefitKeyToCaseType,
  storedBenefitsCasePayloadSchema,
  type BenefitsFunnelStage,
} from "@/lib/toeslagen";

const requestSchema = z.object({
  locale: z.string().min(2),
  selectedBenefits: z.array(z.enum(["zorgtoeslag", "huurtoeslag", "kindgebondenBudget", "kinderopvangtoeslag"])).min(1),
  snapshot: storedBenefitsCasePayloadSchema.shape.snapshot,
  evaluation: storedBenefitsCasePayloadSchema.shape.evaluation,
});

function resolveDraftCaseType(selectedBenefits: z.infer<typeof requestSchema>["selectedBenefits"]) {
  if (selectedBenefits.includes("zorgtoeslag")) {
    return "zorgtoeslag" as const;
  }

  return mapBenefitKeyToCaseType(selectedBenefits[0]);
}

function resolveDraftStage(): BenefitsFunnelStage {
  return "payment_pending";
}

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = requestSchema.safeParse(json);
  if (!parsed.success) {
    return apiError("invalid_payload", "invalid_benefits_draft_payload");
  }

  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) {
    return authed.errorResponse;
  }

  const caseType = resolveDraftCaseType(parsed.data.selectedBenefits);
  const prePaymentRange = buildPrePaymentEstimateRange(parsed.data.evaluation);
  const storedWizardData = {
    kind: "benefits_bundle_2026" as const,
    locale: parsed.data.locale,
    funnelStage: resolveDraftStage(),
    selectedBenefits: parsed.data.selectedBenefits,
    snapshot: parsed.data.snapshot,
    evaluation: parsed.data.evaluation,
    prePaymentRange,
  };

  const { data: existingCase, error: existingCaseError } = await authed.supabase
    .from("cases")
    .select("id")
    .eq("user_id", authed.user.id)
    .eq("case_type", caseType)
    .in("status", ["draft", "pending_payment"])
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existingCaseError) {
    return apiError("internal", "benefits_case_lookup_failed");
  }

  if (existingCase?.id) {
    const { error: updateError } = await authed.supabase
      .from("cases")
      .update({
        status: "pending_payment",
        display_name: buildBenefitsCaseDisplayName(parsed.data.selectedBenefits),
        tax_year: 2026,
        estimated_refund: parsed.data.evaluation.totalEstimatedAnnualAmount,
        wizard_data: storedWizardData,
        wizard_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", existingCase.id)
      .eq("user_id", authed.user.id);

    if (updateError) {
      return apiError("internal", "benefits_case_update_failed");
    }

    return apiSuccess({ caseId: existingCase.id });
  }

  const { data: createdCase, error: createError } = await authed.supabase
    .from("cases")
    .insert({
      user_id: authed.user.id,
      case_type: caseType,
      status: "pending_payment",
      display_name: buildBenefitsCaseDisplayName(parsed.data.selectedBenefits),
      tax_year: 2026,
      estimated_refund: parsed.data.evaluation.totalEstimatedAnnualAmount,
      wizard_data: storedWizardData,
      wizard_completed: true,
    })
    .select("id")
    .single();

  if (createError || !createdCase) {
    return apiError("internal", "benefits_case_create_failed");
  }

  return apiSuccess({ caseId: createdCase.id });
}
