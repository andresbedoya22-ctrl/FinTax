/// <reference types="vitest/globals" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import enMessages from "../../messages/en.json";

import { BenefitsFlow } from "@/components/fintax/flows/BenefitsFlow";

const loadWizardSnapshotMock = vi.fn();
const persistWizardSnapshotMock = vi.fn();
const readWizardSnapshotMock = vi.fn();
const pushMock = vi.fn();
const apiGetMock = vi.fn();
const apiPatchMock = vi.fn();
const apiPostMock = vi.fn();

vi.mock("next-intl", () => ({
  useLocale: () => "en",
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

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock("@/lib/wizards/persistence", () => ({
  loadWizardSnapshot: (...args: unknown[]) => loadWizardSnapshotMock(...args),
  persistWizardSnapshot: (...args: unknown[]) => persistWizardSnapshotMock(...args),
  readWizardSnapshot: (...args: unknown[]) => readWizardSnapshotMock(...args),
}));

vi.mock("@/hooks/api-client", () => ({
  apiGet: (...args: unknown[]) => apiGetMock(...args),
  apiPatch: (...args: unknown[]) => apiPatchMock(...args),
  apiPost: (...args: unknown[]) => apiPostMock(...args),
  isApiClientError: (error: unknown) =>
    Boolean(error && typeof error === "object" && "code" in error && "status" in error),
}));

describe("BenefitsFlow", () => {
  beforeEach(() => {
    loadWizardSnapshotMock.mockImplementation((_: string, fallback: unknown) => fallback);
    persistWizardSnapshotMock.mockResolvedValue(undefined);
    readWizardSnapshotMock.mockReturnValue(null);
    pushMock.mockReset();
    apiGetMock.mockRejectedValue({ code: "not_found", status: 404, message: "benefits_draft_not_found" });
    apiPatchMock.mockResolvedValue({
      id: "case-benefit-1",
      user_id: "user-1",
      case_type: "zorgtoeslag",
      status: "draft",
      display_name: "Benefits draft - zorgtoeslag",
      tax_year: null,
      deadline: null,
      estimated_refund: null,
      actual_refund: null,
      paid_at: null,
      wizard_data: {},
      wizard_completed: true,
      machtigung_status: "not_started",
      machtigung_code: null,
      stripe_payment_id: null,
      created_at: "2099-01-01T00:00:00.000Z",
      updated_at: "2099-01-01T00:00:00.000Z",
    });
    apiPostMock.mockResolvedValue({
      id: "case-benefit-1",
      user_id: "user-1",
      case_type: "zorgtoeslag",
      status: "draft",
      display_name: "Benefits draft - zorgtoeslag",
      tax_year: null,
      deadline: null,
      estimated_refund: null,
      actual_refund: null,
      paid_at: null,
      wizard_data: {},
      wizard_completed: true,
      machtigung_status: "not_started",
      machtigung_code: null,
      stripe_payment_id: null,
      created_at: "2099-01-01T00:00:00.000Z",
      updated_at: "2099-01-01T00:00:00.000Z",
    });
  });

  it("moves from results into the document review step", async () => {
    seedResultsSnapshot();
    render(<BenefitsFlow />);

    await waitFor(() => expect(screen.getByTestId("benefits-results-total")).toBeInTheDocument());
    fireEvent.click(getContinueButton());

    await waitFor(() => expect(screen.getByRole("heading", { name: /review the evidence before this moves into the workspace/i })).toBeInTheDocument());
  });

  it("keeps the selected benefits visible in document review", async () => {
    seedResultsSnapshot();
    render(<BenefitsFlow />);

    await waitFor(() => expect(screen.getByTestId("benefits-results-total")).toBeInTheDocument());
    fireEvent.click(getContinueButton());

    await waitFor(() => expect(screen.getByText(/recommended supporting documents/i)).toBeInTheDocument());
    expect(screen.getAllByText("Zorgtoeslag").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Huurtoeslag").length).toBeGreaterThan(0);
  });

  it("derives the expected document suggestions for the selected benefits", async () => {
    loadWizardSnapshotMock.mockReturnValue({
      age: 36,
      householdType: "partners",
      applicantAnnualIncome: 32000,
      partnerAnnualIncome: 24000,
      applicantAssets: 5000,
      partnerAssets: 4000,
      nlResident: true,
      hasHealthInsurance: true,
      hasIndependentHome: true,
      hasRentalContract: true,
      monthlyRent: 1100,
      childrenUnder18: 2,
      receivesKinderbijslag: true,
      usesChildcare: true,
      childcareHoursPerMonth: 48,
      childcareType: "daycare",
      childcareHourlyRate: 10.5,
      registeredChildcare: true,
      bothParentsWork: true,
    });
    readWizardSnapshotMock.mockReturnValue({
      progressStep: 7,
      payload: {
        selectedBenefits: ["zorgtoeslag", "huurtoeslag", "kindgebondenBudget", "kinderopvangtoeslag"],
      },
    });

    render(<BenefitsFlow />);

    await waitFor(() => expect(screen.getByRole("heading", { name: /review the evidence before this moves into the workspace/i })).toBeInTheDocument());

    expect(screen.getByText(/health insurance evidence/i)).toBeInTheDocument();
    expect(screen.getAllByText(/income evidence/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/rental contract/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/rent evidence/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/address registration/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/child and household evidence/i)).toBeInTheDocument();
    expect(screen.getAllByText(/childcare invoices/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/provider registration/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/work-status evidence/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/partner households should include partner income evidence/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/for partner households with childcare support, work-status evidence may be needed for both adults/i)).toBeInTheDocument();
  });

  it("creates the benefits draft and routes into the case workspace", async () => {
    loadWizardSnapshotMock.mockReturnValue({
      age: 36,
      householdType: "single",
      applicantAnnualIncome: 32000,
      partnerAnnualIncome: null,
      applicantAssets: 5000,
      partnerAssets: null,
      nlResident: true,
      hasHealthInsurance: true,
      hasIndependentHome: true,
      hasRentalContract: true,
      monthlyRent: 1100,
      childrenUnder18: 0,
      receivesKinderbijslag: false,
      usesChildcare: false,
      childcareHoursPerMonth: 0,
      childcareType: "daycare",
      childcareHourlyRate: 0,
      registeredChildcare: false,
      bothParentsWork: false,
    });
    readWizardSnapshotMock.mockReturnValue({
      progressStep: 7,
      payload: {
        selectedBenefits: ["zorgtoeslag", "huurtoeslag"],
      },
    });
    render(<BenefitsFlow />);

    await waitFor(() => expect(screen.getByRole("heading", { name: /review the evidence before this moves into the workspace/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole("button", { name: /continue to case workspace/i }));

    await waitFor(() => expect(apiPostMock.mock.calls.length + apiPatchMock.mock.calls.length).toBeGreaterThan(0));
    const upsertCall = apiPostMock.mock.calls.at(0) ?? apiPatchMock.mock.calls.at(0);
    expect(upsertCall).toBeDefined();
    expect(upsertCall?.[0]).toBe("/api/cases/benefits-draft");
    expect(upsertCall?.[1]).toEqual(
      expect.objectContaining({
        payload: expect.objectContaining({
          selectedBenefits: ["zorgtoeslag", "huurtoeslag"],
        }),
      }),
    );
    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/en/benefits/case-benefit-1"));
  });
});

function getContinueButton() {
  const buttons = screen.getAllByRole("button", { name: /^continue$/i });
  return buttons[buttons.length - 1];
}

function seedResultsSnapshot() {
  loadWizardSnapshotMock.mockReturnValue({
    age: 36,
    householdType: "single",
    applicantAnnualIncome: 32000,
    partnerAnnualIncome: null,
    applicantAssets: 5000,
    partnerAssets: null,
    nlResident: true,
    hasHealthInsurance: true,
    hasIndependentHome: true,
    hasRentalContract: true,
    monthlyRent: 1100,
    childrenUnder18: 0,
    receivesKinderbijslag: false,
    usesChildcare: false,
    childcareHoursPerMonth: 0,
    childcareType: "daycare",
    childcareHourlyRate: 0,
    registeredChildcare: false,
    bothParentsWork: false,
  });
  readWizardSnapshotMock.mockReturnValue({
    progressStep: 6,
    payload: {
      selectedBenefits: ["zorgtoeslag", "huurtoeslag"],
    },
  });
}
