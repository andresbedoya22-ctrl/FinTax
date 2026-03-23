/// <reference types="vitest/globals" />

import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAuthedUserMock = vi.fn();

vi.mock("@/lib/api/auth", () => ({
  requireAuthedUser: (...args: unknown[]) => requireAuthedUserMock(...args),
}));

describe("benefits draft route", () => {
  beforeEach(() => {
    vi.resetModules();
    requireAuthedUserMock.mockReset();
  });

  it("fetches the latest authenticated benefits draft with the API envelope", async () => {
    const query = createSelectQuery({
      data: createBenefitsCase({
        id: "11111111-1111-4111-8111-111111111111",
        wizard_data: { flowKind: "benefits", currentStep: 2, selectedBenefits: ["zorgtoeslag"] },
      }),
      error: null,
    });
    const supabase = {
      from: vi.fn(() => query),
    };
    requireAuthedUserMock.mockResolvedValue({ user: { id: "user-1" }, supabase });

    const { GET } = await import("@/app/api/cases/benefits-draft/route");
    const response = (await GET()) as Response;
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload).toEqual(
      expect.objectContaining({
        data: expect.objectContaining({ id: "11111111-1111-4111-8111-111111111111" }),
        error: null,
      }),
    );
  });

  it("creates a benefits draft for the authenticated user", async () => {
    const lookupQuery = createSelectQuery({ data: null, error: null });
    const insertQuery = createInsertQuery({
      data: createBenefitsCase({
        id: "22222222-2222-4222-8222-222222222222",
        wizard_data: { flowKind: "benefits", currentStep: 1, selectedBenefits: [] },
      }),
      error: null,
    });
    const supabase = {
      from: vi
        .fn()
        .mockReturnValueOnce(lookupQuery)
        .mockReturnValueOnce(insertQuery),
    };
    requireAuthedUserMock.mockResolvedValue({ user: { id: "user-1" }, supabase });

    const { POST } = await import("@/app/api/cases/benefits-draft/route");
    const response = (await POST(
      new Request("http://localhost/api/cases/benefits-draft", {
        method: "POST",
        body: JSON.stringify({
          payload: createDraftPayload({ currentStep: 1, selectedBenefits: [] }),
        }),
      }),
    )) as Response;
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(insertQuery.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        user_id: "user-1",
        case_type: "zorgtoeslag",
      }),
    );
    expect(payload.data.id).toBe("22222222-2222-4222-8222-222222222222");
  });

  it("updates an existing benefits draft and persists selected benefits", async () => {
    const selectQuery = createSelectQuery({
      data: { id: "33333333-3333-4333-8333-333333333333", user_id: "user-1", case_type: "zorgtoeslag", status: "draft" },
      error: null,
    });
    const updateQuery = createUpdateQuery({
      data: createBenefitsCase({
        id: "33333333-3333-4333-8333-333333333333",
        case_type: "huurtoeslag",
        wizard_data: { flowKind: "benefits", currentStep: 6, selectedBenefits: ["huurtoeslag"] },
      }),
      error: null,
    });
    const supabase = {
      from: vi
        .fn()
        .mockReturnValueOnce(selectQuery)
        .mockReturnValueOnce(updateQuery),
    };
    requireAuthedUserMock.mockResolvedValue({ user: { id: "user-1" }, supabase });

    const { PATCH } = await import("@/app/api/cases/benefits-draft/route");
    const response = (await PATCH(
      new Request("http://localhost/api/cases/benefits-draft", {
        method: "PATCH",
        body: JSON.stringify({
          caseId: "33333333-3333-4333-8333-333333333333",
          payload: createDraftPayload({ currentStep: 6, selectedBenefits: ["huurtoeslag"] }),
        }),
      }),
    )) as Response;
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(updateQuery.update).toHaveBeenCalledWith(
      expect.objectContaining({
        case_type: "huurtoeslag",
        wizard_data: expect.objectContaining({
          selectedBenefits: ["huurtoeslag"],
        }),
      }),
    );
    expect(payload.data.case_type).toBe("huurtoeslag");
  });

  it("enforces ownership when updating a benefits draft", async () => {
    const selectQuery = createSelectQuery({
      data: null,
      error: null,
    });
    const supabase = {
      from: vi.fn(() => selectQuery),
    };
    requireAuthedUserMock.mockResolvedValue({ user: { id: "user-1" }, supabase });

    const { PATCH } = await import("@/app/api/cases/benefits-draft/route");
    const response = (await PATCH(
      new Request("http://localhost/api/cases/benefits-draft", {
        method: "PATCH",
        body: JSON.stringify({
          caseId: "44444444-4444-4444-8444-444444444444",
          payload: createDraftPayload({ currentStep: 2 }),
        }),
      }),
    )) as Response;
    const payload = await response.json();

    expect(response.status).toBe(404);
    expect(payload.error).toEqual({ code: "not_found", message: "benefits_draft_not_found" });
  });

  it("fails honestly when backend auth or config is unavailable", async () => {
    const errorResponse = new Response(
      JSON.stringify({
        data: null,
        error: { code: "internal", message: "supabase_client_unavailable" },
      }),
      { status: 500, headers: { "content-type": "application/json" } },
    );
    requireAuthedUserMock.mockResolvedValue({ errorResponse });

    const { POST } = await import("@/app/api/cases/benefits-draft/route");
    const response = (await POST(
      new Request("http://localhost/api/cases/benefits-draft", {
        method: "POST",
        body: JSON.stringify({
          payload: createDraftPayload({ currentStep: 1 }),
        }),
      }),
    )) as Response;
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(payload.error).toEqual({ code: "internal", message: "supabase_client_unavailable" });
  });
});

function createDraftPayload(overrides: Record<string, unknown>) {
  return {
    age: 32,
    householdType: "single",
    applicantAnnualIncome: 32000,
    partnerAnnualIncome: null,
    applicantAssets: 4000,
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
    childcareHourlyRate: 0,
    registeredChildcare: false,
    bothParentsWork: false,
    currentStep: 0,
    selectedBenefits: [],
    draftStatus: "in_progress",
    lastSavedAt: "2026-03-23T09:00:00.000Z",
    ...overrides,
  };
}

function createBenefitsCase(overrides: Record<string, unknown> = {}) {
  return {
    id: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
    user_id: "user-1",
    case_type: "zorgtoeslag",
    status: "draft",
    display_name: "Benefits draft",
    tax_year: null,
    deadline: null,
    estimated_refund: null,
    actual_refund: null,
    paid_at: null,
    wizard_data: {},
    wizard_completed: false,
    machtiging_status: "not_started",
    machtiging_code: null,
    stripe_payment_id: null,
    created_at: "2026-03-23T09:00:00.000Z",
    updated_at: "2026-03-23T09:00:00.000Z",
    ...overrides,
  };
}

function createSelectQuery(result: { data: unknown; error: unknown }) {
  const query = {
    select: vi.fn(() => query),
    eq: vi.fn(() => query),
    in: vi.fn(() => query),
    order: vi.fn(() => query),
    limit: vi.fn(() => query),
    maybeSingle: vi.fn(async () => result),
  };

  return query;
}

function createInsertQuery(result: { data: unknown; error: unknown }) {
  const query = {
    insert: vi.fn(() => query),
    select: vi.fn(() => query),
    single: vi.fn(async () => result),
  };

  return query;
}

function createUpdateQuery(result: { data: unknown; error: unknown }) {
  const query = {
    update: vi.fn(() => query),
    eq: vi.fn(() => query),
    select: vi.fn(() => query),
    maybeSingle: vi.fn(async () => result),
  };

  return query;
}
