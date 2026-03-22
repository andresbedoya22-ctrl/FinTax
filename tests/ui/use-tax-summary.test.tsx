// @vitest-environment jsdom

import "@testing-library/jest-dom/vitest";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, waitFor } from "@testing-library/react";
import * as React from "react";
import { afterEach, describe, expect, it, vi } from "vitest";

import { useTaxSummary } from "@/hooks/useTaxSummary";

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  };
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("useTaxSummary", () => {
  it("returns live tax summary when the endpoint exists", async () => {
    const fetchMock = vi.fn(async () =>
      new Response(JSON.stringify({ data: { box1Income: 52000, box3Assets: 8000, credits: 1200, netResult: 1900 }, error: null }), {
        status: 200,
        headers: { "content-type": "application/json" },
      }),
    );

    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useTaxSummary("case-live"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toMatchObject({
      box1Income: 52000,
      box3Assets: 8000,
      credits: 1200,
      netResult: 1900,
      isFallback: false,
      sourceLabel: "tax_summary_api",
    });
  });

  it("falls back to case data when the tax summary endpoint does not exist", async () => {
    const fetchMock = vi.fn(async (input: RequestInfo | URL) => {
      const url = String(input);

      if (url.includes("/tax-summary")) {
        return new Response(JSON.stringify({ data: null, error: { code: "not_found", message: "missing" } }), {
          status: 404,
          headers: { "content-type": "application/json" },
        });
      }

      return new Response(
        JSON.stringify({
          data: {
            id: "case-fallback",
            user_id: "user-1",
            case_type: "tax_return_p",
            status: "draft",
            display_name: "Declaracion 2025",
            tax_year: 2025,
            deadline: null,
            estimated_refund: 1450,
            actual_refund: null,
            wizard_data: {
              grossIncome: 41000,
              box3Assets: 62000,
              taxCredits: 900,
            },
            wizard_completed: false,
            machtiging_status: "requested",
            machtiging_code: null,
            stripe_payment_id: null,
            assigned_admin: null,
            notes_internal: null,
            created_at: "2099-01-01T00:00:00.000Z",
            updated_at: "2099-01-01T00:00:00.000Z",
          },
          error: null,
        }),
        {
          status: 200,
          headers: { "content-type": "application/json" },
        },
      );
    });

    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useTaxSummary("case-fallback"), {
      wrapper: createWrapper(),
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    expect(result.current.data).toMatchObject({
      box1Income: 41000,
      box3Assets: 62000,
      credits: 900,
      netResult: 1450,
      isFallback: true,
      sourceLabel: "case_data_fallback",
    });
  });
});
