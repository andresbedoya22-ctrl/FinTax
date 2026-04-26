/// <reference types="vitest/globals" />

import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, vi } from "vitest";

import enMessages from "../../messages/en.json";

import { BenefitsFlow } from "@/components/fintax/flows";
import { BenefitsResults } from "@/components/fintax/flows/benefits";
import { evaluateToeslagen } from "@/lib/toeslagen";

import { createBaseHousehold } from "../toeslagen/helpers";

beforeEach(() => {
  window.localStorage.clear();
});

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    const source = namespace.split(".").reduce<unknown>((acc, segment) => {
      if (!acc || typeof acc !== "object") return undefined;
      return (acc as Record<string, unknown>)[segment];
    }, enMessages as Record<string, unknown>) as Record<string, unknown>;

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

    translate.raw = (key: string) =>
      key.split(".").reduce<unknown>((acc, segment) => {
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

  it("prePayment checkout CTA can be triggered", async () => {
    const results = buildEvaluation();
    const onContinueToCheckout = vi.fn();
    const user = userEvent.setup();

    render(
      <BenefitsResults
        mode="prePayment"
        results={results}
        selectedKeys={["zorgtoeslag"]}
        onToggleSelected={() => undefined}
        onContinueToCheckout={onContinueToCheckout}
      />,
    );

    await user.click(screen.getByRole("button", { name: /continue and let fintax prepare my application/i }));
    expect(onContinueToCheckout).toHaveBeenCalledTimes(1);
  });
});

describe("Benefits wizard option selection", () => {
  function renderBenefitsFlow() {
    const user = userEvent.setup();
    render(<BenefitsFlow />);

    return {
      user,
      nextButton: screen.getByTestId("benefits-next-button"),
      healthCard: screen.getByTestId("benefit-option-zorgtoeslag"),
      rentCard: screen.getByTestId("benefit-option-huurtoeslag"),
      familyCard: screen.getByTestId("benefit-option-kindgebondenBudget"),
      debugSelected: () => screen.getByTestId("benefits-debug-selected"),
    };
  }

  it("starts with no selected benefits and a disabled continue button", () => {
    const { nextButton, healthCard, rentCard, familyCard, debugSelected } = renderBenefitsFlow();

    expect(healthCard).toHaveAttribute("data-state", "unselected");
    expect(rentCard).toHaveAttribute("data-state", "unselected");
    expect(familyCard).toHaveAttribute("data-state", "unselected");
    expect(debugSelected()).toHaveTextContent("[]");
    expect(nextButton).toBeDisabled();
    expect(screen.getByTestId("benefits-selection-help")).toHaveTextContent(/select at least one benefit to continue/i);
  });

  it("clicking a benefit selects it, updates debug state, and enables continue", async () => {
    const { user, nextButton, healthCard, debugSelected } = renderBenefitsFlow();

    await user.click(healthCard);

    expect(healthCard).toHaveAttribute("data-state", "selected");
    expect(debugSelected()).toHaveTextContent('"zorgtoeslag"');
    expect(nextButton).toBeEnabled();
  });

  it("clicking the same benefit again deselects it without crashing and disables continue", async () => {
    const { user, nextButton, healthCard, debugSelected } = renderBenefitsFlow();

    await user.click(healthCard);
    await user.click(healthCard);

    expect(healthCard).toHaveAttribute("data-state", "unselected");
    expect(debugSelected()).toHaveTextContent("[]");
    expect(nextButton).toBeDisabled();
    expect(screen.getAllByRole("heading", { name: /select benefits/i }).length).toBeGreaterThan(0);
  });

  it("stores multiple selected benefit keys", async () => {
    const { user, nextButton, healthCard, rentCard, debugSelected } = renderBenefitsFlow();

    await user.click(healthCard);
    await user.click(rentCard);

    expect(healthCard).toHaveAttribute("data-state", "selected");
    expect(rentCard).toHaveAttribute("data-state", "selected");
    expect(debugSelected()).toHaveTextContent('"zorgtoeslag"');
    expect(debugSelected()).toHaveTextContent('"huurtoeslag"');
    expect(nextButton).toBeEnabled();
  });

  it("supports native keyboard toggling with enter and space", async () => {
    const { user, healthCard, rentCard, debugSelected } = renderBenefitsFlow();

    healthCard.focus();
    await user.keyboard("{Enter}");
    expect(healthCard).toHaveAttribute("data-state", "selected");
    expect(debugSelected()).toHaveTextContent('"zorgtoeslag"');

    rentCard.focus();
    await user.keyboard(" ");
    expect(rentCard).toHaveAttribute("data-state", "selected");
    expect(debugSelected()).toHaveTextContent('"huurtoeslag"');
  });

  it("preserves selected benefits after navigating next and back", async () => {
    const { user, nextButton, healthCard } = renderBenefitsFlow();

    await user.click(healthCard);
    await user.click(nextButton);

    expect((await screen.findAllByRole("heading", { name: /applicant details/i })).length).toBeGreaterThan(0);

    await user.click(screen.getByTestId("benefits-back-button"));

    expect((await screen.findAllByRole("heading", { name: /select benefits/i })).length).toBeGreaterThan(0);
    expect(screen.getByTestId("benefit-option-zorgtoeslag")).toHaveAttribute("data-state", "selected");
  });

  it("uses compact progress and hides the full step list by default", async () => {
    const { user } = renderBenefitsFlow();

    expect(screen.getByTestId("benefits-compact-progress")).toBeInTheDocument();
    expect(screen.getAllByText(/Step 1 of 12/i).length).toBeGreaterThan(0);
    expect(screen.queryByTestId("benefits-progress-disclosure")).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /view all steps/i }));
    expect(screen.getByTestId("benefits-progress-disclosure")).toBeInTheDocument();
  });
});
