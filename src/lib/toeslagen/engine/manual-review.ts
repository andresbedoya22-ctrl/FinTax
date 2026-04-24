import type { BenefitKey, HouseholdSnapshot } from "../types";
import type { ReasonCode } from "../reasons";

export function getManualReviewReasons(snapshot: HouseholdSnapshot, benefit: BenefitKey): ReasonCode[] {
  const reasons: ReasonCode[] = [];

  if (benefit === "zorgtoeslag") {
    if (snapshot.specialSituations.foreignResidence || snapshot.specialSituations.foreignWork || snapshot.specialSituations.cakInsured) {
      reasons.push("ZORG_FOREIGN_CASE_MANUAL_REVIEW");
    }
    if (
      snapshot.specialSituations.military ||
      snapshot.specialSituations.detained ||
      snapshot.specialSituations.gemoedsbezwaarde ||
      snapshot.specialSituations.noFixedAddress ||
      snapshot.specialSituations.bijzondereVermogen
    ) {
      reasons.push("ZORG_SPECIAL_STATUS_MANUAL_REVIEW");
    }
  }

  if (benefit === "huurtoeslag") {
    if (
      snapshot.specialSituations.longAbsenceFromHome ||
      snapshot.specialSituations.homeCareSituation ||
      snapshot.specialSituations.bijzonderInkomen ||
      snapshot.specialSituations.bijzondereVermogen
    ) {
      reasons.push("HUUR_SPECIAL_CASE_MANUAL_REVIEW");
    }
  }

  if (benefit === "kindgebondenBudget") {
    if (snapshot.specialSituations.childAbroad) {
      reasons.push("KGB_FOREIGN_CHILD_MANUAL_REVIEW");
    }
    if (snapshot.specialSituations.composedFamily) {
      reasons.push("KGB_COMPOSED_FAMILY_MANUAL_REVIEW");
    }
    if (snapshot.children.some((child) => child.isCoParentingChild)) {
      reasons.push("KGB_CO_PARENTING_MANUAL_REVIEW");
    }
  }

  if (benefit === "kinderopvangtoeslag" && snapshot.specialSituations.childcareAbroad) {
    reasons.push("KOT_FOREIGN_CHILDCARE_MANUAL_REVIEW");
  }

  return reasons;
}
