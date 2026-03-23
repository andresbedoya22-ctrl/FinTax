import type { CaseType } from "@/types/database";
import type { EligibilityResults } from "@/lib/utils/eligibility-calculator";

import type { BenefitCardKey, BenefitsFormValues } from "./wizard";

export interface BenefitDocumentSuggestion {
  id: string;
  titleKey: string;
  descriptionKey: string;
  benefitKeys: BenefitCardKey[];
  hintKeys: string[];
}

export function deriveBenefitDocumentSuggestions(
  selectedBenefits: BenefitCardKey[],
  values: BenefitsFormValues,
): BenefitDocumentSuggestion[] {
  const suggestions = new Map<string, BenefitDocumentSuggestion>();

  const addSuggestion = (suggestion: BenefitDocumentSuggestion) => {
    const existing = suggestions.get(suggestion.id);
    if (!existing) {
      suggestions.set(suggestion.id, suggestion);
      return;
    }

    const benefitKeys = [...new Set([...existing.benefitKeys, ...suggestion.benefitKeys])];
    const hintKeys = [...new Set([...existing.hintKeys, ...suggestion.hintKeys])];
    suggestions.set(suggestion.id, { ...existing, benefitKeys, hintKeys });
  };

  for (const benefitKey of selectedBenefits) {
    if (benefitKey === "zorgtoeslag") {
      addSuggestion({
        id: "health-insurance",
        titleKey: "documentReview.documents.healthInsurance.title",
        descriptionKey: "documentReview.documents.healthInsurance.description",
        benefitKeys: [benefitKey],
        hintKeys: values.householdType === "partners" ? ["documentReview.hints.partnerIncome"] : [],
      });
      addSuggestion({
        id: "income-proof",
        titleKey: "documentReview.documents.incomeEvidence.title",
        descriptionKey: "documentReview.documents.incomeEvidence.description",
        benefitKeys: [benefitKey],
        hintKeys: values.householdType === "partners" ? ["documentReview.hints.partnerIncome"] : [],
      });
    }

    if (benefitKey === "huurtoeslag") {
      addSuggestion({
        id: "rental-contract",
        titleKey: "documentReview.documents.rentalContract.title",
        descriptionKey: "documentReview.documents.rentalContract.description",
        benefitKeys: [benefitKey],
        hintKeys: [],
      });
      addSuggestion({
        id: "rent-evidence",
        titleKey: "documentReview.documents.rentEvidence.title",
        descriptionKey: "documentReview.documents.rentEvidence.description",
        benefitKeys: [benefitKey],
        hintKeys: [],
      });
      addSuggestion({
        id: "address-registration",
        titleKey: "documentReview.documents.addressRegistration.title",
        descriptionKey: "documentReview.documents.addressRegistration.description",
        benefitKeys: [benefitKey],
        hintKeys: values.householdType === "partners" ? ["documentReview.hints.householdRegistration"] : [],
      });
    }

    if (benefitKey === "kindgebondenBudget") {
      addSuggestion({
        id: "child-household-evidence",
        titleKey: "documentReview.documents.childHouseholdEvidence.title",
        descriptionKey: "documentReview.documents.childHouseholdEvidence.description",
        benefitKeys: [benefitKey],
        hintKeys: ["documentReview.hints.childRegistration", ...(values.householdType === "partners" ? ["documentReview.hints.householdRegistration"] : [])],
      });
    }

    if (benefitKey === "kinderopvangtoeslag") {
      addSuggestion({
        id: "childcare-invoices",
        titleKey: "documentReview.documents.childcareInvoices.title",
        descriptionKey: "documentReview.documents.childcareInvoices.description",
        benefitKeys: [benefitKey],
        hintKeys: [],
      });
      addSuggestion({
        id: "provider-registration",
        titleKey: "documentReview.documents.providerRegistration.title",
        descriptionKey: "documentReview.documents.providerRegistration.description",
        benefitKeys: [benefitKey],
        hintKeys: [],
      });
      addSuggestion({
        id: "work-status",
        titleKey: "documentReview.documents.workStatusEvidence.title",
        descriptionKey: "documentReview.documents.workStatusEvidence.description",
        benefitKeys: [benefitKey],
        hintKeys: [values.householdType === "partners" ? "documentReview.hints.partnerWorkStatus" : "documentReview.hints.workStatus"],
      });
    }
  }

  return Array.from(suggestions.values());
}

export function getBenefitCaseType(benefitKey: BenefitCardKey): CaseType {
  if (benefitKey === "kindgebondenBudget") {
    return "kindgebonden_budget";
  }

  return benefitKey;
}

export function getPrimaryBenefitCaseType(selectedBenefits: BenefitCardKey[]): CaseType | null {
  const primaryBenefit = selectedBenefits[0];
  return primaryBenefit ? getBenefitCaseType(primaryBenefit) : null;
}

export function buildBenefitsDraftPayload(params: {
  selectedBenefits: BenefitCardKey[];
  values: BenefitsFormValues;
  results: EligibilityResults;
  selectedAmount: number;
}) {
  return {
    intakeType: "benefits",
    currentStep: "document_review",
    selectedBenefits: params.selectedBenefits,
    selectedAnnualEstimate: params.selectedAmount,
    householdType: params.values.householdType,
    childrenUnder18: params.values.childrenUnder18,
    usesChildcare: params.values.usesChildcare,
    benefitsProfile: params.values,
    benefitEstimates: params.selectedBenefits.map((benefitKey) => ({
      benefitKey,
      caseType: getBenefitCaseType(benefitKey),
      estimatedAnnualAmount: params.results[benefitKey].estimatedAnnualAmount,
      eligible: params.results[benefitKey].eligible,
      nextStep: params.results[benefitKey].nextStep,
    })),
    documentSuggestions: deriveBenefitDocumentSuggestions(params.selectedBenefits, params.values).map((suggestion) => ({
      id: suggestion.id,
      benefitKeys: suggestion.benefitKeys,
      hintKeys: suggestion.hintKeys,
    })),
  };
}

export function buildBenefitsCaseDisplayName(selectedBenefits: BenefitCardKey[]): string {
  if (selectedBenefits.length === 0) {
    return "Benefits review";
  }

  if (selectedBenefits.length === 1) {
    return `${selectedBenefits[0]} review`;
  }

  return `Benefits review (${selectedBenefits.length} items)`;
}
