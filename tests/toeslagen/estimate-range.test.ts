import { describe, expect, it } from "vitest";

import { buildPrePaymentEstimateRange, evaluateToeslagen } from "@/lib/toeslagen";

import { createBaseHousehold } from "./helpers";

describe("buildPrePaymentEstimateRange", () => {
  it("applies a standard +/-10% range and rounds to EUR 10", () => {
    const household = createBaseHousehold();
    household.selectedBenefits = ["zorgtoeslag"];

    const evaluation = evaluateToeslagen(household);
    evaluation.totalEstimatedMonthlyAmount = 529;

    const range = buildPrePaymentEstimateRange(evaluation);

    expect(range.minMonthly).toBe(480);
    expect(range.maxMonthly).toBe(580);
    expect(range.minAnnual).toBe(5760);
    expect(range.maxAnnual).toBe(6960);
    expect(range.confidence).toBe("standard");
  });

  it("widens the range to +/-20% when manual review is required", () => {
    const household = createBaseHousehold();
    household.selectedBenefits = ["zorgtoeslag"];

    const evaluation = evaluateToeslagen(household);
    evaluation.totalEstimatedMonthlyAmount = 529;
    evaluation.manualReviewRequired = true;

    const range = buildPrePaymentEstimateRange(evaluation);

    expect(range.minMonthly).toBe(420);
    expect(range.maxMonthly).toBe(630);
    expect(range.confidence).toBe("manual_review");
  });

  it("returns zero range for zero amount", () => {
    const household = createBaseHousehold();
    const evaluation = evaluateToeslagen(household);
    evaluation.totalEstimatedMonthlyAmount = 0;

    const range = buildPrePaymentEstimateRange(evaluation);

    expect(range).toEqual({
      minMonthly: 0,
      maxMonthly: 0,
      minAnnual: 0,
      maxAnnual: 0,
      confidence: "low",
    });
  });

  it("never returns negative values", () => {
    const household = createBaseHousehold();
    const evaluation = evaluateToeslagen(household);
    evaluation.totalEstimatedMonthlyAmount = 1;

    const range = buildPrePaymentEstimateRange(evaluation);

    expect(range.minMonthly).toBeGreaterThanOrEqual(0);
    expect(range.maxMonthly).toBeGreaterThanOrEqual(0);
    expect(range.minAnnual).toBeGreaterThanOrEqual(0);
    expect(range.maxAnnual).toBeGreaterThanOrEqual(0);
  });
});
