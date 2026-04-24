import { getDocumentChecklistForBenefit } from "../documents";
import { getManualReviewReasons } from "../engine/manual-review";
import { normalizeHousehold } from "../engine/normalize-household";
import { NL_TOESLAGEN_2026 } from "../parameters";
import type { BenefitEvaluationResult, CalculationStep, HouseholdSnapshot } from "../types";

function floorEuro(value: number) {
  return Math.max(0, Math.floor(value));
}

function roundCurrency(value: number) {
  return Math.round(Math.max(0, value) * 100) / 100;
}

export function calculateZorgtoeslag(snapshot: HouseholdSnapshot): BenefitEvaluationResult {
  const normalized = normalizeHousehold(snapshot);
  const params = NL_TOESLAGEN_2026.zorgtoeslag;
  const manualReasons = getManualReviewReasons(snapshot, "zorgtoeslag");
  const blockingReasons: BenefitEvaluationResult["blockingReasons"] = [];
  const warningReasons: BenefitEvaluationResult["warningReasons"] = [...manualReasons];
  const steps: CalculationStep[] = [];

  const applicantAge = new Date("2026-01-01T00:00:00.000Z").getUTCFullYear() - new Date(`${snapshot.applicant.birthDate}T00:00:00.000Z`).getUTCFullYear();
  if (applicantAge < params.minAge) {
    blockingReasons.push("ZORG_UNDER_18");
  }
  if (!snapshot.applicant.hasDutchHealthInsurance && !snapshot.specialSituations.cakInsured) {
    blockingReasons.push("ZORG_NO_DUTCH_HEALTH_INSURANCE");
  }

  if (normalized.hasPartner && snapshot.partner && !snapshot.partner.hasDutchHealthInsurance && !snapshot.specialSituations.cakInsured) {
    warningReasons.push("ZORG_PARTNER_NO_DUTCH_HEALTH_INSURANCE");
  }

  if (!snapshot.applicant.nlResident && !snapshot.specialSituations.foreignResidence && !snapshot.specialSituations.cakInsured) {
    warningReasons.push("ZORG_FOREIGN_CASE_MANUAL_REVIEW");
  }

  const incomeCap = normalized.hasPartner ? params.maxIncomeWithPartner : params.maxIncomeSingle;
  const assetsCap = normalized.hasPartner ? params.maxAssetsWithPartner : params.maxAssetsSingle;
  const incomeForFormula = normalized.hasPartner ? normalized.jointIncome : snapshot.applicant.annualIncome;
  const assetsForFormula = normalized.hasPartner
    ? snapshot.assets.applicantAssets1Jan + snapshot.assets.partnerAssets1Jan
    : snapshot.assets.applicantAssets1Jan;

  if (incomeForFormula > incomeCap) {
    blockingReasons.push("ZORG_INCOME_TOO_HIGH");
  }
  if (assetsForFormula > assetsCap || snapshot.assets.hasSpecialAssets) {
    blockingReasons.push("ZORG_ASSETS_TOO_HIGH");
  }

  const baseNormPremie = normalized.hasPartner
    ? params.normpremiePartnerBaseRate * params.drempelinkomen
    : params.normpremieSingleBaseRate * params.drempelinkomen;
  const excessNormPremie = params.normpremieExcessRate * Math.max(0, incomeForFormula - params.drempelinkomen);
  const normPremie = baseNormPremie + excessNormPremie;
  const standaardPremie = normalized.hasPartner ? params.standaardpremiePair : params.standaardpremiePerInsured;

  let annual = Math.max(0, standaardPremie - normPremie);

  if (normalized.hasPartner && snapshot.partner && !snapshot.partner.hasDutchHealthInsurance) {
    annual *= 0.5;
  }

  annual = roundCurrency(annual);
  const monthly = floorEuro(annual / 12);

  steps.push(
    { code: "income", labelKey: "Benefits.results.calculation.income", value: incomeForFormula },
    { code: "assets", labelKey: "Benefits.results.calculation.assets", value: assetsForFormula },
    {
      code: "normPremie",
      labelKey: "Benefits.results.calculation.normPremie",
      value: roundCurrency(normPremie),
      formula: normalized.hasPartner
        ? "0.04289 x 29,736 + 0.1373 x max(0, jointIncome - 29,736)"
        : "0.01912 x 29,736 + 0.1373 x max(0, income - 29,736)",
    },
    {
      code: "annual",
      labelKey: "Benefits.results.calculation.annualAmount",
      value: annual,
      formula: normalized.hasPartner ? "max(0, 4,238 - normPremie)" : "max(0, 2,119 - normPremie)",
    },
    {
      code: "monthly",
      labelKey: "Benefits.results.calculation.monthlyAmount",
      value: monthly,
      formula: "floor(annual / 12)",
    },
  );

  const eligible = blockingReasons.length === 0 && annual > 0;
  const docs = getDocumentChecklistForBenefit(snapshot, "zorgtoeslag");

  return {
    benefit: "zorgtoeslag",
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
