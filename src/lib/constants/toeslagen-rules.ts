import type { CaseType } from "../../types/database";

export type HouseholdType = "single" | "partners";

export interface ToeslagRules2026 {
  zorgtoeslag: {
    minAge: number;
    maxIncome: Record<HouseholdType, number>;
    maxAssets: Record<HouseholdType, number>;
    maxAnnualAmount: Record<HouseholdType, number>;
    requiresNlResident: true;
    requiresHealthInsurance: true;
  };
  huurtoeslag: {
    minAge: number;
    maxAssets: Record<HouseholdType, number>;
    noMaxRentFrom2026: true;
    maxRentConsidered: {
      under23: number;
      standard: number;
    };
    requiresIndependentHome: true;
    requiresRentalContract: true;
  };
  kindgebondenBudget: {
    maxAssets: Record<HouseholdType, number>;
    fullAmountIncomeThreshold: Record<HouseholdType, number>;
    reductionRate: number;
    requiresChildrenUnder18: true;
    requiresKinderbijslag: true;
  };
  kinderopvangtoeslag: {
    highCoverageIncomeThreshold: number;
    highCoverageRate: number;
    requiresRegisteredChildcare: true;
    requiresWorkingParents: true;
    maxHourlyRate: {
      daycare: number;
      outOfSchoolCare: number;
      childminder: number;
    };
  };
}

export const TOESLAGEN_RULES_2026: ToeslagRules2026 = {
  zorgtoeslag: {
    minAge: 18,
    maxIncome: { single: 40857, partners: 51142 },
    maxAssets: { single: 146011, partners: 184633 },
    maxAnnualAmount: { single: 1574, partners: 3010 },
    requiresNlResident: true,
    requiresHealthInsurance: true,
  },
  huurtoeslag: {
    minAge: 18,
    maxAssets: { single: 38479, partners: 76958 },
    noMaxRentFrom2026: true,
    maxRentConsidered: { standard: 932.93, under23: 498.2 },
    requiresIndependentHome: true,
    requiresRentalContract: true,
  },
  kindgebondenBudget: {
    maxAssets: { single: 146011, partners: 184633 },
    fullAmountIncomeThreshold: { single: 29736, partners: 39141 },
    reductionRate: 0.076,
    requiresChildrenUnder18: true,
    requiresKinderbijslag: true,
  },
  kinderopvangtoeslag: {
    highCoverageIncomeThreshold: 56413,
    highCoverageRate: 0.96,
    requiresRegisteredChildcare: true,
    requiresWorkingParents: true,
    maxHourlyRate: {
      daycare: 10.25,
      outOfSchoolCare: 9.12,
      childminder: 7.53,
    },
  },
};

export const BENEFIT_CASE_TYPES: CaseType[] = [
  "zorgtoeslag",
  "huurtoeslag",
  "kindgebonden_budget",
  "kinderopvangtoeslag",
];
