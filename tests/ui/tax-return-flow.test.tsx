/// <reference types="vitest/globals" />

import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import * as React from "react";
import { vi } from "vitest";

import enMessages from "../../messages/en.json";
import esMessages from "../../messages/es.json";

import { TaxReturnFlow } from "@/components/fintax/flows/TaxReturnFlow";

const mockState = vi.hoisted(() => ({
  locale: "en",
  messages: {} as Record<string, unknown>,
  selectedCaseId: null as string | null,
  caseItem: null as Record<string, unknown> | null,
  intake: null as Record<string, unknown> | null,
  requirements: [] as Array<Record<string, unknown>>,
  progress: { total: 0, completed: 0, uploaded: 0, pending: 0, rejected: 0, blockingRemaining: 0, completionRatio: 0, blockers: [] as unknown[] },
  documents: [] as Array<Record<string, unknown>>,
  help: { title: "Passport or EU identity document", why: "Backend help content", minimumContent: ["Readable document"], whenUnavailable: "Add a note." } as Record<string, unknown> | null,
  profile: {
    full_name: "Alex Example",
    country_of_origin: "ES",
    address_country: "NL",
  },
}));

const setSelectedCaseIdMock = vi.fn();
const createDraftMutateAsync = vi.fn(async () => {
  mockState.selectedCaseId = "case-tax-1";
  return "case-tax-1";
});
const saveIntakeMutateAsync = vi.fn(async () => ({ ok: true }));
const regenerateMutateAsync = vi.fn(async () => ({ ok: true }));
const uploadMutateAsync = vi.fn(async () => ({ ok: true }));
const deleteMutateAsync = vi.fn(async () => ({ ok: true }));
const noteMutateAsync = vi.fn(async () => ({ ok: true }));
const notAvailableMutateAsync = vi.fn(async () => ({ ok: true }));

function getValue(path: string, source: Record<string, unknown>): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object") return (acc as Record<string, unknown>)[key];
    return undefined;
  }, source);
}

vi.mock("next-intl", () => ({
  useLocale: () => mockState.locale,
  useTranslations: (namespace: string) => {
    const source = (mockState.messages as Record<string, unknown>)[namespace] as Record<string, unknown>;
    const t = (key: string, values?: Record<string, string | number>) => {
      const value = getValue(key, source);
      const text = typeof value === "string" ? value : key;
      return Object.entries(values ?? {}).reduce((acc, [name, replacement]) => acc.replaceAll(`{${name}}`, String(replacement)), text);
    };
    t.raw = (key: string) => getValue(key, source);
    return t;
  },
}));

vi.mock("@/hooks/useCase", () => ({
  useCase: () => ({ isLoading: false, isError: false, error: null, data: mockState.caseItem }),
}));

vi.mock("@/hooks/useCurrentProfile", () => ({
  useCurrentProfile: () => ({
    loading: false,
    profile: mockState.profile,
  }),
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
  mergeIntakeDraftValues: ({ draftValues, snapshot }: { draftValues: Record<string, unknown>; snapshot: Record<string, unknown> | null }) =>
    snapshot ? { ...draftValues, payload: (snapshot.payload as Record<string, unknown>) ?? draftValues.payload } : draftValues,
  useLatestActiveTaxCase: () => ({ isLoading: false, selectedCaseId: mockState.selectedCaseId, setSelectedCaseId: setSelectedCaseIdMock }),
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
  useRequirementHelp: () => ({ isLoading: false, data: mockState.help }),
  useCreateDraftCase: () => ({ isPending: false, mutateAsync: createDraftMutateAsync }),
  useSaveCaseIntake: () => ({ isPending: false, mutateAsync: saveIntakeMutateAsync }),
  useRegenerateRequirements: () => ({ isPending: false, mutateAsync: regenerateMutateAsync }),
  useUploadRequirementDocument: () => ({ isPending: false, variables: null, mutateAsync: uploadMutateAsync }),
  useDeleteCaseDocument: () => ({ isPending: false, mutateAsync: deleteMutateAsync }),
  useRequirementNote: () => ({ isPending: false, mutateAsync: noteMutateAsync }),
  useRequirementNotAvailable: () => ({ isPending: false, mutateAsync: notAvailableMutateAsync }),
}));

describe("TaxReturnFlow wizard", () => {
  beforeEach(() => {
    mockState.locale = "en";
    mockState.messages = enMessages as Record<string, unknown>;
    mockState.selectedCaseId = null;
    mockState.caseItem = null;
    mockState.intake = null;
    mockState.requirements = [];
    mockState.progress = { total: 0, completed: 0, uploaded: 0, pending: 0, rejected: 0, blockingRemaining: 0, completionRatio: 0, blockers: [] };
    mockState.documents = [];
    createDraftMutateAsync.mockClear();
    saveIntakeMutateAsync.mockClear();
    regenerateMutateAsync.mockClear();
    uploadMutateAsync.mockClear();
    deleteMutateAsync.mockClear();
    noteMutateAsync.mockClear();
    notAvailableMutateAsync.mockClear();
    setSelectedCaseIdMock.mockClear();
    window.localStorage.clear();
  });

  it("renders the wizard entry step instead of a long intake screen", () => {
    render(<TaxReturnFlow />);

    expect(screen.getByRole("heading", { name: /tax return now moves in short, saved steps/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /service and tax year/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /next/i })).toBeInTheDocument();
  });

  it("validates the first step before creating the draft", async () => {
    render(<TaxReturnFlow />);

    fireEvent.click(screen.getByRole("button", { name: /next/i }));

    expect(await screen.findByText(/enter a valid bsn before saving the draft/i)).toBeInTheDocument();
    expect(createDraftMutateAsync).not.toHaveBeenCalled();
  });

  it("saves on step navigation and keeps answers when moving back", async () => {
    render(<TaxReturnFlow />);

    fireEvent.change(screen.getByLabelText(/bsn/i), { target: { value: "1234" } });
    fireEvent.click(screen.getByRole("button", { name: /^next$/i }));

    await waitFor(() => expect(createDraftMutateAsync).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(saveIntakeMutateAsync).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole("heading", { name: /registration and residence/i })).toBeInTheDocument();

    const firstDeclarationGroup = screen.getByRole("radiogroup", { name: /first tax return with fintax/i });
    fireEvent.click(within(firstDeclarationGroup).getByRole("radio", { name: /yes/i }));
    fireEvent.click(screen.getByRole("button", { name: /back/i }));

    await waitFor(() => expect(saveIntakeMutateAsync).toHaveBeenCalledTimes(2));
    expect(await screen.findByRole("heading", { name: /service and tax year/i })).toBeInTheDocument();
  });

  it("renders the review step and regenerates requirements before opening documents", async () => {
    render(<TaxReturnFlow />);

    fireEvent.change(screen.getByLabelText(/bsn/i), { target: { value: "1234" } });

    for (let index = 0; index < 8; index += 1) {
      fireEvent.click(screen.getByRole("button", { name: /^next$/i }));
      await waitFor(() => expect(saveIntakeMutateAsync).toHaveBeenCalled());
    }

    expect(await screen.findByRole("heading", { name: /review answers/i })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /save and open requirements/i }));

    await waitFor(() => expect(regenerateMutateAsync).toHaveBeenCalledTimes(1));
    expect(await screen.findByRole("heading", { name: /requirements and documents/i })).toBeInTheDocument();
  });

  it("renders the main flow cleanly in Spanish without residual English CTAs", () => {
    mockState.locale = "es";
    mockState.messages = esMessages as Record<string, unknown>;

    render(<TaxReturnFlow />);

    expect(screen.getByRole("heading", { name: /la declaración fiscal ahora avanza por pasos cortos y guardados/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /servicio y año fiscal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /siguiente/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Next" })).not.toBeInTheDocument();
    expect(screen.queryByText(/How to get it/i)).not.toBeInTheDocument();
  });

  it("shows grouped requirement actions in the final document step", async () => {
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
        status: "rejected",
        requirement_type: "document",
        is_document_required: true,
        is_blocking: true,
        accepted_mime_types: ["application/pdf"],
        max_file_size_bytes: 1024 * 1024,
        customer_note: "",
        availability_note: "",
        rejection_reason: "Unreadable file",
      },
    ];
    mockState.documents = [
      {
        id: "doc-1",
        requirement_id: "req-1",
        file_name: "passport-old.pdf",
        file_size: 1024,
        mime_type: "application/pdf",
        status: "rejected",
        created_at: "2099-01-01T00:00:00.000Z",
      },
    ];

    window.localStorage.setItem("tax-return-wizard-step:case-tax-1", "9");

    const { container } = render(<TaxReturnFlow />);

    expect(await screen.findByRole("heading", { name: /requirements and documents/i })).toBeInTheDocument();
    expect(screen.getAllByText("Passport").length).toBeGreaterThan(0);

    fireEvent.change(screen.getAllByRole("textbox")[0], { target: { value: "Client note" } });
    fireEvent.click(screen.getByRole("button", { name: /save note/i }));
    await waitFor(() => expect(noteMutateAsync).toHaveBeenCalledWith({ requirementId: "req-1", note: "Client note" }));

    fireEvent.change(screen.getAllByRole("textbox")[1], { target: { value: "Waiting for municipality" } });
    fireEvent.click(screen.getByRole("button", { name: /mark as not available/i }));
    await waitFor(() => expect(notAvailableMutateAsync).toHaveBeenCalledWith({ requirementId: "req-1", note: "Waiting for municipality" }));

    fireEvent.click(screen.getByRole("button", { name: /how to get it/i }));
    expect(await screen.findByText(/backend help content/i)).toBeInTheDocument();

    const replaceInput = container.querySelectorAll('input[type="file"]')[1] as HTMLInputElement;
    const file = new File(["replacement"], "passport-new.pdf", { type: "application/pdf" });
    fireEvent.change(replaceInput, { target: { files: [file] } });
    await waitFor(() => expect(uploadMutateAsync).toHaveBeenCalledWith({ requirementId: "req-1", file, replacesDocumentId: "doc-1" }));
  });
});
