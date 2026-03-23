/// <reference types="vitest/globals" />

import {
  benefitsDefaultValues,
  benefitsWizardSchema,
  hydrateBenefitsValues,
  mapBenefitsValuesToEligibilityInput,
  normalizeBenefitsValues,
} from "@/components/fintax/flows/benefits";
import { calculateEligibility } from "@/lib/utils/eligibility-calculator";

describe("benefits wizard model", () => {
  it("accepts a single household without partner fields", () => {
    const result = benefitsWizardSchema.safeParse({
      ...benefitsDefaultValues,
      householdType: "single",
      partnerAnnualIncome: null,
      partnerAssets: null,
    });

    expect(result.success).toBe(true);
  });

  it("accepts a partner household when partner values are present", () => {
    const result = benefitsWizardSchema.safeParse({
      ...benefitsDefaultValues,
      householdType: "partners",
      partnerAnnualIncome: 24000,
      partnerAssets: 8000,
    });

    expect(result.success).toBe(true);
  });

  it("requires partner income when the household is marked as partners", () => {
    const result = benefitsWizardSchema.safeParse({
      ...benefitsDefaultValues,
      householdType: "partners",
      partnerAnnualIncome: null,
      partnerAssets: 8000,
    });

    expect(result.success).toBe(false);
    expect(result.error?.issues.some((issue) => issue.path.join(".") === "partnerAnnualIncome")).toBe(true);
  });

  it("cleans partner and conditional values when the household flow no longer needs them", () => {
    const normalized = normalizeBenefitsValues({
      ...benefitsDefaultValues,
      householdType: "single",
      partnerAnnualIncome: 24000,
      partnerAssets: 8000,
      hasIndependentHome: false,
      hasRentalContract: true,
      monthlyRent: 1200,
      childrenUnder18: 0,
      receivesKinderbijslag: true,
      usesChildcare: true,
      childcareHoursPerMonth: 36,
      childcareHourlyRate: 12,
      registeredChildcare: true,
      bothParentsWork: true,
    });

    expect(normalized.partnerAnnualIncome).toBeNull();
    expect(normalized.partnerAssets).toBeNull();
    expect(normalized.hasRentalContract).toBe(false);
    expect(normalized.monthlyRent).toBe(0);
    expect(normalized.usesChildcare).toBe(false);
    expect(normalized.childcareHoursPerMonth).toBe(0);
    expect(normalized.childcareHourlyRate).toBe(0);
    expect(normalized.registeredChildcare).toBe(false);
    expect(normalized.bothParentsWork).toBe(false);
  });

  it("maps legacy annualIncome and assets snapshots into the applicant fields", () => {
    const hydrated = hydrateBenefitsValues({
      householdType: "single",
      annualIncome: 41000,
      assets: 6000,
    });

    expect(hydrated.applicantAnnualIncome).toBe(41000);
    expect(hydrated.applicantAssets).toBe(6000);
    expect(hydrated.partnerAnnualIncome).toBeNull();
    expect(hydrated.partnerAssets).toBeNull();
  });

  it("uses household totals for partner eligibility decisions", () => {
    const eligibilityInput = mapBenefitsValuesToEligibilityInput({
      ...benefitsDefaultValues,
      householdType: "partners",
      applicantAnnualIncome: 30000,
      partnerAnnualIncome: 24000,
      applicantAssets: 22000,
      partnerAssets: 60000,
      childrenUnder18: 1,
      receivesKinderbijslag: true,
    });
    const result = calculateEligibility(eligibilityInput);

    expect(result.zorgtoeslag.eligible).toBe(false);
    expect(result.huurtoeslag.eligible).toBe(false);
    expect(result.zorgtoeslag.reasons).toEqual(expect.arrayContaining(["income_too_high"]));
    expect(result.huurtoeslag.reasons).toEqual(expect.arrayContaining(["assets_too_high"]));
  });
});
