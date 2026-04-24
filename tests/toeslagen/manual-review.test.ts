import { describe, expect, it } from "vitest";

import { evaluateToeslagen } from "@/lib/toeslagen";

import { createBaseHousehold } from "./helpers";

describe("manual review flags", () => {
  it("raises global manual review when a special foreign case exists", () => {
    const household = createBaseHousehold();
    household.specialSituations.foreignResidence = true;

    const result = evaluateToeslagen(household);

    expect(result.manualReviewRequired).toBe(true);
    expect(result.results.zorgtoeslag.manualReviewRequired).toBe(true);
  });

  it("marks composed family KGB cases for manual review", () => {
    const household = createBaseHousehold();
    household.children = [
      {
        id: "child-1",
        birthDate: "2018-01-01",
        livesWithApplicant: true,
        isCoParentingChild: false,
        daysPerYearWithApplicant: 365,
        receivesKinderbijslag: true,
        hasIncome: false,
        annualIncome: 0,
        assets1Jan: 0,
        goesToChildcare: false,
        bsnKnown: true,
        childcareArrangements: [],
      },
    ];
    household.specialSituations.composedFamily = true;

    const result = evaluateToeslagen(household);

    expect(result.results.kindgebondenBudget.manualReviewRequired).toBe(true);
    expect(result.results.kindgebondenBudget.warningReasons).toContain("KGB_COMPOSED_FAMILY_MANUAL_REVIEW");
  });
});
