// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import * as React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardOverview } from "@/components/fintax/dashboard/DashboardOverview";

const mockState = vi.hoisted(() => ({
  profile: { id: "user-1" },
  cases: [
    {
      id: "case-1",
      user_id: "user-1",
      case_type: "tax_return_p",
      status: "pending_documents",
      display_name: "Declaración 2025",
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
  requirements: [
    { id: "1", title: "Pasaporte", status: "approved", requirement_type: "document", is_document_required: true },
    { id: "2", title: "Contrato de alquiler", status: "pending", requirement_type: "document", is_document_required: true },
  ],
  progress: { total: 2, completed: 1, uploaded: 0, pending: 1, rejected: 0, blockingRemaining: 1, completionRatio: 50, blockers: [] },
  events: [
    {
      id: "evt-1",
      event_type: "document_uploaded",
      created_at: "2099-03-12T00:00:00.000Z",
      payload: { fileName: "passport.pdf" },
    },
  ],
  notifications: [
    {
      id: "note-1",
      title: "Documento recibido",
      message: "El documento de identidad fue validado.",
      created_at: "2099-03-12T00:00:00.000Z",
    },
  ],
  taxSummary: {
    box1Income: 48000,
    box3Assets: 70000,
    credits: 2100,
    netResult: 1650,
    isFallback: true,
    sourceLabel: "case_data_fallback",
  },
}));

const useNotificationsMock = vi.fn();
const useCasesMock = vi.fn();

const translations = {
  apiError: { eyebrow: "API del dashboard", body: "No se pudo refrescar el resumen de la declaración.", codePrefix: "Código:" },
  header: {
    breadcrumb: "Dashboard",
    declaration: "Declaración",
    noDate: "Sin fecha disponible",
    updated: "Actualizado: {value}",
    deadline: "Fecha límite: {value}",
    primaryAction: "Añadir documento",
    secondaryAction: "Descargar resumen PDF",
    secondaryHint: "Pendiente",
  },
  stepper: {
    current: "Paso actual",
    completedLabel: "Completado",
    pendingLabel: "Pendiente",
    draft: "Inicio",
    docs: "Documentos",
    review: "Revisión",
    submitted: "Presentado",
    completed: "Completado",
  },
  kpis: {
    box1Income: { title: "Ingresos Box 1", note: "Ingresos laborales declarados" },
    box3Assets: { title: "Activos Box 3", note: "Activos registrados en el expediente" },
    credits: { title: "Créditos fiscales", note: "Créditos confirmados en el resumen actual" },
    netResult: { title: "Resultado neto", note: "Estimación actual tras ajustes" },
  },
  documents: {
    title: "Progreso documental",
    description: "Sigue las cargas y lo que falta para que el expediente pase a revisión.",
    progressLabel: "Estado documental",
    progressCaption: "Archivos listos para revisión",
    emptyTitle: "Todavía no hay una declaración activa",
    emptyBody: "Empieza una declaración para cargar documentos y activar el dashboard operativo.",
    cta: "Ver declaración",
  },
  history: {
    title: "Historial fiscal",
    description: "Declaraciones recientes y puntos de control ordenados por última actividad.",
    empty: "Sin historial",
    taxYear: "Año fiscal {year}",
    updated: "Actualizado {value}",
    cta: "Ver declaración",
    types: {
      formP: "Declaración de renta",
      formM: "Declaración M",
      formC: "Declaración C",
      zzp: "Declaración autónomo",
      vat: "Declaración IVA",
      healthcare: "Subsidio sanitario",
      rent: "Subsidio de alquiler",
      childBudget: "Ayuda por hijo",
      childcare: "Subsidio de guardería",
    },
  },
  summary: {
    title: "Resumen fiscal",
    description: "Vista operativa del expediente fiscal activo.",
    netResultLabel: "Resultado neto",
    rows: {
      box1Income: "Ingresos Box 1",
      box3Assets: "Activos Box 3",
      credits: "Créditos fiscales",
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
    description: "Fechas críticas y elementos que aún pueden retrasar la presentación.",
    calendarTitle: "Calendario",
    alertsTitle: "Alertas prioritarias",
    empty: "Sin alertas",
  },
  alerts: {
    box3Threshold: "Los activos de Box 3 superan 59.357 EUR. Revisa la documentación patrimonial antes de presentar.",
    checklistIncomplete: "El checklist documental sigue incompleto. Sube la evidencia pendiente para evitar retrasos.",
    deadlineNear: "La fecha límite está próxima. Completa cuanto antes los pasos de revisión.",
  },
  activity: {
    title: "Actividad reciente",
    description: "Últimos eventos y actualizaciones operativas del expediente.",
    empty: "Sin actividad",
    caseUpdated: "{caseLabel} recibió una nueva actualización de estado",
  },
  advisor: {
    title: "Panel del asesor",
    description: "La capa humana permanece visible cuando realmente ayuda a mover el caso.",
    statusTitle: "Asignación de asesor activa",
    body: "Hay un especialista asignado a esta declaración y podrá continuar la revisión cuando se resuelvan los bloqueos actuales.",
    primaryAction: "Escribir al asesor",
    secondaryAction: "Solicitar llamada",
  },
  status: {
    draft: "Inicio",
    pendingDocuments: "Documentos pendientes",
    inReview: "En revisión",
    pendingPayment: "Pago pendiente",
    pendingAuthorization: "Autorización pendiente",
    authorized: "Autorizado",
    submitted: "Presentado",
    completed: "Completado",
    rejected: "Requiere cambios",
  },
  docFlow: {
    eventTypes: {
      document_uploaded: { title: "Documento subido", body: "El documento fue subido." },
    },
  },
  calendarMilestones: [
    { date: "01/03/2027", label: "Inicio del periodo de declaración" },
    { date: "01/05/2027", label: "Fecha límite estándar" },
    { date: "01/07/2027", label: "Revisión tardía o correcciones si aplica" },
  ],
};

function getValue(path: string, source: Record<string, unknown>): unknown {
  return path.split(".").reduce<unknown>((acc, key) => {
    if (acc && typeof acc === "object" && key in acc) return (acc as Record<string, unknown>)[key];
    return undefined;
  }, source);
}

vi.mock("next-intl", () => ({
  useLocale: () => "es",
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

vi.mock("@/hooks/useCurrentProfile", () => ({
  useCurrentProfile: () => ({
    loading: false,
    profile: mockState.profile,
  }),
}));

vi.mock("@/hooks/useCases", () => ({
  useCases: (enabled?: boolean) => useCasesMock(enabled),
}));

vi.mock("@/hooks/useTaxReturnDocFlow", () => ({
  useCaseRequirements: () => ({
    data: {
      requirements: mockState.requirements,
      progress: mockState.progress,
    },
  }),
  useCaseProgress: () => ({
    data: mockState.progress,
  }),
  useCaseEvents: () => ({
    data: mockState.events,
  }),
}));

vi.mock("@/hooks/useNotifications", () => ({
  useNotifications: (limit?: number, enabled?: boolean) => useNotificationsMock(limit, enabled),
}));

vi.mock("@/hooks/useTaxSummary", () => ({
  useTaxSummary: () => ({
    data: mockState.taxSummary,
  }),
}));

describe("DashboardOverview", () => {
  beforeEach(() => {
    useCasesMock.mockImplementation(() => ({
      data: mockState.cases,
      isError: false,
      error: null,
    }));
    useNotificationsMock.mockImplementation(() => ({
      data: mockState.notifications,
    }));
  });

  it("renders declaration KPIs and alerts", () => {
    render(<DashboardOverview />);

    expect(screen.getByRole("heading", { name: "Declaración 2025" })).toBeInTheDocument();
    expect(screen.getAllByText("Ingresos Box 1").length).toBeGreaterThan(0);
    expect(screen.getByText(/Los activos de Box 3 superan 59.357 EUR/i)).toBeInTheDocument();
    expect(screen.getByText("Fallback desde datos del caso")).toBeInTheDocument();
  });

  it("does not enable notifications when case events already exist", () => {
    render(<DashboardOverview />);

    expect(useCasesMock).toHaveBeenCalledWith(true);
    expect(useNotificationsMock).toHaveBeenCalledWith(6, false);
  });

  it("keeps notifications disabled when there is no active case", () => {
    mockState.cases = [];

    render(<DashboardOverview />);

    expect(useNotificationsMock).toHaveBeenCalledWith(6, false);
    expect(screen.getByText("Todavía no hay una declaración activa")).toBeInTheDocument();
  });
});
