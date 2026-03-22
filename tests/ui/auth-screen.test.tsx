/// <reference types="vitest/globals" />

import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { vi } from "vitest";

import { AuthScreen } from "@/components/fintax/auth/AuthScreen";

const pushMock = vi.fn();
const createClientMock = vi.fn<() => unknown>(() => null);

vi.mock("next-intl", () => ({
  useLocale: () => "en",
}));

vi.mock("@/hooks/useEncryptedFormDraft", () => ({
  useEncryptedFormDraft: () => ({ hydrated: true, clearDraft: vi.fn() }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => createClientMock(),
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof href === "string" ? href : "#"} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({
    push: pushMock,
  }),
}));

describe("AuthScreen", () => {
  beforeEach(() => {
    createClientMock.mockReset();
    createClientMock.mockReturnValue(null);
    pushMock.mockReset();
    window.sessionStorage.clear();
  });

  it("opens the register tab by default when an intent is present", () => {
    render(<AuthScreen initialSearchParams={{ intent: "tax-return" }} />);

    expect(screen.getByRole("tab", { name: /create account/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText(/tax return intake requested/i)).toBeInTheDocument();
  });

  it("shows an intent warning when the service is missing", () => {
    render(<AuthScreen initialSearchParams={{ intent: "tax-return" }} />);

    expect(
      screen.getByText(/a specific service is not selected yet\. you can still create your account now/i),
    ).toBeInTheDocument();
  });

  it("renders the password strength meter and updates on input", () => {
    render(<AuthScreen initialSearchParams={{ intent: "tax-return" }} />);

    expect(screen.getByTestId("password-strength-meter")).toBeInTheDocument();
    expect(screen.getByText(/weak/i)).toBeInTheDocument();

    fireEvent.change(screen.getByPlaceholderText(/at least 8 characters/i), { target: { value: "Longer!Pass123" } });

    expect(screen.getByText(/strong/i)).toBeInTheDocument();
  });

  it("shows the premium social buttons and removes the redundant register helper", () => {
    render(<AuthScreen />);

    expect(screen.getByRole("button", { name: /continue with google/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /continue with apple/i })).toBeInTheDocument();
    expect(screen.queryByText(/first time here/i)).not.toBeInTheDocument();
  });

  it("re-exports AuthScreen from the auth barrel", async () => {
    const barrel = await import("@/components/fintax/auth");

    expect(barrel.AuthScreen).toBe(AuthScreen);
  });

  it("renders the compact legal rail", () => {
    render(<AuthScreen />);

    expect(screen.getByRole("navigation", { name: /auth support links/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /terms/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /privacy/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to landing/i })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /help \/ contact/i })).toHaveAttribute("href", "mailto:privacy@fintax.nl");
  });

  it("restores a pending intent from session storage without needing URL params", async () => {
    window.sessionStorage.setItem(
      "fintax.pending_intent",
      JSON.stringify({ intent: "benefits", next: "/benefits?service=zorgtoeslag", service: "zorgtoeslag" }),
    );

    render(<AuthScreen />);

    await waitFor(() =>
      expect(screen.getByRole("tab", { name: /create account/i })).toHaveAttribute("aria-selected", "true"),
    );
    expect(screen.getByText(/benefits intake requested/i)).toBeInTheDocument();
  });

  it("opens the mfa modal after a successful login when pending mfa setup exists", async () => {
    window.sessionStorage.setItem("fintax.auth.mfa_after_login", "1");
    createClientMock.mockReturnValue({
      auth: {
        signInWithPassword: vi.fn().mockResolvedValue({ error: null }),
        mfa: {
          listFactors: vi.fn().mockResolvedValue({ error: { message: "disabled" } }),
        },
      },
    });

    render(<AuthScreen />);

    fireEvent.change(screen.getByLabelText(/^email$/i), { target: { value: "user@example.com" } });
    fireEvent.change(screen.getByLabelText(/^password$/i), { target: { value: "Password123!" } });
    fireEvent.click(screen.getByRole("button", { name: /^sign in$/i }));

    await waitFor(() => expect(screen.getByRole("heading", { name: /set up two-step verification/i })).toBeInTheDocument());
  });
});
