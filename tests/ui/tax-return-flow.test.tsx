/// <reference types="vitest/globals" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import enMessages from "../../messages/en.json";

import { TaxReturnFlow } from "@/components/fintax/flows/TaxReturnFlow";

const loadWizardSnapshotMock = vi.fn();
const persistWizardSnapshotMock = vi.fn();
const readWizardSnapshotMock = vi.fn();
const hasLocalWizardProgressMock = vi.fn();

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
  hasLocalWizardProgress: (...args: unknown[]) => hasLocalWizardProgressMock(...args),
}));

describe("TaxReturnFlow", () => {
  beforeEach(() => {
    loadWizardSnapshotMock.mockImplementation((_: string, fallback: unknown) => fallback);
    persistWizardSnapshotMock.mockResolvedValue(undefined);
    readWizardSnapshotMock.mockReturnValue(null);
    hasLocalWizardProgressMock.mockReturnValue(false);
    vi.stubGlobal(
      "fetch",
      vi.fn(async () =>
        new Response(JSON.stringify({ caseId: "case-tax-1" }), {
          status: 200,
          headers: { "content-type": "application/json" },
        }),
      ),
    );
  });

  it("renders the rebuilt wizard shell", () => {
    render(<TaxReturnFlow />);

    expect(screen.getByRole("heading", { name: /build your dutch tax return with a structured intake/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /tax return case intake/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /identity and filing context/i })).toBeInTheDocument();
  });

  it("updates progress and supports next and back navigation", async () => {
    render(<TaxReturnFlow />);

    fillIdentityStep();
    fireEvent.click(getContinueButton());

    await waitFor(() => expect(screen.getByRole("heading", { name: /income picture/i })).toBeInTheDocument());
    expect(screen.getByText("2 / 7")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /back/i }));

    await waitFor(() => expect(screen.getByRole("heading", { name: /identity and filing context/i })).toBeInTheDocument());
  }, 15000);

  it("creates a draft case after the identity step", async () => {
    const fetchMock = vi.mocked(fetch);

    render(<TaxReturnFlow />);

    fillIdentityStep();
    fireEvent.click(getContinueButton());

    await waitFor(() => expect(fetchMock).toHaveBeenCalledWith(
      "/api/cases/draft",
      expect.objectContaining({
        method: "POST",
        body: expect.stringContaining("caseType"),
      }),
    ));
  });

  it("persists the current step in the draft payload", async () => {
    render(<TaxReturnFlow />);

    persistWizardSnapshotMock.mockClear();
    fillIdentityStep();
    fireEvent.click(getContinueButton());

    await waitFor(() =>
      expect(persistWizardSnapshotMock).toHaveBeenCalledWith(
        expect.objectContaining({
          storageKey: "fintax-tax-tax_return_p",
          payload: expect.objectContaining({
            currentStep: 1,
            draftStatus: "in_progress",
          }),
        }),
      ),
    );
  });

  it("shows the structured summary with a visible estimate range", async () => {
    render(<TaxReturnFlow />);

    await moveToSummary();

    expect(screen.getByRole("heading", { name: /structured summary/i })).toBeInTheDocument();
    expect(screen.getByText(/preliminary range/i)).toBeInTheDocument();
    expect(screen.getByText(/eur 450 - eur 2,000/i)).toBeInTheDocument();
  }, 15000);

  it("shows an honest pending estimate state when withholding is missing", async () => {
    render(<TaxReturnFlow />);

    fillIdentityStep();
    fireEvent.click(getContinueButton());
    await waitFor(() => expect(screen.getByRole("heading", { name: /income picture/i })).toBeInTheDocument());

    fillIncomeStep({ wageTaxWithheld: "0" });
    fireEvent.click(getContinueButton());
    await waitFor(() => expect(screen.getByRole("heading", { name: /housing and household context/i })).toBeInTheDocument());
    fillHousingStep();
    fireEvent.click(getContinueButton());
    await waitFor(() => expect(screen.getByRole("heading", { name: /assets intake/i })).toBeInTheDocument());
    fireEvent.click(getContinueButton());
    await waitFor(() => expect(screen.getByRole("heading", { name: /deductions and additional details/i })).toBeInTheDocument());
    fireEvent.click(getContinueButton());

    await waitFor(() => expect(screen.getByRole("heading", { name: /structured summary/i })).toBeInTheDocument());
    expect(screen.getByText(/estimate pending review/i)).toBeInTheDocument();
    expect(screen.getByText(/known wage tax withheld figure/i)).toBeInTheDocument();
  }, 15000);

  it("restores the saved step from the snapshot metadata", async () => {
    loadWizardSnapshotMock.mockReturnValue({
      service: "tax_return_p",
      identity: { fullName: "Saved Client", bsn: "" },
      filing: { taxYear: 2025, residency: "resident", filingStatus: "single", hasFiscalPartner: false, partnerName: "" },
      income: { incomeProfile: "employment", employerName: "Saved BV", monthsWorkedInNl: 12, employmentIncome: 42000, selfEmploymentIncome: 0, otherIncome: 0, wageTaxWithheld: 3600 },
      housing: { homeSituation: "tenant", address: "Saved Straat 1", city: "Amsterdam", postalCode: "1000AA", monthlyHousingCost: 950, householdSize: 1 },
      assets: { hasBox3Exposure: false, taxpayerAssets: 0, partnerAssets: 0, hasForeignAssets: false, notes: "" },
      deductions: { healthcareCosts: 0, educationCosts: 0, donationCosts: 0, otherContext: "" },
      submission: { wantsReviewCall: false, preferredContact: "portal", readyToContinue: true },
    });
    readWizardSnapshotMock.mockReturnValue({
      progressStep: 5,
      caseId: "case-tax-1",
      updatedAt: "2099-01-01T00:00:00.000Z",
      payload: {},
    });

    render(<TaxReturnFlow />);

    await waitFor(() => expect(screen.getByRole("heading", { name: /structured summary/i })).toBeInTheDocument());
    expect(screen.getByText(/connected to a case draft/i)).toBeInTheDocument();
  });
});

function fillIdentityStep() {
  fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Alex Example" } });
  fireEvent.change(screen.getByLabelText(/bsn/i), { target: { value: "1234" } });
}

function fillIncomeStep(overrides?: { wageTaxWithheld?: string }) {
  fireEvent.click(screen.getByRole("button", { name: /employment income/i }));
  fireEvent.change(screen.getByLabelText(/main employer/i), { target: { value: "Example BV" } });
  fireEvent.change(screen.getByLabelText(/employment income/i), { target: { value: "42000" } });
  fireEvent.change(screen.getByLabelText(/wage tax withheld/i), { target: { value: overrides?.wageTaxWithheld ?? "3600" } });
}

function fillHousingStep() {
  fireEvent.change(screen.getByLabelText(/primary address/i), { target: { value: "Keizersgracht 1" } });
  fireEvent.change(screen.getByLabelText(/^city$/i), { target: { value: "Amsterdam" } });
  fireEvent.change(screen.getByLabelText(/postal code/i), { target: { value: "1015CJ" } });
}

async function moveToSummary() {
  fillIdentityStep();
  fireEvent.click(getContinueButton());
  await waitFor(() => expect(screen.getByRole("heading", { name: /income picture/i })).toBeInTheDocument());
  fillIncomeStep();
  fireEvent.click(getContinueButton());
  await waitFor(() => expect(screen.getByRole("heading", { name: /housing and household context/i })).toBeInTheDocument());
  fillHousingStep();
  fireEvent.click(getContinueButton());
  await waitFor(() => expect(screen.getByRole("heading", { name: /assets intake/i })).toBeInTheDocument());
  fireEvent.click(getContinueButton());
  await waitFor(() => expect(screen.getByRole("heading", { name: /deductions and additional details/i })).toBeInTheDocument());
  fireEvent.click(getContinueButton());
  await waitFor(() => expect(screen.getByRole("heading", { name: /structured summary/i })).toBeInTheDocument());
}

function getContinueButton() {
  const buttons = screen.getAllByRole("button", { name: /^continue$/i });
  return buttons[buttons.length - 1];
}
