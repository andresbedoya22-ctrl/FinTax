import { randomUUID } from "node:crypto";

import type { Case } from "@/types/database";
import * as operationalConfigNamespace from "@/lib/tax-documents/operational-config";
import * as serviceNamespace from "@/lib/tax-documents/service";

import { loadLocalEnv } from "./lib/load-local-env";
import { createSupabaseAdminClient } from "./lib/supabase-admin";

const operationalConfigModule = resolveModule(
  operationalConfigNamespace
) as typeof import("@/lib/tax-documents/operational-config");
const serviceModule = resolveModule(
  serviceNamespace
) as typeof import("@/lib/tax-documents/service");
const { DOCFLOW_OPERATIONAL_CONFIG } = operationalConfigModule;
const {
  addRequirementCustomerNote,
  createUploadSession,
  finalizeUpload,
  getCaseForAdminOrNull,
  listCaseDocuments,
  listCaseEvents,
  listCaseRequirements,
  markRequirementNotYetAvailable,
  reviewDocument,
  reviewRequirement,
  saveCaseIntake,
  softDeleteDocument,
  summarizeRequirementProgress,
} = serviceModule;
type TaxReturnIntakePayload = import("@/lib/tax-documents/contracts").TaxReturnIntakePayload;

async function main() {
  const envFiles = loadLocalEnv();
  const supabase = createSupabaseAdminClient();
  const userId = readArg("--user-id");
  const adminId = readArg("--admin-id");
  const existingCaseId = readArg("--case-id");

  if (!userId || !adminId) {
    throw new Error("missing_required_args:user-id,admin-id");
  }

  let caseRecord = existingCaseId
    ? ((await getCaseForAdminOrNull(supabase, existingCaseId)) as Case | null)
    : null;
  if (!caseRecord) {
    const { data, error } = await supabase
      .from("cases")
      .insert({
        user_id: userId,
        case_type: "tax_return_p",
        status: "draft",
        tax_year: DOCFLOW_OPERATIONAL_CONFIG.activeTaxYear,
        display_name: `DOCFLOW QA ${DOCFLOW_OPERATIONAL_CONFIG.activeTaxYear} ${new Date().toISOString()}`,
        wizard_data: {
          qaHarness: true,
        },
      })
      .select("*")
      .single();

    if (error) throw error;
    caseRecord = data as Case;
  }

  const payload = buildQaPayload(caseRecord.case_type);
  const saveResult = await saveCaseIntake({
    supabase,
    caseRecord,
    actorId: userId,
    source: "api",
    payload,
  });

  const requirements = await listCaseRequirements(supabase, caseRecord.id);
  const noteRequirement = requirements.find((item) => item.requirement_type !== "document");
  const primaryDocumentRequirement = requirements.find((item) => item.is_document_required);
  const secondaryDocumentRequirement = requirements.filter((item) => item.is_document_required)[1];

  if (!primaryDocumentRequirement || !secondaryDocumentRequirement || !noteRequirement) {
    throw new Error("qa_case_missing_expected_requirements");
  }

  await addRequirementCustomerNote({
    supabase,
    caseRecord,
    userId,
    requirementId: noteRequirement.id,
    note: "QA note saved by scripted readiness harness.",
  });

  await markRequirementNotYetAvailable({
    supabase,
    caseRecord,
    userId,
    requirementId: secondaryDocumentRequirement.id,
    note: "Authority-issued evidence still pending; expected next week.",
  });

  const initialDocument = await uploadAndFinalize({
    supabase,
    caseRecord,
    userId,
    requirementId: primaryDocumentRequirement.id,
    fileName: "passport-initial.pdf",
    contents: Buffer.from("%PDF-1.4\n% QA initial document\n", "utf8"),
  });

  await reviewDocument({
    supabase,
    caseRecord,
    adminId,
    documentId: initialDocument.id,
    status: "rejected",
    reviewNotes: "QA rejection to verify replacement flow.",
  });

  const replacementDocument = await uploadAndFinalize({
    supabase,
    caseRecord,
    userId,
    requirementId: primaryDocumentRequirement.id,
    fileName: "passport-replacement.pdf",
    contents: Buffer.from("%PDF-1.4\n% QA replacement document\n", "utf8"),
    replacesDocumentId: initialDocument.id,
  });

  await softDeleteDocument({
    supabase,
    caseRecord,
    userId,
    documentId: replacementDocument.id,
  });

  const finalDocument = await uploadAndFinalize({
    supabase,
    caseRecord,
    userId,
    requirementId: primaryDocumentRequirement.id,
    fileName: "passport-final.pdf",
    contents: Buffer.from("%PDF-1.4\n% QA approved document\n", "utf8"),
  });

  await reviewDocument({
    supabase,
    caseRecord,
    adminId,
    documentId: finalDocument.id,
    status: "approved",
    reviewNotes: "QA approval after replacement and delete validation.",
  });

  await reviewRequirement({
    supabase,
    caseRecord,
    adminId,
    requirementId: noteRequirement.id,
    status: "approved",
    reviewNotes: "Date answer reviewed and accepted.",
  });

  const finalRequirements = await listCaseRequirements(supabase, caseRecord.id);
  const documents = await listCaseDocuments(supabase, caseRecord.id);
  const events = await listCaseEvents(supabase, caseRecord.id, true);
  const refreshedCase = await getCaseForAdminOrNull(supabase, caseRecord.id);
  const progress = summarizeRequirementProgress(finalRequirements);

  console.log(
    JSON.stringify(
      {
        ok: true,
        envFiles,
        caseId: caseRecord.id,
        caseStatus: refreshedCase?.status ?? null,
        snapshotId: String(saveResult.snapshot.id),
        helpContentTitle: String(primaryDocumentRequirement.help_content.title ?? ""),
        notesSavedForRequirementId: noteRequirement.id,
        notAvailableRequirementId: secondaryDocumentRequirement.id,
        approvedDocumentId: finalDocument.id,
        documentCountVisible: documents.length,
        eventTypes: events.map((item) => item.event_type),
        progress,
        requirementsSummaryMatchesCase:
          JSON.stringify(refreshedCase?.requirements_summary ?? {}) === JSON.stringify(progress),
      },
      null,
      2
    )
  );
}

async function uploadAndFinalize(params: {
  supabase: ReturnType<typeof createSupabaseAdminClient>;
  caseRecord: Case;
  userId: string;
  requirementId: string;
  fileName: string;
  contents: Buffer;
  replacesDocumentId?: string;
}) {
  const requirements = await listCaseRequirements(params.supabase, params.caseRecord.id);
  const requirement = requirements.find((item) => item.id === params.requirementId);
  if (!requirement) throw new Error("qa_requirement_not_found");

  const session = await createUploadSession({
    supabase: params.supabase,
    caseRecord: params.caseRecord,
    userId: params.userId,
    requirement,
    fileName: params.fileName,
    mimeType: "application/pdf",
    fileSizeBytes: params.contents.byteLength,
    replacesDocumentId: params.replacesDocumentId,
  });
  const uploadSession = session as typeof session & {
    id: string;
    storage_bucket: string;
  };

  const uploadResult = await params.supabase.storage
    .from(String(uploadSession.storage_bucket))
    .uploadToSignedUrl(String(uploadSession.path), String(uploadSession.token), params.contents, {
      contentType: "application/pdf",
      upsert: true,
    });

  if (uploadResult.error) throw uploadResult.error;

  return finalizeUpload({
    supabase: params.supabase,
    caseRecord: params.caseRecord,
    userId: params.userId,
    uploadSessionId: String(uploadSession.id),
  });
}

function buildQaPayload(caseType: Case["case_type"]): TaxReturnIntakePayload {
  return {
    caseType: caseType as TaxReturnIntakePayload["caseType"],
    filing: {
      taxYear: DOCFLOW_OPERATIONAL_CONFIG.activeTaxYear,
      originCountryCode: "RO",
      currentCountryOfResidence: "NL",
      firstDeclarationWithFinTax: true,
      filingRoute: "standard",
    },
    residency: {
      registeredInNlFullYear: false,
      firstRegistrationInNlInTaxYear: true,
      firstRegistrationDateInNl: `${DOCFLOW_OPERATIONAL_CONFIG.activeTaxYear}-02-01`,
      reestablishmentDateInNl: `${DOCFLOW_OPERATIONAL_CONFIG.activeTaxYear}-02-01`,
      hadRegistrationInterruption: true,
      registrationInterruptionPeriods: [
        {
          startDate: `${DOCFLOW_OPERATIONAL_CONFIG.activeTaxYear}-01-01`,
          endDate: `${DOCFLOW_OPERATIONAL_CONFIG.activeTaxYear}-01-31`,
        },
      ],
      emigratedOrDeregistered: false,
      emigrationOrDeregistrationDate: null,
    },
    household: {
      hasFiscalPartner: false,
      hasChildrenRegisteredSameAddress: true,
      childrenCountSameAddress: 1,
      childrenRegistrationSameAddressDate: `${DOCFLOW_OPERATIONAL_CONFIG.activeTaxYear}-03-15`,
    },
    income: {
      employers: [{ id: randomUUID(), name: "QA Employer B.V." }],
      hasUwvIncome: true,
      hasTransitievergoeding: false,
      hasZzpIncome: false,
      zzpHoursOver1225: false,
      hasOtherForeignIncome: false,
      hasProvisionalAssessment: true,
    },
    housing: {
      ownsHome: true,
      hasMortgage: true,
      hasSvnOrStarterslening: false,
    },
    debts: {
      hasConsumerLoans: true,
    },
    assets: {
      hasNlBankAccounts: true,
      hasForeignBankAccounts: true,
      hasCrypto: false,
    },
    deductions: {
      hasUnreimbursedDeductibleMedicalCosts: true,
    },
    summary: {
      box1Income: 42000,
      box3Assets: 9000,
      credits: 850,
      netResult: 1200,
    },
  };
}

function readArg(flag: string) {
  const exact = process.argv.find((value) => value.startsWith(`${flag}=`));
  if (exact) return exact.slice(flag.length + 1);

  const index = process.argv.indexOf(flag);
  if (index >= 0) return process.argv[index + 1];

  return undefined;
}

void main().catch((error) => {
  console.error(
    JSON.stringify(
      {
        ok: false,
        error: formatUnknownError(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      null,
      2
    )
  );
  process.exitCode = 1;
});

function resolveModule<T>(namespace: T) {
  const candidate = namespace as T & { default?: T };
  return candidate.default ?? namespace;
}

function formatUnknownError(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  try {
    return JSON.stringify(error);
  } catch {
    return "docflow_e2e_failed";
  }
}
