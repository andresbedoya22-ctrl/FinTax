import { describe, expect, it } from "vitest";

import { calculateHuurtoeslag } from "@/lib/toeslagen/calculators";

import { createBaseHousehold } from "./helpers";

describe("huurtoeslag 2026", () => {
  it("uses the young cap for a 20 year old single applicant", () => {
    const household = createBaseHousehold();
    household.applicant.birthDate = "2005-04-01";
    household.housing!.basicMonthlyRent = 600;
    household.applicant.annualIncome = 22000;

    const result = calculateHuurtoeslag(household);

    expect(result.estimatedMonthlyAmount).toBe(295);
    expect(result.warningReasons).toContain("YOUNG_HOUSEHOLD_HUUR_FORMULA_REQUIRES_CONFIRMATION");
  });

  it("caps rent at 932.93 for a partner household with a child", () => {
    const household = createBaseHousehold();
    household.partner = {
      id: "partner",
      birthDate: "1994-03-01",
      countryOfResidence: "NL",
      nlResident: true,
      bsnKnown: true,
      annualIncome: 8000,
      assets1Jan: 2000,
      hasDutchHealthInsurance: true,
      activityStatus: ["employed"],
      sameAddress: true,
      isToeslagPartner: true,
    };
    household.children = [
      {
        id: "child-1",
        birthDate: "2024-01-01",
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
    household.applicant.annualIncome = 26000;
    household.housing!.basicMonthlyRent = 1200;

    const result = calculateHuurtoeslag(household);

    expect(result.estimatedMonthlyAmount).toBe(492);
    expect(result.calculationSteps.find((step) => step.code === "cappedRent")?.value).toBe(932.93);
  });

  it("blocks when a medebewoner exceeds the assets limit", () => {
    const household = createBaseHousehold();
    household.residents = [
      {
        id: "resident-1",
        birthDate: "1988-01-01",
        relationship: "friend",
        sameAddressRegistered: true,
        annualIncome: 20000,
        assets1Jan: 45000,
        isSubtenant: false,
        hasSubrentContract: false,
      },
    ];

    const result = calculateHuurtoeslag(household);

    expect(result.eligible).toBe(false);
    expect(result.blockingReasons).toContain("HUUR_MEDEBEWONER_ASSETS_TOO_HIGH");
  });

  it("blocks ordinary room rentals", () => {
    const household = createBaseHousehold();
    household.housing!.rentsRoom = true;
    household.housing!.independentHome = false;

    const result = calculateHuurtoeslag(household);

    expect(result.blockingReasons).toContain("HUUR_KAMERHUUR");
  });

  it("excludes a valid subtenant from the medebewoner calculation", () => {
    const household = createBaseHousehold();
    household.residents = [
      {
        id: "resident-1",
        birthDate: "1988-01-01",
        relationship: "subtenant",
        sameAddressRegistered: true,
        annualIncome: 50000,
        assets1Jan: 60000,
        isSubtenant: true,
        hasSubrentContract: true,
      },
    ];

    const result = calculateHuurtoeslag(household);

    expect(result.blockingReasons).not.toContain("HUUR_MEDEBEWONER_ASSETS_TOO_HIGH");
  });

  it("excludes child income under the under-23 exemption", () => {
    const household = createBaseHousehold();
    household.children = [
      {
        id: "child-1",
        birthDate: "2007-01-01",
        livesWithApplicant: true,
        isCoParentingChild: false,
        daysPerYearWithApplicant: 365,
        receivesKinderbijslag: true,
        hasIncome: true,
        annualIncome: 5000,
        assets1Jan: 0,
        goesToChildcare: false,
        bsnKnown: true,
        childcareArrangements: [],
      },
    ];

    const result = calculateHuurtoeslag(household);

    expect(result.calculationSteps.find((step) => step.code === "rekeninkomen")?.value).toBe(19000);
  });

  it("includes only the excess child income above the exemption", () => {
    const household = createBaseHousehold();
    household.children = [
      {
        id: "child-1",
        birthDate: "2007-01-01",
        livesWithApplicant: true,
        isCoParentingChild: false,
        daysPerYearWithApplicant: 365,
        receivesKinderbijslag: true,
        hasIncome: true,
        annualIncome: 7000,
        assets1Jan: 0,
        goesToChildcare: false,
        bsnKnown: true,
        childcareArrangements: [],
      },
    ];

    const result = calculateHuurtoeslag(household);

    expect(result.calculationSteps.find((step) => step.code === "rekeninkomen")?.value).toBe(19782);
  });

  it("blocks partner households above the joint asset cap", () => {
    const household = createBaseHousehold();
    household.partner = {
      id: "partner",
      birthDate: "1994-03-01",
      countryOfResidence: "NL",
      nlResident: true,
      bsnKnown: true,
      annualIncome: 8000,
      assets1Jan: 80000,
      hasDutchHealthInsurance: true,
      activityStatus: ["employed"],
      sameAddress: true,
      isToeslagPartner: true,
    };
    household.assets.partnerAssets1Jan = 80000;

    const result = calculateHuurtoeslag(household);

    expect(result.eligible).toBe(false);
    expect(result.blockingReasons).toContain("HUUR_PARTNER_ASSETS_TOO_HIGH");
  });
});
