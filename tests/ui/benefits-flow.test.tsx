/// <reference types="vitest/globals" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import enMessages from "../../messages/en.json";

import { BenefitsFlow } from "@/components/fintax/flows/BenefitsFlow";

const loadWizardSnapshotMock = vi.fn();
const persistWizardSnapshotMock = vi.fn();
const readWizardSnapshotMock = vi.fn();
const apiGetMock = vi.fn();
const apiPatchMock = vi.fn();
const apiPostMock = vi.fn();

vi.mock("next-intl", () => ({
  useLocale: () => "en-NL",
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
    push: vi.fn(),
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
    apiGetMock.mockRejectedValue({ code: "not_found", status: 404, message: "benefits_draft_not_found" });
    apiPatchMock.mockResolvedValue(createCase({}));
    apiPostMock.mockResolvedValue(createCase({}));
  });

  it("renders from local fallback when no server draft exists", async () => {
    render(<BenefitsFlow />);

    await waitFor(() => expect(apiGetMock).toHaveBeenCalledWith("/api/cases/benefits-draft"));
    expect(screen.getByRole("heading", { name: /benefits eligibility wizard/i })).toBeInTheDocument();
  });

  it("creates the backend draft after the personal step", async () => {
    render(<BenefitsFlow />);

    await waitFor(() => expect(apiGetMock).toHaveBeenCalled());
    fireEvent.click(screen.getByRole("button", { name: /continue/i }));

    await waitFor(() =>
      expect(apiPostMock).toHaveBeenCalledWith(
        "/api/cases/benefits-draft",
        expect.objectContaining({
          payload: expect.objectContaining({
            currentStep: 1,
            selectedBenefits: [],
          }),
        }),
      ),
    );
  });

  it("restores server draft data before local fallback data", async () => {
    loadWizardSnapshotMock.mockReturnValue({
      age: 30,
      householdType: "single",
      applicantAnnualIncome: 32000,
      partnerAnnualIncome: null,
      applicantAssets: 15000,
      partnerAssets: null,
      nlResident: true,
      hasHealthInsurance: true,
      hasIndependentHome: true,
      hasRentalContract: true,
      monthlyRent: 950,
      childrenUnder18: 0,
      receivesKinderbijslag: false,
      usesChildcare: false,
      childcareHoursPerMonth: 0,
      childcareType: "daycare",
      childcareHourlyRate: 10,
      registeredChildcare: false,
      bothParentsWork: false,
    });
    readWizardSnapshotMock.mockReturnValue({
      progressStep: 1,
      payload: {
        selectedBenefits: ["zorgtoeslag"],
      },
    });
    apiGetMock.mockResolvedValue(
      createCase({
        id: "case-server-1",
        updated_at: "2099-01-01T00:00:00.000Z",
        wizard_data: {
          flowKind: "benefits",
          currentStep: 6,
          selectedBenefits: ["huurtoeslag"],
          age: 44,
          householdType: "single",
          applicantAnnualIncome: 28000,
          partnerAnnualIncome: null,
          applicantAssets: 4000,
          partnerAssets: null,
          nlResident: true,
          hasHealthInsurance: true,
          hasIndependentHome: true,
          hasRentalContract: true,
          monthlyRent: 900,
          childrenUnder18: 0,
          receivesKinderbijslag: false,
          usesChildcare: false,
          childcareHoursPerMonth: 0,
          childcareType: "daycare",
          childcareHourlyRate: 0,
          registeredChildcare: false,
          bothParentsWork: false,
        },
      }),
    );

    render(<BenefitsFlow />);

    await waitFor(() => expect(screen.getByText(/case draft connected/i)).toBeInTheDocument());
    expect(screen.queryByText(/local draft is active until the first server-backed case is created/i)).not.toBeInTheDocument();
    expect(screen.getByTestId("benefits-results-total")).toBeInTheDocument();
    expect(screen.getAllByRole("button", { name: /remove from support plan/i }).length).toBeGreaterThan(0);
  });

  it("patches the backend draft after a server-backed reload", async () => {
    apiGetMock.mockResolvedValue(
      createCase({
        id: "case-server-2",
        wizard_data: {
          flowKind: "benefits",
          currentStep: 1,
          selectedBenefits: [],
          age: 30,
          householdType: "single",
          applicantAnnualIncome: 32000,
          partnerAnnualIncome: null,
          applicantAssets: 15000,
          partnerAssets: null,
          nlResident: true,
          hasHealthInsurance: true,
          hasIndependentHome: true,
          hasRentalContract: true,
          monthlyRent: 950,
          childrenUnder18: 0,
          receivesKinderbijslag: false,
          usesChildcare: false,
          childcareHoursPerMonth: 0,
          childcareType: "daycare",
          childcareHourlyRate: 10,
          registeredChildcare: false,
          bothParentsWork: false,
        },
      }),
    );

    render(<BenefitsFlow />);

    await waitFor(() => expect(screen.getByText(/case draft connected/i)).toBeInTheDocument());
    apiPatchMock.mockClear();

    fireEvent.change(screen.getByLabelText(/applicant annual income/i), { target: { value: "41000" } });

    await waitFor(() => expect(apiPatchMock).toHaveBeenCalled());
  });

  it("shows an honest sync failure when a local case cannot be reloaded from the backend", async () => {
    loadWizardSnapshotMock.mockReturnValue({
      age: 30,
      householdType: "single",
      applicantAnnualIncome: 32000,
      partnerAnnualIncome: null,
      applicantAssets: 15000,
      partnerAssets: null,
      nlResident: true,
      hasHealthInsurance: true,
      hasIndependentHome: true,
      hasRentalContract: true,
      monthlyRent: 950,
      childrenUnder18: 0,
      receivesKinderbijslag: false,
      usesChildcare: false,
      childcareHoursPerMonth: 0,
      childcareType: "daycare",
      childcareHourlyRate: 10,
      registeredChildcare: false,
      bothParentsWork: false,
    });
    readWizardSnapshotMock.mockReturnValue({
      caseId: "case-stale-1",
      progressStep: 1,
      updatedAt: "2099-01-01T00:00:00.000Z",
      payload: {
        selectedBenefits: [],
      },
    });
    apiGetMock.mockRejectedValue({ code: "internal", status: 500, message: "benefits_draft_fetch_failed" });

    render(<BenefitsFlow />);

    await waitFor(() => expect(screen.getByText(/benefits draft sync is unavailable/i)).toBeInTheDocument());
    expect(screen.getByText(/case draft connected/i)).toBeInTheDocument();
  });
});

function createCase(overrides: Record<string, unknown>) {
  return {
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
    wizard_completed: false,
    machtiging_status: "not_started",
    machtigung_code: null,
    stripe_payment_id: null,
    created_at: "2099-01-01T00:00:00.000Z",
    updated_at: "2099-01-01T00:00:00.000Z",
    ...overrides,
  };
}
