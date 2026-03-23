import type { Case } from "@/types/database";

import { BENEFITS_CASE_TYPES, buildBenefitsDisplayName, buildBenefitsWizardData, createBenefitsDraftPayload, resolveBenefitsCaseType, type BenefitsDraftRequest } from "./contracts";

export const BENEFITS_CASE_SELECT =
  "id, user_id, case_type, status, display_name, tax_year, deadline, estimated_refund, actual_refund, paid_at, wizard_data, wizard_completed, machtiging_status, machtiging_code, stripe_payment_id, created_at, updated_at";

type BenefitsCasesQuery = {
  select: (columns: string) => {
    eq: (column: string, value: string) => {
      eq: (column: string, value: string) => {
        in: (column: string, values: readonly string[]) => {
          order: (column: string, options: { ascending: boolean }) => {
            limit: (count: number) => {
              maybeSingle: () => Promise<{ data: unknown; error: { message: string } | null }>;
            };
          };
        };
      };
    };
  };
};

export async function findLatestBenefitsDraftCase(
  supabase: {
    from: (table: string) => unknown;
  },
  userId: string,
) {
  const casesQuery = supabase.from("cases") as BenefitsCasesQuery;
  const { data, error } = await casesQuery
    .select(BENEFITS_CASE_SELECT)
    .eq("user_id", userId)
    .eq("status", "draft")
    .in("case_type", BENEFITS_CASE_TYPES)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  return { data: (data as Case | null) ?? null, error: (error as { message: string } | null) ?? null };
}

export function buildBenefitsInsertInput(userId: string, request: BenefitsDraftRequest) {
  const payload = createBenefitsDraftPayload(request.payload);
  const caseType = resolveBenefitsCaseType({
    selectedBenefits: payload.selectedBenefits,
    preferredCaseType: request.preferredCaseType ?? null,
  });

  return {
    user_id: userId,
    case_type: caseType,
    status: "draft" as const,
    display_name: buildBenefitsDisplayName(payload.selectedBenefits),
    wizard_data: buildBenefitsWizardData(payload),
    wizard_completed: payload.currentStep >= 7,
    updated_at: new Date().toISOString(),
  };
}

export function buildBenefitsUpdateInput(existingCase: Pick<Case, "case_type">, request: BenefitsDraftRequest) {
  const payload = createBenefitsDraftPayload(request.payload);
  const caseType = resolveBenefitsCaseType({
    selectedBenefits: payload.selectedBenefits,
    preferredCaseType: request.preferredCaseType ?? null,
    existingCaseType: existingCase.case_type,
  });

  return {
    case_type: caseType,
    display_name: buildBenefitsDisplayName(payload.selectedBenefits),
    wizard_data: buildBenefitsWizardData(payload),
    wizard_completed: payload.currentStep >= 7,
    updated_at: new Date().toISOString(),
  };
}
