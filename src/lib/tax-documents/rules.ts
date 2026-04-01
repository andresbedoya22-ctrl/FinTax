import type { CaseType, RequirementStatus } from "@/types/database";
import {
  TAX_RETURN_DOCUMENT_FLOW_RULESET_VERSION,
  type DerivedFacts,
  type RequirementDraft,
  type RequirementTemplateSeed,
  type TaxReturnIntakePayload,
} from "@/lib/tax-documents/contracts";
import { getRequirementHelpContent } from "@/lib/tax-documents/help-content";

type RuleContext = {
  caseType: CaseType;
  intake: TaxReturnIntakePayload;
  facts: DerivedFacts;
};

interface RequirementBlueprint extends RequirementTemplateSeed {
  conditionKey: string;
  sortOrder: number;
  cardinality: (context: RuleContext) => Array<{ instanceKey: string; titleSuffix?: string; answerValue?: Record<string, unknown> }>;
  applies: (context: RuleContext) => boolean;
  applicabilityReason: (context: RuleContext, item: { instanceKey: string }) => Record<string, unknown>;
}

const DOCUMENT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"];
const OFFICE_MIME_TYPES = ["application/pdf", "text/csv", "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"];

const sharedRequirementBlueprints: Array<Omit<RequirementBlueprint, "caseType">> = [
  {
    code: "passport_or_id_document",
    section: "identity",
    requirementType: "document",
    title: "Passport or ID document",
    description: "Valid proof of identity for the taxpayer.",
    acceptedMimeTypes: DOCUMENT_MIME_TYPES,
    maxFileSizeBytes: 10 * 1024 * 1024,
    minFiles: 1,
    maxFiles: 1,
    isBlocking: true,
    conditionKey: "Q-ID-001",
    sortOrder: 10,
    applies: () => true,
    cardinality: () => [{ instanceKey: "default" }],
    applicabilityReason: () => ({ rule: "Q-ID-001" }),
  },
  {
    code: "reestablishment_date_in_nl",
    section: "residency",
    requirementType: "date",
    title: "Date of (re)establishment in NL",
    description: "Exact date the client first registered or re-established in the Netherlands.",
    acceptedMimeTypes: [],
    maxFileSizeBytes: 0,
    minFiles: 0,
    maxFiles: 0,
    isBlocking: true,
    conditionKey: "R-REG-001",
    sortOrder: 20,
    applies: ({ intake }) =>
      intake.filing.firstDeclarationWithFinTax ||
      intake.residency.firstRegistrationInNlInTaxYear ||
      intake.residency.hadRegistrationInterruption,
    cardinality: ({ intake }) => [
      {
        instanceKey: "default",
        answerValue: intake.residency.reestablishmentDateInNl ? { value: intake.residency.reestablishmentDateInNl } : {},
      },
    ],
    applicabilityReason: () => ({ rule: "R-REG-001" }),
  },
  {
    code: "children_same_address_registration_date",
    section: "household",
    requirementType: "date",
    title: "Date children registered at same address",
    description: "Required when children were registered at the same address.",
    acceptedMimeTypes: [],
    maxFileSizeBytes: 0,
    minFiles: 0,
    maxFiles: 0,
    isBlocking: true,
    conditionKey: "R-REG-002",
    sortOrder: 30,
    applies: ({ intake }) => intake.household.hasChildrenRegisteredSameAddress,
    cardinality: ({ intake }) => [
      {
        instanceKey: "default",
        answerValue: intake.household.childrenRegistrationSameAddressDate
          ? { value: intake.household.childrenRegistrationSameAddressDate }
          : {},
      },
    ],
    applicabilityReason: () => ({ rule: "R-REG-002" }),
  },
  {
    code: "emigration_or_deregistration_date",
    section: "residency",
    requirementType: "date",
    title: "Date of emigration or deregistration",
    description: "Exact date the client emigrated or stopped being registered in the Netherlands.",
    acceptedMimeTypes: [],
    maxFileSizeBytes: 0,
    minFiles: 0,
    maxFiles: 0,
    isBlocking: true,
    conditionKey: "R-REG-003",
    sortOrder: 40,
    applies: ({ intake }) => intake.residency.emigratedOrDeregistered,
    cardinality: ({ intake }) => [
      {
        instanceKey: "default",
        answerValue: intake.residency.emigrationOrDeregistrationDate
          ? { value: intake.residency.emigrationOrDeregistrationDate }
          : {},
      },
    ],
    applicabilityReason: () => ({ rule: "R-REG-003" }),
  },
  {
    code: "proof_of_nl_registration_periods",
    section: "residency",
    requirementType: "document",
    title: "Proof of Dutch registration periods",
    description: "BRP extract, municipality registration proof, or deregistration confirmation.",
    acceptedMimeTypes: DOCUMENT_MIME_TYPES,
    maxFileSizeBytes: 10 * 1024 * 1024,
    minFiles: 1,
    maxFiles: 3,
    isBlocking: true,
    conditionKey: "Q-REG-001",
    sortOrder: 50,
    applies: ({ facts }) =>
      !facts.residency.was_registered_full_year_in_nl ||
      facts.residency.has_registration_interruption ||
      facts.residency.emigrated_or_deregistered,
    cardinality: () => [{ instanceKey: "default" }],
    applicabilityReason: () => ({ rule: "Q-REG-001" }),
  },
  {
    code: "origin_country_income_certificate",
    section: "residency",
    requirementType: "document",
    title: "Origin-country income certificate",
    description: "Official income certificate or equivalent statement from the origin country.",
    acceptedMimeTypes: DOCUMENT_MIME_TYPES,
    maxFileSizeBytes: 10 * 1024 * 1024,
    minFiles: 1,
    maxFiles: 3,
    isBlocking: true,
    conditionKey: "Q-REG-002",
    sortOrder: 60,
    applies: ({ facts }) => facts.residency.requires_origin_income_certificate,
    cardinality: () => [{ instanceKey: "default" }],
    applicabilityReason: ({ facts }) => ({ rule: "Q-REG-002", originCountryCode: facts.filing.origin_country_code }),
  },
  {
    code: "voorlopige_aanslag",
    section: "income",
    requirementType: "document",
    title: "Voorlopige aanslag",
    description: "Provisional assessment or annual provisional assessment overview.",
    acceptedMimeTypes: DOCUMENT_MIME_TYPES,
    maxFileSizeBytes: 10 * 1024 * 1024,
    minFiles: 1,
    maxFiles: 2,
    isBlocking: false,
    conditionKey: "Q-INC-000",
    sortOrder: 70,
    applies: ({ facts }) => facts.income.has_provisional_assessment,
    cardinality: () => [{ instanceKey: "default" }],
    applicabilityReason: () => ({ rule: "Q-INC-000" }),
  },
  {
    code: "jaaropgaaf_employer",
    section: "income",
    requirementType: "document",
    title: "Employer jaaropgave",
    description: "Official annual income statement per employer.",
    acceptedMimeTypes: DOCUMENT_MIME_TYPES,
    maxFileSizeBytes: 10 * 1024 * 1024,
    minFiles: 1,
    maxFiles: 1,
    isBlocking: true,
    conditionKey: "Q-INC-001",
    sortOrder: 80,
    applies: ({ facts }) => facts.income.has_employment,
    cardinality: ({ intake }) =>
      intake.income.employers.map((employer, index) => ({
        instanceKey: employer.id?.trim() || `employer-${index + 1}`,
        titleSuffix: employer.name,
      })),
    applicabilityReason: (_, item) => ({ rule: "Q-INC-001", instanceKey: item.instanceKey }),
  },
  {
    code: "uwv_statement",
    section: "income",
    requirementType: "document",
    title: "UWV annual statement",
    description: "Annual statement for UWV income.",
    acceptedMimeTypes: DOCUMENT_MIME_TYPES,
    maxFileSizeBytes: 10 * 1024 * 1024,
    minFiles: 1,
    maxFiles: 1,
    isBlocking: true,
    conditionKey: "Q-INC-002",
    sortOrder: 90,
    applies: ({ facts }) => facts.income.has_uwv,
    cardinality: () => [{ instanceKey: "default" }],
    applicabilityReason: () => ({ rule: "Q-INC-002" }),
  },
  {
    code: "transitievergoeding_statement",
    section: "income",
    requirementType: "document",
    title: "Transitievergoeding statement",
    description: "Official statement showing transition compensation payment.",
    acceptedMimeTypes: DOCUMENT_MIME_TYPES,
    maxFileSizeBytes: 10 * 1024 * 1024,
    minFiles: 1,
    maxFiles: 1,
    isBlocking: true,
    conditionKey: "Q-INC-003",
    sortOrder: 100,
    applies: ({ facts }) => facts.income.has_transitievergoeding,
    cardinality: () => [{ instanceKey: "default" }],
    applicabilityReason: () => ({ rule: "Q-INC-003" }),
  },
  {
    code: "zzp_profit_documents",
    section: "income",
    requirementType: "document",
    title: "ZZP annual results",
    description: "Annual accounts, bookkeeping export, or VAT summaries when relevant.",
    acceptedMimeTypes: OFFICE_MIME_TYPES,
    maxFileSizeBytes: 25 * 1024 * 1024,
    minFiles: 1,
    maxFiles: 5,
    isBlocking: true,
    conditionKey: "Q-INC-004",
    sortOrder: 110,
    applies: ({ facts }) => facts.income.has_zzp,
    cardinality: () => [{ instanceKey: "default" }],
    applicabilityReason: () => ({ rule: "Q-INC-004" }),
  },
  {
    code: "zzp_1225_hours_support",
    section: "income",
    requirementType: "document",
    title: "Support for 1225-hour criterion",
    description: "Hours log or other evidence supporting the 1225-hour criterion.",
    acceptedMimeTypes: OFFICE_MIME_TYPES,
    maxFileSizeBytes: 25 * 1024 * 1024,
    minFiles: 1,
    maxFiles: 5,
    isBlocking: true,
    conditionKey: "Q-INC-005",
    sortOrder: 120,
    applies: ({ facts }) => facts.income.has_zzp && facts.income.zzp_hours_over_1225,
    cardinality: () => [{ instanceKey: "default" }],
    applicabilityReason: () => ({ rule: "Q-INC-005" }),
  },
  {
    code: "mortgage_jaaroverzicht",
    section: "housing",
    requirementType: "document",
    title: "Mortgage jaaroverzicht",
    description: "Annual statement from the mortgage lender.",
    acceptedMimeTypes: DOCUMENT_MIME_TYPES,
    maxFileSizeBytes: 10 * 1024 * 1024,
    minFiles: 1,
    maxFiles: 2,
    isBlocking: true,
    conditionKey: "Q-HOU-001",
    sortOrder: 130,
    applies: ({ facts }) => facts.housing.has_mortgage,
    cardinality: () => [{ instanceKey: "default" }],
    applicabilityReason: () => ({ rule: "Q-HOU-001" }),
  },
  {
    code: "svn_starterslening_jaaroverzicht",
    section: "housing",
    requirementType: "document",
    title: "SVN or starterslening jaaroverzicht",
    description: "Annual statement for SVN or starterslening financing.",
    acceptedMimeTypes: DOCUMENT_MIME_TYPES,
    maxFileSizeBytes: 10 * 1024 * 1024,
    minFiles: 1,
    maxFiles: 2,
    isBlocking: true,
    conditionKey: "Q-HOU-002",
    sortOrder: 140,
    applies: ({ facts }) => facts.housing.has_svn_loan,
    cardinality: () => [{ instanceKey: "default" }],
    applicabilityReason: () => ({ rule: "Q-HOU-002" }),
  },
  {
    code: "consumer_loan_statements",
    section: "debts",
    requirementType: "document",
    title: "Consumer loan statements",
    description: "Official year-end or annual statements for consumer loans.",
    acceptedMimeTypes: DOCUMENT_MIME_TYPES,
    maxFileSizeBytes: 10 * 1024 * 1024,
    minFiles: 1,
    maxFiles: 5,
    isBlocking: false,
    conditionKey: "Q-DEBT-001",
    sortOrder: 150,
    applies: ({ facts }) => facts.debts.has_consumer_loans,
    cardinality: () => [{ instanceKey: "default" }],
    applicabilityReason: () => ({ rule: "Q-DEBT-001" }),
  },
  {
    code: "nl_bank_and_savings_statements_summary",
    section: "assets",
    requirementType: "document",
    title: "Dutch bank and savings annual overviews",
    description: "Year-end or annual overviews for Dutch bank and savings accounts.",
    acceptedMimeTypes: DOCUMENT_MIME_TYPES,
    maxFileSizeBytes: 10 * 1024 * 1024,
    minFiles: 1,
    maxFiles: 10,
    isBlocking: false,
    conditionKey: "Q-ASSET-001",
    sortOrder: 160,
    applies: ({ facts }) => facts.assets.has_nl_accounts,
    cardinality: () => [{ instanceKey: "default" }],
    applicabilityReason: () => ({ rule: "Q-ASSET-001" }),
  },
  {
    code: "foreign_bank_and_savings_statements_summary",
    section: "assets",
    requirementType: "document",
    title: "Foreign bank and savings annual overviews",
    description: "Year-end or annual overviews for foreign bank and savings accounts.",
    acceptedMimeTypes: DOCUMENT_MIME_TYPES,
    maxFileSizeBytes: 10 * 1024 * 1024,
    minFiles: 1,
    maxFiles: 10,
    isBlocking: false,
    conditionKey: "Q-ASSET-002",
    sortOrder: 170,
    applies: ({ facts }) => facts.assets.has_foreign_accounts,
    cardinality: () => [{ instanceKey: "default" }],
    applicabilityReason: () => ({ rule: "Q-ASSET-002" }),
  },
  {
    code: "crypto_value_proof_open_close_year",
    section: "assets",
    requirementType: "document",
    title: "Crypto value proof at start and end of year",
    description: "Proof of crypto value on 1 January and 31 December of the tax year.",
    acceptedMimeTypes: OFFICE_MIME_TYPES,
    maxFileSizeBytes: 25 * 1024 * 1024,
    minFiles: 2,
    maxFiles: 10,
    isBlocking: false,
    conditionKey: "Q-ASSET-003",
    sortOrder: 180,
    applies: ({ facts }) => facts.assets.has_crypto,
    cardinality: () => [{ instanceKey: "default" }],
    applicabilityReason: ({ facts }) => ({ rule: "Q-ASSET-003", taxYear: facts.filing.tax_year }),
  },
  {
    code: "medical_costs_proof_unreimbursed",
    section: "deductions",
    requirementType: "document",
    title: "Proof of unreimbursed medical costs",
    description: "Evidence for deductible medical costs that were not reimbursed.",
    acceptedMimeTypes: DOCUMENT_MIME_TYPES,
    maxFileSizeBytes: 10 * 1024 * 1024,
    minFiles: 1,
    maxFiles: 20,
    isBlocking: false,
    conditionKey: "Q-DED-001",
    sortOrder: 190,
    applies: ({ facts }) => facts.deductions.has_medical_costs,
    cardinality: () => [{ instanceKey: "default" }],
    applicabilityReason: () => ({ rule: "Q-DED-001" }),
  },
];

export const requirementBlueprints: RequirementBlueprint[] = sharedRequirementBlueprints.flatMap((blueprint) =>
  (["tax_return_p", "tax_return_m", "tax_return_c", "tax_return_w"] as const).map((caseType) => ({
    ...blueprint,
    caseType,
  })),
);

export function buildRequirementTemplatesForCaseType(caseType: CaseType): RequirementTemplateSeed[] {
  return requirementBlueprints.filter((item) => item.caseType === caseType).map(stripBlueprintToTemplateSeed);
}

function stripBlueprintToTemplateSeed(blueprint: RequirementBlueprint): RequirementTemplateSeed {
  return {
    code: blueprint.code,
    caseType: blueprint.caseType,
    section: blueprint.section,
    requirementType: blueprint.requirementType,
    title: blueprint.title,
    description: blueprint.description,
    acceptedMimeTypes: blueprint.acceptedMimeTypes,
    maxFileSizeBytes: blueprint.maxFileSizeBytes,
    minFiles: blueprint.minFiles,
    maxFiles: blueprint.maxFiles,
    isBlocking: blueprint.isBlocking,
    metadata: blueprint.metadata,
  };
}

export function buildRuleSeedRows(caseType: CaseType) {
  return requirementBlueprints
    .filter((blueprint) => blueprint.caseType === caseType)
    .map((blueprint) => ({
      requirement_code: blueprint.code,
      condition_key: blueprint.conditionKey,
      condition_payload: {
        version: TAX_RETURN_DOCUMENT_FLOW_RULESET_VERSION,
        section: blueprint.section,
        requirementType: blueprint.requirementType,
      },
      sort_order: blueprint.sortOrder,
    }));
}

export function generateRequirementDrafts(input: {
  caseType: CaseType;
  intake: TaxReturnIntakePayload;
  facts: DerivedFacts;
}): RequirementDraft[] {
  const context: RuleContext = {
    caseType: input.caseType,
    intake: input.intake,
    facts: input.facts,
  };

  return requirementBlueprints
    .filter((blueprint) => blueprint.caseType === input.caseType)
    .filter((blueprint) => blueprint.applies(context))
    .flatMap((blueprint) =>
      blueprint.cardinality(context).map((cardinalityItem, index) => {
        const helpContent = getRequirementHelpContent(blueprint.code, {
          taxYear: input.facts.filing.tax_year,
          originCountryCode: input.facts.filing.origin_country_code,
          employerName: cardinalityItem.titleSuffix,
        });

        return {
          requirementCode: blueprint.code,
          instanceKey: cardinalityItem.instanceKey,
          section: blueprint.section,
          requirementType: blueprint.requirementType,
          title: cardinalityItem.titleSuffix ? `${blueprint.title}: ${cardinalityItem.titleSuffix}` : blueprint.title,
          description: blueprint.description,
          helpContent: helpContent as unknown as Record<string, unknown>,
          isBlocking: blueprint.isBlocking,
          isDocumentRequired: blueprint.requirementType === "document",
          minFiles: blueprint.minFiles,
          maxFiles: blueprint.maxFiles,
          acceptedMimeTypes: blueprint.acceptedMimeTypes,
          maxFileSizeBytes: blueprint.maxFileSizeBytes,
          sortOrder: blueprint.sortOrder + index,
          applicabilityReason: blueprint.applicabilityReason(context, { instanceKey: cardinalityItem.instanceKey }),
          answerValue: cardinalityItem.answerValue ?? {},
        } satisfies RequirementDraft;
      }),
    )
    .sort((left, right) => left.sortOrder - right.sortOrder || left.title.localeCompare(right.title));
}

export function deriveRequirementStatusFromDraft(
  draft: RequirementDraft,
  existingStatus?: RequirementStatus,
  previousAnswerValue?: Record<string, unknown>,
) {
  const answerChanged = JSON.stringify(previousAnswerValue ?? {}) !== JSON.stringify(draft.answerValue ?? {});

  if (!draft.isDocumentRequired) {
    const hasAnswer = Object.keys(draft.answerValue ?? {}).length > 0;
    if (existingStatus === "approved" && !answerChanged) return "approved" satisfies RequirementStatus;
    if (existingStatus === "waived") return "waived" satisfies RequirementStatus;
    return hasAnswer ? ("uploaded" satisfies RequirementStatus) : ("pending" satisfies RequirementStatus);
  }

  if (existingStatus === "approved" || existingStatus === "waived" || existingStatus === "uploaded") {
    return existingStatus;
  }

  return "pending" satisfies RequirementStatus;
}
