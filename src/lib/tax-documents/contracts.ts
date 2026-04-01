import { z } from "zod";

import type { CaseType, RequirementStatus, RequirementType } from "@/types/database";

export const TAX_RETURN_DOCUMENT_FLOW_SCHEMA_VERSION = "2026-04-01";
export const TAX_RETURN_DOCUMENT_FLOW_NORMALIZATION_VERSION = "2026-04-01";
export const TAX_RETURN_DOCUMENT_FLOW_RULESET_VERSION = "2026-04-01";

const isoDateSchema = z
  .string()
  .trim()
  .regex(/^\d{4}-\d{2}-\d{2}$/)
  .optional()
  .nullable();

const countryCodeSchema = z.string().trim().length(2).transform((value) => value.toUpperCase());

const employerSchema = z.object({
  id: z.string().trim().min(1).optional(),
  name: z.string().trim().min(1),
});

const interruptionPeriodSchema = z.object({
  startDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
  endDate: z.string().trim().regex(/^\d{4}-\d{2}-\d{2}$/),
});

const taxSummarySchema = z.object({
  box1Income: z.number().finite().min(0).default(0),
  box3Assets: z.number().finite().min(0).default(0),
  credits: z.number().finite().min(0).default(0),
  netResult: z.number().finite().default(0),
});

export const taxReturnIntakeSchema = z.object({
  schemaVersion: z.string().trim().optional(),
  caseType: z.enum(["tax_return_p", "tax_return_m", "tax_return_c", "tax_return_w"] satisfies [CaseType, ...CaseType[]]).optional(),
  filing: z.object({
    taxYear: z.number().int().min(2020).max(2100),
    originCountryCode: countryCodeSchema,
    currentCountryOfResidence: countryCodeSchema.default("NL"),
    firstDeclarationWithFinTax: z.boolean().default(false),
    filingRoute: z.enum(["standard", "migration", "non_resident", "self_employed"]).default("standard"),
  }),
  residency: z.object({
    registeredInNlFullYear: z.boolean().default(true),
    firstRegistrationInNlInTaxYear: z.boolean().default(false),
    firstRegistrationDateInNl: isoDateSchema,
    reestablishmentDateInNl: isoDateSchema,
    hadRegistrationInterruption: z.boolean().default(false),
    registrationInterruptionPeriods: z.array(interruptionPeriodSchema).default([]),
    emigratedOrDeregistered: z.boolean().default(false),
    emigrationOrDeregistrationDate: isoDateSchema,
  }),
  household: z.object({
    hasFiscalPartner: z.boolean().default(false),
    hasChildrenRegisteredSameAddress: z.boolean().default(false),
    childrenCountSameAddress: z.number().int().min(0).max(20).default(0),
    childrenRegistrationSameAddressDate: isoDateSchema,
  }),
  income: z.object({
    employers: z.array(employerSchema).default([]),
    hasUwvIncome: z.boolean().default(false),
    hasTransitievergoeding: z.boolean().default(false),
    hasZzpIncome: z.boolean().default(false),
    zzpHoursOver1225: z.boolean().default(false),
    hasOtherForeignIncome: z.boolean().default(false),
    hasProvisionalAssessment: z.boolean().default(false),
  }),
  housing: z.object({
    ownsHome: z.boolean().default(false),
    hasMortgage: z.boolean().default(false),
    hasSvnOrStarterslening: z.boolean().default(false),
  }),
  debts: z.object({
    hasConsumerLoans: z.boolean().default(false),
  }),
  assets: z.object({
    hasNlBankAccounts: z.boolean().default(false),
    hasForeignBankAccounts: z.boolean().default(false),
    hasCrypto: z.boolean().default(false),
  }),
  deductions: z.object({
    hasUnreimbursedDeductibleMedicalCosts: z.boolean().default(false),
  }),
  summary: taxSummarySchema.default({
    box1Income: 0,
    box3Assets: 0,
    credits: 0,
    netResult: 0,
  }),
});

export const caseDraftSchema = z.object({
  caseType: z.enum(["tax_return_p", "tax_return_m", "tax_return_c", "tax_return_w"] satisfies [CaseType, ...CaseType[]]),
  fullName: z.string().trim().min(2),
  bsn: z.string().trim().min(4),
  taxYear: z.number().int().min(2020).max(2100),
  originCountryCode: countryCodeSchema.optional(),
});

export const uploadSessionCreateSchema = z.object({
  requirementId: z.string().uuid(),
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.string().trim().min(1).max(255),
  fileSizeBytes: z.number().int().positive().max(26_214_400),
  replacesDocumentId: z.string().uuid().optional(),
});

export const finalizeUploadSchema = z.object({
  uploadSessionId: z.string().uuid(),
  checksumSha256: z
    .string()
    .trim()
    .regex(/^[a-fA-F0-9]{64}$/)
    .optional(),
});

export const requirementAvailabilitySchema = z.object({
  note: z.string().trim().min(3).max(2000),
});

export const requirementNoteSchema = z.object({
  note: z.string().trim().min(1).max(2000),
});

export const adminRequirementReviewSchema = z.object({
  status: z.enum(["approved", "rejected", "waived"] satisfies [RequirementStatus, ...RequirementStatus[]]),
  reviewNotes: z.string().trim().max(2000).optional(),
  rejectionReason: z.string().trim().max(2000).optional(),
});

export const adminDocumentReviewSchema = z.object({
  status: z.enum(["approved", "rejected", "under_review"] satisfies ["approved", "rejected", "under_review"]),
  reviewNotes: z.string().trim().max(2000).optional(),
});

export type TaxReturnIntakePayload = z.infer<typeof taxReturnIntakeSchema>;
export type TaxReturnEmployer = TaxReturnIntakePayload["income"]["employers"][number];

export interface DerivedFacts {
  filing: {
    tax_year: number;
    route: string;
    first_declaration_with_fintax: boolean;
    origin_country_code: string;
    current_country_of_residence: string;
  };
  residency: {
    was_registered_full_year_in_nl: boolean;
    first_registration_in_tax_year: boolean;
    has_registration_interruption: boolean;
    interruption_count: number;
    emigrated_or_deregistered: boolean;
    requires_origin_income_certificate: boolean;
    residency_pattern: "full_year_nl" | "partial_year_nl" | "deregistered";
  };
  household: {
    has_fiscal_partner: boolean;
    has_children_registered_same_address: boolean;
    children_count_same_address: number;
  };
  income: {
    employer_count: number;
    has_employment: boolean;
    has_uwv: boolean;
    has_transitievergoeding: boolean;
    has_zzp: boolean;
    zzp_hours_over_1225: boolean;
    has_other_foreign_income: boolean;
    has_provisional_assessment: boolean;
  };
  housing: {
    owns_home: boolean;
    has_mortgage: boolean;
    has_svn_loan: boolean;
  };
  debts: {
    has_consumer_loans: boolean;
  };
  assets: {
    has_nl_accounts: boolean;
    has_foreign_accounts: boolean;
    has_crypto: boolean;
  };
  deductions: {
    has_medical_costs: boolean;
  };
}

export interface RequirementDraft {
  requirementCode: string;
  instanceKey: string;
  section: string;
  requirementType: RequirementType;
  title: string;
  description: string;
  helpContent: Record<string, unknown>;
  isBlocking: boolean;
  isDocumentRequired: boolean;
  minFiles: number;
  maxFiles: number | null;
  acceptedMimeTypes: string[];
  maxFileSizeBytes: number;
  sortOrder: number;
  applicabilityReason: Record<string, unknown>;
  answerValue: Record<string, unknown>;
}

export interface RequirementTemplateSeed {
  code: string;
  caseType: CaseType;
  section: string;
  requirementType: RequirementType;
  title: string;
  description: string;
  acceptedMimeTypes: string[];
  maxFileSizeBytes: number;
  minFiles: number;
  maxFiles: number | null;
  isBlocking: boolean;
  metadata?: Record<string, unknown>;
}
