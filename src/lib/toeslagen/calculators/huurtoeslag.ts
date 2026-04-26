import { getDocumentChecklistForBenefit } from "../documents";
import { getManualReviewReasons } from "../engine/manual-review";
import { coerceHouseholdSnapshot, getAgeOnReferenceDate, normalizeHousehold } from "../engine/normalize-household";
import { NL_TOESLAGEN_2026 } from "../parameters";
import type { BenefitEvaluationResult, CalculationStep, ChildSnapshot, HouseholdSnapshot, ResidentSnapshot } from "../types";

function floorEuro(value: number) {
  return Math.max(0, Math.floor(value));
}

function roundCurrency(value: number) {
  return Math.round(Math.max(0, value) * 100) / 100;
}

function residentTaxableIncome(resident: ResidentSnapshot) {
  return Math.max(0, resident.annualIncome);
}

function childTaxableIncome(child: ChildSnapshot, exemption: number) {
  if (!child.hasIncome) {
    return 0;
  }
  const age = getAgeOnReferenceDate(child.birthDate);
  if (age < 23) {
    return Math.max(0, child.annualIncome - exemption);
  }
  return Math.max(0, child.annualIncome);
}

export function calculateHuurtoeslag(snapshot: HouseholdSnapshot): BenefitEvaluationResult {
  const safeSnapshot = coerceHouseholdSnapshot(snapshot);
  const normalized = normalizeHousehold(safeSnapshot);
  const params = NL_TOESLAGEN_2026.huurtoeslag;
  const housing = safeSnapshot.housing;
  const blockingReasons: BenefitEvaluationResult["blockingReasons"] = [];
  const warningReasons: BenefitEvaluationResult["warningReasons"] = getManualReviewReasons(safeSnapshot, "huurtoeslag");
  const steps: CalculationStep[] = [];

  if (!housing) {
    blockingReasons.push("HUUR_NO_RENTAL_CONTRACT");
  }

  const applicantAge = getAgeOnReferenceDate(safeSnapshot.applicant.birthDate);
  if (applicantAge < params.minAge) {
    blockingReasons.push("HUUR_UNDER_18");
  }
  if (!housing?.hasRentalContract) {
    blockingReasons.push("HUUR_NO_RENTAL_CONTRACT");
  }
  if (!housing?.independentHome && !housing?.recognizedException) {
    blockingReasons.push("HUUR_NOT_INDEPENDENT_HOME");
  }
  if (housing?.rentsRoom && !housing.recognizedException) {
    blockingReasons.push("HUUR_KAMERHUUR");
  }
  if (housing?.groupHousingForElderlyOrAssistedLiving && !housing.recognizedException) {
    blockingReasons.push("HUUR_GROUP_HOUSING_UNRECOGNIZED");
  }
  const combinedPartnerAssets = safeSnapshot.assets.applicantAssets1Jan + safeSnapshot.assets.partnerAssets1Jan;
  if (!normalized.hasPartner && safeSnapshot.assets.applicantAssets1Jan > params.maxAssetsSingle) {
    blockingReasons.push("HUUR_APPLICANT_ASSETS_TOO_HIGH");
  }
  if (normalized.hasPartner && combinedPartnerAssets > params.maxAssetsWithPartner) {
    blockingReasons.push("HUUR_PARTNER_ASSETS_TOO_HIGH");
  }
  if (
    safeSnapshot.residents.some(
      (resident) =>
        !resident.isSubtenant &&
        resident.assets1Jan > params.maxAssetsPerMedebewoner,
    )
  ) {
    blockingReasons.push("HUUR_MEDEBEWONER_ASSETS_TOO_HIGH");
  }

  const rekenhuurBase = (housing?.basicMonthlyRent ?? 0) + (housing?.isWoonwagen ? housing.monthlyStandplaatsCost : 0);
  const isYoungHousehold = normalized.oldestHouseholdMemberAge < params.youngHouseholdAgeLimit;
  const cappedRent = Math.min(
    rekenhuurBase,
    isYoungHousehold ? params.maxRentCalculationYoung : params.maxRentCalculationGeneral,
  );
  const basishuur =
    normalized.householdSizeForRent === 1 ? params.basishuurOnePerson : params.basishuurTwoOrMorePersons;
  const aftoppingsgrens =
    normalized.householdSizeForRent >= 3
      ? params.aftoppingsgrensThreeOrMorePersons
      : params.aftoppingsgrensOneOrTwoPersons;

  const relevantResidents = safeSnapshot.residents.filter(
    (resident) => !(resident.isSubtenant && resident.hasSubrentContract),
  );
  const rekeninkomen =
    safeSnapshot.applicant.annualIncome +
    (normalized.hasPartner && safeSnapshot.partner ? safeSnapshot.partner.annualIncome : 0) +
    relevantResidents.reduce((total, resident) => total + residentTaxableIncome(resident), 0) +
    safeSnapshot.children.reduce(
      (total, child) => total + childTaxableIncome(child, params.childrenUnder23IncomeExemption),
      0,
    );

  const correctionBase =
    normalized.householdSizeForRent === 1
      ? Math.max(0, rekeninkomen - params.inkomensijkpuntOnePerson) * params.incomeReductionRateOnePerson / 12
      : Math.max(0, rekeninkomen - params.inkomensijkpuntTwoOrMorePersons) * params.incomeReductionRateTwoOrMorePersons / 12;

  const partA = Math.max(0, Math.min(cappedRent, params.kwaliteitskortingsgrens) - basishuur);
  const partB = isYoungHousehold
    ? 0
    : Math.max(0, Math.min(cappedRent, aftoppingsgrens) - params.kwaliteitskortingsgrens) * 0.65;
  const partC = isYoungHousehold ? 0 : Math.max(0, cappedRent - aftoppingsgrens) * 0.4;
  const correction = isYoungHousehold ? 0 : Math.max(0, correctionBase);
  const monthlyRaw = Math.max(0, partA + partB + partC - correction);
  const monthly = floorEuro(monthlyRaw);
  const annual = monthly * 12;

  if (isYoungHousehold) {
    warningReasons.push("YOUNG_HOUSEHOLD_HUUR_FORMULA_REQUIRES_CONFIRMATION");
  }

  if (rekeninkomen > (normalized.householdSizeForRent === 1 ? 999999 : 999999) && monthly === 0) {
    blockingReasons.push("HUUR_INCOME_TOO_HIGH");
  }
  if (monthly === 0) {
    blockingReasons.push("HUUR_AMOUNT_ZERO");
  }

  steps.push(
    { code: "rekenhuur", labelKey: "Benefits.results.calculation.rekenhuur", value: roundCurrency(rekenhuurBase) },
    { code: "cappedRent", labelKey: "Benefits.results.calculation.cappedRent", value: roundCurrency(cappedRent) },
    { code: "basishuur", labelKey: "Benefits.results.calculation.basishuur", value: basishuur },
    { code: "partA", labelKey: "Benefits.results.calculation.partA", value: roundCurrency(partA), formula: "max(0, min(cappedRent, 498.20) - basishuur)" },
    { code: "partB", labelKey: "Benefits.results.calculation.partB", value: roundCurrency(partB), formula: "max(0, min(cappedRent, aftoppingsgrens) - 498.20) x 0.65" },
    { code: "partC", labelKey: "Benefits.results.calculation.partC", value: roundCurrency(partC), formula: "max(0, cappedRent - aftoppingsgrens) x 0.40" },
    { code: "rekeninkomen", labelKey: "Benefits.results.calculation.rekeninkomen", value: rekeninkomen },
    { code: "incomeCorrection", labelKey: "Benefits.results.calculation.incomeCorrection", value: roundCurrency(correction) },
    { code: "monthly", labelKey: "Benefits.results.calculation.monthlyAmount", value: monthly, formula: "floor(max(0, A + B + C - correction))" },
  );

  const eligible = blockingReasons.length === 0;
  const docs = getDocumentChecklistForBenefit(safeSnapshot, "huurtoeslag");

  return {
    benefit: "huurtoeslag",
    eligible,
    manualReviewRequired: warningReasons.length > 0,
    estimatedAnnualAmount: eligible ? annual : 0,
    estimatedMonthlyAmount: eligible ? monthly : 0,
    blockingReasons,
    warningReasons,
    calculationSteps: steps,
    requiredDocuments: docs.requiredDocuments,
    optionalDocuments: docs.optionalDocuments,
  };
}
