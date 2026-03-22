"use client";

import { AlertCircle, Calculator, CircleDollarSign, FileClock } from "lucide-react";
import { useTranslations } from "next-intl";
import type { ComponentType } from "react";

import { ContextNote, HintCard, TaxPanel } from "./TaxReturnFormPrimitives";
import type { TaxReturnEstimate } from "./wizard";

function formatEuro(value: number) {
  return `EUR ${value.toLocaleString("en-US", { maximumFractionDigits: 0 })}`;
}

export function TaxReturnSummaryCard({ estimate, caseId, updatedAt }: { estimate: TaxReturnEstimate; caseId?: string | null; updatedAt?: string | null }) {
  const t = useTranslations("TaxReturn");

  return (
    <TaxPanel title={t("summary.cardTitle")} description={t("summary.cardDescription")} className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <HintCard
          label={t("summary.estimateLabel")}
          value={estimate.status === "range" && estimate.min !== null && estimate.max !== null ? `${formatEuro(estimate.min)} - ${formatEuro(estimate.max)}` : t("summary.pendingEstimate")}
        />
        <HintCard label={t("summary.confidenceLabel")} value={t(`summary.confidence.${estimate.confidence}`)} />
        <HintCard label={t("summary.reviewStateLabel")} value={caseId ? t("summary.draftConnected") : t("summary.localDraft")} />
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <Metric icon={CircleDollarSign} label={t("summary.incomeLabel")} value={formatEuro(estimate.incomeTotal)} />
        <Metric icon={Calculator} label={t("summary.deductionsLabel")} value={formatEuro(estimate.deductionsTotal)} />
        <Metric icon={FileClock} label={t("summary.lastSavedLabel")} value={updatedAt ? new Date(updatedAt).toLocaleString() : t("summary.justNow")} />
      </div>

      <ContextNote
        tone={estimate.status === "range" ? "warning" : "neutral"}
        title={t("summary.honestyTitle")}
        copy={estimate.status === "range" ? t("summary.honestyRangeCopy") : t("summary.honestyPendingCopy")}
      />

      {estimate.missingDataKeys.length > 0 ? (
        <div className="rounded-[22px] border border-border/45 bg-white/80 px-4 py-3.5">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 size-4 text-copper" />
            <div>
              <p className="text-sm font-semibold text-text">{t("summary.missingTitle")}</p>
              <ul className="mt-2 space-y-2 text-sm text-secondary">
                {estimate.missingDataKeys.map((item) => (
                  <li key={item}>{t(`summary.missingItems.${item}`)}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </TaxPanel>
  );
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-[22px] border border-border/45 bg-white/80 px-4 py-3.5">
      <div className="mb-2 inline-flex size-8 items-center justify-center rounded-2xl border border-border/45 bg-surface2/55 text-green">
        <Icon className="size-4" />
      </div>
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-text">{value}</p>
    </div>
  );
}
