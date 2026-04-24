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

  it("renders the new canonical wizard shell", () => {
    render(<BenefitsFlow />);

    expect(screen.getByRole("heading", { name: /benefits \/ toeslagen 2026 check/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /benefits eligibility wizard/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /select benefits/i })).toBeInTheDocument();
  });

  it("navigates through the new step sequence", async () => {
    render(<BenefitsFlow />);

    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => expect(screen.getByRole("heading", { name: /applicant details/i })).toBeInTheDocument());
    expect(screen.getByText(/step 2 of 12/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /back/i }));
    await waitFor(() => expect(screen.getByRole("heading", { name: /select benefits/i })).toBeInTheDocument());
  });

  it("supports dynamic child and childcare arrangement editors", async () => {
    render(<BenefitsFlow />);

    for (let index = 0; index < 5; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: /next/i }));
    }

    await waitFor(() => expect(screen.getByRole("button", { name: /add child/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /add child/i }));
    expect(screen.getByText(/child 1/i)).toBeInTheDocument();

    fireEvent.click(screen.getByLabelText(/child goes to childcare/i));
    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    await waitFor(() => expect(screen.getByRole("button", { name: /add arrangement/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /add arrangement/i }));
    expect(screen.getByText(/arrangement 1/i)).toBeInTheDocument();
  });

  it("renders results with calculation cards after progressing to the end", async () => {
    render(<BenefitsFlow />);

    for (let index = 0; index < 11; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: /next/i }));
    }

    await waitFor(() => expect(screen.getByTestId("benefits-results-total")).toBeInTheDocument());
    expect(screen.getByTestId("benefit-card-zorgtoeslag")).toBeInTheDocument();
    expect(screen.getByTestId("benefit-card-huurtoeslag")).toBeInTheDocument();
  });

  it("loads a legacy saved snapshot and persists the next step", async () => {
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

    render(<BenefitsFlow />);

    fireEvent.click(screen.getByRole("button", { name: /next/i }));

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
