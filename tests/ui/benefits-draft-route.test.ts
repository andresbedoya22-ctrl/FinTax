import { beforeEach, describe, expect, it, vi } from "vitest";

const requireAuthedUserMock = vi.fn();
const supabaseSelectMock = vi.fn();
const supabaseUpdateMock = vi.fn();
const supabaseInsertMock = vi.fn();

vi.mock("@/lib/api/auth", () => ({
  requireAuthedUser: (...args: unknown[]) => requireAuthedUserMock(...args),
}));

function createSupabaseMock() {
  return {
    from: vi.fn((table: string) => {
      if (table !== "cases") {
        throw new Error(`Unexpected table ${table}`);
      }

      return {
        select: (...args: unknown[]) => supabaseSelectMock(...args),
        update: (...args: unknown[]) => supabaseUpdateMock(...args),
        insert: (...args: unknown[]) => supabaseInsertMock(...args),
      };
    }),
  };
}

function createRequest(body: unknown) {
  return new Request("http://localhost/api/benefits/draft", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
}

function createPayload() {
  return {
    locale: "en",
    selectedBenefits: ["zorgtoeslag"],
    snapshot: {
      year: 2026,
      selectedBenefits: ["zorgtoeslag"],
      applicant: {
        id: "applicant",
        birthDate: "1990-01-01",
        countryOfResidence: "NL",
        nlResident: true,
        bsnKnown: true,
        annualIncome: 19000,
        assets1Jan: 1000,
        hasDutchHealthInsurance: true,
        activityStatus: ["employed"],
      },
      partner: null,
      children: [],
      residents: [],
      housing: {
        rentsRoom: false,
        independentHome: true,
        groupHousingForElderlyOrAssistedLiving: false,
        recognizedException: false,
        hasRentalContract: true,
        basicMonthlyRent: 700,
        isWoonwagen: false,
        monthlyStandplaatsCost: 0,
        serviceCostsIncludedButIgnoredFrom2026: 0,
      },
      assets: {
        applicantAssets1Jan: 1000,
        partnerAssets1Jan: 0,
        childAssets1Jan: 0,
        residentAssets1Jan: 0,
        hasSpecialAssets: false,
      },
      specialSituations: {
        foreignResidence: false,
        foreignWork: false,
        childAbroad: false,
        childcareAbroad: false,
        cakInsured: false,
        military: false,
        detained: false,
        gemoedsbezwaarde: false,
        noFixedAddress: false,
        bijzondereVermogen: false,
        bijzonderInkomen: false,
        longAbsenceFromHome: false,
        homeCareSituation: false,
        composedFamily: false,
        adoptionFosterStepChild: false,
        manualReviewNotes: "",
      },
    },
    evaluation: {
      year: 2026,
      parameterSetVersion: "NL_TOESLAGEN_2026_V1",
      results: {
        zorgtoeslag: {
          benefit: "zorgtoeslag",
          eligible: true,
          manualReviewRequired: false,
          estimatedAnnualAmount: 1200,
          estimatedMonthlyAmount: 100,
          blockingReasons: [],
          warningReasons: [],
          calculationSteps: [],
          requiredDocuments: [],
          optionalDocuments: [],
        },
        huurtoeslag: {
          benefit: "huurtoeslag",
          eligible: false,
          manualReviewRequired: false,
          estimatedAnnualAmount: 0,
          estimatedMonthlyAmount: 0,
          blockingReasons: [],
          warningReasons: [],
          calculationSteps: [],
          requiredDocuments: [],
          optionalDocuments: [],
        },
        kindgebondenBudget: {
          benefit: "kindgebondenBudget",
          eligible: false,
          manualReviewRequired: false,
          estimatedAnnualAmount: 0,
          estimatedMonthlyAmount: 0,
          blockingReasons: [],
          warningReasons: [],
          calculationSteps: [],
          requiredDocuments: [],
          optionalDocuments: [],
        },
        kinderopvangtoeslag: {
          benefit: "kinderopvangtoeslag",
          eligible: false,
          manualReviewRequired: false,
          estimatedAnnualAmount: 0,
          estimatedMonthlyAmount: 0,
          blockingReasons: [],
          warningReasons: [],
          calculationSteps: [],
          requiredDocuments: [],
          optionalDocuments: [],
        },
      },
      totalEstimatedAnnualAmount: 1200,
      totalEstimatedMonthlyAmount: 100,
      manualReviewRequired: false,
    },
  };
}

describe("/api/benefits/draft", () => {
  beforeEach(() => {
    requireAuthedUserMock.mockReset();
    supabaseSelectMock.mockReset();
    supabaseUpdateMock.mockReset();
    supabaseInsertMock.mockReset();
  });

  it("returns 400 for invalid payload", async () => {
    const { POST } = await import("@/app/api/benefits/draft/route");

    const response = (await POST(createRequest({ locale: "en" })))!;

    expect(response.status).toBe(400);
  });

  it("returns unauthorized when the user is not authenticated", async () => {
    const { POST } = await import("@/app/api/benefits/draft/route");
    requireAuthedUserMock.mockResolvedValue({
      errorResponse: new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 }),
    });

    const response = (await POST(createRequest(createPayload())))!;

    expect(response.status).toBe(401);
  });

  it("creates a benefits case and only returns the caseId", async () => {
    const { POST } = await import("@/app/api/benefits/draft/route");
    const supabase = createSupabaseMock();

    requireAuthedUserMock.mockResolvedValue({
      user: { id: "user-1" },
      supabase,
    });

    supabaseSelectMock.mockReturnValue({
      eq: () => ({
        eq: () => ({
          in: () => ({
            order: () => ({
              limit: () => ({
                maybeSingle: async () => ({ data: null, error: null }),
              }),
            }),
          }),
        }),
      }),
    });

    supabaseInsertMock.mockReturnValue({
      select: () => ({
        single: async () => ({ data: { id: "case-123" }, error: null }),
      }),
    });

    const response = (await POST(createRequest(createPayload())))!;
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json.data).toEqual({ caseId: "case-123" });
    expect(json.data.snapshot).toBeUndefined();
    expect(json.data.evaluation).toBeUndefined();
  });
});
