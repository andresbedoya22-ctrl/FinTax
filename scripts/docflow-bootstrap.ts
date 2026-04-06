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
const { ensureRuleMetadata } = serviceModule;

async function main() {
  const envFiles = loadLocalEnv();
  const supabase = createSupabaseAdminClient();
  const seeded: Array<{ caseType: string; taxYear: number; ruleSetId: string; version: string }> =
    [];

  for (const caseType of DOCFLOW_OPERATIONAL_CONFIG.supportedCaseTypes) {
    for (const taxYear of DOCFLOW_OPERATIONAL_CONFIG.supportedTaxYears) {
      const metadata = await ensureRuleMetadata({
        supabase,
        caseType,
        taxYear,
      });

      seeded.push({
        caseType,
        taxYear,
        ruleSetId: String(metadata.ruleSet.id),
        version: String(metadata.ruleSet.version),
      });
    }
  }

  console.log(
    JSON.stringify(
      {
        ok: true,
        envFiles,
        seedRelease: DOCFLOW_OPERATIONAL_CONFIG.seedRelease,
        activeTaxYear: DOCFLOW_OPERATIONAL_CONFIG.activeTaxYear,
        supportedCaseTypes: DOCFLOW_OPERATIONAL_CONFIG.supportedCaseTypes,
        supportedTaxYears: DOCFLOW_OPERATIONAL_CONFIG.supportedTaxYears,
        seeded,
      },
      null,
      2
    )
  );
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
    return "docflow_bootstrap_failed";
  }
}
