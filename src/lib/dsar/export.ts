import type { DsarRequest } from "@/types/database";

type QueryBuilder = {
  eq: (column: string, value: string) => QueryBuilder;
  order: (column: string, options?: { ascending?: boolean }) => Promise<{ data: unknown[] | null; error: { message: string } | null }>;
  maybeSingle: () => Promise<{ data: Record<string, unknown> | null; error: { message: string } | null }>;
};

type DsExportReader = {
  from: (table: string) => {
    select: (columns: string) => unknown;
  };
};

function maskProfileForExport(profile: Record<string, unknown> | null) {
  if (!profile) return null;

  const {
    bsn_encrypted: _legacyBsn,
    bsn_key_id: _bsnKeyId,
    bsn_ciphertext: _bsnCiphertext,
    ...safeProfile
  } = profile;

  return {
    ...safeProfile,
    bsn_on_file: Boolean(_legacyBsn || (_bsnKeyId && _bsnCiphertext)),
  };
}

function selectTable(deps: DsExportReader, table: string) {
  return deps.from(table).select("*") as QueryBuilder;
}

export async function buildDsarExportBundle(deps: DsExportReader, userId: string) {
  const [profileResult, casesResult, documentsResult, paymentsResult, notificationsResult, dsarResult] = await Promise.all([
    selectTable(deps, "profiles").eq("id", userId).maybeSingle(),
    selectTable(deps, "cases").eq("user_id", userId).order("created_at", { ascending: false }),
    selectTable(deps, "documents").eq("user_id", userId).order("created_at", { ascending: false }),
    selectTable(deps, "payments").eq("user_id", userId).order("created_at", { ascending: false }),
    selectTable(deps, "notifications").eq("user_id", userId).order("created_at", { ascending: false }),
    selectTable(deps, "dsar_requests").eq("user_id", userId).order("created_at", { ascending: false }),
  ]);

  const firstError = [
    profileResult.error,
    casesResult.error,
    documentsResult.error,
    paymentsResult.error,
    notificationsResult.error,
    dsarResult.error,
  ].find(Boolean);

  if (firstError) {
    throw new Error(firstError.message);
  }

  return {
    generated_at: new Date().toISOString(),
    profile: maskProfileForExport(profileResult.data),
    cases: casesResult.data ?? [],
    documents: documentsResult.data ?? [],
    payments: paymentsResult.data ?? [],
    notifications: notificationsResult.data ?? [],
    dsar_requests: (dsarResult.data ?? []) as DsarRequest[],
  };
}
