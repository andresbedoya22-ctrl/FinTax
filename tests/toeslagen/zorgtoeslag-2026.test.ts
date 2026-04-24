import { describe, expect, it } from "vitest";

import { calculateZorgtoeslag } from "@/lib/toeslagen/calculators";

import { createBaseHousehold } from "./helpers";

describe("zorgtoeslag 2026", () => {
  it("marks a single insured adult with low income as eligible", () => {
    const household = createBaseHousehold();

    const result = calculateZorgtoeslag(household);

    expect(result.eligible).toBe(true);
    expect(result.estimatedMonthlyAmount).toBeGreaterThan(0);
    expect(result.blockingReasons).toEqual([]);
  });

  it("blocks a single applicant above the income limit", () => {
    const household = createBaseHousehold();
    household.applicant.annualIncome = 41000;

    const result = calculateZorgtoeslag(household);

    expect(result.eligible).toBe(false);
    expect(result.blockingReasons).toContain("ZORG_INCOME_TOO_HIGH");
  });

  it("accepts a partner household within the joint cap", () => {
    const household = createBaseHousehold();
    household.partner = {
      id: "partner",
      birthDate: "1994-03-01",
      countryOfResidence: "NL",
      nlResident: true,
      bsnKnown: true,
      annualIncome: 14200,
      assets1Jan: 3000,
      hasDutchHealthInsurance: true,
      activityStatus: ["employed"],
      sameAddress: true,
      isToeslagPartner: true,
    };

    const result = calculateZorgtoeslag(household);

    expect(result.eligible).toBe(true);
    expect(result.estimatedAnnualAmount).toBeGreaterThan(0);
  });

  it("blocks a single applicant above the assets limit", () => {
    const household = createBaseHousehold();
    household.assets.applicantAssets1Jan = 150000;

    const result = calculateZorgtoeslag(household);

    expect(result.eligible).toBe(false);
    expect(result.blockingReasons).toContain("ZORG_ASSETS_TOO_HIGH");
  });

  it("applies the half amount warning when the partner is not insured", () => {
    const household = createBaseHousehold();
    household.partner = {
      id: "partner",
      birthDate: "1994-03-01",
      countryOfResidence: "NL",
      nlResident: true,
      bsnKnown: true,
      annualIncome: 14200,
      assets1Jan: 3000,
      hasDutchHealthInsurance: false,
      activityStatus: ["employed"],
      sameAddress: true,
      isToeslagPartner: true,
    };

    const result = calculateZorgtoeslag(household);

    expect(result.eligible).toBe(true);
    expect(result.warningReasons).toContain("ZORG_PARTNER_NO_DUTCH_HEALTH_INSURANCE");
    expect(result.estimatedAnnualAmount).toBeGreaterThan(0);
  });
});
