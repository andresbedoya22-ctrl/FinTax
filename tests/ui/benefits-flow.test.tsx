/// <reference types="vitest/globals" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import enMessages from "../../messages/en.json";

import { BenefitsFlow } from "@/components/fintax/flows/BenefitsFlow";

const loadWizardSnapshotMock = vi.fn();
const persistWizardSnapshotMock = vi.fn();
const readWizardSnapshotMock = vi.fn();

vi.mock("next-intl", () => ({
  useTranslations: (namespace: string) => {
    const source = (enMessages as Record<string, unknown>)[namespace] as Record<string, unknown>;

    const translate = (key: string, values?: Record<string, string | number>) => {
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
    };

    translate.raw = (key: string) =>
      key.split(".").reduce<unknown>((acc, segment) => {
        if (!acc || typeof acc !== "object") return undefined;
        return (acc as Record<string, unknown>)[segment];
      }, source);

    return translate;
  },
}));

vi.mock("@/lib/wizards/persistence", () => ({
  loadWizardSnapshot: (...args: unknown[]) => loadWizardSnapshotMock(...args),
  persistWizardSnapshot: (...args: unknown[]) => persistWizardSnapshotMock(...args),
  readWizardSnapshot: (...args: unknown[]) => readWizardSnapshotMock(...args),
}));

describe("BenefitsFlow", () => {
  beforeEach(() => {
    loadWizardSnapshotMock.mockImplementation((_: string, fallback: unknown) => fallback);
    persistWizardSnapshotMock.mockResolvedValue(undefined);
    readWizardSnapshotMock.mockReturnValue(null);
  });

  it("renders the redesigned wizard shell", () => {
    render(<BenefitsFlow />);

    expect(screen.getByRole("heading", { name: /see which dutch benefits may actually fit your case/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /benefits eligibility wizard/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /personal context/i })).toBeInTheDocument();
  });

  it("updates step progress and supports next and back navigation", async () => {
    render(<BenefitsFlow />);

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => expect(screen.getByText(/income picture/i)).toBeInTheDocument());
    expect(screen.getByText("2 / 7")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /back/i }));

    await waitFor(() => expect(screen.getByText(/residency check/i)).toBeInTheDocument());
  });

  it("simplifies conditional sections for no rent, no insurance and no children", async () => {
    render(<BenefitsFlow />);

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() => expect(screen.getByText(/rental situation/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /independent home/i }));
    expect(screen.queryByLabelText(/monthly rent/i)).not.toBeInTheDocument();
    expect(screen.getByText(/housing questions simplified/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    await waitFor(() => expect(screen.getByText(/health coverage/i)).toBeInTheDocument());

    fireEvent.click(screen.getByRole("button", { name: /dutch health insurance/i }));
    expect(screen.getByText(/zorgtoeslag remains unlikely/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    await waitFor(() => expect(screen.getByText(/children and childcare/i)).toBeInTheDocument());

    expect(screen.getByText(/children section simplified/i)).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /receiving kinderbijslag/i })).not.toBeInTheDocument();
  });

  it("shows the final eligibility cards, total and summary message", async () => {
    render(<BenefitsFlow />);

    for (let index = 0; index < 6; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: /continue/i }));
    }

    await waitFor(() => expect(screen.getByTestId("benefits-results-total")).toBeInTheDocument());

    expect(screen.getByText(/several benefits look potentially relevant/i)).toBeInTheDocument();
    expect(screen.getByTestId("benefit-card-zorgtoeslag")).toBeInTheDocument();
    expect(screen.getByTestId("benefit-card-huurtoeslag")).toBeInTheDocument();
    expect(screen.getByTestId("benefit-card-kindgebondenBudget")).toBeInTheDocument();
    expect(screen.getByTestId("benefit-card-kinderopvangtoeslag")).toBeInTheDocument();
  });

  it("loads a saved snapshot and persists the current step after advancing", async () => {
    loadWizardSnapshotMock.mockReturnValue({
      age: 41,
      householdType: "partners",
      annualIncome: 52000,
      assets: 9000,
      nlResident: true,
      hasHealthInsurance: true,
      hasIndependentHome: true,
      hasRentalContract: true,
      monthlyRent: 1200,
      childrenUnder18: 1,
      receivesKinderbijslag: true,
      usesChildcare: false,
      childcareHoursPerMonth: 0,
      childcareType: "daycare",
      childcareHourlyRate: 0,
      registeredChildcare: false,
      bothParentsWork: false,
    });
    readWizardSnapshotMock.mockReturnValue({
      progressStep: 0,
      payload: {
        selectedBenefits: ["zorgtoeslag"],
      },
    });

    render(<BenefitsFlow />);

    expect(loadWizardSnapshotMock).toHaveBeenCalledWith("fintax-benefits-wizard", expect.any(Object));
    expect(readWizardSnapshotMock).toHaveBeenCalledWith("fintax-benefits-wizard");

    persistWizardSnapshotMock.mockClear();

    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() =>
      expect(persistWizardSnapshotMock).toHaveBeenCalledWith(
        expect.objectContaining({
          storageKey: "fintax-benefits-wizard",
          payload: expect.objectContaining({
            currentStep: 1,
          }),
        }),
      ),
    );
  });
});
