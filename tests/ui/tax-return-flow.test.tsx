/// <reference types="vitest/globals" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import * as React from "react";
import { vi } from "vitest";

import enMessages from "../../messages/en.json";

import { TaxReturnFlow } from "@/components/fintax/flows/TaxReturnFlow";

const mockState = vi.hoisted(() => ({
  selectedCaseId: null as string | null,
  caseItem: null as Record<string, unknown> | null,
  intake: null as Record<string, unknown> | null,
  requirements: [] as Array<Record<string, unknown>>,
  progress: { total: 0, completed: 0, uploaded: 0, pending: 0, rejected: 0, blockingRemaining: 0, completionRatio: 0, blockers: [] as unknown[] },
  documents: [] as Array<Record<string, unknown>>,
  events: [] as Array<Record<string, unknown>>,
  help: { title: "Passport or EU identity document", why: "Backend help content", minimumContent: ["Readable document"], whenUnavailable: "Add a note." } as Record<string, unknown> | null,
}));

const createDraftMutateAsync = vi.fn(async () => {
  mockState.selectedCaseId = "case-tax-1";
  return "case-tax-1";
});
const saveIntakeMutateAsync = vi.fn(async () => ({ ok: true }));
const regenerateMutateAsync = vi.fn(async () => ({ ok: true }));

function getValue(path: string, source: Record<string, unknown>): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, source);
}

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: (namespace: string) => {
    const source = (enMessages as Record<string, unknown>)[namespace] as Record<string, unknown>;
    const t = (key: string, values?: Record<string, string | number>) => {
      const value = getValue(key, source);
      const text = typeof value === "string" ? value : key;
      return Object.entries(values ?? {}).reduce((acc, [name, replacement]) => acc.replaceAll(`{${name}}`, String(replacement)), text);
    };
    t.raw = (key: string) => getValue(key, source);
    return t;
  },
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

vi.mock("@/hooks/useCase", () => ({
  useCase: () => ({ isLoading: false, isError: false, error: null, data: mockState.caseItem }),
}));

vi.mock("@/hooks/useTaxSummary", () => ({
  useTaxSummary: () => ({ data: { box1Income: 42000, box3Assets: 12000, credits: 900, netResult: 1800 } }),
}));

vi.mock("@/hooks/useTaxReturnDocFlow", () => ({
  createDefaultIntakeDraftValues: () => ({
    fullName: "",
    bsn: "",
    payload: {
      caseType: "tax_return_p",
      filing: { taxYear: 2025, originCountryCode: "ES", currentCountryOfResidence: "NL", firstDeclarationWithFinTax: false, filingRoute: "standard" },
      residency: { registeredInNlFullYear: true, firstRegistrationInNlInTaxYear: false, firstRegistrationDateInNl: null, reestablishmentDateInNl: null, hadRegistrationInterruption: false, registrationInterruptionPeriods: [], emigratedOrDeregistered: false, emigrationOrDeregistrationDate: null },
      household: { hasFiscalPartner: false, hasChildrenRegisteredSameAddress: false, childrenCountSameAddress: 0, childrenRegistrationSameAddressDate: null },
      income: { employers: [], hasUwvIncome: false, hasTransitievergoeding: false, hasZzpIncome: false, zzpHoursOver1225: false, hasOtherForeignIncome: false, hasProvisionalAssessment: false },
      housing: { ownsHome: false, hasMortgage: false, hasSvnOrStarterslening: false },
      debts: { hasConsumerLoans: false },
      assets: { hasNlBankAccounts: true, hasForeignBankAccounts: false, hasCrypto: false },
      deductions: { hasUnreimbursedDeductibleMedicalCosts: false },
      summary: { box1Income: 0, box3Assets: 0, credits: 0, netResult: 0 },
    },
  }),
  mergeIntakeDraftValues: ({ draftValues }: { draftValues: Record<string, unknown> }) => draftValues,
  useLatestActiveTaxCase: () => ({ isLoading: false, selectedCaseId: mockState.selectedCaseId, setSelectedCaseId: vi.fn() }),
  useCaseIntake: () => ({ data: mockState.intake }),
  useCaseRequirements: () => ({
    isLoading: false,
    data: {
      requirements: mockState.requirements,
      progress: mockState.progress,
    },
  }),
  useCaseProgress: () => ({ data: mockState.progress }),
  useCaseDocuments: () => ({ isLoading: false, data: mockState.documents }),
  useCaseEvents: () => ({ isLoading: false, data: mockState.events }),
  useRequirementHelp: () => ({ isLoading: false, data: mockState.help }),
  useCreateDraftCase: () => ({ isPending: false, mutateAsync: createDraftMutateAsync }),
  useSaveCaseIntake: () => ({ isPending: false, mutateAsync: saveIntakeMutateAsync }),
  useRegenerateRequirements: () => ({ isPending: false, mutateAsync: regenerateMutateAsync }),
  useUploadRequirementDocument: () => ({ isPending: false, variables: null, mutateAsync: vi.fn() }),
  useDeleteCaseDocument: () => ({ isPending: false, mutateAsync: vi.fn() }),
  useRequirementNote: () => ({ mutateAsync: vi.fn() }),
  useRequirementNotAvailable: () => ({ mutateAsync: vi.fn() }),
}));

describe("TaxReturnFlow document cutover", () => {
  beforeEach(() => {
    mockState.selectedCaseId = null;
    mockState.caseItem = null;
    mockState.intake = null;
    mockState.requirements = [];
    mockState.progress = { total: 0, completed: 0, uploaded: 0, pending: 0, rejected: 0, blockingRemaining: 0, completionRatio: 0, blockers: [] };
    mockState.documents = [];
    mockState.events = [];
    createDraftMutateAsync.mockClear();
    saveIntakeMutateAsync.mockClear();
    regenerateMutateAsync.mockClear();
  });

  it("renders the new backend-driven document workspace shell", () => {
    render(<TaxReturnFlow />);

    expect(screen.getByRole("heading", { name: /tax return documents now follow the real case backend/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /choose declaration and year/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /document intake/i })).toBeInTheDocument();
  });

  it("creates or resumes a draft and saves intake through the backend flow", async () => {
    render(<TaxReturnFlow />);

    fireEvent.change(screen.getByLabelText(/full name/i), { target: { value: "Alex Example" } });
    fireEvent.change(screen.getByLabelText(/bsn/i), { target: { value: "1234" } });
    fireEvent.click(screen.getByRole("button", { name: /save intake and generate requirements/i }));

    await waitFor(() => expect(createDraftMutateAsync).toHaveBeenCalled());
    await waitFor(() => expect(saveIntakeMutateAsync).toHaveBeenCalled());
  });

  it("renders real requirements and timeline entries from backend hooks", async () => {
    mockState.selectedCaseId = "case-tax-1";
    mockState.caseItem = {
      id: "case-tax-1",
      case_type: "tax_return_p",
      status: "pending_documents",
      display_name: "Resident return 2025",
      tax_year: 2025,
    };
    mockState.requirements = [
      {
        id: "req-1",
        section: "identity",
        title: "Passport",
        description: "Upload identity proof",
        status: "pending",
        requirement_type: "document",
        is_document_required: true,
        is_blocking: true,
        accepted_mime_types: ["application/pdf"],
        max_file_size_bytes: 1024 * 1024,
        customer_note: null,
        availability_note: null,
        rejection_reason: null,
      },
    ];
    mockState.progress = { total: 1, completed: 0, uploaded: 0, pending: 1, rejected: 0, blockingRemaining: 1, completionRatio: 0, blockers: [] };
    mockState.events = [{ id: "evt-1", event_type: "intake_saved", created_at: "2099-01-01T00:00:00.000Z", payload: {} }];

    render(<TaxReturnFlow />);

    expect(screen.getAllByText(/passport/i).length).toBeGreaterThan(0);
    fireEvent.click(screen.getByRole("button", { name: /how to get it/i }));
    await waitFor(() => expect(screen.getByText(/backend help content/i)).toBeInTheDocument());
    expect(screen.getByText(/intake saved/i)).toBeInTheDocument();
  });
});
