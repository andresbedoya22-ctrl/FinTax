import type { CaseType } from "@/types/database";

export const DOCFLOW_OPERATIONAL_CONFIG = {
  activeTaxYear: 2025,
  supportedTaxYears: [2024, 2025],
  supportedCaseTypes: [
    "tax_return_p",
    "tax_return_m",
    "tax_return_c",
    "tax_return_w",
  ] as const satisfies readonly CaseType[],
  helpContentLocale: "en",
  seedRelease: "2026-04-06-internal-readiness",
} as const;

export type DocflowSupportedCaseType =
  (typeof DOCFLOW_OPERATIONAL_CONFIG.supportedCaseTypes)[number];
