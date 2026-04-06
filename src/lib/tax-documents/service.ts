import crypto from "node:crypto";

import type {
  Case,
  CaseEvent,
  CaseRequirement,
  CaseStatus,
  Document,
  RequirementStatus,
} from "@/types/database";
import { createAdminClient } from "@/lib/supabase/server";
import {
  TAX_RETURN_DOCUMENT_FLOW_RULESET_VERSION,
  type DerivedFacts,
  type TaxReturnIntakePayload,
  type RequirementTemplateSeed,
} from "@/lib/tax-documents/contracts";
import { normalizeTaxReturnIntake } from "@/lib/tax-documents/normalize";
import {
  buildRequirementTemplatesForCaseType,
  buildRuleSeedRows,
  deriveRequirementStatusFromDraft,
  generateRequirementDrafts,
} from "@/lib/tax-documents/rules";
import { getRequirementHelpContent } from "@/lib/tax-documents/help-content";

type SupabaseLike = Awaited<ReturnType<typeof createAdminClient>>;

const CASE_DOCUMENT_BUCKET = "case-documents";

export async function getOwnedCaseOrNull(supabase: SupabaseLike, caseId: string, userId: string) {
  const { data, error } = await supabase
    .from("cases")
    .select("*")
    .eq("id", caseId)
    .eq("user_id", userId)
    .maybeSingle();

  if (error) throw error;
  return (data as Case | null) ?? null;
}

export async function getCaseForAdminOrNull(supabase: SupabaseLike, caseId: string) {
  const { data, error } = await supabase.from("cases").select("*").eq("id", caseId).maybeSingle();
  if (error) throw error;
  return (data as Case | null) ?? null;
}

export async function getCurrentIntakeSnapshot(supabase: SupabaseLike, caseId: string) {
  const { data, error } = await supabase
    .from("case_intake_snapshots")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

export async function saveCaseIntake(params: {
  supabase: SupabaseLike;
  caseRecord: Case;
  actorId: string;
  source: "wizard" | "admin" | "migration" | "api";
  payload: TaxReturnIntakePayload;
}) {
  const normalized = normalizeTaxReturnIntake(params.payload);

  const { data: snapshot, error: snapshotError } = await params.supabase
    .from("case_intake_snapshots")
    .insert({
      case_id: params.caseRecord.id,
      schema_version: normalized.schemaVersion,
      normalization_version: normalized.normalizationVersion,
      source: params.source,
      payload: normalized.payload,
      derived_facts: normalized.derivedFacts,
      created_by: params.actorId,
    })
    .select("*")
    .single();

  if (snapshotError) throw snapshotError;

  await params.supabase
    .from("cases")
    .update({
      tax_year: normalized.caseSummary.tax_year,
      origin_country_code: normalized.caseSummary.origin_country_code,
      residency_pattern: normalized.caseSummary.residency_pattern,
      filing_route: normalized.caseSummary.filing_route,
      wizard_data: normalized.caseSummary.wizard_data,
      current_intake_snapshot_id: snapshot.id,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.caseRecord.id);

  await recordCaseEvent(params.supabase, {
    caseId: params.caseRecord.id,
    actorId: params.actorId,
    actorType: resolveIntakeActorType(params.source),
    eventType: "intake_saved",
    visibility: "both",
    payload: {
      taxYear: normalized.caseSummary.tax_year,
      originCountryCode: normalized.caseSummary.origin_country_code,
    },
  });

  const requirements = await regenerateCaseRequirements({
    supabase: params.supabase,
    caseRecord: {
      ...params.caseRecord,
      tax_year: normalized.caseSummary.tax_year,
      origin_country_code: normalized.caseSummary.origin_country_code,
    } as Case,
    snapshot,
    actorId: params.actorId,
  });

  return {
    snapshot,
    requirements,
  };
}

export async function ensureRuleMetadata(params: {
  supabase: SupabaseLike;
  caseType: Case["case_type"];
  taxYear: number;
}) {
  const templates = buildRequirementTemplatesForCaseType(params.caseType);
  await upsertRequirementTemplates(params.supabase, templates);
  await upsertRequirementHelpContent(params.supabase, templates, params.taxYear);

  let ruleSet = await getActiveRuleSet(params.supabase, params.caseType, params.taxYear);
  if (!ruleSet) {
    const { data, error } = await params.supabase
      .from("requirement_rule_sets")
      .insert({
        case_type: params.caseType,
        tax_year: params.taxYear,
        version: TAX_RETURN_DOCUMENT_FLOW_RULESET_VERSION,
        status: "active",
        notes: "Auto-seeded by backend requirement engine",
      })
      .select("*")
      .single();

    if (error) throw error;
    ruleSet = data;
  }

  const { data: templateRows, error: templateRowsError } = await params.supabase
    .from("requirement_templates")
    .select("id, code")
    .eq("case_type", params.caseType);

  if (templateRowsError) throw templateRowsError;

  const templateMap = new Map<string, string>(
    (templateRows ?? []).map((row: { id: string; code: string }) => [row.code, row.id])
  );
  const existingRulesResponse = await params.supabase
    .from("requirement_rules")
    .select("id, template_id")
    .eq("rule_set_id", ruleSet.id);

  if (existingRulesResponse.error) throw existingRulesResponse.error;

  const existingTemplateIds = new Set<string>(
    (existingRulesResponse.data ?? []).map((row: { template_id: string }) => row.template_id)
  );
  const missingRuleRows = buildRuleSeedRows(params.caseType)
    .map((row) => ({
      rule_set_id: ruleSet.id,
      template_id: templateMap.get(row.requirement_code),
      condition_key: row.condition_key,
      condition_payload: row.condition_payload,
      sort_order: row.sort_order,
    }))
    .filter((row) => row.template_id && !existingTemplateIds.has(row.template_id));

  if (missingRuleRows.length > 0) {
    const { error } = await params.supabase.from("requirement_rules").insert(missingRuleRows);
    if (error) throw error;
  }

  return {
    ruleSet,
    templateMap,
  };
}

async function getActiveRuleSet(
  supabase: SupabaseLike,
  caseType: Case["case_type"],
  taxYear: number
) {
  const { data, error } = await supabase
    .from("requirement_rule_sets")
    .select("*")
    .eq("case_type", caseType)
    .eq("tax_year", taxYear)
    .eq("status", "active")
    .maybeSingle();

  if (error) throw error;
  return data ?? null;
}

async function upsertRequirementTemplates(
  supabase: SupabaseLike,
  templates: RequirementTemplateSeed[]
) {
  const rows = templates.map((template) => ({
    code: template.code,
    case_type: template.caseType,
    section: template.section,
    requirement_type: template.requirementType,
    title: template.title,
    description: template.description,
    accepted_mime_types: template.acceptedMimeTypes,
    max_file_size_bytes: template.maxFileSizeBytes,
    min_files: template.minFiles,
    max_files: template.maxFiles,
    is_blocking: template.isBlocking,
    metadata: template.metadata ?? {},
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("requirement_templates")
    .upsert(rows, { onConflict: "code" });
  if (error) throw error;
}

async function upsertRequirementHelpContent(
  supabase: SupabaseLike,
  templates: RequirementTemplateSeed[],
  taxYear: number
) {
  const rows = templates.map((template) => ({
    requirement_code: template.code,
    version: TAX_RETURN_DOCUMENT_FLOW_RULESET_VERSION,
    locale: "en",
    content: getRequirementHelpContent(template.code, { taxYear, originCountryCode: "EU" }),
    updated_at: new Date().toISOString(),
  }));

  const { error } = await supabase
    .from("requirement_help_content")
    .upsert(rows, { onConflict: "requirement_code" });
  if (error) throw error;
}

export async function regenerateCaseRequirements(params: {
  supabase: SupabaseLike;
  caseRecord: Case;
  snapshot: { id: string; payload: TaxReturnIntakePayload; derived_facts: DerivedFacts };
  actorId: string;
}) {
  const taxYear = params.snapshot.payload.filing.taxYear;
  const metadata = await ensureRuleMetadata({
    supabase: params.supabase,
    caseType: params.caseRecord.case_type,
    taxYear,
  });

  const drafts = generateRequirementDrafts({
    caseType: params.caseRecord.case_type,
    intake: params.snapshot.payload,
    facts: params.snapshot.derived_facts,
  });

  const { data: existingRows, error: existingError } = await params.supabase
    .from("case_requirements")
    .select("*")
    .eq("case_id", params.caseRecord.id);

  if (existingError) throw existingError;

  const existingMap = new Map<string, CaseRequirement>(
    ((existingRows ?? []) as CaseRequirement[]).map((row) => [
      `${row.requirement_code}::${row.instance_key}`,
      row,
    ])
  );

  const touchedKeys = new Set<string>();

  for (const draft of drafts) {
    const key = `${draft.requirementCode}::${draft.instanceKey}`;
    touchedKeys.add(key);
    const existing = existingMap.get(key);
    const nextStatus = deriveRequirementStatusFromDraft(
      draft,
      existing?.status,
      existing?.answer_value
    );

    const row = {
      case_id: params.caseRecord.id,
      template_id: metadata.templateMap.get(draft.requirementCode) ?? null,
      snapshot_id: params.snapshot.id,
      rule_set_id: metadata.ruleSet.id,
      requirement_code: draft.requirementCode,
      instance_key: draft.instanceKey,
      section: draft.section,
      requirement_type: draft.requirementType,
      title: draft.title,
      description: draft.description,
      help_content: draft.helpContent,
      status: nextStatus,
      is_blocking: draft.isBlocking,
      is_document_required: draft.isDocumentRequired,
      min_files: draft.minFiles,
      max_files: draft.maxFiles,
      accepted_mime_types: draft.acceptedMimeTypes,
      max_file_size_bytes: draft.maxFileSizeBytes,
      sort_order: draft.sortOrder,
      applicability_reason: draft.applicabilityReason,
      answer_value: draft.answerValue,
      review_notes:
        existing &&
        JSON.stringify(existing.answer_value ?? {}) !== JSON.stringify(draft.answerValue ?? {}) &&
        !draft.isDocumentRequired
          ? null
          : (existing?.review_notes ?? null),
      rejection_reason:
        existing &&
        JSON.stringify(existing.answer_value ?? {}) !== JSON.stringify(draft.answerValue ?? {}) &&
        !draft.isDocumentRequired
          ? null
          : (existing?.rejection_reason ?? null),
      reviewed_at:
        existing &&
        JSON.stringify(existing.answer_value ?? {}) !== JSON.stringify(draft.answerValue ?? {}) &&
        !draft.isDocumentRequired
          ? null
          : (existing?.reviewed_at ?? null),
      reviewed_by:
        existing &&
        JSON.stringify(existing.answer_value ?? {}) !== JSON.stringify(draft.answerValue ?? {}) &&
        !draft.isDocumentRequired
          ? null
          : (existing?.reviewed_by ?? null),
      updated_at: new Date().toISOString(),
      first_completed_at:
        nextStatus === "approved" || nextStatus === "waived" || nextStatus === "uploaded"
          ? (existing?.first_completed_at ?? new Date().toISOString())
          : (existing?.first_completed_at ?? null),
    };

    const response = existing
      ? await params.supabase.from("case_requirements").update(row).eq("id", existing.id)
      : await params.supabase.from("case_requirements").insert(row);

    if (response.error) throw response.error;
  }

  for (const existing of (existingRows ?? []) as CaseRequirement[]) {
    const key = `${existing.requirement_code}::${existing.instance_key}`;
    if (!touchedKeys.has(key)) {
      const { error } = await params.supabase
        .from("case_requirements")
        .update({
          status: "not_applicable",
          updated_at: new Date().toISOString(),
        })
        .eq("id", existing.id);

      if (error) throw error;
    }
  }

  const refreshedRows = await listCaseRequirements(params.supabase, params.caseRecord.id);
  const progress = summarizeRequirementProgress(refreshedRows);

  const nextCaseStatus = deriveCaseStatusFromRequirements(
    params.caseRecord.status,
    progress.blockingRemaining
  );

  await params.supabase
    .from("cases")
    .update({
      active_rule_set_id: metadata.ruleSet.id,
      current_intake_snapshot_id: params.snapshot.id,
      requirements_completion_ratio: progress.completionRatio,
      blocking_requirements_count: progress.blockingRemaining,
      requirements_summary: progress,
      last_requirement_refresh_at: new Date().toISOString(),
      status: nextCaseStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.caseRecord.id);

  await recordCaseEvent(params.supabase, {
    caseId: params.caseRecord.id,
    actorId: params.actorId,
    actorType: "system",
    eventType: "requirements_regenerated",
    visibility: "both",
    payload: {
      requirementsTotal: progress.total,
      blockingRemaining: progress.blockingRemaining,
      ruleSetVersion: metadata.ruleSet.version,
      taxYear,
    },
  });

  return refreshedRows;
}

export async function listCaseRequirements(supabase: SupabaseLike, caseId: string) {
  const { data, error } = await supabase
    .from("case_requirements")
    .select("*")
    .eq("case_id", caseId)
    .order("sort_order", { ascending: true });

  if (error) throw error;
  return (data ?? []) as CaseRequirement[];
}

export function summarizeRequirementProgress(requirements: CaseRequirement[]) {
  const applicable = requirements.filter((item) => item.status !== "not_applicable");
  const completed = applicable.filter((item) =>
    ["approved", "waived"].includes(item.status)
  ).length;
  const uploaded = applicable.filter((item) => item.status === "uploaded").length;
  const blockingRemaining = applicable.filter(
    (item) => item.is_blocking && ["pending", "rejected"].includes(item.status)
  ).length;
  const blockers = applicable
    .filter((item) => item.is_blocking && ["pending", "rejected"].includes(item.status))
    .map((item) => ({
      requirementCode: item.requirement_code,
      title: item.title,
      status: item.status,
      section: item.section,
    }));

  return {
    total: applicable.length,
    completed,
    uploaded,
    pending: applicable.filter((item) => item.status === "pending").length,
    rejected: applicable.filter((item) => item.status === "rejected").length,
    blockingRemaining,
    completionRatio:
      applicable.length === 0 ? 0 : Number(((completed / applicable.length) * 100).toFixed(2)),
    blockers,
  };
}

export function deriveCaseStatusFromRequirements(
  currentStatus: CaseStatus,
  blockingRemaining: number
): CaseStatus {
  if (
    [
      "submitted",
      "completed",
      "rejected",
      "pending_payment",
      "pending_authorization",
      "authorized",
    ].includes(currentStatus)
  ) {
    return currentStatus;
  }

  return blockingRemaining > 0 ? "pending_documents" : "in_review";
}

export async function listCaseDocuments(supabase: SupabaseLike, caseId: string) {
  const { data: docs, error: docsError } = await supabase
    .from("documents")
    .select("*")
    .eq("case_id", caseId)
    .is("deleted_at", null)
    .order("created_at", { ascending: false });

  if (docsError) throw docsError;
  if ((docs ?? []).length === 0) return [];

  const { data: joins, error: joinsError } = await supabase
    .from("requirement_documents")
    .select("requirement_id, document_id")
    .in(
      "document_id",
      ((docs ?? []) as Array<{ id: string }>).map((doc) => doc.id)
    );

  if (joinsError) throw joinsError;

  const requirementByDocumentId = new Map<string, string>(
    (joins ?? []).map((row: { requirement_id: string; document_id: string }) => [
      row.document_id,
      row.requirement_id,
    ])
  );
  return ((docs ?? []) as Document[]).map((doc) => ({
    ...doc,
    requirement_id: requirementByDocumentId.get(doc.id) ?? null,
  }));
}

export async function createUploadSession(params: {
  supabase: SupabaseLike;
  caseRecord: Case;
  userId: string;
  requirement: CaseRequirement;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  replacesDocumentId?: string;
}) {
  validateUploadAgainstRequirement(params.requirement, params.mimeType, params.fileSizeBytes);

  if (
    params.requirement.case_id !== params.caseRecord.id ||
    params.requirement.status === "not_applicable"
  ) {
    throw new Error("requirement_not_uploadable");
  }

  if (params.replacesDocumentId) {
    await assertReplaceTarget({
      supabase: params.supabase,
      caseRecord: params.caseRecord,
      userId: params.userId,
      requirementId: params.requirement.id,
      documentId: params.replacesDocumentId,
    });
  }

  const sessionId = crypto.randomUUID();
  const storagePath = `${params.userId}/${params.caseRecord.id}/${params.requirement.id}/${sessionId}-${sanitizeFilename(params.fileName)}`;
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString();

  const { data: session, error: sessionError } = await params.supabase
    .from("document_upload_sessions")
    .insert({
      id: sessionId,
      case_id: params.caseRecord.id,
      requirement_id: params.requirement.id,
      user_id: params.userId,
      intended_filename: params.fileName,
      mime_type: params.mimeType,
      file_size_bytes: params.fileSizeBytes,
      storage_bucket: CASE_DOCUMENT_BUCKET,
      storage_path: storagePath,
      replaces_document_id: params.replacesDocumentId ?? null,
      status: "issued",
      expires_at: expiresAt,
    })
    .select("*")
    .single();

  if (sessionError) throw sessionError;

  const signedUpload = await params.supabase.storage
    .from(CASE_DOCUMENT_BUCKET)
    .createSignedUploadUrl(storagePath);
  if (signedUpload.error) throw signedUpload.error;

  await recordCaseEvent(params.supabase, {
    caseId: params.caseRecord.id,
    actorId: params.userId,
    actorType: "user",
    eventType: "document_upload_session_issued",
    visibility: "both",
    payload: {
      requirementId: params.requirement.id,
      fileName: params.fileName,
    },
  });

  return {
    ...(session as Record<string, unknown>),
    signedUrl: signedUpload.data?.signedUrl ?? null,
    token: signedUpload.data?.token ?? null,
    path: storagePath,
  };
}

function validateUploadAgainstRequirement(
  requirement: CaseRequirement,
  mimeType: string,
  fileSizeBytes: number
) {
  if (!requirement.is_document_required) {
    throw new Error("requirement_does_not_accept_documents");
  }

  if (
    requirement.accepted_mime_types.length > 0 &&
    !requirement.accepted_mime_types.includes(mimeType)
  ) {
    throw new Error("unsupported_mime_type");
  }

  if (fileSizeBytes > requirement.max_file_size_bytes) {
    throw new Error("file_too_large");
  }
}

export async function finalizeUpload(params: {
  supabase: SupabaseLike;
  caseRecord: Case;
  userId: string;
  uploadSessionId: string;
  checksumSha256?: string;
}) {
  const { data: session, error: sessionError } = await params.supabase
    .from("document_upload_sessions")
    .select("*")
    .eq("id", params.uploadSessionId)
    .eq("case_id", params.caseRecord.id)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (sessionError) throw sessionError;
  if (!session) throw new Error("upload_session_not_found");
  if (session.status !== "issued") throw new Error("upload_session_invalid_state");
  if (new Date(session.expires_at).getTime() < Date.now())
    throw new Error("upload_session_expired");

  const requirement = await getCaseRequirementOrThrow(
    params.supabase,
    params.caseRecord.id,
    session.requirement_id
  );
  if (requirement.status === "not_applicable") throw new Error("requirement_not_uploadable");

  const downloadAttempt = await params.supabase.storage
    .from(session.storage_bucket)
    .download(session.storage_path);
  if (downloadAttempt.error) throw new Error("uploaded_object_not_found");

  const { data: document, error: documentError } = await params.supabase
    .from("documents")
    .insert({
      case_id: params.caseRecord.id,
      user_id: params.userId,
      checklist_item_id: null,
      upload_session_id: session.id,
      file_name: session.intended_filename,
      file_path: session.storage_path,
      file_size: session.file_size_bytes,
      mime_type: session.mime_type,
      storage_provider: "supabase_storage",
      storage_bucket: session.storage_bucket,
      storage_object_key: session.storage_path,
      sha256_checksum: params.checksumSha256 ?? null,
      upload_state: "finalized",
      status: "uploaded",
      metadata: {},
    })
    .select("*")
    .single();

  if (documentError) throw documentError;
  if (document.status === "archived" || document.status === "replaced") {
    throw new Error("document_review_invalid_state");
  }

  const { error: joinError } = await params.supabase.from("requirement_documents").insert({
    requirement_id: session.requirement_id,
    document_id: document.id,
    is_primary: true,
  });
  if (joinError) throw joinError;

  const { error: sessionUpdateError } = await params.supabase
    .from("document_upload_sessions")
    .update({
      status: "finalized",
      finalized_at: new Date().toISOString(),
    })
    .eq("id", session.id);

  if (sessionUpdateError) throw sessionUpdateError;

  const { error: requirementError } = await params.supabase
    .from("case_requirements")
    .update({
      status: "uploaded",
      availability_status: "available",
      availability_note: null,
      availability_marked_at: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", session.requirement_id);

  if (requirementError) throw requirementError;

  if (session.replaces_document_id) {
    const replaceResponse = await params.supabase
      .from("documents")
      .update({
        status: "replaced",
        upload_state: "replaced",
        replaced_by_document_id: document.id,
      })
      .eq("id", session.replaces_document_id)
      .eq("case_id", params.caseRecord.id)
      .eq("user_id", params.userId);

    if (replaceResponse.error) throw replaceResponse.error;
  }

  await recordCaseEvent(params.supabase, {
    caseId: params.caseRecord.id,
    actorId: params.userId,
    actorType: "user",
    eventType: "document_uploaded",
    visibility: "both",
    payload: {
      documentId: document.id,
      requirementId: session.requirement_id,
      fileName: session.intended_filename,
    },
  });

  await syncCaseDerivedState(params.supabase, params.caseRecord);

  return document as Document;
}

export async function softDeleteDocument(params: {
  supabase: SupabaseLike;
  caseRecord: Case;
  userId: string;
  documentId: string;
}) {
  const { data: document, error } = await params.supabase
    .from("documents")
    .select("*")
    .eq("id", params.documentId)
    .eq("case_id", params.caseRecord.id)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (error) throw error;
  if (!document) throw new Error("document_not_found");
  if (document.status === "approved") throw new Error("approved_document_cannot_be_deleted");

  await params.supabase.storage
    .from(document.storage_bucket ?? CASE_DOCUMENT_BUCKET)
    .remove([document.storage_object_key ?? document.file_path]);

  await params.supabase
    .from("documents")
    .update({
      deleted_at: new Date().toISOString(),
      deleted_by: params.userId,
      upload_state: "deleted",
      status: "archived",
    })
    .eq("id", document.id);

  const joinLookup = await params.supabase
    .from("requirement_documents")
    .select("id, requirement_id")
    .eq("document_id", document.id)
    .maybeSingle();

  if (joinLookup.error) throw joinLookup.error;

  if (joinLookup.data) {
    await params.supabase.from("requirement_documents").delete().eq("id", joinLookup.data.id);

    const remaining = await params.supabase
      .from("requirement_documents")
      .select("id")
      .eq("requirement_id", joinLookup.data.requirement_id);

    if (remaining.error) throw remaining.error;

    if ((remaining.data ?? []).length === 0) {
      await params.supabase
        .from("case_requirements")
        .update({
          status: "pending",
          updated_at: new Date().toISOString(),
        })
        .eq("id", joinLookup.data.requirement_id);
    }
  }

  await recordCaseEvent(params.supabase, {
    caseId: params.caseRecord.id,
    actorId: params.userId,
    actorType: "user",
    eventType: "document_deleted",
    visibility: "both",
    payload: {
      documentId: document.id,
      fileName: document.file_name,
    },
  });

  await syncCaseDerivedState(params.supabase, params.caseRecord);
}

export async function markRequirementNotYetAvailable(params: {
  supabase: SupabaseLike;
  caseRecord: Case;
  userId: string;
  requirementId: string;
  note: string;
}) {
  const { data, error } = await params.supabase
    .from("case_requirements")
    .update({
      availability_status: "not_yet_available",
      availability_note: params.note,
      availability_marked_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.requirementId)
    .eq("case_id", params.caseRecord.id)
    .neq("status", "not_applicable")
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("requirement_not_found");

  await recordCaseEvent(params.supabase, {
    caseId: params.caseRecord.id,
    actorId: params.userId,
    actorType: "user",
    eventType: "requirement_marked_not_available",
    visibility: "both",
    payload: {
      requirementId: params.requirementId,
      note: params.note,
    },
  });
}

export async function addRequirementCustomerNote(params: {
  supabase: SupabaseLike;
  caseRecord: Case;
  userId: string;
  requirementId: string;
  note: string;
}) {
  const { data, error } = await params.supabase
    .from("case_requirements")
    .update({
      customer_note: params.note,
      updated_at: new Date().toISOString(),
    })
    .eq("id", params.requirementId)
    .eq("case_id", params.caseRecord.id)
    .neq("status", "not_applicable")
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("requirement_not_found");

  await recordCaseEvent(params.supabase, {
    caseId: params.caseRecord.id,
    actorId: params.userId,
    actorType: "user",
    eventType: "requirement_note_added",
    visibility: "both",
    payload: {
      requirementId: params.requirementId,
    },
  });
}

export async function reviewRequirement(params: {
  supabase: SupabaseLike;
  caseRecord: Case;
  adminId: string;
  requirementId: string;
  status: "approved" | "rejected" | "waived";
  reviewNotes?: string;
  rejectionReason?: string;
}) {
  const now = new Date().toISOString();
  const { data, error } = await params.supabase
    .from("case_requirements")
    .update({
      status: params.status,
      review_notes: params.reviewNotes ?? null,
      rejection_reason: params.rejectionReason ?? null,
      reviewed_at: now,
      reviewed_by: params.adminId,
      updated_at: now,
    })
    .eq("id", params.requirementId)
    .eq("case_id", params.caseRecord.id)
    .neq("status", "not_applicable")
    .select("id")
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("requirement_not_found");

  await recordCaseEvent(params.supabase, {
    caseId: params.caseRecord.id,
    actorId: params.adminId,
    actorType: "admin",
    eventType: "requirement_reviewed",
    visibility: "both",
    payload: {
      requirementId: params.requirementId,
      status: params.status,
      rejectionReason: params.rejectionReason ?? null,
    },
  });

  const requirements = await listCaseRequirements(params.supabase, params.caseRecord.id);
  const progress = summarizeRequirementProgress(requirements);
  const nextStatus = deriveCaseStatusFromRequirements(
    params.caseRecord.status,
    progress.blockingRemaining
  );

  await params.supabase
    .from("cases")
    .update({
      requirements_completion_ratio: progress.completionRatio,
      blocking_requirements_count: progress.blockingRemaining,
      requirements_summary: progress,
      status: nextStatus,
      updated_at: now,
    })
    .eq("id", params.caseRecord.id);
}

export async function reviewDocument(params: {
  supabase: SupabaseLike;
  caseRecord: Case;
  adminId: string;
  documentId: string;
  status: "approved" | "rejected" | "under_review";
  reviewNotes?: string;
}) {
  const now = new Date().toISOString();

  const { data: existingDocument, error: existingDocumentError } = await params.supabase
    .from("documents")
    .select("*")
    .eq("id", params.documentId)
    .eq("case_id", params.caseRecord.id)
    .maybeSingle();

  if (existingDocumentError) throw existingDocumentError;
  if (!existingDocument) throw new Error("document_not_found");
  if (!isDocumentReviewable(existingDocument as Document)) {
    throw new Error("document_review_invalid_state");
  }

  const { data: document, error: documentError } = await params.supabase
    .from("documents")
    .update({
      status: params.status,
      review_notes: params.reviewNotes ?? null,
      reviewed_at: now,
      reviewed_by: params.adminId,
    })
    .eq("id", params.documentId)
    .eq("case_id", params.caseRecord.id)
    .select("*")
    .single();

  if (documentError) throw documentError;

  const joinLookup = await params.supabase
    .from("requirement_documents")
    .select("requirement_id")
    .eq("document_id", params.documentId)
    .maybeSingle();

  if (joinLookup.error) throw joinLookup.error;

  if (joinLookup.data?.requirement_id) {
    const mappedRequirementStatus: RequirementStatus =
      params.status === "approved"
        ? "approved"
        : params.status === "rejected"
          ? "rejected"
          : "uploaded";

    await params.supabase
      .from("case_requirements")
      .update({
        status: mappedRequirementStatus,
        review_notes: params.reviewNotes ?? null,
        rejection_reason: params.status === "rejected" ? (params.reviewNotes ?? null) : null,
        reviewed_at: now,
        reviewed_by: params.adminId,
        updated_at: now,
      })
      .eq("id", joinLookup.data.requirement_id);
  }

  await recordCaseEvent(params.supabase, {
    caseId: params.caseRecord.id,
    actorId: params.adminId,
    actorType: "admin",
    eventType: "document_reviewed",
    visibility: "both",
    payload: {
      documentId: params.documentId,
      status: params.status,
    },
  });

  await syncCaseDerivedState(params.supabase, params.caseRecord);

  return document as Document;
}

export function isDocumentReviewable(
  document: Pick<Document, "status" | "upload_state" | "deleted_at">
) {
  if (document.deleted_at) return false;
  if (document.upload_state === "replaced" || document.upload_state === "deleted") return false;
  return document.status !== "archived" && document.status !== "replaced";
}

async function syncCaseDerivedState(supabase: SupabaseLike, caseRecord: Case) {
  const requirements = await listCaseRequirements(supabase, caseRecord.id);
  const progress = summarizeRequirementProgress(requirements);
  const nextStatus = deriveCaseStatusFromRequirements(
    caseRecord.status,
    progress.blockingRemaining
  );

  await supabase
    .from("cases")
    .update({
      requirements_completion_ratio: progress.completionRatio,
      blocking_requirements_count: progress.blockingRemaining,
      requirements_summary: progress,
      status: nextStatus,
      updated_at: new Date().toISOString(),
    })
    .eq("id", caseRecord.id);
}

async function getCaseRequirementOrThrow(
  supabase: SupabaseLike,
  caseId: string,
  requirementId: string
) {
  const { data, error } = await supabase
    .from("case_requirements")
    .select("*")
    .eq("id", requirementId)
    .eq("case_id", caseId)
    .maybeSingle();

  if (error) throw error;
  if (!data) throw new Error("requirement_not_found");
  return data as CaseRequirement;
}

async function assertReplaceTarget(params: {
  supabase: SupabaseLike;
  caseRecord: Case;
  userId: string;
  requirementId: string;
  documentId: string;
}) {
  const { data: document, error: documentError } = await params.supabase
    .from("documents")
    .select("id, case_id, user_id, status, deleted_at")
    .eq("id", params.documentId)
    .eq("case_id", params.caseRecord.id)
    .eq("user_id", params.userId)
    .maybeSingle();

  if (documentError) throw documentError;
  if (!document || document.deleted_at) throw new Error("replace_document_not_found");
  if (
    document.status === "approved" ||
    document.status === "archived" ||
    document.status === "replaced"
  ) {
    throw new Error("replace_document_not_allowed");
  }

  const { data: join, error: joinError } = await params.supabase
    .from("requirement_documents")
    .select("requirement_id")
    .eq("document_id", params.documentId)
    .maybeSingle();

  if (joinError) throw joinError;
  if (!join || join.requirement_id !== params.requirementId)
    throw new Error("replace_document_not_allowed");
}

export async function listCaseEvents(
  supabase: SupabaseLike,
  caseId: string,
  includeInternal = false
) {
  const query = supabase
    .from("case_events")
    .select("*")
    .eq("case_id", caseId)
    .order("created_at", { ascending: false });
  if (!includeInternal) {
    query.in("visibility", ["client", "both"]);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as CaseEvent[];
}

export async function recordCaseEvent(
  supabase: SupabaseLike,
  input: {
    caseId: string;
    actorType: "user" | "admin" | "system";
    actorId: string | null;
    eventType: string;
    visibility: "internal" | "client" | "both";
    payload: Record<string, unknown>;
  }
) {
  const { error } = await supabase.from("case_events").insert({
    case_id: input.caseId,
    actor_type: input.actorType,
    actor_id: input.actorId,
    event_type: input.eventType,
    visibility: input.visibility,
    payload: input.payload,
  });

  if (error) throw error;
}

export function buildTaxSummary(input: {
  caseRecord: Case;
  snapshot?: { payload?: TaxReturnIntakePayload } | null;
}) {
  const snapshotSummary = input.snapshot?.payload?.summary;
  if (snapshotSummary) {
    return {
      ...snapshotSummary,
      sourceLabel: "tax_summary_api" as const,
      isFallback: false,
    };
  }

  const wizardSummary =
    input.caseRecord.wizard_data && typeof input.caseRecord.wizard_data === "object"
      ? ((input.caseRecord.wizard_data.summary as Record<string, unknown> | undefined) ?? null)
      : null;

  return {
    box1Income: toNumber(wizardSummary?.box1Income),
    box3Assets: toNumber(wizardSummary?.box3Assets),
    credits: toNumber(wizardSummary?.credits),
    netResult:
      toNumber(wizardSummary?.netResult) ||
      toNumber(input.caseRecord.actual_refund ?? input.caseRecord.estimated_refund),
    sourceLabel: wizardSummary ? ("case_data_fallback" as const) : ("summary_unavailable" as const),
    isFallback: true,
  };
}

function sanitizeFilename(value: string) {
  return value.replace(/[^a-zA-Z0-9._-]/g, "_");
}

function toNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function resolveIntakeActorType(source: "wizard" | "admin" | "migration" | "api") {
  if (source === "admin") return "admin" as const;
  if (source === "migration") return "system" as const;
  return "user" as const;
}
