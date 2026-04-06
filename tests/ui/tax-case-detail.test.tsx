/// <reference types="vitest/globals" />

import * as React from "react";
import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { CaseDetailView } from "@/components/fintax/flows/CaseDetailView";

vi.mock("@/components/fintax/flows/tax-return/TaxReturnDocumentWorkspace", () => ({
  TaxReturnDocumentWorkspace: ({ caseId }: { caseId: string }) => <div>Workspace {caseId}</div>,
}));

describe("CaseDetailView", () => {
  it("delegates tax return case detail to the shared document workspace", () => {
    render(<CaseDetailView caseId="case-tax-1" />);

    expect(screen.getByText("Workspace case-tax-1")).toBeInTheDocument();
  });
});
