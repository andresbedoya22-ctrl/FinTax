/// <reference types="vitest/globals" />

import { vi } from "vitest";

vi.mock("@/lib/supabase/client", () => ({
  createClient: () => null,
}));

import { persistWizardSnapshot, readWizardSnapshot } from "@/lib/wizards/persistence";

describe("tax return wizard persistence", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it("stores step metadata, case id and masks nested BSN values", async () => {
    await persistWizardSnapshot({
      storageKey: "tax-return-test",
      caseId: "case-tax-1",
      payload: {
        selectedService: "tax_return_p",
        currentStep: 2,
        draftStatus: "in_progress",
        identity: {
          fullName: "Alex Example",
          bsn: "999999999",
        },
      },
    });

    const snapshot = readWizardSnapshot<Record<string, unknown>>("tax-return-test");
    const identity = snapshot?.payload.identity as Record<string, unknown>;

    expect(snapshot?.progressStep).toBe(2);
    expect(snapshot?.caseId).toBe("case-tax-1");
    expect(snapshot?.draftStatus).toBe("in_progress");
    expect(identity.bsn).toBeNull();
  });
});
