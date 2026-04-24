import { z } from "zod";

import { REASON_CODES } from "./reasons";
import type {
  ActivityStatus,
  BenefitEvaluationResult,
  BenefitKey,
  ChildcareArrangement,
  HouseholdSnapshot,
  ToeslagenEvaluation,
} from "./types";
import type { EstimateRange } from "./engine/estimate-range";

export type BenefitsFunnelStage =
  | "free_diagnosis"
  | "checkout_required"
  | "payment_pending"
  | "paid_document_collection"
  | "documents_incomplete"
  | "ready_for_review"
  | "application_preparation"
  | "submitted"
  | "completed";

export type BenefitsResultsMode = "prePayment" | "postPayment";

export type StoredBenefitsCasePayload = {
  kind: "benefits_bundle_2026";
  locale: string;
  funnelStage: BenefitsFunnelStage;
  selectedBenefits: BenefitKey[];
  snapshot: HouseholdSnapshot;
  evaluation: ToeslagenEvaluation;
  prePaymentRange: EstimateRange;
};

const benefitKeySchema = z.enum([
  "zorgtoeslag",
  "huurtoeslag",
  "kindgebondenBudget",
  "kinderopvangtoeslag",
]);

const activityStatusSchema = z.enum([
  "employed",
  "selfEmployed",
  "studentRecognized",
  "inburgeringCourse",
  "workReintegration",
  "trajectoryToWork",
  "unemployed",
  "none",
  "unknown",
]) satisfies z.ZodType<ActivityStatus>;

const estimateRangeSchema = z.object({
  minMonthly: z.number(),
  maxMonthly: z.number(),
  minAnnual: z.number(),
  maxAnnual: z.number(),
  confidence: z.enum(["standard", "manual_review", "low"]),
}) satisfies z.ZodType<EstimateRange>;

const calculationStepSchema = z.object({
  code: z.string(),
  labelKey: z.string(),
  value: z.union([z.number(), z.string(), z.boolean(), z.null()]),
  formula: z.string().optional(),
});

const documentRequirementSchema = z.object({
  code: z.string(),
  labelKey: z.string(),
  required: z.boolean(),
  appliesWhen: z.array(z.string()),
  benefitKeys: z.array(benefitKeySchema),
  severity: z.enum(["required", "recommended", "manual_review"]),
});
const reasonCodeSchema = z.enum(REASON_CODES);

const benefitEvaluationResultSchema = z.object({
  benefit: benefitKeySchema,
  eligible: z.boolean(),
  manualReviewRequired: z.boolean(),
  estimatedAnnualAmount: z.number().nullable(),
  estimatedMonthlyAmount: z.number().nullable(),
  blockingReasons: z.array(reasonCodeSchema),
  warningReasons: z.array(reasonCodeSchema),
  calculationSteps: z.array(calculationStepSchema),
  requiredDocuments: z.array(documentRequirementSchema),
  optionalDocuments: z.array(documentRequirementSchema),
}) satisfies z.ZodType<BenefitEvaluationResult>;

const childcareArrangementSchema = z.object({
  id: z.string(),
  childcareKind: z.enum(["dagopvang", "buitenschoolseOpvang", "tussenschoolseOpvang"]),
  providerType: z.enum(["kindercentrum", "gastouder"]),
  registeredLrk: z.boolean(),
  lrkNumber: z.string().optional(),
  monthlyHours: z.number(),
  hourlyRate: z.number(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  hasContract: z.boolean().optional(),
  parentsPayContribution: z.boolean().optional(),
}) satisfies z.ZodType<ChildcareArrangement>;

const personSnapshotSchema = z.object({
  id: z.string(),
  birthDate: z.string(),
  countryOfResidence: z.string(),
  nlResident: z.boolean(),
  bsnKnown: z.boolean().optional(),
  annualIncome: z.number(),
  assets1Jan: z.number(),
  hasDutchHealthInsurance: z.boolean().optional(),
  activityStatus: z.array(activityStatusSchema),
});

const partnerSnapshotSchema = personSnapshotSchema.extend({
  sameAddress: z.boolean(),
  isToeslagPartner: z.boolean(),
});

const childSnapshotSchema = z.object({
  id: z.string(),
  birthDate: z.string(),
  livesWithApplicant: z.boolean(),
  isCoParentingChild: z.boolean(),
  daysPerYearWithApplicant: z.number(),
  receivesKinderbijslag: z.boolean(),
  hasIncome: z.boolean(),
  annualIncome: z.number(),
  assets1Jan: z.number(),
  goesToChildcare: z.boolean(),
  bsnKnown: z.boolean().optional(),
  childcareArrangements: z.array(childcareArrangementSchema),
});

const residentSnapshotSchema = z.object({
  id: z.string(),
  birthDate: z.string(),
  relationship: z.string(),
  sameAddressRegistered: z.boolean(),
  annualIncome: z.number(),
  assets1Jan: z.number(),
  isSubtenant: z.boolean(),
  hasSubrentContract: z.boolean(),
});

const housingSnapshotSchema = z.object({
  rentsRoom: z.boolean(),
  independentHome: z.boolean(),
  groupHousingForElderlyOrAssistedLiving: z.boolean(),
  recognizedException: z.boolean(),
  hasRentalContract: z.boolean(),
  basicMonthlyRent: z.number(),
  isWoonwagen: z.boolean(),
  monthlyStandplaatsCost: z.number(),
  serviceCostsIncludedButIgnoredFrom2026: z.number(),
});

const assetsSnapshotSchema = z.object({
  applicantAssets1Jan: z.number(),
  partnerAssets1Jan: z.number(),
  childAssets1Jan: z.number(),
  residentAssets1Jan: z.number(),
  hasSpecialAssets: z.boolean(),
});

const specialSituationsSchema = z.object({
  foreignResidence: z.boolean(),
  foreignWork: z.boolean(),
  childAbroad: z.boolean(),
  childcareAbroad: z.boolean(),
  cakInsured: z.boolean(),
  military: z.boolean(),
  detained: z.boolean(),
  gemoedsbezwaarde: z.boolean(),
  noFixedAddress: z.boolean(),
  bijzondereVermogen: z.boolean(),
  bijzonderInkomen: z.boolean(),
  longAbsenceFromHome: z.boolean(),
  homeCareSituation: z.boolean(),
  composedFamily: z.boolean(),
  adoptionFosterStepChild: z.boolean(),
  manualReviewNotes: z.string(),
});

const householdSnapshotSchema = z.object({
  year: z.literal(2026),
  selectedBenefits: z.array(benefitKeySchema),
  applicant: personSnapshotSchema,
  partner: partnerSnapshotSchema.nullish(),
  children: z.array(childSnapshotSchema),
  residents: z.array(residentSnapshotSchema),
  housing: housingSnapshotSchema.nullish(),
  assets: assetsSnapshotSchema,
  specialSituations: specialSituationsSchema,
}) satisfies z.ZodType<HouseholdSnapshot>;

const toeslagenEvaluationSchema = z.object({
  year: z.literal(2026),
  parameterSetVersion: z.literal("NL_TOESLAGEN_2026_V1"),
  results: z.object({
    zorgtoeslag: benefitEvaluationResultSchema,
    huurtoeslag: benefitEvaluationResultSchema,
    kindgebondenBudget: benefitEvaluationResultSchema,
    kinderopvangtoeslag: benefitEvaluationResultSchema,
  }),
  totalEstimatedAnnualAmount: z.number(),
  totalEstimatedMonthlyAmount: z.number(),
  manualReviewRequired: z.boolean(),
}) satisfies z.ZodType<ToeslagenEvaluation>;

export const storedBenefitsCasePayloadSchema = z.object({
  kind: z.literal("benefits_bundle_2026"),
  locale: z.string().min(2),
  funnelStage: z.enum([
    "free_diagnosis",
    "checkout_required",
    "payment_pending",
    "paid_document_collection",
    "documents_incomplete",
    "ready_for_review",
    "application_preparation",
    "submitted",
    "completed",
  ]),
  selectedBenefits: z.array(benefitKeySchema).min(1),
  snapshot: householdSnapshotSchema,
  evaluation: toeslagenEvaluationSchema,
  prePaymentRange: estimateRangeSchema,
}) satisfies z.ZodType<StoredBenefitsCasePayload>;

const benefitLabelByKey: Record<BenefitKey, string> = {
  zorgtoeslag: "Zorgtoeslag",
  huurtoeslag: "Huurtoeslag",
  kindgebondenBudget: "Kindgebonden budget",
  kinderopvangtoeslag: "Kinderopvangtoeslag",
};

export function buildBenefitsCaseDisplayName(selectedBenefits: BenefitKey[]) {
  return selectedBenefits.map((key) => benefitLabelByKey[key]).join(" + ");
}

export function mapBenefitKeyToCaseType(benefit: BenefitKey) {
  if (benefit === "kindgebondenBudget") {
    return "kindgebonden_budget" as const;
  }

  return benefit;
}

export function parseStoredBenefitsCasePayload(value: unknown) {
  return storedBenefitsCasePayloadSchema.safeParse(value);
}
