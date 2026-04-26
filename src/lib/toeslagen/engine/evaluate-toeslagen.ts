import { calculateHuurtoeslag, calculateKindgebondenBudget, calculateKinderopvangtoeslag, calculateZorgtoeslag } from "../calculators";
import { coerceHouseholdSnapshot } from "./normalize-household";
import { validateSnapshot } from "./validation";
import type { BenefitKey, ToeslagenEvaluation, HouseholdSnapshot } from "../types";

export function evaluateToeslagen(snapshot: HouseholdSnapshot): ToeslagenEvaluation {
  const safeSnapshot = coerceHouseholdSnapshot(snapshot);
  validateSnapshot(safeSnapshot);

  const results = {
    zorgtoeslag: calculateZorgtoeslag(safeSnapshot),
    huurtoeslag: calculateHuurtoeslag(safeSnapshot),
    kindgebondenBudget: calculateKindgebondenBudget(safeSnapshot),
    kinderopvangtoeslag: calculateKinderopvangtoeslag(safeSnapshot),
  };

  for (const benefit of Object.keys(results) as BenefitKey[]) {
    if (!safeSnapshot.selectedBenefits.includes(benefit)) {
      results[benefit] = {
        ...results[benefit],
        eligible: false,
        estimatedAnnualAmount: 0,
        estimatedMonthlyAmount: 0,
      };
    }
  }

  const totalEstimatedAnnualAmount = (Object.values(results).reduce(
    (sum, result) => sum + (result.estimatedAnnualAmount ?? 0),
    0,
  ));
  const totalEstimatedMonthlyAmount = (Object.values(results).reduce(
    (sum, result) => sum + (result.estimatedMonthlyAmount ?? 0),
    0,
  ));

  return {
    year: 2026,
    parameterSetVersion: "NL_TOESLAGEN_2026_V1",
    results,
    totalEstimatedAnnualAmount,
    totalEstimatedMonthlyAmount,
    manualReviewRequired: Object.values(results).some((result) => result.manualReviewRequired),
  };
}
