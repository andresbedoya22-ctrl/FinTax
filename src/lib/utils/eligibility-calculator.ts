import { evaluateToeslagen, type BenefitKey, type HouseholdSnapshot, type ToeslagenEvaluation } from "@/lib/toeslagen";

export interface BenefitsWizardInput {
  benefitsYear?: 2025 | 2026;
  age: number;
  householdType: "single" | "partners";
  annualIncome: number;
  assets: number;
  nlResident: boolean;
  hasHealthInsurance: boolean;
  hasIndependentHome: boolean;
  hasRentalContract: boolean;
  monthlyRent: number;
  childrenUnder18: number;
  receivesKinderbijslag: boolean;
  usesChildcare: boolean;
  childcareHoursPerMonth: number;
  childcareType: "daycare" | "outOfSchoolCare" | "childminder";
  childcareHourlyRate: number;
  registeredChildcare: boolean;
  bothParentsWork: boolean;
}

export interface BenefitResult {
  eligible: boolean;
  manualReviewRequired: boolean;
  estimatedAnnualAmount: number;
  estimatedMonthlyAmount: number;
  reasons: string[];
  reasoning: string[];
  warningReasons: string[];
  nextStep: string;
  priority: number;
  calculationSteps: ToeslagenEvaluation["results"][BenefitKey]["calculationSteps"];
  requiredDocuments: ToeslagenEvaluation["results"][BenefitKey]["requiredDocuments"];
  optionalDocuments: ToeslagenEvaluation["results"][BenefitKey]["optionalDocuments"];
}

export interface EligibilityResults {
  zorgtoeslag: BenefitResult;
  huurtoeslag: BenefitResult;
  kindgebondenBudget: BenefitResult;
  kinderopvangtoeslag: BenefitResult;
  totalEstimatedAnnualAmount: number;
  totalEstimatedMonthlyAmount: number;
  manualReviewRequired: boolean;
  year: 2026;
  parameterSetVersion: "NL_TOESLAGEN_2026_V1";
}

function birthDateFromAge(age: number) {
  const year = 2026 - Math.max(0, Math.floor(age));
  return `${year}-01-01`;
}

function buildLegacySnapshot(input: BenefitsWizardInput): HouseholdSnapshot {
  const hasPartner = input.householdType === "partners";
  const hasChildren = input.childrenUnder18 > 0;

  return {
    year: 2026,
    selectedBenefits: [
      "zorgtoeslag",
      "huurtoeslag",
      ...(hasChildren ? (["kindgebondenBudget"] as const) : []),
      ...(input.usesChildcare ? (["kinderopvangtoeslag"] as const) : []),
    ],
    applicant: {
      id: "applicant",
      birthDate: birthDateFromAge(input.age),
      countryOfResidence: input.nlResident ? "NL" : "UNKNOWN",
      nlResident: input.nlResident,
      bsnKnown: true,
      annualIncome: input.annualIncome,
      assets1Jan: input.assets,
      hasDutchHealthInsurance: input.hasHealthInsurance,
      activityStatus: input.bothParentsWork ? ["employed"] : ["none"],
    },
    partner: hasPartner
      ? {
          id: "partner",
          birthDate: birthDateFromAge(Math.max(18, input.age - 1)),
          countryOfResidence: input.nlResident ? "NL" : "UNKNOWN",
          nlResident: input.nlResident,
          bsnKnown: true,
          annualIncome: 0,
          assets1Jan: 0,
          hasDutchHealthInsurance: input.hasHealthInsurance,
          activityStatus: input.bothParentsWork ? ["employed"] : ["none"],
          sameAddress: true,
          isToeslagPartner: true,
        }
      : null,
    children: Array.from({ length: input.childrenUnder18 }).map((_, index) => ({
      id: `child-${index + 1}`,
      birthDate: `${2026 - Math.max(1, 8 + index)}-01-01`,
      livesWithApplicant: true,
      isCoParentingChild: false,
      daysPerYearWithApplicant: 365,
      receivesKinderbijslag: input.receivesKinderbijslag,
      hasIncome: false,
      annualIncome: 0,
      assets1Jan: 0,
      goesToChildcare: input.usesChildcare,
      bsnKnown: true,
      childcareArrangements: input.usesChildcare
        ? [
            {
              id: `arrangement-${index + 1}`,
              childcareKind:
                input.childcareType === "daycare"
                  ? "dagopvang"
                  : input.childcareType === "outOfSchoolCare"
                    ? "buitenschoolseOpvang"
                    : "dagopvang",
              providerType: input.childcareType === "childminder" ? "gastouder" : "kindercentrum",
              registeredLrk: input.registeredChildcare,
              lrkNumber: input.registeredChildcare ? "123456789" : undefined,
              monthlyHours: input.childcareHoursPerMonth,
              hourlyRate: input.childcareHourlyRate,
              hasContract: true,
              parentsPayContribution: true,
            },
          ]
        : [],
    })),
    residents: [],
    housing: {
      rentsRoom: !input.hasIndependentHome,
      independentHome: input.hasIndependentHome,
      groupHousingForElderlyOrAssistedLiving: false,
      recognizedException: false,
      hasRentalContract: input.hasRentalContract,
      basicMonthlyRent: input.monthlyRent,
      isWoonwagen: false,
      monthlyStandplaatsCost: 0,
      serviceCostsIncludedButIgnoredFrom2026: 0,
    },
    assets: {
      applicantAssets1Jan: input.assets,
      partnerAssets1Jan: 0,
      childAssets1Jan: 0,
      residentAssets1Jan: 0,
      hasSpecialAssets: false,
    },
    specialSituations: {
      foreignResidence: !input.nlResident,
      foreignWork: false,
      childAbroad: false,
      childcareAbroad: false,
      cakInsured: false,
      military: false,
      detained: false,
      gemoedsbezwaarde: false,
      noFixedAddress: false,
      bijzondereVermogen: false,
      bijzonderInkomen: false,
      longAbsenceFromHome: false,
      homeCareSituation: false,
      composedFamily: false,
      adoptionFosterStepChild: false,
      manualReviewNotes: "",
    },
  };
}

function nextStepForBenefit(benefit: BenefitKey, eligible: boolean, manualReviewRequired: boolean) {
  if (manualReviewRequired) {
    return "manualReview";
  }
  if (!eligible) {
    switch (benefit) {
      case "zorgtoeslag":
        return "reviewHealthConditions";
      case "huurtoeslag":
        return "reviewHousingConditions";
      case "kindgebondenBudget":
        return "reviewChildrenConditions";
      case "kinderopvangtoeslag":
        return "reviewChildcareConditions";
    }
  }

  switch (benefit) {
    case "zorgtoeslag":
      return "collectHealthPolicy";
    case "huurtoeslag":
      return "prepareRentalDocuments";
    case "kindgebondenBudget":
      return "confirmChildBenefit";
    case "kinderopvangtoeslag":
      return "prepareChildcareInvoices";
  }
}

function toLegacyBenefitResult(
  benefit: BenefitKey,
  result: ToeslagenEvaluation["results"][BenefitKey],
  priority: number,
): BenefitResult {
  const reasoning = result.eligible
    ? result.calculationSteps.slice(0, 3).map((step) => step.code)
    : result.blockingReasons;

  return {
    eligible: result.eligible,
    manualReviewRequired: result.manualReviewRequired,
    estimatedAnnualAmount: result.estimatedAnnualAmount ?? 0,
    estimatedMonthlyAmount: result.estimatedMonthlyAmount ?? 0,
    reasons: result.blockingReasons,
    reasoning,
    warningReasons: result.warningReasons,
    nextStep: nextStepForBenefit(benefit, result.eligible, result.manualReviewRequired),
    priority,
    calculationSteps: result.calculationSteps,
    requiredDocuments: result.requiredDocuments,
    optionalDocuments: result.optionalDocuments,
  };
}

export function calculateEligibility(input: BenefitsWizardInput): EligibilityResults {
  const evaluation = evaluateToeslagen(buildLegacySnapshot(input));

  return {
    zorgtoeslag: toLegacyBenefitResult("zorgtoeslag", evaluation.results.zorgtoeslag, 1),
    huurtoeslag: toLegacyBenefitResult("huurtoeslag", evaluation.results.huurtoeslag, 2),
    kindgebondenBudget: toLegacyBenefitResult("kindgebondenBudget", evaluation.results.kindgebondenBudget, 3),
    kinderopvangtoeslag: toLegacyBenefitResult("kinderopvangtoeslag", evaluation.results.kinderopvangtoeslag, 4),
    totalEstimatedAnnualAmount: evaluation.totalEstimatedAnnualAmount,
    totalEstimatedMonthlyAmount: evaluation.totalEstimatedMonthlyAmount,
    manualReviewRequired: evaluation.manualReviewRequired,
    year: evaluation.year,
    parameterSetVersion: evaluation.parameterSetVersion,
  };
}

export { buildLegacySnapshot };
