// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DeclarationHeader } from "@/components/fintax/dashboard/DeclarationHeader";
import { HorizontalStepper } from "@/components/fintax/dashboard/HorizontalStepper";

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

describe("DeclarationHeader", () => {
  it("renders premium declaration header actions and metadata", () => {
    render(
      <DeclarationHeader
        breadcrumbLabel="Dashboard"
        declarationLabel="Declaracion"
        taxYear={2025}
        updatedLabel="Actualizado: 20 mar 2026"
        deadlineLabel="Fecha limite: 01 may 2026"
        primaryHref="/tax-return/case-1"
        primaryLabel="Anadir documento"
        secondaryLabel="Descargar resumen PDF"
        secondaryHint="Disponible despues"
        secondaryDisabled
      />,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Declaracion 2025" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /Anadir documento/i })).toHaveAttribute("href", "/tax-return/case-1");
    expect(screen.getByRole("button", { name: /Descargar resumen PDF/i })).toBeDisabled();
  });
});

describe("HorizontalStepper", () => {
  it("highlights the current step and keeps all five phases visible", () => {
    render(
      <HorizontalStepper
        currentStep={3}
        currentStepLabel="Paso actual"
        completedStepLabel="Completado"
        pendingStepLabel="Pendiente"
        steps={[
          { id: "draft", label: "Inicio" },
          { id: "docs", label: "Documentos" },
          { id: "review", label: "Revision" },
          { id: "submitted", label: "Presentado" },
          { id: "completed", label: "Completado" },
        ]}
      />,
    );

    expect(screen.getByText("Inicio")).toBeInTheDocument();
    expect(screen.getByText("Documentos")).toBeInTheDocument();
    expect(screen.getByText("Revision")).toBeInTheDocument();
    expect(screen.getByText("Presentado")).toBeInTheDocument();
    expect(screen.getAllByText("Completado").length).toBeGreaterThan(0);
    expect(screen.getByText("Paso actual")).toBeInTheDocument();
    expect(screen.getAllByText(/Completado|Pendiente/).length).toBeGreaterThan(0);
    expect(screen.getByLabelText("Case progress")).toBeInTheDocument();
  });
});
