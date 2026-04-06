import type { Case } from "@/types/database";
import * as operationalConfigNamespace from "@/lib/tax-documents/operational-config";
import * as contractsNamespace from "@/lib/tax-documents/contracts";
import * as serviceNamespace from "@/lib/tax-documents/service";

import { loadLocalEnv } from "./lib/load-local-env";
import { createSupabaseAdminClient } from "./lib/supabase-admin";

const operationalConfigModule = resolveModule(
  operationalConfigNamespace
) as typeof import("@/lib/tax-documents/operational-config");
const contractsModule = resolveModule(
  contractsNamespace
) as typeof import("@/lib/tax-documents/contracts");
const serviceModule = resolveModule(
  serviceNamespace
) as typeof import("@/lib/tax-documents/service");
const { DOCFLOW_OPERATIONAL_CONFIG } = operationalConfigModule;
const { taxReturnIntakeSchema } = contractsModule;
const { saveCaseIntake } = serviceModule;
type TaxReturnIntakePayload = import("@/lib/tax-documents/contracts").TaxReturnIntakePayload;

type TaxCaseRow = Pick<
  Case,
  | "id"
  | "user_id"
  | "case_type"
  | "status"
  | "display_name"
  | "tax_year"
  | "origin_country_code"
  | "wizard_data"
  | "current_intake_snapshot_id"
>;

async function main() {
  const apply = process.argv.includes("--apply");
  const envFiles = loadLocalEnv();
  const supabase = createSupabaseAdminClient();
  const caseIdArg = readArg("--case-id");
  const limitArg = Number(readArg("--limit") ?? "50");
  const actorId = readArg("--actor-id");

  const query = supabase
    .from("cases")
    .select(
      "id,user_id,case_type,status,display_name,tax_year,origin_country_code,wizard_data,current_intake_snapshot_id"
    )
    .in("case_type", [...DOCFLOW_OPERATIONAL_CONFIG.supportedCaseTypes])
    .in("status", [
      "draft",
      "pending_payment",
      "paid",
      "pending_authorization",
      "authorized",
      "pending_documents",
      "in_review",
    ])
    .order("updated_at", { ascending: false })
    .limit(Number.isFinite(limitArg) && limitArg > 0 ? limitArg : 50);

  if (caseIdArg) query.eq("id", caseIdArg);

  const { data, error } = await query;
  if (error) throw error;

  const report = {
    ok: true,
    apply,
    envFiles,
    scanned: (data ?? []).length,
    migrated: [] as string[],
    alreadyMigrated: [] as string[],
    eligibleDryRun: [] as string[],
    skipped: [] as Array<{ caseId: string; reason: string }>,
  };

  for (const item of (data ?? []) as TaxCaseRow[]) {
    if (item.current_intake_snapshot_id) {
      report.alreadyMigrated.push(item.id);
      continue;
    }

    const payload = extractBackfillPayload(item.wizard_data);
    if (!payload) {
      report.skipped.push({
        caseId: item.id,
        reason: "wizard_data_not_docflow_compatible",
      });
      continue;
    }

    if (!apply) {
      report.eligibleDryRun.push(item.id);
      continue;
    }

    await saveCaseIntake({
      supabase,
      caseRecord: item as Case,
      actorId: actorId ?? item.user_id,
      source: "migration",
      payload,
    });

    report.migrated.push(item.id);
  }

  console.log(JSON.stringify(report, null, 2));
}

function extractBackfillPayload(value: unknown): TaxReturnIntakePayload | null {
  const candidates: unknown[] = [];

  if (value && typeof value === "object") {
    candidates.push(value);

    const record = value as Record<string, unknown>;
    if ("payload" in record) candidates.push(record.payload);
    if ("docflowPayload" in record) candidates.push(record.docflowPayload);
  }

  for (const candidate of candidates) {
    const parsed = taxReturnIntakeSchema.safeParse(candidate);
    if (parsed.success) {
      return parsed.data;
    }
  }

  return null;
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
    return "docflow_backfill_failed";
  }
}
