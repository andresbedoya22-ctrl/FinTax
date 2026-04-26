import type { BenefitKey, HouseholdSnapshot } from "../types";
import type { ReasonCode } from "../reasons";
import { coerceHouseholdSnapshot } from "./normalize-household";

export function getManualReviewReasons(snapshot: HouseholdSnapshot, benefit: BenefitKey): ReasonCode[] {
  const safeSnapshot = coerceHouseholdSnapshot(snapshot);
  const reasons: ReasonCode[] = [];

  if (benefit === "zorgtoeslag") {
    if (safeSnapshot.specialSituations.foreignResidence || safeSnapshot.specialSituations.foreignWork || safeSnapshot.specialSituations.cakInsured) {
      reasons.push("ZORG_FOREIGN_CASE_MANUAL_REVIEW");
    }
    if (
      safeSnapshot.specialSituations.military ||
      safeSnapshot.specialSituations.detained ||
      safeSnapshot.specialSituations.gemoedsbezwaarde ||
      safeSnapshot.specialSituations.noFixedAddress ||
      safeSnapshot.specialSituations.bijzondereVermogen
    ) {
      reasons.push("ZORG_SPECIAL_STATUS_MANUAL_REVIEW");
    }
  }

  if (benefit === "huurtoeslag") {
    if (
      safeSnapshot.specialSituations.longAbsenceFromHome ||
      safeSnapshot.specialSituations.homeCareSituation ||
      safeSnapshot.specialSituations.bijzonderInkomen ||
      safeSnapshot.specialSituations.bijzondereVermogen
    ) {
      reasons.push("HUUR_SPECIAL_CASE_MANUAL_REVIEW");
    }
  }

  if (benefit === "kindgebondenBudget") {
    if (safeSnapshot.specialSituations.childAbroad) {
      reasons.push("KGB_FOREIGN_CHILD_MANUAL_REVIEW");
    }
    if (safeSnapshot.specialSituations.composedFamily) {
      reasons.push("KGB_COMPOSED_FAMILY_MANUAL_REVIEW");
    }
    if (safeSnapshot.children.some((child) => child.isCoParentingChild)) {
      reasons.push("KGB_CO_PARENTING_MANUAL_REVIEW");
    }
  }

  if (benefit === "kinderopvangtoeslag" && safeSnapshot.specialSituations.childcareAbroad) {
    reasons.push("KOT_FOREIGN_CHILDCARE_MANUAL_REVIEW");
  }

  return reasons;
}
