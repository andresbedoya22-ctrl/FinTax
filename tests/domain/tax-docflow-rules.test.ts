import { describe, expect, it } from "vitest";

import type { Case } from "@/types/database";
import { createDefaultTaxReturnIntake } from "@/hooks/useTaxReturnDocFlow";
import { taxReturnIntakeSchema } from "@/lib/tax-documents/contracts";
import { normalizeTaxReturnIntake } from "@/lib/tax-documents/normalize";
import {
  buildTaxSummary,
  deriveCaseStatusFromRequirements,
  isDocumentReviewable,
  summarizeRequirementProgress,
} from "@/lib/tax-documents/service";
import {
  deriveRequirementStatusFromDraft,
  generateRequirementDrafts,
} from "@/lib/tax-documents/rules";

function createIntake(overrides: Record<string, unknown> = {}) {
  return taxReturnIntakeSchema.parse({
    filing: {
      taxYear: 2025,
      originCountryCode: "RO",
      currentCountryOfResidence: "NL",
      firstDeclarationWithFinTax: false,
      filingRoute: "standard",
    },
    residency: {
      registeredInNlFullYear: true,
      firstRegistrationInNlInTaxYear: false,
      firstRegistrationDateInNl: null,
      reestablishmentDateInNl: null,
      hadRegistrationInterruption: false,
      registrationInterruptionPeriods: [],
      emigratedOrDeregistered: false,
      emigrationOrDeregistrationDate: null,
    },
    household: {
      hasFiscalPartner: false,
      hasChildrenRegisteredSameAddress: false,
      childrenCountSameAddress: 0,
      childrenRegistrationSameAddressDate: null,
    },
    income: {
      employers: [],
      hasUwvIncome: false,
      hasTransitievergoeding: false,
      hasZzpIncome: false,
      zzpHoursOver1225: false,
      hasOtherForeignIncome: false,
      hasProvisionalAssessment: false,
    },
    housing: {
      ownsHome: false,
      hasMortgage: false,
      hasSvnOrStarterslening: false,
    },
    debts: {
      hasConsumerLoans: false,
    },
    assets: {
      hasNlBankAccounts: false,
      hasForeignBankAccounts: false,
      hasCrypto: false,
    },
    deductions: {
      hasUnreimbursedDeductibleMedicalCosts: false,
    },
    summary: {
      box1Income: 51000,
      box3Assets: 9000,
      credits: 1200,
      netResult: 1800,
    },
    ...overrides,
  });
}

function createCase(overrides: Partial<Case> = {}): Case {
  return {
    id: "case-1",
    user_id: "user-1",
    case_type: "tax_return_p",
    status: "draft",
    display_name: "Tax return 2025",
    tax_year: 2025,
    origin_country_code: "RO",
    residency_pattern: "full_year_nl",
    filing_route: "standard",
    deadline: null,
    estimated_refund: 1800,
    actual_refund: null,
    wizard_data: {},
    wizard_completed: false,
    machtiging_status: "requested",
    machtiging_code: null,
    stripe_payment_id: null,
    assigned_admin: null,
    notes_internal: null,
    created_at: "2026-01-01T00:00:00.000Z",
    updated_at: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("tax return document flow rules", () => {
  it("preserves tax_year and origin_country_code as derived facts", () => {
    const normalized = normalizeTaxReturnIntake(createIntake());

    expect(normalized.caseSummary.tax_year).toBe(2025);
    expect(normalized.caseSummary.origin_country_code).toBe("RO");
    expect(normalized.derivedFacts.filing.tax_year).toBe(2025);
    expect(normalized.derivedFacts.filing.origin_country_code).toBe("RO");
  });

  it("generates origin-country income certificate for partial NL registration", () => {
    const intake = createIntake({
      residency: {
        registeredInNlFullYear: false,
        firstRegistrationInNlInTaxYear: true,
        firstRegistrationDateInNl: "2025-03-01",
        reestablishmentDateInNl: "2025-03-01",
        hadRegistrationInterruption: false,
        registrationInterruptionPeriods: [],
        emigratedOrDeregistered: false,
        emigrationOrDeregistrationDate: null,
      },
    });

    const normalized = normalizeTaxReturnIntake(intake);
    const drafts = generateRequirementDrafts({
      caseType: "tax_return_m",
      intake,
      facts: normalized.derivedFacts,
    });

    expect(normalized.derivedFacts.residency.requires_origin_income_certificate).toBe(true);
    expect(
      drafts.some((item) => item.requirementCode === "origin_country_income_certificate")
    ).toBe(true);
    expect(drafts.some((item) => item.requirementCode === "proof_of_nl_registration_periods")).toBe(
      true
    );
  });

  it("creates one employer requirement per employer", () => {
    const intake = createIntake({
      income: {
        employers: [
          { id: "acme", name: "ACME BV" },
          { id: "globex", name: "Globex BV" },
        ],
        hasUwvIncome: false,
        hasTransitievergoeding: false,
        hasZzpIncome: false,
        zzpHoursOver1225: false,
        hasOtherForeignIncome: false,
        hasProvisionalAssessment: false,
      },
    });

    const normalized = normalizeTaxReturnIntake(intake);
    const employerDrafts = generateRequirementDrafts({
      caseType: "tax_return_p",
      intake,
      facts: normalized.derivedFacts,
    }).filter((item) => item.requirementCode === "jaaropgaaf_employer");

    expect(employerDrafts).toHaveLength(2);
    expect(employerDrafts.map((item) => item.instanceKey)).toEqual(["acme", "globex"]);
  });

  it("supports employment with UWV and ZZP combinations", () => {
    const intake = createIntake({
      income: {
        employers: [{ id: "acme", name: "ACME BV" }],
        hasUwvIncome: true,
        hasTransitievergoeding: false,
        hasZzpIncome: true,
        zzpHoursOver1225: true,
        hasOtherForeignIncome: false,
        hasProvisionalAssessment: false,
      },
    });

    const normalized = normalizeTaxReturnIntake(intake);
    const codes = generateRequirementDrafts({
      caseType: "tax_return_w",
      intake,
      facts: normalized.derivedFacts,
    }).map((item) => item.requirementCode);

    expect(codes).toContain("jaaropgaaf_employer");
    expect(codes).toContain("uwv_statement");
    expect(codes).toContain("zzp_profit_documents");
    expect(codes).toContain("zzp_1225_hours_support");
  });

  it("invalidates previously approved non-document answers when the intake answer changes", () => {
    const baseIntake = createIntake({
      filing: {
        taxYear: 2025,
        originCountryCode: "RO",
        currentCountryOfResidence: "NL",
        firstDeclarationWithFinTax: true,
        filingRoute: "standard",
      },
      residency: {
        registeredInNlFullYear: true,
        firstRegistrationInNlInTaxYear: true,
        firstRegistrationDateInNl: "2025-02-01",
        reestablishmentDateInNl: "2025-02-01",
        hadRegistrationInterruption: false,
        registrationInterruptionPeriods: [],
        emigratedOrDeregistered: false,
        emigrationOrDeregistrationDate: null,
      },
    });

    const changedIntake = createIntake({
      filing: {
        taxYear: 2025,
        originCountryCode: "RO",
        currentCountryOfResidence: "NL",
        firstDeclarationWithFinTax: true,
        filingRoute: "standard",
      },
      residency: {
        registeredInNlFullYear: true,
        firstRegistrationInNlInTaxYear: true,
        firstRegistrationDateInNl: "2025-02-01",
        reestablishmentDateInNl: "2025-05-01",
        hadRegistrationInterruption: false,
        registrationInterruptionPeriods: [],
        emigratedOrDeregistered: false,
        emigrationOrDeregistrationDate: null,
      },
    });

    const firstDraft = generateRequirementDrafts({
      caseType: "tax_return_p",
      intake: baseIntake,
      facts: normalizeTaxReturnIntake(baseIntake).derivedFacts,
    }).find((item) => item.requirementCode === "reestablishment_date_in_nl");

    const nextDraft = generateRequirementDrafts({
      caseType: "tax_return_p",
      intake: changedIntake,
      facts: normalizeTaxReturnIntake(changedIntake).derivedFacts,
    }).find((item) => item.requirementCode === "reestablishment_date_in_nl");

    expect(firstDraft).toBeDefined();
    expect(nextDraft).toBeDefined();
    expect(
      deriveRequirementStatusFromDraft(
        nextDraft!,
        "approved",
        firstDraft?.answerValue as Record<string, unknown>
      )
    ).toBe("uploaded");
  });

  it("summarizes progress and maps case status from real requirements", () => {
    const progress = summarizeRequirementProgress([
      {
        id: "req-1",
        case_id: "case-1",
        template_id: null,
        snapshot_id: "snap-1",
        rule_set_id: "rules-1",
        requirement_code: "passport_or_id_document",
        instance_key: "default",
        section: "identity",
        requirement_type: "document",
        title: "Passport",
        description: null,
        help_content: {},
        status: "approved",
        is_blocking: true,
        is_document_required: true,
        min_files: 1,
        max_files: 1,
        accepted_mime_types: ["application/pdf"],
        max_file_size_bytes: 100,
        sort_order: 1,
        applicability_reason: {},
        answer_value: {},
        customer_note: null,
        availability_status: "available",
        availability_note: null,
        availability_marked_at: null,
        review_notes: null,
        rejection_reason: null,
        requested_at: "2026-01-01T00:00:00.000Z",
        first_completed_at: null,
        reviewed_at: null,
        reviewed_by: null,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
      {
        id: "req-2",
        case_id: "case-1",
        template_id: null,
        snapshot_id: "snap-1",
        rule_set_id: "rules-1",
        requirement_code: "origin_country_income_certificate",
        instance_key: "default",
        section: "residency",
        requirement_type: "document",
        title: "Income certificate",
        description: null,
        help_content: {},
        status: "pending",
        is_blocking: true,
        is_document_required: true,
        min_files: 1,
        max_files: 1,
        accepted_mime_types: ["application/pdf"],
        max_file_size_bytes: 100,
        sort_order: 2,
        applicability_reason: {},
        answer_value: {},
        customer_note: null,
        availability_status: "available",
        availability_note: null,
        availability_marked_at: null,
        review_notes: null,
        rejection_reason: null,
        requested_at: "2026-01-01T00:00:00.000Z",
        first_completed_at: null,
        reviewed_at: null,
        reviewed_by: null,
        created_at: "2026-01-01T00:00:00.000Z",
        updated_at: "2026-01-01T00:00:00.000Z",
      },
    ]);

    expect(progress.total).toBe(2);
    expect(progress.completed).toBe(1);
    expect(progress.blockingRemaining).toBe(1);
    expect(deriveCaseStatusFromRequirements("draft", progress.blockingRemaining)).toBe(
      "pending_documents"
    );
    expect(deriveCaseStatusFromRequirements("draft", 0)).toBe("in_review");
  });

  it("resolves tax-summary from the canonical intake snapshot", () => {
    const summary = buildTaxSummary({
      caseRecord: createCase(),
      snapshot: {
        payload: createIntake(),
      },
    });

    expect(summary).toMatchObject({
      box1Income: 51000,
      box3Assets: 9000,
      credits: 1200,
      netResult: 1800,
      isFallback: false,
      sourceLabel: "tax_summary_api",
    });
  });

  it("falls back to case wizard summary when no intake snapshot exists", () => {
    const summary = buildTaxSummary({
      caseRecord: createCase({
        wizard_data: {
          summary: {
            box1Income: 43000,
            box3Assets: 15000,
            credits: 800,
            netResult: 900,
          },
        },
      }),
    });

    expect(summary).toMatchObject({
      box1Income: 43000,
      box3Assets: 15000,
      credits: 800,
      netResult: 900,
      isFallback: true,
      sourceLabel: "case_data_fallback",
    });
  });

  it("does not default new intake drafts to Spain", () => {
    const draft = createDefaultTaxReturnIntake();

    expect(draft.filing.originCountryCode).toBe("NL");
    expect(draft.filing.originCountryCode).not.toBe("ES");
  });

  it("rejects review actions on replaced, deleted or archived documents", () => {
    expect(
      isDocumentReviewable({ status: "uploaded", upload_state: "finalized", deleted_at: null })
    ).toBe(true);
    expect(
      isDocumentReviewable({ status: "replaced", upload_state: "replaced", deleted_at: null })
    ).toBe(false);
    expect(
      isDocumentReviewable({
        status: "archived",
        upload_state: "deleted",
        deleted_at: "2026-01-01T00:00:00.000Z",
      })
    ).toBe(false);
  });
});
