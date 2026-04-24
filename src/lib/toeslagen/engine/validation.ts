import type { HouseholdSnapshot } from "../types";

export function validateSnapshot(snapshot: HouseholdSnapshot) {
  if (snapshot.year !== 2026) {
    throw new Error(`Unsupported toeslagen year: ${snapshot.year}`);
  }

  if (!snapshot.selectedBenefits.length) {
    throw new Error("At least one selected benefit is required.");
  }
}
