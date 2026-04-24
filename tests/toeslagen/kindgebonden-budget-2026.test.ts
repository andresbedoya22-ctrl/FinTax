import { describe, expect, it } from "vitest";

import { calculateKindgebondenBudget } from "@/lib/toeslagen/calculators";

import { createBaseHousehold } from "./helpers";

describe("kindgebonden budget 2026", () => {
  it("supports a single parent with one child and low income", () => {
    const household = createBaseHousehold();
    household.applicant.annualIncome = 30000;
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

    const result = calculateKindgebondenBudget(household);

    expect(result.eligible).toBe(true);
    expect(result.estimatedAnnualAmount).toBeGreaterThan(0);
  });

  it("applies reduction for a partner household with two children", () => {
    const household = createBaseHousehold();
    household.applicant.annualIncome = 26000;
    household.partner = {
      id: "partner",
      birthDate: "1994-03-01",
      countryOfResidence: "NL",
      nlResident: true,
      bsnKnown: true,
      annualIncome: 19000,
      assets1Jan: 2000,
      hasDutchHealthInsurance: true,
      activityStatus: ["employed"],
      sameAddress: true,
      isToeslagPartner: true,
    };
    household.assets.partnerAssets1Jan = 2000;
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
      {
        id: "child-2",
        birthDate: "2020-01-01",
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

    const result = calculateKindgebondenBudget(household);

    expect(result.eligible).toBe(true);
    expect(result.calculationSteps.find((step) => step.code === "reduction")?.value).toBeGreaterThan(0);
  });

  it("adds age supplements for 13 and 16 year old children", () => {
    const household = createBaseHousehold();
    household.children = [
      {
        id: "child-1",
        birthDate: "2012-01-01",
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
      {
        id: "child-2",
        birthDate: "2009-01-01",
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

    const result = calculateKindgebondenBudget(household);

    expect(result.calculationSteps.find((step) => step.code === "ageAdditions")?.value).toBe(1688);
  });

  it("blocks when no eligible child receives kinderbijslag", () => {
    const household = createBaseHousehold();
    household.children = [
      {
        id: "child-1",
        birthDate: "2018-01-01",
        livesWithApplicant: true,
        isCoParentingChild: false,
        daysPerYearWithApplicant: 365,
        receivesKinderbijslag: false,
        hasIncome: false,
        annualIncome: 0,
        assets1Jan: 0,
        goesToChildcare: false,
        bsnKnown: true,
        childcareArrangements: [],
      },
    ];

    const result = calculateKindgebondenBudget(household);

    expect(result.eligible).toBe(false);
    expect(result.blockingReasons).toContain("KGB_NO_KINDERBIJSLAG");
  });

  it("blocks partner households above the assets cap", () => {
    const household = createBaseHousehold();
    household.partner = {
      id: "partner",
      birthDate: "1994-03-01",
      countryOfResidence: "NL",
      nlResident: true,
      bsnKnown: true,
      annualIncome: 8000,
      assets1Jan: 190000,
      hasDutchHealthInsurance: true,
      activityStatus: ["employed"],
      sameAddress: true,
      isToeslagPartner: true,
    };
    household.assets.partnerAssets1Jan = 190000;
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

    const result = calculateKindgebondenBudget(household);

    expect(result.eligible).toBe(false);
    expect(result.blockingReasons).toContain("KGB_ASSETS_TOO_HIGH");
  });

  it("marks child abroad cases for manual review and withholds exact amount", () => {
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
    household.specialSituations.childAbroad = true;

    const result = calculateKindgebondenBudget(household);

    expect(result.manualReviewRequired).toBe(true);
    expect(result.warningReasons).toContain("KGB_FOREIGN_CHILD_MANUAL_REVIEW");
    expect(result.estimatedAnnualAmount).toBeNull();
  });
});
