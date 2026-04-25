/// <reference types="vitest/globals" />

import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import enMessages from "../../messages/en.json";

import { BenefitsFlow } from "@/components/fintax/flows";
import { BenefitsResults } from "@/components/fintax/flows/benefits";
import { evaluateToeslagen } from "@/lib/toeslagen";

import { createBaseHousehold } from "../toeslagen/helpers";

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    const source = (enMessages as Record<string, unknown>)[namespace] as Record<string, unknown>;

    const translate = ((key: string, values?: Record<string, string | number>) => {
      const rawValue = key.split(".").reduce<unknown>((acc, segment) => {
        if (!acc || typeof acc !== "object") return undefined;
        return (acc as Record<string, unknown>)[segment];
      }, source);

      const text = typeof rawValue === "string" ? rawValue : key;
      if (!values) return text;

      return Object.entries(values).reduce(
        (result, [token, value]) => result.replaceAll(`{${token}}`, String(value)),
        text,
      );
    }) as ((key: string, values?: Record<string, string | number>) => string) & { raw: (key: string) => unknown };

    translate.raw = (key: string) => key.split(".").reduce<unknown>((acc, segment) => {
      if (!acc || typeof acc !== "object") return undefined;
      return (acc as Record<string, unknown>)[segment];
    }, source);

    return translate;
  },
  useLocale: () => "en",
}));

vi.mock("@/hooks/useTaxReturnDocFlow", () => ({
  useCaseRequirements: () => ({ data: { requirements: [], progress: { completed: 0, total: 0 } } }),
  useCaseProgress: () => ({ data: null }),
}));

vi.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => null,
}));

describe("Benefits results modes", () => {
  function buildEvaluation() {
    const household = createBaseHousehold();
    household.selectedBenefits = ["zorgtoeslag", "huurtoeslag"];
    return evaluateToeslagen(household);
  }

  it("prePayment hides exact totals and shows a range", () => {
    const results = buildEvaluation();

    render(
      <BenefitsResults
        mode="prePayment"
        results={results}
        selectedKeys={["zorgtoeslag", "huurtoeslag"]}
        onToggleSelected={() => undefined}
        onContinueToCheckout={() => undefined}
      />,
    );

    expect(screen.getByText(/preliminary result for your benefits/i)).toBeInTheDocument();
    expect(screen.getByText(/between/i)).toBeInTheDocument();
    expect(screen.queryByText(new RegExp(results.totalEstimatedAnnualAmount.toFixed(2), "i"))).not.toBeInTheDocument();
    expect(screen.queryByText(/calculation trace/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/documents checklist/i)).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue and let fintax prepare my application/i })).toBeInTheDocument();
  });

  it("postPayment shows exact amount, calculation trace and documents", () => {
    const results = buildEvaluation();

    render(
      <BenefitsResults
        mode="postPayment"
        caseId="case-benefits-1"
        results={results}
        selectedKeys={["zorgtoeslag", "huurtoeslag"]}
        onToggleSelected={() => undefined}
      />,
    );

    expect(screen.getByText(/detailed calculation unlocked/i)).toBeInTheDocument();
    expect(screen.getAllByText(/€/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/calculation trace/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/documents checklist/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/upload the required documents/i).length).toBeGreaterThan(0);
  });

  it("prePayment checkout CTA can be triggered", () => {
    const results = buildEvaluation();
    const onContinueToCheckout = vi.fn();

    render(
      <BenefitsResults
        mode="prePayment"
        results={results}
        selectedKeys={["zorgtoeslag"]}
        onToggleSelected={() => undefined}
        onContinueToCheckout={onContinueToCheckout}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: /continue and let fintax prepare my application/i }));
    expect(onContinueToCheckout).toHaveBeenCalledTimes(1);
  });
});

describe("Benefits wizard premium shell", () => {
  it("renders the start step as premium option cards", () => {
    render(<BenefitsFlow />);

    expect(screen.getByTestId("benefits-wizard-shell")).toBeInTheDocument();
    expect(screen.getByTestId("benefits-step-card")).toBeInTheDocument();
    expect(screen.getAllByTestId("benefits-option-card").length).toBeGreaterThanOrEqual(4);
  });
});
