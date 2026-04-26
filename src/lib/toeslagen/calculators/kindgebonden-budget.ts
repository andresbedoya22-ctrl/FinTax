import { getDocumentChecklistForBenefit } from "../documents";
import { getManualReviewReasons } from "../engine/manual-review";
import { coerceHouseholdSnapshot, getAgeOnReferenceDate, normalizeHousehold } from "../engine/normalize-household";
import { NL_TOESLAGEN_2026 } from "../parameters";
import type { BenefitEvaluationResult, CalculationStep, HouseholdSnapshot } from "../types";

function floorEuro(value: number) {
  return Math.max(0, Math.floor(value));
}

export function calculateKindgebondenBudget(snapshot: HouseholdSnapshot): BenefitEvaluationResult {
  const safeSnapshot = coerceHouseholdSnapshot(snapshot);
  const normalized = normalizeHousehold(safeSnapshot);
  const params = NL_TOESLAGEN_2026.kindgebondenBudget;
  const blockingReasons: BenefitEvaluationResult["blockingReasons"] = [];
  const warningReasons: BenefitEvaluationResult["warningReasons"] = getManualReviewReasons(safeSnapshot, "kindgebondenBudget");
  const steps: CalculationStep[] = [];

  const eligibleChildren = safeSnapshot.children.filter((child) => getAgeOnReferenceDate(child.birthDate) < 18);
  if (!eligibleChildren.length) {
    blockingReasons.push("KGB_NO_CHILD_UNDER_18");
  }
  if (!eligibleChildren.some((child) => child.receivesKinderbijslag)) {
    if (eligibleChildren.some((child) => {
      const age = getAgeOnReferenceDate(child.birthDate);
      return age === 16 || age === 17;
    })) {
      warningReasons.push("KGB_KINDERBIJSLAG_EXCEPTION_MANUAL_REVIEW");
    } else {
      blockingReasons.push("KGB_NO_KINDERBIJSLAG");
    }
  }

  const assetLimit = normalized.hasPartner ? params.maxAssetsWithPartner : params.maxAssetsSingle;
  const relevantAssets = normalized.hasPartner
    ? safeSnapshot.assets.applicantAssets1Jan + safeSnapshot.assets.partnerAssets1Jan
    : safeSnapshot.assets.applicantAssets1Jan;
  if (relevantAssets > assetLimit || safeSnapshot.assets.hasSpecialAssets) {
    blockingReasons.push("KGB_ASSETS_TOO_HIGH");
  }

  const childrenCount = eligibleChildren.length;
  const base = (() => {
    if (childrenCount <= 0) return 0;
    if (normalized.hasPartner) {
      if (childrenCount === 1) return params.baseWithPartner.oneChild;
      if (childrenCount === 2) return params.baseWithPartner.twoChildren;
      return params.baseWithPartner.twoChildren + (childrenCount - 2) * params.baseWithPartner.extraChild;
    }
    if (childrenCount === 1) return params.baseWithoutPartner.oneChild;
    if (childrenCount === 2) return params.baseWithoutPartner.twoChildren;
    return params.baseWithoutPartner.twoChildren + (childrenCount - 2) * params.baseWithoutPartner.extraChild;
  })();

  const ageAdditions = eligibleChildren.reduce((total, child) => {
    const age = getAgeOnReferenceDate(child.birthDate);
    if (age >= 16 && age <= 17) return total + params.ageAddition16To17;
    if (age >= 12 && age <= 15) return total + params.ageAddition12To15;
    return total;
  }, 0);

  const income = normalized.jointIncome;
  const threshold = normalized.hasPartner ? params.thresholdWithPartner : params.thresholdSingle;
  const reduction = Math.max(0, income - threshold) * params.reductionRate;
  const annualRaw = Math.max(0, base + ageAdditions - reduction);
  const annual = Math.round(annualRaw * 100) / 100;
  const monthly = floorEuro(annual / 12);

  if (safeSnapshot.specialSituations.childAbroad) {
    warningReasons.push("KGB_FOREIGN_CHILD_MANUAL_REVIEW");
  }
  if (safeSnapshot.specialSituations.composedFamily) {
    warningReasons.push("KGB_COMPOSED_FAMILY_MANUAL_REVIEW");
  }
  if (safeSnapshot.children.some((child) => child.isCoParentingChild)) {
    warningReasons.push("KGB_CO_PARENTING_MANUAL_REVIEW");
  }
  if (income > threshold && annual === 0) {
    blockingReasons.push("KGB_INCOME_TOO_HIGH");
  }
  if (annual === 0) {
    blockingReasons.push("KGB_AMOUNT_ZERO");
  }

  steps.push(
    { code: "childrenCount", labelKey: "Benefits.results.calculation.childrenCount", value: childrenCount },
    { code: "base", labelKey: "Benefits.results.calculation.baseAmount", value: base },
    { code: "ageAdditions", labelKey: "Benefits.results.calculation.ageAdditions", value: ageAdditions },
    { code: "income", labelKey: "Benefits.results.calculation.income", value: income },
    { code: "reduction", labelKey: "Benefits.results.calculation.reduction", value: Math.round(reduction * 100) / 100, formula: "max(0, income - threshold) x 0.076" },
    { code: "annual", labelKey: "Benefits.results.calculation.annualAmount", value: annual },
    { code: "monthly", labelKey: "Benefits.results.calculation.monthlyAmount", value: monthly, formula: "floor(annual / 12)" },
  );

  const docs = getDocumentChecklistForBenefit(safeSnapshot, "kindgebondenBudget");
  const exactAmountBlocked = safeSnapshot.specialSituations.childAbroad;
  const eligible = blockingReasons.length === 0;

  return {
    benefit: "kindgebondenBudget",
    eligible,
    manualReviewRequired: warningReasons.length > 0,
    estimatedAnnualAmount: eligible ? (exactAmountBlocked ? null : annual) : 0,
    estimatedMonthlyAmount: eligible ? (exactAmountBlocked ? null : monthly) : 0,
    blockingReasons,
    warningReasons,
    calculationSteps: steps,
    requiredDocuments: docs.requiredDocuments,
    optionalDocuments: docs.optionalDocuments,
  };
}
