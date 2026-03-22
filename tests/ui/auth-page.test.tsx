/// <reference types="vitest/globals" />

import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

vi.mock("@/components/fintax/auth", () => ({
  AuthScreen: ({ initialSearchParams }: { initialSearchParams: Record<string, string | undefined> }) => (
    <div data-testid="auth-screen-proxy">{JSON.stringify(initialSearchParams)}</div>
  ),
}));

describe("AuthPage", () => {
  it("passes normalized search params into AuthScreen", async () => {
    const { default: AuthPage } = await import("@/app/[locale]/auth/page");

    render(await AuthPage({
      searchParams: Promise.resolve({
        intent: ["tax-return"],
        service: "income-tax",
        next: "/en/app",
        reason: "mfa_required",
      }),
    }));

    expect(screen.getByTestId("auth-screen-proxy")).toHaveTextContent(
      JSON.stringify({
        intent: "tax-return",
        service: "income-tax",
        next: "/en/app",
        reason: "mfa_required",
      }),
    );
  });
});
