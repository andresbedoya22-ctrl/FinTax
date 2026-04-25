/// <reference types="vitest/globals" />

import { render, screen } from "@testing-library/react";
import * as React from "react";
import { vi } from "vitest";

import { TopNav } from "@/components/fintax/layout";
import { AppShell } from "@/components/fintax/layout/AppShell";

let currentLocale = "en";

vi.mock("next-intl", () => ({
  useLocale: () => currentLocale,
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
  usePathname: () => "/benefits",
}));

describe("Premium navigation terminology", () => {
  it.each([
    ["es", "Subsidios"],
    ["en", "Benefits"],
    ["nl", "Toeslagen"],
    ["pl", "Świadczenia"],
    ["ro", "Beneficii"],
  ])("renders the localized benefits label for %s", (locale, label) => {
    currentLocale = locale;
    render(<TopNav />);

    expect(screen.getByRole("link", { name: label })).toBeInTheDocument();
  });

  it("renders the premium shell and navigation landmarks", () => {
    currentLocale = "es";

    render(
      <AppShell>
        <main>Contenido de la app</main>
      </AppShell>,
    );

    expect(screen.getByTestId("premium-app-shell")).toBeInTheDocument();
    expect(screen.getByTestId("premium-top-nav")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Subsidios" })).toBeInTheDocument();
  });
});
