import { getToeslagenRules, type HouseholdType } from "../constants/toeslagen-rules";

export interface BenefitsWizardInput {
  benefitsYear?: 2025 | 2026;
  age: number;
  householdType: HouseholdType;
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
  estimatedAnnualAmount: number;
  reasons: string[];
  reasoning: string[];
  nextStep: string;
  priority: number;
}

export interface EligibilityResults {
  zorgtoeslag: BenefitResult;
  huurtoeslag: BenefitResult;
  kindgebondenBudget: BenefitResult;
  kinderopvangtoeslag: BenefitResult;
  totalEstimatedAnnualAmount: number;
}

function roundCurrency(value: number): number {
  return Math.max(0, Math.round(value * 100) / 100);
}

function inThreshold(value: number, max: number): boolean {
  return value <= max;
}

export function calculateEligibility(input: BenefitsWizardInput): EligibilityResults {
  const rules = getToeslagenRules(input.benefitsYear ?? 2026);
  const household = input.householdType;

  const zorgReasons: string[] = [];
  if (input.age < rules.zorgtoeslag.minAge) zorgReasons.push("min_age");
  if (!input.nlResident) zorgReasons.push("nl_resident_required");
  if (!input.hasHealthInsurance) zorgReasons.push("health_insurance_required");
  if (!inThreshold(input.annualIncome, rules.zorgtoeslag.maxIncome[household])) zorgReasons.push("income_too_high");
  if (!inThreshold(input.assets, rules.zorgtoeslag.maxAssets[household])) zorgReasons.push("assets_too_high");

  const zorgEligible = zorgReasons.length === 0;
  const zorgIncomeRatio = Math.min(1, input.annualIncome / rules.zorgtoeslag.maxIncome[household]);
  const zorgEstimate = zorgEligible
    ? roundCurrency(rules.zorgtoeslag.maxAnnualAmount[household] * (1 - zorgIncomeRatio * 0.7))
    : 0;
  const zorgReasoning = zorgEligible
    ? ["resident_and_insured", "income_within_threshold", "assets_within_threshold"]
    : zorgReasons;

  const huurReasons: string[] = [];
  if (input.age < rules.huurtoeslag.minAge) huurReasons.push("min_age");
  if (!input.hasIndependentHome) huurReasons.push("independent_home_required");
  if (!input.hasRentalContract) huurReasons.push("rental_contract_required");
  if (!inThreshold(input.assets, rules.huurtoeslag.maxAssets[household])) huurReasons.push("assets_too_high");

  const huurEligible = huurReasons.length === 0;
  const rentCap = input.age < 23 ? rules.huurtoeslag.maxRentConsidered.under23 : rules.huurtoeslag.maxRentConsidered.standard;
  const rentForCalc = Math.min(input.monthlyRent, rentCap);
  const annualRentForCalc = rentForCalc * 12;
  const incomeFactor = Math.max(0.18, 1 - input.annualIncome / 90000);
  const huurEstimate = huurEligible ? roundCurrency(annualRentForCalc * 0.32 * incomeFactor) : 0;
  const huurReasoning = huurEligible ? ["independent_rental_home", "assets_within_huur_threshold"] : huurReasons;

  const kgbReasons: string[] = [];
  if (input.childrenUnder18 < 1) kgbReasons.push("children_required");
  if (!input.receivesKinderbijslag) kgbReasons.push("kinderbijslag_required");
  if (!inThreshold(input.assets, rules.kindgebondenBudget.maxAssets[household])) kgbReasons.push("assets_too_high");

  const kgbEligible = kgbReasons.length === 0;
  const baseKgb = input.childrenUnder18 * 1650;
  const threshold = rules.kindgebondenBudget.fullAmountIncomeThreshold[household];
  const incomeExcess = Math.max(0, input.annualIncome - threshold);
  const kgbReduction = incomeExcess * rules.kindgebondenBudget.reductionRate;
  const kgbEstimate = kgbEligible ? roundCurrency(baseKgb - kgbReduction) : 0;
  const kgbReasoning = kgbEligible ? ["children_declared", "kinderbijslag_confirmed", "assets_within_threshold"] : kgbReasons;

  const kotReasons: string[] = [];
  if (!input.usesChildcare) kotReasons.push("childcare_not_needed");
  if (!input.registeredChildcare) kotReasons.push("registered_childcare_required");
  if (!input.bothParentsWork) kotReasons.push("working_parents_required");
  if (input.childcareHoursPerMonth <= 0) kotReasons.push("childcare_hours_required");
  if (input.childrenUnder18 < 1) kotReasons.push("children_required");

  const kotEligible = kotReasons.length === 0;
  const maxRate = rules.kinderopvangtoeslag.maxHourlyRate[input.childcareType];
  const eligibleHourlyRate = Math.min(input.childcareHourlyRate, maxRate);
  const yearlyChildcareCost = eligibleHourlyRate * input.childcareHoursPerMonth * 12;
  const coverageRate = input.annualIncome <= rules.kinderopvangtoeslag.highCoverageIncomeThreshold
    ? rules.kinderopvangtoeslag.highCoverageRate
    : Math.max(0.33, 0.96 - (input.annualIncome - rules.kinderopvangtoeslag.highCoverageIncomeThreshold) / 220000);
  const kotEstimate = kotEligible ? roundCurrency(yearlyChildcareCost * coverageRate) : 0;
  const kotReasoning = kotEligible ? ["childcare_requirements_met", "childcare_costs_capped"] : kotReasons;

  const results: EligibilityResults = {
    zorgtoeslag: {
      eligible: zorgEligible,
      estimatedAnnualAmount: zorgEstimate,
      reasons: zorgReasons,
      reasoning: zorgReasoning,
      nextStep: zorgEligible ? "collectHealthPolicy" : "reviewHealthConditions",
      priority: zorgEligible ? 1 : 4,
    },
    huurtoeslag: {
      eligible: huurEligible,
      estimatedAnnualAmount: huurEstimate,
      reasons: huurReasons,
      reasoning: huurReasoning,
      nextStep: huurEligible ? "prepareRentalDocuments" : "reviewHousingConditions",
      priority: huurEligible ? 2 : 5,
    },
    kindgebondenBudget: {
      eligible: kgbEligible,
      estimatedAnnualAmount: kgbEstimate,
      reasons: kgbReasons,
      reasoning: kgbReasoning,
      nextStep: kgbEligible ? "confirmChildBenefit" : "reviewChildrenConditions",
      priority: kgbEligible ? 3 : 6,
    },
    kinderopvangtoeslag: {
      eligible: kotEligible,
      estimatedAnnualAmount: kotEstimate,
      reasons: kotReasons,
      reasoning: kotReasoning,
      nextStep: kotEligible ? "prepareChildcareInvoices" : "reviewChildcareConditions",
      priority: kotEligible ? 4 : 7,
    },
    totalEstimatedAnnualAmount: roundCurrency(zorgEstimate + huurEstimate + kgbEstimate + kotEstimate),
  };

  return results;
}
