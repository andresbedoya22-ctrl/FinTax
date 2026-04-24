import { calculateHuurtoeslag, calculateKindgebondenBudget, calculateKinderopvangtoeslag, calculateZorgtoeslag } from "../calculators";
import { validateSnapshot } from "./validation";
import type { BenefitKey, ToeslagenEvaluation, HouseholdSnapshot } from "../types";

export function evaluateToeslagen(snapshot: HouseholdSnapshot): ToeslagenEvaluation {
  validateSnapshot(snapshot);

  const results = {
    zorgtoeslag: calculateZorgtoeslag(snapshot),
    huurtoeslag: calculateHuurtoeslag(snapshot),
    kindgebondenBudget: calculateKindgebondenBudget(snapshot),
    kinderopvangtoeslag: calculateKinderopvangtoeslag(snapshot),
  };

  for (const benefit of Object.keys(results) as BenefitKey[]) {
    if (!snapshot.selectedBenefits.includes(benefit)) {
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
