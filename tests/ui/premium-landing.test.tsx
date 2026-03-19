/* eslint-disable @next/next/no-img-element */
/// <reference types="vitest/globals" />

import { render, screen } from "@testing-library/react";
import { vi } from "vitest";

import { PremiumLandingPage } from "@/components/fintax/landing/PremiumLandingPage";

vi.mock("next/image", () => ({
  default: ({ alt, ...props }: React.ImgHTMLAttributes<HTMLImageElement>) => <img alt={alt} {...props} />,
}));

vi.mock("next-intl", () => ({
  useLocale: () => "en",
}));

vi.mock("@/components/fintax/LanguageSwitcher", () => ({
  LanguageSwitcher: () => <button type="button">Language</button>,
}));

vi.mock("@/i18n/navigation", () => ({
  Link: ({ href, children, ...props }: React.AnchorHTMLAttributes<HTMLAnchorElement>) => (
    <a href={typeof href === "string" ? href : "#"} {...props}>
      {children}
    </a>
  ),
}));

describe("PremiumLandingPage", () => {
  it("renders the main landing content", () => {
    render(<PremiumLandingPage />);

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: /premium workspace for tax returns and benefits in the netherlands/i,
      }),
    ).toBeInTheDocument();
  });

  it("shows the primary CTA", () => {
    render(<PremiumLandingPage />);

    expect(screen.getAllByRole("link", { name: /start tax return intake/i }).length).toBeGreaterThan(0);
  });

  it("renders key section headings", () => {
    render(<PremiumLandingPage />);

    expect(
      screen.getByRole("heading", { level: 2, name: /three clear steps from intake to follow-through/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /built around real tax and benefits workflows/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: /common questions before you start/i }),
    ).toBeInTheDocument();
  });

  it("renders FAQ questions", () => {
    render(<PremiumLandingPage />);

    expect(screen.getByRole("button", { name: /can i begin before i have every document ready/i })).toBeInTheDocument();
  });

  it("renders anchor sections for navigation", () => {
    render(<PremiumLandingPage />);

    expect(document.getElementById("how-it-works")).not.toBeNull();
    expect(document.getElementById("services")).not.toBeNull();
    expect(document.getElementById("pricing")).not.toBeNull();
    expect(document.getElementById("faq")).not.toBeNull();
    expect(document.getElementById("resources")).not.toBeNull();
  });
});
