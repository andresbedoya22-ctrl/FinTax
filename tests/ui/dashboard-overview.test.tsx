// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import * as React from "react";
import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { DashboardOverview } from "@/components/fintax/dashboard/DashboardOverview";

const translations = {
  apiError: { eyebrow: "API del dashboard", body: "No se pudo refrescar el resumen de la declaracion.", codePrefix: "Codigo:" },
  header: {
    breadcrumb: "Dashboard",
    declaration: "Declaracion",
    updated: "Actualizado: {value}",
    deadline: "Fecha limite: {value}",
    primaryAction: "Anadir documento",
    secondaryAction: "Descargar resumen PDF",
    secondaryHint: "Pendiente",
  },
  stepper: {
    current: "Paso actual",
    draft: "Inicio",
    docs: "Documentos",
    review: "Revision",
    submitted: "Presentado",
    completed: "Completado",
  },
  kpis: {
    box1Income: { title: "Ingresos Box 1", note: "Ingresos laborales declarados" },
    box3Assets: { title: "Activos Box 3", note: "Activos registrados en el expediente" },
    credits: { title: "Creditos fiscales", note: "Creditos confirmados en el resumen actual" },
    netResult: { title: "Resultado neto", note: "Estimacion actual tras ajustes" },
  },
  documents: {
    title: "Progreso documental",
    description: "Sigue las cargas y lo que falta para que el expediente pase a revision.",
    progressLabel: "Estado documental",
    progressCaption: "Archivos listos para revision",
    cta: "Ver declaracion",
  },
  history: {
    title: "Historial fiscal",
    description: "Declaraciones recientes y puntos de control ordenados por ultima actividad.",
    empty: "Sin historial",
    taxYear: "Ano fiscal {year}",
    updated: "Actualizado {value}",
    cta: "Ver declaracion",
    types: {
      formP: "Declaracion de renta",
      formM: "Declaracion M",
      formC: "Declaracion C",
      zzp: "Declaracion autonomo",
      vat: "Declaracion IVA",
      healthcare: "Subsidio sanitario",
      rent: "Subsidio de alquiler",
      childBudget: "Ayuda por hijo",
      childcare: "Subsidio de guarderia",
    },
  },
  summary: {
    title: "Resumen fiscal",
    description: "Vista operativa del expediente fiscal activo.",
    netResultLabel: "Resultado neto",
    rows: {
      box1Income: "Ingresos Box 1",
      box3Assets: "Activos Box 3",
      credits: "Creditos fiscales",
      netResult: "Resultado neto",
    },
    sources: {
      tax_summary_api: "Resumen fiscal en vivo",
      case_data_fallback: "Fallback desde datos del caso",
      summary_unavailable: "Resumen no disponible",
    },
  },
  alertsPanel: {
    title: "Alertas y calendario",
    description: "Fechas criticas y elementos que aun pueden retrasar la presentacion.",
    calendarTitle: "Calendario",
    alertsTitle: "Alertas prioritarias",
    empty: "Sin alertas",
  },
  alerts: {
    box3Threshold: "Los activos de Box 3 superan 59.357 EUR. Revisa la documentacion patrimonial antes de presentar.",
    checklistIncomplete: "El checklist documental sigue incompleto. Sube la evidencia pendiente para evitar retrasos.",
    deadlineNear: "La fecha limite esta proxima. Completa cuanto antes los pasos de revision.",
  },
  activity: {
    title: "Actividad reciente",
    description: "Ultimos eventos y actualizaciones operativas del expediente.",
    empty: "Sin actividad",
    caseUpdated: "{caseLabel} recibio una nueva actualizacion de estado",
  },
  advisor: {
    title: "Panel del asesor",
    description: "La capa humana permanece visible cuando realmente ayuda a mover el caso.",
    statusTitle: "Asignacion de asesor activa",
    body: "Hay un especialista asignado a esta declaracion y podra continuar la revision cuando se resuelvan los bloqueos actuales.",
    primaryAction: "Escribir al asesor",
    secondaryAction: "Solicitar llamada",
  },
  status: {
    draft: "Inicio",
    pendingDocuments: "Documentos pendientes",
    inReview: "En revision",
    pendingPayment: "Pago pendiente",
    pendingAuthorization: "Autorizacion pendiente",
    authorized: "Autorizado",
    submitted: "Presentado",
    completed: "Completado",
    rejected: "Requiere cambios",
  },
  checklistFallback: [
    { label: "Pasaporte", done: true },
    { label: "Ingresos", done: false },
  ],
  calendarMilestones: [
    { date: "01/03/2027", label: "Inicio periodo de declaracion" },
    { date: "01/05/2027", label: "Fecha limite estandar" },
    { date: "01/07/2027", label: "Revision tardia / correcciones si aplica" },
  ],
};

function getValue(path: string, source: Record<string, unknown>): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) return (acc as Record<string, unknown>)[key];
    return undefined;
  }, source);
}

vi.mock("next-intl", () => ({
  useLocale: () => "en",
  useTranslations: () => {
    const t = (key: string, values?: Record<string, string | number>) => {
      const value = getValue(key, translations);
      if (typeof value !== "string") return key;
      return Object.entries(values ?? {}).reduce((acc, [name, replacement]) => acc.replace(`{${name}}`, String(replacement)), value);
    };
    t.raw = (key: string) => getValue(key, translations);
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

vi.mock("@/hooks/useCases", () => ({
  useCases: () => ({
    data: [
      {
        id: "case-1",
        user_id: "user-1",
        case_type: "tax_return_p",
        status: "pending_documents",
        display_name: "Declaracion 2025",
        tax_year: 2025,
        deadline: "2099-04-20T00:00:00.000Z",
        estimated_refund: 1500,
        actual_refund: null,
        wizard_data: {},
        wizard_completed: false,
        machtiging_status: "requested",
        machtiging_code: null,
        stripe_payment_id: null,
        assigned_admin: null,
        notes_internal: null,
        created_at: "2099-01-12T00:00:00.000Z",
        updated_at: "2099-03-10T00:00:00.000Z",
      },
    ],
    isError: false,
    error: null,
  }),
}));

vi.mock("@/hooks/useChecklist", () => ({
  useChecklist: () => ({
    data: [
      { id: "1", label: "Pasaporte", is_completed: true, is_document_upload: true },
      { id: "2", label: "Contrato de alquiler", is_completed: false, is_document_upload: true },
    ],
  }),
}));

vi.mock("@/hooks/useNotifications", () => ({
  useNotifications: () => ({
    data: [
      {
        id: "note-1",
        title: "Documento recibido",
        message: "El documento de identidad fue validado.",
        created_at: "2099-03-12T00:00:00.000Z",
      },
    ],
  }),
}));

vi.mock("@/hooks/useTaxSummary", () => ({
  useTaxSummary: () => ({
    data: {
      box1Income: 48000,
      box3Assets: 70000,
      credits: 2100,
      netResult: 1650,
      isFallback: true,
      sourceLabel: "case_data_fallback",
    },
  }),
}));

describe("DashboardOverview", () => {
  it("renders declaration KPIs and alerts panel", () => {
    render(<DashboardOverview />);

    expect(screen.getByRole("heading", { name: "Declaracion 2025" })).toBeInTheDocument();
    expect(screen.getAllByText("Ingresos Box 1").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Activos Box 3").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Creditos fiscales").length).toBeGreaterThan(0);
    expect(screen.getAllByText("Resultado neto").length).toBeGreaterThan(0);
    expect(screen.getByText("01/03/2027")).toBeInTheDocument();
    expect(screen.getByText("01/05/2027")).toBeInTheDocument();
    expect(screen.getByText("01/07/2027")).toBeInTheDocument();
    expect(screen.getByText(/Los activos de Box 3 superan 59.357 EUR/i)).toBeInTheDocument();
    expect(screen.getByText(/El checklist documental sigue incompleto/i)).toBeInTheDocument();
  });
});
