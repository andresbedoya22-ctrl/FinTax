"use client";

import * as React from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { apiDelete, apiGet, apiPost, apiPut } from "@/hooks/api-client";
import { createClient as createSupabaseClient } from "@/lib/supabase/client";
import type { TaxReturnIntakePayload } from "@/lib/tax-documents/contracts";
import type { Case, CaseEvent, CaseIntakeSnapshot, CaseRequirement, Document, DocumentUploadSession } from "@/types/database";

export interface RequirementProgressSummary {
  total: number;
  completed: number;
  uploaded: number;
  pending: number;
  rejected: number;
  blockingRemaining: number;
  completionRatio: number;
  blockers: Array<{
    requirementCode: string;
    title: string;
    status: string;
    section: string;
  }>;
}

export interface CaseRequirementsResponse {
  snapshotId: string | null;
  requirements: CaseRequirement[];
  grouped: Record<string, CaseRequirement[]>;
  progress: RequirementProgressSummary;
}

export type CaseDocument = Document & {
  requirement_id?: string | null;
};

export type UploadSessionResponse = DocumentUploadSession & {
  signedUrl: string | null;
  token: string | null;
  path: string;
};

export interface TaxReturnIntakeDraftValues {
  fullName: string;
  bsn: string;
  payload: TaxReturnIntakePayload;
}

export function createDefaultTaxReturnIntake(caseType: Case["case_type"] = "tax_return_p", originCountryCode = "NL"): TaxReturnIntakePayload {
  const currentYear = new Date().getFullYear();

  return {
    caseType: caseType as TaxReturnIntakePayload["caseType"],
    filing: {
      taxYear: currentYear - 1,
      originCountryCode,
      currentCountryOfResidence: "NL",
      firstDeclarationWithFinTax: false,
      filingRoute: caseType === "tax_return_m" ? "migration" : caseType === "tax_return_c" ? "non_resident" : caseType === "tax_return_w" ? "self_employed" : "standard",
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
      hasZzpIncome: caseType === "tax_return_w",
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
      hasNlBankAccounts: true,
      hasForeignBankAccounts: false,
      hasCrypto: false,
    },
    deductions: {
      hasUnreimbursedDeductibleMedicalCosts: false,
    },
    summary: {
      box1Income: 0,
      box3Assets: 0,
      credits: 0,
      netResult: 0,
    },
  };
}

export function createDefaultIntakeDraftValues(caseType: Case["case_type"] = "tax_return_p"): TaxReturnIntakeDraftValues {
  return {
    fullName: "",
    bsn: "",
    payload: createDefaultTaxReturnIntake(caseType),
  };
}

export function mergeIntakeDraftValues(input: {
  draftValues: TaxReturnIntakeDraftValues;
  caseType: Case["case_type"];
  snapshot: CaseIntakeSnapshot | null | undefined;
}): TaxReturnIntakeDraftValues {
  const payload = input.snapshot?.payload && typeof input.snapshot.payload === "object" ? (input.snapshot.payload as TaxReturnIntakePayload) : null;
  const nextPayload = payload
    ? {
        ...createDefaultTaxReturnIntake(input.caseType),
        ...payload,
        filing: {
          ...createDefaultTaxReturnIntake(input.caseType).filing,
          ...(payload.filing ?? {}),
        },
        residency: {
          ...createDefaultTaxReturnIntake(input.caseType).residency,
          ...(payload.residency ?? {}),
        },
        household: {
          ...createDefaultTaxReturnIntake(input.caseType).household,
          ...(payload.household ?? {}),
        },
        income: {
          ...createDefaultTaxReturnIntake(input.caseType).income,
          ...(payload.income ?? {}),
        },
        housing: {
          ...createDefaultTaxReturnIntake(input.caseType).housing,
          ...(payload.housing ?? {}),
        },
        debts: {
          ...createDefaultTaxReturnIntake(input.caseType).debts,
          ...(payload.debts ?? {}),
        },
        assets: {
          ...createDefaultTaxReturnIntake(input.caseType).assets,
          ...(payload.assets ?? {}),
        },
        deductions: {
          ...createDefaultTaxReturnIntake(input.caseType).deductions,
          ...(payload.deductions ?? {}),
        },
        summary: {
          ...createDefaultTaxReturnIntake(input.caseType).summary,
          ...(payload.summary ?? {}),
        },
      }
    : createDefaultTaxReturnIntake(input.caseType);

  return {
    ...input.draftValues,
    payload: nextPayload,
  };
}

export function useCaseIntake(caseId: string, enabled = true) {
  return useQuery({
    queryKey: ["case-intake", caseId],
    enabled: Boolean(caseId) && enabled,
    queryFn: () => apiGet<CaseIntakeSnapshot | null>(`/api/cases/${caseId}/intake`),
  });
}

export function useCaseRequirements(caseId: string, enabled = true) {
  return useQuery({
    queryKey: ["case-requirements", caseId],
    enabled: Boolean(caseId) && enabled,
    queryFn: () => apiGet<CaseRequirementsResponse>(`/api/cases/${caseId}/requirements`),
  });
}

export function useCaseProgress(caseId: string, enabled = true) {
  return useQuery({
    queryKey: ["case-progress", caseId],
    enabled: Boolean(caseId) && enabled,
    queryFn: () => apiGet<RequirementProgressSummary>(`/api/cases/${caseId}/progress`),
  });
}

export function useCaseDocuments(caseId: string, enabled = true) {
  return useQuery({
    queryKey: ["case-documents", caseId],
    enabled: Boolean(caseId) && enabled,
    queryFn: () => apiGet<CaseDocument[]>(`/api/cases/${caseId}/documents`),
  });
}

export function useCaseEvents(caseId: string, enabled = true) {
  return useQuery({
    queryKey: ["case-events", caseId],
    enabled: Boolean(caseId) && enabled,
    queryFn: () => apiGet<CaseEvent[]>(`/api/cases/${caseId}/events`),
  });
}

export function useRequirementHelp(caseId: string, requirementId: string, enabled = true) {
  return useQuery({
    queryKey: ["requirement-help", caseId, requirementId],
    enabled: Boolean(caseId && requirementId && enabled),
    queryFn: () => apiGet<Record<string, unknown> | null>(`/api/cases/${caseId}/requirements/${requirementId}/help`),
    staleTime: 5 * 60_000,
  });
}

export function useSaveCaseIntake(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ caseId: targetCaseId, payload }: { caseId?: string; payload: TaxReturnIntakePayload }) =>
      apiPut<{ snapshot: CaseIntakeSnapshot; requirements: CaseRequirement[] }, TaxReturnIntakePayload>(`/api/cases/${targetCaseId ?? caseId}/intake`, payload),
    onSuccess: async (_data, variables) => {
      await invalidateCaseDocflow(queryClient, variables.caseId ?? caseId);
    },
  });
}

export function useRegenerateRequirements(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => apiPost<{ requirements: CaseRequirement[]; progress: RequirementProgressSummary }, Record<string, never>>(`/api/cases/${caseId}/requirements/regenerate`, {}),
    onSuccess: async () => {
      await invalidateCaseDocflow(queryClient, caseId);
    },
  });
}

export function useRequirementNote(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requirementId, note }: { requirementId: string; note: string }) =>
      apiPost<{ ok: true }, { note: string }>(`/api/cases/${caseId}/requirements/${requirementId}/note`, { note }),
    onSuccess: async () => {
      await invalidateCaseDocflow(queryClient, caseId);
    },
  });
}

export function useRequirementNotAvailable(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ requirementId, note }: { requirementId: string; note: string }) =>
      apiPost<{ ok: true }, { note: string }>(`/api/cases/${caseId}/requirements/${requirementId}/not-available`, { note }),
    onSuccess: async () => {
      await invalidateCaseDocflow(queryClient, caseId);
    },
  });
}

export function useDeleteCaseDocument(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ documentId }: { documentId: string }) => apiDelete<{ ok: true }>(`/api/cases/${caseId}/documents/${documentId}`),
    onSuccess: async () => {
      await invalidateCaseDocflow(queryClient, caseId);
    },
  });
}

export function useUploadRequirementDocument(caseId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      requirementId,
      file,
      replacesDocumentId,
    }: {
      requirementId: string;
      file: File;
      replacesDocumentId?: string;
    }) => {
      const session = await apiPost<UploadSessionResponse, { requirementId: string; fileName: string; mimeType: string; fileSizeBytes: number; replacesDocumentId?: string }>(
        `/api/cases/${caseId}/documents/upload-session`,
        {
          requirementId,
          fileName: file.name,
          mimeType: file.type || "application/octet-stream",
          fileSizeBytes: file.size,
          replacesDocumentId,
        },
      );

      await uploadToSignedSession(session, file);

      const checksumSha256 = await computeFileSha256(file);
      const document = await apiPost<CaseDocument, { uploadSessionId: string; checksumSha256?: string }>(`/api/cases/${caseId}/documents/finalize`, {
        uploadSessionId: session.id,
        checksumSha256,
      });

      return document;
    },
    onSuccess: async () => {
      await invalidateCaseDocflow(queryClient, caseId);
    },
  });
}

export function useCreateDraftCase() {
  return useMutation({
    mutationFn: createDraftCase,
  });
}

export function useLatestActiveTaxCase(explicitCaseId?: string | null, enabled = true) {
  const [selectedCaseId, setSelectedCaseId] = React.useState<string | null>(explicitCaseId ?? null);
  const casesQuery = useQuery({
    queryKey: ["cases"],
    enabled,
    queryFn: () => apiGet<Case[]>("/api/cases"),
  });

  React.useEffect(() => {
    if (explicitCaseId) {
      setSelectedCaseId(explicitCaseId);
      return;
    }

    if (!casesQuery.data || selectedCaseId) return;
    const candidate = casesQuery.data.find((caseItem) => isActiveTaxReturnCase(caseItem.case_type, caseItem.status));
    if (candidate) {
      setSelectedCaseId(candidate.id);
    }
  }, [casesQuery.data, explicitCaseId, selectedCaseId]);

  return {
    ...casesQuery,
    selectedCaseId,
    setSelectedCaseId,
  };
}

export async function createDraftCase(input: {
  caseType: Case["case_type"];
  fullName: string;
  bsn: string;
  taxYear: number;
  originCountryCode?: string;
}) {
  const response = await fetch("/api/cases/draft", {
    method: "POST",
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(input),
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as { caseId?: string | null; error?: string } | null;

  if (!response.ok || !payload?.caseId) {
    throw new Error(payload?.error ?? "draft_create_failed");
  }

  return payload.caseId;
}

async function invalidateCaseDocflow(queryClient: ReturnType<typeof useQueryClient>, caseId: string) {
  await Promise.all([
    queryClient.invalidateQueries({ queryKey: ["cases"] }),
    queryClient.invalidateQueries({ queryKey: ["case", caseId] }),
    queryClient.invalidateQueries({ queryKey: ["case-intake", caseId] }),
    queryClient.invalidateQueries({ queryKey: ["case-requirements", caseId] }),
    queryClient.invalidateQueries({ queryKey: ["case-progress", caseId] }),
    queryClient.invalidateQueries({ queryKey: ["case-documents", caseId] }),
    queryClient.invalidateQueries({ queryKey: ["case-events", caseId] }),
    queryClient.invalidateQueries({ queryKey: ["tax-summary", caseId] }),
  ]);
}

async function uploadToSignedSession(session: UploadSessionResponse, file: File) {
  const supabase = createSupabaseClient();

  if (supabase && session.token) {
    const result = await supabase.storage.from(session.storage_bucket).uploadToSignedUrl(session.path, session.token, file, {
      cacheControl: "3600",
      contentType: file.type || "application/octet-stream",
      upsert: true,
    });

    if (result.error) {
      throw result.error;
    }

    return;
  }

  if (!session.signedUrl) {
    throw new Error("signed_upload_missing");
  }

  const response = await fetch(session.signedUrl, {
    method: "PUT",
    headers: {
      "content-type": file.type || "application/octet-stream",
      "x-upsert": "true",
    },
    body: file,
  });

  if (!response.ok) {
    throw new Error("signed_upload_failed");
  }
}

async function computeFileSha256(file: File) {
  if (!globalThis.crypto?.subtle) return undefined;

  const buffer = await file.arrayBuffer();
  const digest = await globalThis.crypto.subtle.digest("SHA-256", buffer);
  return Array.from(new Uint8Array(digest))
    .map((value) => value.toString(16).padStart(2, "0"))
    .join("");
}

function isActiveTaxReturnCase(caseType: Case["case_type"], status: Case["status"]) {
  return caseType.startsWith("tax_return") && !["completed", "submitted"].includes(status);
}
