import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";

import { BenefitsResults } from "@/components/fintax/flows/benefits/BenefitsResults";
import { evaluateToeslagen } from "@/lib/toeslagen";
import { toHouseholdSnapshot, benefitsDefaultValues } from "@/components/fintax/flows/benefits/wizard";
import { calculateEligibility } from "@/lib/utils/eligibility-calculator";

const messages = {
  Benefits: {
    results: {
      summary: { none: "none", one: "one", multiple: "multiple" },
      summaryBadge: "badge",
      disclaimer: "disclaimer",
      totalLabel: "total",
      totalCaption: "caption",
      eligibleCountLabel: "eligible",
      eligibleCountCaption: "eligible-caption",
      noneEligibleTitle: "none-title",
      noneEligibleCopy: "none-copy",
      honestyTitle: "honesty-title",
      honestyCopy: "honesty-copy",
      eligible: "eligible",
      notEligible: "not eligible",
      estimatedAnnualLabel: "annual",
      whyLabel: "why",
      nextStepLabel: "next-step",
      removeFromPlan: "remove",
      addToPlan: "add",
      reviewNotice: "review",
      cards: {
        zorgtoeslag: { title: "zorg", subtitle: "zorg-sub" },
        huurtoeslag: { title: "huur", subtitle: "huur-sub" },
        kindgebondenBudget: { title: "kgb", subtitle: "kgb-sub" },
        kinderopvangtoeslag: { title: "kot", subtitle: "kot-sub" },
      },
      reasonCodes: new Proxy({}, { get: (_, prop) => String(prop) }),
      nextSteps: new Proxy({}, { get: (_, prop) => String(prop) }),
    },
    bundle: {
      eyebrow: "bundle",
      title: "bundle-title",
      copy: "bundle-copy",
      selectedServicesLabel: "selected",
      empty: "empty",
      recommendedNextLabel: "recommended",
      recommendedNextSelected: "selected",
      recommendedNextNone: "none",
      annualImpactLabel: "impact",
      annualImpactCopy: "impact-copy",
      continue: "continue",
      askHelp: "help",
    },
  },
};

describe("legacy eligibility wrapper", () => {
  it("keeps calculateEligibility working with the old input shape", () => {
    const result = calculateEligibility({
      age: 29,
      householdType: "single",
      annualIncome: 32000,
      assets: 12000,
      nlResident: true,
      hasHealthInsurance: true,
      hasIndependentHome: true,
      hasRentalContract: true,
      monthlyRent: 950,
      childrenUnder18: 1,
      receivesKinderbijslag: true,
      usesChildcare: true,
      childcareHoursPerMonth: 122,
      childcareType: "daycare",
      childcareHourlyRate: 10.5,
      registeredChildcare: true,
      bothParentsWork: true,
    });

    expect(result.zorgtoeslag).toHaveProperty("eligible");
    expect(result.huurtoeslag).toHaveProperty("requiredDocuments");
    expect(result.totalEstimatedAnnualAmount).toBeGreaterThan(0);
  });

  it("does not crash BenefitsResults when fed the legacy wrapper output", () => {
    const result = evaluateToeslagen(toHouseholdSnapshot(benefitsDefaultValues));

    render(
      <NextIntlClientProvider locale="en" messages={messages}>
        <BenefitsResults
          results={result}
          selectedKeys={[]}
          onToggleSelected={() => undefined}
        />
      </NextIntlClientProvider>,
    );

    expect(screen.getByTestId("benefits-results-total")).toBeInTheDocument();
  });
});
