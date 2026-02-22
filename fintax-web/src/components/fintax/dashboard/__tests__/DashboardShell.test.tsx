// @ts-nocheck
// Note: requires `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
import { render } from "@testing-library/react";
import { describe, it, vi } from "vitest";
import { DashboardShell } from "../DashboardShell";

vi.mock("next-intl", () => ({
  useTranslations: () => (key: string) => key,
}));
vi.mock("@/components/fintax/dashboard/DashboardSidebar", () => ({
  DashboardSidebar: () => <div data-testid="sidebar" />,
}));
vi.mock("@/components/fintax/dashboard/DashboardTopbar", () => ({
  DashboardTopbar: ({ onOpenSidebar }: { onOpenSidebar: () => void }) => (
    <div data-testid="topbar" onClick={onOpenSidebar} />
  ),
}));

describe("DashboardShell", () => {
  it("renders children", () => {
    const { getByText } = render(
      <DashboardShell><div>Test child</div></DashboardShell>
    );
    expect(getByText("Test child")).toBeTruthy();
  });
});
