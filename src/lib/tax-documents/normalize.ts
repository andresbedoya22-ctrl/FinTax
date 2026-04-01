import {
  TAX_RETURN_DOCUMENT_FLOW_NORMALIZATION_VERSION,
  TAX_RETURN_DOCUMENT_FLOW_SCHEMA_VERSION,
  type DerivedFacts,
  type TaxReturnIntakePayload,
} from "@/lib/tax-documents/contracts";

export function normalizeTaxReturnIntake(payload: TaxReturnIntakePayload) {
  const employerCount = payload.income.employers.length;
  const requiresOriginIncomeCertificate = !payload.residency.registeredInNlFullYear;

  const residencyPattern: DerivedFacts["residency"]["residency_pattern"] = payload.residency.emigratedOrDeregistered
    ? "deregistered"
    : payload.residency.registeredInNlFullYear
      ? "full_year_nl"
      : "partial_year_nl";

  const derivedFacts: DerivedFacts = {
    filing: {
      tax_year: payload.filing.taxYear,
      route: payload.filing.filingRoute,
      first_declaration_with_fintax: payload.filing.firstDeclarationWithFinTax,
      origin_country_code: payload.filing.originCountryCode,
      current_country_of_residence: payload.filing.currentCountryOfResidence,
    },
    residency: {
      was_registered_full_year_in_nl: payload.residency.registeredInNlFullYear,
      first_registration_in_tax_year: payload.residency.firstRegistrationInNlInTaxYear,
      has_registration_interruption: payload.residency.hadRegistrationInterruption,
      interruption_count: payload.residency.registrationInterruptionPeriods.length,
      emigrated_or_deregistered: payload.residency.emigratedOrDeregistered,
      requires_origin_income_certificate: requiresOriginIncomeCertificate,
      residency_pattern: residencyPattern,
    },
    household: {
      has_fiscal_partner: payload.household.hasFiscalPartner,
      has_children_registered_same_address: payload.household.hasChildrenRegisteredSameAddress,
      children_count_same_address: payload.household.childrenCountSameAddress,
    },
    income: {
      employer_count: employerCount,
      has_employment: employerCount > 0,
      has_uwv: payload.income.hasUwvIncome,
      has_transitievergoeding: payload.income.hasTransitievergoeding,
      has_zzp: payload.income.hasZzpIncome,
      zzp_hours_over_1225: payload.income.zzpHoursOver1225,
      has_other_foreign_income: payload.income.hasOtherForeignIncome,
      has_provisional_assessment: payload.income.hasProvisionalAssessment,
    },
    housing: {
      owns_home: payload.housing.ownsHome,
      has_mortgage: payload.housing.hasMortgage,
      has_svn_loan: payload.housing.hasSvnOrStarterslening,
    },
    debts: {
      has_consumer_loans: payload.debts.hasConsumerLoans,
    },
    assets: {
      has_nl_accounts: payload.assets.hasNlBankAccounts,
      has_foreign_accounts: payload.assets.hasForeignBankAccounts,
      has_crypto: payload.assets.hasCrypto,
    },
    deductions: {
      has_medical_costs: payload.deductions.hasUnreimbursedDeductibleMedicalCosts,
    },
  };

  return {
    schemaVersion: payload.schemaVersion ?? TAX_RETURN_DOCUMENT_FLOW_SCHEMA_VERSION,
    normalizationVersion: TAX_RETURN_DOCUMENT_FLOW_NORMALIZATION_VERSION,
    payload,
    derivedFacts,
    caseSummary: {
      tax_year: payload.filing.taxYear,
      origin_country_code: payload.filing.originCountryCode,
      residency_pattern: residencyPattern,
      filing_route: payload.filing.filingRoute,
      wizard_data: buildLegacyWizardSummary(payload, derivedFacts),
    },
  };
}

export function buildLegacyWizardSummary(payload: TaxReturnIntakePayload, derivedFacts: DerivedFacts) {
  return {
    taxYear: payload.filing.taxYear,
    originCountryCode: payload.filing.originCountryCode,
    filingRoute: payload.filing.filingRoute,
    residencyPattern: derivedFacts.residency.residency_pattern,
    employerCount: derivedFacts.income.employer_count,
    hasUwvIncome: payload.income.hasUwvIncome,
    hasZzpIncome: payload.income.hasZzpIncome,
    hasMortgage: payload.housing.hasMortgage,
    hasForeignBankAccounts: payload.assets.hasForeignBankAccounts,
    hasCrypto: payload.assets.hasCrypto,
    hasMedicalCosts: payload.deductions.hasUnreimbursedDeductibleMedicalCosts,
    summary: payload.summary,
    documentIntakeCaptured: true,
  };
}
