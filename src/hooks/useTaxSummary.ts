"use client";

import { useQuery } from "@tanstack/react-query";

import { apiGet } from "@/hooks/api-client";
import type { Case } from "@/types/database";

export type TaxSummarySourceLabel = "tax_summary_api" | "case_data_fallback" | "summary_unavailable";

export interface TaxSummary {
  box1Income: number;
  box3Assets: number;
  credits: number;
  netResult: number;
  isFallback: boolean;
  sourceLabel: TaxSummarySourceLabel;
}

type TaxSummaryResponse = Partial<Pick<TaxSummary, "box1Income" | "box3Assets" | "credits" | "netResult">>;

const EMPTY_TAX_SUMMARY: TaxSummary = {
  box1Income: 0,
  box3Assets: 0,
  credits: 0,
  netResult: 0,
  isFallback: true,
  sourceLabel: "summary_unavailable",
};

function toNumber(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) ? value : 0;
}

function mapTaxSummaryResponse(summary: TaxSummaryResponse): TaxSummary {
  return {
    box1Income: toNumber(summary.box1Income),
    box3Assets: toNumber(summary.box3Assets),
    credits: toNumber(summary.credits),
    netResult: toNumber(summary.netResult),
    isFallback: false,
    sourceLabel: "tax_summary_api",
  };
}

export function deriveFallbackTaxSummary(caseItem: Case | null | undefined): TaxSummary {
  if (!caseItem) return EMPTY_TAX_SUMMARY;

  const wizardData = caseItem.wizard_data as Record<string, unknown>;
  const income = readRecord(wizardData.income);
  const assets = readRecord(wizardData.assets);
  const deductions = readRecord(wizardData.deductions);

  return {
    box1Income:
      toNumber(income.employmentIncome) +
      toNumber(income.selfEmploymentIncome) +
      toNumber(income.otherIncome) +
      toNumber(wizardData.grossIncome),
    box3Assets: toNumber(assets.taxpayerAssets) + toNumber(assets.partnerAssets) + toNumber(wizardData.box3Assets),
    credits:
      toNumber(deductions.healthcareCosts) +
      toNumber(deductions.educationCosts) +
      toNumber(deductions.donationCosts) +
      toNumber(wizardData.taxCredits),
    netResult: toNumber(caseItem.actual_refund ?? caseItem.estimated_refund),
    isFallback: true,
    sourceLabel: "case_data_fallback",
  };
}

export function useTaxSummary(caseId: string, enabled = true) {
  return useQuery({
    queryKey: ["tax-summary", caseId],
    enabled: Boolean(caseId) && enabled,
    retry: false,
    queryFn: async (): Promise<TaxSummary> => {
      try {
        const summary = await apiGet<TaxSummaryResponse>(`/api/cases/${caseId}/tax-summary`);
        return mapTaxSummaryResponse(summary);
      } catch {
        try {
          const caseItem = await apiGet<Case>(`/api/cases/${caseId}`);
          return deriveFallbackTaxSummary(caseItem);
        } catch {
          return EMPTY_TAX_SUMMARY;
        }
      }
    },
  });
}

function readRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}
