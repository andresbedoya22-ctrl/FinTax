/// <reference types="vitest/globals" />

import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import enMessages from "../../messages/en.json";

import { CaseDetailView } from "@/components/fintax/flows/CaseDetailView";

const useCaseMock = vi.fn();
const useChecklistMock = vi.fn();

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

vi.mock("@/hooks/useCase", () => ({
  useCase: (...args: unknown[]) => useCaseMock(...args),
}));

vi.mock("@/hooks/useChecklist", () => ({
  useChecklist: (...args: unknown[]) => useChecklistMock(...args),
}));

describe("CaseDetailView tax QA", () => {
  beforeEach(() => {
    useCaseMock.mockReturnValue({
      isLoading: false,
      isError: false,
      error: null,
      data: {
        id: "case-tax-1",
        user_id: "user-1",
        case_type: "tax_return_p",
        status: "pending_documents",
        display_name: "Resident return 2025",
        tax_year: 2025,
        deadline: null,
        estimated_refund: null,
        actual_refund: null,
        wizard_data: {},
        wizard_completed: false,
        machtiging_status: "requested",
        machtiging_code: null,
        stripe_payment_id: null,
        assigned_admin: null,
        notes_internal: null,
        created_at: "2099-01-01T00:00:00.000Z",
        updated_at: "2099-01-01T00:00:00.000Z",
      },
    });
    useChecklistMock.mockReturnValue({
      isLoading: false,
      data: [],
    });
  });

  it("renders tax case labels and fallback copy in a clean way", () => {
    render(<CaseDetailView caseId="case-tax-1" />);

    expect(screen.getByRole("heading", { name: /resident return 2025/i })).toBeInTheDocument();
    expect(screen.getAllByText(/pending documents/i)).not.toHaveLength(0);
    expect(screen.getByText(/to be confirmed/i)).toBeInTheDocument();
    expect(screen.getAllByText(/requested|pending review/i)).not.toHaveLength(0);
  });

  it("shows improved empty states for documents and checklist", () => {
    render(<CaseDetailView caseId="case-tax-1" />);

    fireEvent.click(screen.getByRole("tab", { name: /documents/i }));
    expect(screen.getByText(/no files uploaded yet/i)).toBeInTheDocument();
    expect(screen.getByText(/checklist items will appear here/i)).toBeInTheDocument();
  });
});
