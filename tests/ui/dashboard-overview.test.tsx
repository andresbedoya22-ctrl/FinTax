// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import * as React from "react";
import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { DashboardOverview } from "@/components/fintax/dashboard/DashboardOverview";

const baseCase = {
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
} as const;

const mockState = vi.hoisted(() => ({
  profile: { id: "user-1", full_name: "María López" },
  cases: [] as Array<typeof baseCase>,
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
}));

const useNotificationsMock = vi.fn();
const useCasesMock = vi.fn();

const translations = {
  home: {
    eyebrow: "Centro de control",
    fallbackName: "cliente",
    greeting: "Hola, {name}",
    subtitle: "Este es el estado actual de tus trámites.",
    taxReturnCta: "Iniciar declaración",
    benefitsCta: "Calcular subsidios",
    emptyTitle: "Aún no tienes trámites activos",
    emptyBody: "Empieza con una estimación de subsidios o inicia una declaración.",
    continueCta: "Continuar",
    updated: "Actualizado {value}",
    nextStep: "Siguiente paso: {step}",
    progress: "Progreso",
    documentsAction: "Documentos pendientes",
    pendingDocuments: "{count} documento(s) requieren atención",
    noPendingDocuments: "No hay bloqueos documentales ahora",
    paymentAction: "Pagos",
    paymentPending: "El pago sigue pendiente",
    paymentClear: "No hay acciones de pago",
    reviewAction: "Revisión",
    reviewNeeded: "La revisión manual o autorización requiere atención",
    reviewClear: "No hay bloqueos de revisión",
  },
  apiError: { eyebrow: "API del dashboard", body: "No se pudo refrescar el resumen.", codePrefix: "Código:" },
  header: { noDate: "Sin fecha disponible" },
  stepper: {
    draft: "Diagnóstico",
    docs: "Documentos",
    review: "Revisión",
    submitted: "Solicitud",
    completed: "Completado",
  },
  history: {
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
  activity: {
    title: "Actividad reciente",
    description: "Últimos eventos y actualizaciones operativas.",
    caseUpdated: "{caseLabel} recibió una nueva actualización de estado",
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

describe("DashboardOverview", () => {
  beforeEach(() => {
    mockState.cases = [{ ...baseCase }];
    mockState.events = [
      {
        id: "evt-1",
        event_type: "document_uploaded",
        created_at: "2099-03-12T00:00:00.000Z",
        payload: { fileName: "passport.pdf" },
      },
    ];
    useCasesMock.mockImplementation(() => ({
      data: mockState.cases,
      isError: false,
      error: null,
    }));
    useNotificationsMock.mockImplementation(() => ({
      data: mockState.notifications,
    }));
  });

  it("shows a focused active-case dashboard without fallback Box KPIs", () => {
    render(<DashboardOverview />);

    expect(screen.getByText("Hola, María")).toBeInTheDocument();
    expect(screen.getByTestId("dashboard-primary-case-card")).toBeInTheDocument();
    expect(screen.getAllByTestId("dashboard-quick-action-card")).toHaveLength(3);
    expect(screen.getByTestId("dashboard-simple-timeline")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Declaración 2025" })).toBeInTheDocument();
    expect(screen.queryByText("Ingresos Box 1")).not.toBeInTheDocument();
    expect(screen.queryByText("Activos Box 3")).not.toBeInTheDocument();
  });

  it("limits recent activity to max 3 items", () => {
    mockState.events = Array.from({ length: 5 }, (_, index) => ({
      id: `evt-${index}`,
      event_type: "document_uploaded",
      created_at: "2099-03-12T00:00:00.000Z",
      payload: { fileName: `file-${index}.pdf` },
    }));

    render(<DashboardOverview />);

    expect(screen.getByTestId("dashboard-recent-activity")).toBeInTheDocument();
    expect(screen.getAllByText("Documento subido")).toHaveLength(3);
  });

  it("does not enable notifications when case events already exist", () => {
    render(<DashboardOverview />);

    expect(useCasesMock).toHaveBeenCalledWith(true);
    expect(useNotificationsMock).toHaveBeenCalledWith(6, false);
  });

  it("shows empty state with two CTAs when there is no active case", () => {
    mockState.cases = [];

    render(<DashboardOverview />);

    expect(useNotificationsMock).toHaveBeenCalledWith(6, false);
    expect(screen.getByTestId("dashboard-empty-state")).toBeInTheDocument();
    expect(screen.getAllByTestId("dashboard-main-cta-benefits").length).toBeGreaterThan(0);
    expect(screen.getAllByTestId("dashboard-main-cta-tax-return").length).toBeGreaterThan(0);
  });
});
