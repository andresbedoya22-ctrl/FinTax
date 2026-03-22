"use client";

import { useTranslations } from "next-intl";

import { TaxReturnDocumentChecklist } from "./TaxReturnDocumentChecklist";
import { TaxReturnSummaryCard } from "./TaxReturnSummaryCard";
import { ContextNote, TaxPanel, TaxStepLayout } from "./TaxReturnFormPrimitives";
import type { TaxReturnEstimate, TaxReturnFormValues } from "./wizard";

export function TaxReturnStepSummary({
  values,
  estimate,
  caseId,
  updatedAt,
}: {
  values: TaxReturnFormValues;
  estimate: TaxReturnEstimate;
  caseId: string | null;
  updatedAt?: string | null;
}) {
  const t = useTranslations("TaxReturn");

  return (
    <TaxStepLayout
      eyebrow={t("steps.summary.eyebrow")}
      title={t("steps.summary.title")}
      description={t("steps.summary.description")}
      aside={<TaxReturnSummaryCard estimate={estimate} caseId={caseId} updatedAt={updatedAt} />}
    >
      <TaxPanel title={t("summary.caseSnapshotTitle")} description={t("summary.caseSnapshotDescription")}>
        <div className="grid gap-3 md:grid-cols-2">
          <SummaryRow label={t("summary.snapshot.service")} value={t(`services.${serviceKey(values.service)}.title`)} />
          <SummaryRow label={t("summary.snapshot.taxYear")} value={String(values.filing.taxYear)} />
          <SummaryRow label={t("summary.snapshot.residency")} value={t(`identity.residency.${values.filing.residency}.label`)} />
          <SummaryRow label={t("summary.snapshot.filingStatus")} value={t(`identity.filingStatus.${values.filing.filingStatus}.label`)} />
          <SummaryRow label={t("summary.snapshot.income")} value={`EUR ${estimate.incomeTotal.toLocaleString("en-US")}`} />
          <SummaryRow label={t("summary.snapshot.deductions")} value={`EUR ${estimate.deductionsTotal.toLocaleString("en-US")}`} />
        </div>
      </TaxPanel>

      <TaxReturnDocumentChecklist values={values} />

      <ContextNote title={t("summary.validationTitle")} copy={t("summary.validationCopy")} tone="warning" />
    </TaxStepLayout>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-border/45 bg-white/80 px-4 py-3.5">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-text">{value}</p>
    </div>
  );
}

function serviceKey(service: TaxReturnFormValues["service"]) {
  switch (service) {
    case "tax_return_m":
      return "formM";
    case "tax_return_c":
      return "formC";
    case "tax_return_w":
      return "zzp";
    default:
      return "formP";
  }
}
