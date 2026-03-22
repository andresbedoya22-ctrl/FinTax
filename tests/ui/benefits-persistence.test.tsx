/// <reference types="vitest/globals" />

import { vi } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => null,
}));

import { loadWizardSnapshot, persistWizardSnapshot, readWizardSnapshot } from "@/lib/wizards/persistence";

describe("benefits wizard persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores a payload snapshot and merges it back into the fallback values", async () => {
    await persistWizardSnapshot({
      storageKey: "benefits-test",
      payload: {
        annualIncome: 34000,
        currentStep: 3,
        selectedBenefits: ["zorgtoeslag"],
      },
    });

    const snapshot = readWizardSnapshot<Record<string, unknown>>("benefits-test");
    const restored = loadWizardSnapshot("benefits-test", {
      annualIncome: 0,
      assets: 0,
    });

    expect(snapshot?.progressStep).toBe(3);
    expect(snapshot?.payload.selectedBenefits).toEqual(["zorgtoeslag"]);
    expect(restored).toEqual({
      annualIncome: 34000,
      assets: 0,
    });
  });
});
