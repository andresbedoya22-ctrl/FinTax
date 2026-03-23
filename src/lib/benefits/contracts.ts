import { z } from "zod";

import { benefitStepKeys, benefitsDefaultValues, benefitsWizardSchema, normalizeBenefitsValues, type BenefitCardKey } from "@/components/fintax/flows/benefits/wizard";
import type { Case, CaseType } from "@/types/database";

export const benefitCardKeySchema = z.enum(["zorgtoeslag", "huurtoeslag", "kindgebondenBudget", "kinderopvangtoeslag"]);
export const benefitsCaseTypeSchema = z.enum(["zorgtoeslag", "huurtoeslag", "kindgebonden_budget", "kinderopvangtoeslag"]);

export const benefitsDraftPayloadSchema = benefitsWizardSchema.extend({
  currentStep: z.number().int().min(0).max(benefitStepKeys.length - 1),
  selectedBenefits: z.array(benefitCardKeySchema),
  draftStatus: z.string().min(1).nullable().optional(),
  lastSavedAt: z.string().datetime().nullable().optional(),
});

export const benefitsDraftRequestSchema = z.object({
  caseId: z.string().uuid().optional(),
  payload: benefitsDraftPayloadSchema,
  preferredCaseType: benefitsCaseTypeSchema.optional(),
});

export type BenefitsCaseType = z.infer<typeof benefitsCaseTypeSchema>;
export type BenefitsDraftPayload = z.infer<typeof benefitsDraftPayloadSchema>;
export type BenefitsDraftRequest = z.infer<typeof benefitsDraftRequestSchema>;

export const BENEFITS_CASE_TYPES: BenefitsCaseType[] = benefitsCaseTypeSchema.options;

const BENEFIT_CARD_TO_CASE_TYPE: Record<BenefitCardKey, BenefitsCaseType> = {
  zorgtoeslag: "zorgtoeslag",
  huurtoeslag: "huurtoeslag",
  kindgebondenBudget: "kindgebonden_budget",
  kinderopvangtoeslag: "kinderopvangtoeslag",
};

const CASE_TYPE_TO_BENEFIT_CARD: Record<BenefitsCaseType, BenefitCardKey> = {
  zorgtoeslag: "zorgtoeslag",
  huurtoeslag: "huurtoeslag",
  kindgebonden_budget: "kindgebondenBudget",
  kinderopvangtoeslag: "kinderopvangtoeslag",
};

export function isBenefitsCaseType(value: string): value is BenefitsCaseType {
  return BENEFITS_CASE_TYPES.includes(value as BenefitsCaseType);
}

export function isBenefitCardKey(value: unknown): value is BenefitCardKey {
  return benefitCardKeySchema.safeParse(value).success;
}

export function benefitCardKeyToCaseType(value: BenefitCardKey): BenefitsCaseType {
  return BENEFIT_CARD_TO_CASE_TYPE[value];
}

export function caseTypeToBenefitCardKey(value: BenefitsCaseType): BenefitCardKey {
  return CASE_TYPE_TO_BENEFIT_CARD[value];
}

export function normalizeBenefitsDraftPayload(payload: BenefitsDraftPayload): BenefitsDraftPayload {
  const normalizedValues = normalizeBenefitsValues(payload);
  const selectedBenefits = Array.from(new Set(payload.selectedBenefits.filter(isBenefitCardKey)));

  return {
    ...normalizedValues,
    currentStep: Math.max(0, Math.min(payload.currentStep, benefitStepKeys.length - 1)),
    selectedBenefits,
    draftStatus: payload.draftStatus ?? null,
    lastSavedAt: payload.lastSavedAt ?? null,
  };
}

export function createBenefitsDraftPayload(input: Partial<BenefitsDraftPayload>): BenefitsDraftPayload {
  const parsed = benefitsDraftPayloadSchema.safeParse({
    ...benefitsDefaultValues,
    currentStep: 0,
    selectedBenefits: [],
    draftStatus: "in_progress",
    lastSavedAt: null,
    ...input,
  });

  if (!parsed.success) {
    return {
      ...benefitsDefaultValues,
      currentStep: 0,
      selectedBenefits: [],
      draftStatus: "in_progress",
      lastSavedAt: null,
    };
  }

  return normalizeBenefitsDraftPayload(parsed.data);
}

export function buildBenefitsWizardData(payload: BenefitsDraftPayload) {
  const normalized = normalizeBenefitsDraftPayload(payload);

  return {
    flowKind: "benefits",
    version: 1,
    ...normalized,
  } as const satisfies Record<string, unknown>;
}

export function resolveBenefitsCaseType(params: {
  selectedBenefits: BenefitCardKey[];
  preferredCaseType?: BenefitsCaseType | null;
  existingCaseType?: CaseType | null;
}): BenefitsCaseType {
  const selectedCaseType = params.selectedBenefits[0] ? benefitCardKeyToCaseType(params.selectedBenefits[0]) : null;

  if (selectedCaseType) return selectedCaseType;
  if (params.preferredCaseType) return params.preferredCaseType;
  if (params.existingCaseType && isBenefitsCaseType(params.existingCaseType)) return params.existingCaseType;

  return "zorgtoeslag";
}

export function buildBenefitsDisplayName(selectedBenefits: BenefitCardKey[]) {
  if (selectedBenefits.length === 0) return "Benefits draft";
  if (selectedBenefits.length === 1) return `Benefits draft · ${selectedBenefits[0]}`;
  return `Benefits draft · ${selectedBenefits.length} selected`;
}

export function parseBenefitsDraftCase(caseItem: Pick<Case, "case_type" | "wizard_data"> | null | undefined) {
  if (!caseItem) return null;

  const wizardData = caseItem.wizard_data;
  const payload = createBenefitsDraftPayload({
    ...benefitsDefaultValues,
    ...(wizardData && typeof wizardData === "object" ? (wizardData as Partial<BenefitsDraftPayload>) : {}),
  });

  const selectedBenefits =
    payload.selectedBenefits.length > 0
      ? payload.selectedBenefits
      : isBenefitsCaseType(caseItem.case_type)
        ? [caseTypeToBenefitCardKey(caseItem.case_type)]
        : [];

  return {
    payload: {
      ...payload,
      selectedBenefits,
    },
  };
}
