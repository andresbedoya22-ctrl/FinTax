import { describe, expect, it } from "vitest";

import { getDocumentChecklistForBenefit } from "@/lib/toeslagen";

import { createBaseHousehold } from "./helpers";

describe("documents matrix", () => {
  it("returns base documents for every benefit", () => {
    const household = createBaseHousehold();
    for (const benefit of household.selectedBenefits) {
      const docs = getDocumentChecklistForBenefit(household, benefit);
      expect(docs.requiredDocuments.map((doc) => doc.code)).toContain("identity_document");
      expect(docs.requiredDocuments.map((doc) => doc.code)).toContain("bsn_applicant");
      expect(docs.requiredDocuments.map((doc) => doc.code)).toContain("iban");
    }
  });

  it("includes partner documents only when a partner exists", () => {
    const household = createBaseHousehold();
    let docs = getDocumentChecklistForBenefit(household, "zorgtoeslag");
    expect(docs.requiredDocuments.map((doc) => doc.code)).not.toContain("partner_details_if_applicable");

    household.partner = {
      id: "partner",
      birthDate: "1994-03-01",
      countryOfResidence: "NL",
      nlResident: true,
      bsnKnown: true,
      annualIncome: 8000,
      assets1Jan: 1000,
      hasDutchHealthInsurance: true,
      activityStatus: ["employed"],
      sameAddress: true,
      isToeslagPartner: true,
    };
    docs = getDocumentChecklistForBenefit(household, "zorgtoeslag");
    expect(docs.requiredDocuments.map((doc) => doc.code)).toContain("partner_details_if_applicable");
  });

  it("shows childcare documents only for KOT", () => {
    const household = createBaseHousehold();
    const zorgDocs = getDocumentChecklistForBenefit(household, "zorgtoeslag");
    const kotDocs = getDocumentChecklistForBenefit(household, "kinderopvangtoeslag");

    expect(zorgDocs.requiredDocuments.map((doc) => doc.code)).not.toContain("childcare_contract");
    expect(kotDocs.requiredDocuments.map((doc) => doc.code)).toContain("childcare_contract");
  });

  it("shows medebewoner proofs only when residents exist", () => {
    const household = createBaseHousehold();
    let docs = getDocumentChecklistForBenefit(household, "huurtoeslag");
    expect(docs.requiredDocuments.map((doc) => doc.code)).not.toContain("resident_income_assets_proof");

    household.residents = [
      {
        id: "resident-1",
        birthDate: "1988-01-01",
        relationship: "friend",
        sameAddressRegistered: true,
        annualIncome: 22000,
        assets1Jan: 1200,
        isSubtenant: false,
        hasSubrentContract: false,
      },
    ];
    docs = getDocumentChecklistForBenefit(household, "huurtoeslag");
    expect(docs.requiredDocuments.map((doc) => doc.code)).toContain("resident_income_assets_proof");
  });

  it("adds manual review documents for special situations", () => {
    const household = createBaseHousehold();
    household.specialSituations.childcareAbroad = true;

    const docs = getDocumentChecklistForBenefit(household, "kinderopvangtoeslag");

    expect(docs.requiredDocuments.map((doc) => doc.code)).toContain("foreign_childcare_registration");
  });
});
