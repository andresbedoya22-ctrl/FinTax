import { describe, expect, it } from "vitest";

import { calculateKinderopvangtoeslag } from "@/lib/toeslagen/calculators";

import { createBaseHousehold } from "./helpers";

function childcareChild(overrides: Partial<(ReturnType<typeof createBaseHousehold>)["children"][number]> = {}) {
  return {
    id: "child-1",
    birthDate: "2022-01-01",
    livesWithApplicant: true,
    isCoParentingChild: false,
    daysPerYearWithApplicant: 365,
    receivesKinderbijslag: true,
    hasIncome: false,
    annualIncome: 0,
    assets1Jan: 0,
    goesToChildcare: true,
    bsnKnown: true,
    childcareArrangements: [
      {
        id: "arr-1",
        childcareKind: "dagopvang" as const,
        providerType: "kindercentrum" as const,
        registeredLrk: true,
        lrkNumber: "123456789",
        monthlyHours: 122,
        hourlyRate: 10.5,
        hasContract: true,
        parentsPayContribution: true,
      },
    ],
    ...overrides,
  };
}

describe("kinderopvangtoeslag 2026", () => {
  it("calculates an eligible daycare arrangement below the rate cap", () => {
    const household = createBaseHousehold();
    household.applicant.annualIncome = 60000;
    household.children = [childcareChild()];

    const result = calculateKinderopvangtoeslag(household);

    expect(result.eligible).toBe(true);
    expect(result.estimatedMonthlyAmount).toBeGreaterThan(0);
  });

  it("caps daycare hourly rate at 11.23", () => {
    const household = createBaseHousehold();
    household.applicant.annualIncome = 60000;
    household.children = [
      childcareChild({
        childcareArrangements: [
          {
            id: "arr-1",
            childcareKind: "dagopvang",
            providerType: "kindercentrum",
            registeredLrk: true,
            lrkNumber: "123456789",
            monthlyHours: 100,
            hourlyRate: 12,
            hasContract: true,
            parentsPayContribution: true,
          },
        ],
      }),
    ];

    const result = calculateKinderopvangtoeslag(household);

    expect(result.eligible).toBe(true);
    expect(result.estimatedMonthlyAmount).toBe(1054);
  });

  it("caps BSO at 9.98", () => {
    const household = createBaseHousehold();
    household.applicant.annualIncome = 60000;
    household.children = [
      childcareChild({
        childcareArrangements: [
          {
            id: "arr-1",
            childcareKind: "buitenschoolseOpvang",
            providerType: "kindercentrum",
            registeredLrk: true,
            lrkNumber: "123456789",
            monthlyHours: 100,
            hourlyRate: 10.5,
            hasContract: true,
            parentsPayContribution: true,
          },
        ],
      }),
    ];

    const result = calculateKinderopvangtoeslag(household);

    expect(result.eligible).toBe(true);
    expect(result.estimatedMonthlyAmount).toBe(937);
  });

  it("caps gastouderopvang at 8.49", () => {
    const household = createBaseHousehold();
    household.applicant.annualIncome = 60000;
    household.children = [
      childcareChild({
        childcareArrangements: [
          {
            id: "arr-1",
            childcareKind: "dagopvang",
            providerType: "gastouder",
            registeredLrk: true,
            lrkNumber: "123456789",
            monthlyHours: 100,
            hourlyRate: 10,
            hasContract: true,
            parentsPayContribution: true,
          },
        ],
      }),
    ];

    const result = calculateKinderopvangtoeslag(household);

    expect(result.eligible).toBe(true);
    expect(result.estimatedMonthlyAmount).toBe(797);
  });

  it("caps childcare hours at 230 per child per month", () => {
    const household = createBaseHousehold();
    household.applicant.annualIncome = 60000;
    household.children = [
      childcareChild({
        childcareArrangements: [
          {
            id: "arr-1",
            childcareKind: "dagopvang",
            providerType: "kindercentrum",
            registeredLrk: true,
            lrkNumber: "123456789",
            monthlyHours: 240,
            hourlyRate: 10,
            hasContract: true,
            parentsPayContribution: true,
          },
        ],
      }),
    ];

    const result = calculateKinderopvangtoeslag(household);

    expect(result.eligible).toBe(true);
    expect(result.estimatedMonthlyAmount).toBe(2159);
  });

  it("blocks when the partner has no valid activity", () => {
    const household = createBaseHousehold();
    household.partner = {
      id: "partner",
      birthDate: "1994-03-01",
      countryOfResidence: "NL",
      nlResident: true,
      bsnKnown: true,
      annualIncome: 10000,
      assets1Jan: 1000,
      hasDutchHealthInsurance: true,
      activityStatus: ["unemployed"],
      sameAddress: true,
      isToeslagPartner: true,
    };
    household.children = [childcareChild()];

    const result = calculateKinderopvangtoeslag(household);

    expect(result.eligible).toBe(false);
    expect(result.blockingReasons).toContain("KOT_NO_VALID_ACTIVITY_PARTNER");
  });

  it("blocks when LRK data is missing", () => {
    const household = createBaseHousehold();
    household.children = [
      childcareChild({
        childcareArrangements: [
          {
            id: "arr-1",
            childcareKind: "dagopvang",
            providerType: "kindercentrum",
            registeredLrk: false,
            monthlyHours: 100,
            hourlyRate: 10,
            hasContract: true,
            parentsPayContribution: true,
          },
        ],
      }),
    ];

    const result = calculateKinderopvangtoeslag(household);

    expect(result.eligible).toBe(false);
    expect(result.blockingReasons).toContain("KOT_NOT_REGISTERED_LRK");
  });

  it("picks the first child by the most eligible hours", () => {
    const household = createBaseHousehold();
    household.applicant.annualIncome = 60000;
    household.children = [
      childcareChild({ id: "child-1" }),
      childcareChild({
        id: "child-2",
        childcareArrangements: [
          {
            id: "arr-2",
            childcareKind: "dagopvang",
            providerType: "kindercentrum",
            registeredLrk: true,
            lrkNumber: "223456789",
            monthlyHours: 160,
            hourlyRate: 10.5,
            hasContract: true,
            parentsPayContribution: true,
          },
        ],
      }),
    ];

    const result = calculateKinderopvangtoeslag(household);

    expect(result.calculationSteps.find((step) => step.code === "firstChildId")?.value).toBe("child-2");
  });

  it("breaks ties by highest eligible cost", () => {
    const household = createBaseHousehold();
    household.applicant.annualIncome = 60000;
    household.children = [
      childcareChild({
        id: "child-1",
        childcareArrangements: [
          {
            id: "arr-1",
            childcareKind: "dagopvang",
            providerType: "kindercentrum",
            registeredLrk: true,
            lrkNumber: "123456789",
            monthlyHours: 120,
            hourlyRate: 11.23,
            hasContract: true,
            parentsPayContribution: true,
          },
        ],
      }),
      childcareChild({
        id: "child-2",
        childcareArrangements: [
          {
            id: "arr-2",
            childcareKind: "dagopvang",
            providerType: "kindercentrum",
            registeredLrk: true,
            lrkNumber: "223456789",
            monthlyHours: 120,
            hourlyRate: 10.5,
            hasContract: true,
            parentsPayContribution: true,
          },
        ],
      }),
    ];

    const result = calculateKinderopvangtoeslag(household);

    expect(result.calculationSteps.find((step) => step.code === "firstChildId")?.value).toBe("child-1");
  });

  it("blocks tussenschoolse opvang", () => {
    const household = createBaseHousehold();
    household.children = [
      childcareChild({
        childcareArrangements: [
          {
            id: "arr-1",
            childcareKind: "tussenschoolseOpvang",
            providerType: "kindercentrum",
            registeredLrk: true,
            lrkNumber: "123456789",
            monthlyHours: 100,
            hourlyRate: 10,
            hasContract: true,
            parentsPayContribution: true,
          },
        ],
      }),
    ];

    const result = calculateKinderopvangtoeslag(household);

    expect(result.eligible).toBe(false);
    expect(result.blockingReasons).toContain("KOT_TUSSENSCHOOLSE_OPVANG_NOT_ELIGIBLE");
  });
});
