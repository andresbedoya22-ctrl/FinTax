// @ts-nocheck
// Note: requires `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
/**
 * Basic smoke tests for DashboardOverview
 * Run with: npm test (or node --experimental-vm-modules)
 */
import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { DashboardOverview } from "../DashboardOverview";

// Mock useTranslations raw
vi.mock("next-intl", () => ({
  useTranslations: () => {
    const t = (key: string) => key;
    t.raw = (key: string) => {
      if (key === "checklistItems") return [
        { label: "Test item 1", done: true },
        { label: "Test item 2", done: false },
      ];
      if (key === "caseRows") return [
        { label: "Zorgtoeslag", amount: "EUR 1,286" },
      ];
      return [];
    };
    return t;
  },
}));

describe("DashboardOverview", () => {
  it("renders without crashing", () => {
    render(<DashboardOverview />);
  });

  it("renders refund card", () => {
    render(<DashboardOverview />);
    expect(screen.getByText(/refundTitle|Schatting/i)).toBeTruthy();
  });

  it("renders checklist card", () => {
    render(<DashboardOverview />);
    expect(screen.getByText(/checklistTitle|Checklist/i)).toBeTruthy();
  });

  it("renders case card", () => {
    render(<DashboardOverview />);
    expect(screen.getByText(/caseTitle|Casus/i)).toBeTruthy();
  });
});
