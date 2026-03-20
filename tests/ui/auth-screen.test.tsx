/// <reference types="vitest/globals" />

import { fireEvent, render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { AuthScreen } from "@/components/fintax/auth/AuthScreen";

vi.mock("next-intl", () => ({
  useLocale: () => "en",
}));

vi.mock("@/hooks/useEncryptedFormDraft", () => ({
  useEncryptedFormDraft: () => ({ hydrated: true, clearDraft: vi.fn() }),
}));

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => null,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof href === "string" ? href : "#"} {...props}>
      {children}
    </a>
  ),
  useRouter: () => ({
    push: vi.fn(),
  }),
}));

describe("AuthScreen", () => {
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
});
