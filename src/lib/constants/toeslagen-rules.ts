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
    noMaxRentFrom2026: boolean;
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

export interface ToeslagRuleSet extends ToeslagRules2026 {
  year: 2025 | 2026;
  source: string;
  validatedAt: string;
}

export const TOESLAGEN_RULES_2025: ToeslagRuleSet = {
  year: 2025,
  source: "Belastingdienst Toeslagenkaart 2025 and Dienst Toeslagen public threshold pages",
  validatedAt: "2026-04-01",
  zorgtoeslag: {
    minAge: 18,
    maxIncome: { single: 39719, partners: 50206 },
    maxAssets: { single: 141896, partners: 179429 },
    maxAnnualAmount: { single: 1572, partners: 3008 },
    requiresNlResident: true,
    requiresHealthInsurance: true,
  },
  huurtoeslag: {
    minAge: 18,
    maxAssets: { single: 37795, partners: 75590 },
    noMaxRentFrom2026: false,
    maxRentConsidered: { standard: 900.07, under23: 477.2 },
    requiresIndependentHome: true,
    requiresRentalContract: true,
  },
  kindgebondenBudget: {
    maxAssets: { single: 141896, partners: 179429 },
    fullAmountIncomeThreshold: { single: 28297, partners: 39927 },
    reductionRate: 0.0675,
    requiresChildrenUnder18: true,
    requiresKinderbijslag: true,
  },
  kinderopvangtoeslag: {
    highCoverageIncomeThreshold: 47200,
    highCoverageRate: 0.96,
    requiresRegisteredChildcare: true,
    requiresWorkingParents: true,
    maxHourlyRate: {
      daycare: 10.71,
      outOfSchoolCare: 9.52,
      childminder: 8.1,
    },
  },
};

export const TOESLAGEN_RULES_2026: ToeslagRuleSet = {
  year: 2026,
  source: "Dienst Toeslagen public threshold pages validated on 2026-04-01",
  validatedAt: "2026-04-01",
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

export function getToeslagenRules(year: number): ToeslagRuleSet {
  if (year <= 2025) return TOESLAGEN_RULES_2025;
  return TOESLAGEN_RULES_2026;
}

export const BENEFIT_CASE_TYPES: CaseType[] = [
  "zorgtoeslag",
  "huurtoeslag",
  "kindgebonden_budget",
  "kinderopvangtoeslag",
];
