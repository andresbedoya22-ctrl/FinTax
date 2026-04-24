"use client";

import { FileText, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  buildBenefitEstimateRange,
  buildPrePaymentEstimateRange,
  type BenefitsResultsMode,
  type ToeslagenEvaluation,
} from "@/lib/toeslagen";

import { BenefitsBundleSummary } from "./BenefitsBundleSummary";
import { BenefitsEligibilityCard } from "./BenefitsEligibilityCard";
import { BenefitsPostPaymentNextSteps } from "./BenefitsPostPaymentNextSteps";
import type { BenefitCardKey } from "./wizard";

const benefitCardOrder: BenefitCardKey[] = [
  "zorgtoeslag",
  "huurtoeslag",
  "kindgebondenBudget",
  "kinderopvangtoeslag",
];

function formatCompactAmount(value: number, exact = false) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: exact ? 2 : 0,
    maximumFractionDigits: exact ? 2 : 0,
  }).format(value);
}

export function BenefitsResults({
  results,
  selectedKeys,
  onToggleSelected,
  mode = "prePayment",
  caseId = null,
  onContinueToCheckout,
  isCheckoutLoading = false,
}: {
  results: ToeslagenEvaluation;
  selectedKeys: BenefitCardKey[];
  onToggleSelected: (key: BenefitCardKey) => void;
  mode?: BenefitsResultsMode;
  caseId?: string | null;
  onContinueToCheckout?: () => void;
  isCheckoutLoading?: boolean;
}) {
  const t = useTranslations("Benefits");
  const eligibleCount = benefitCardOrder.filter((key) => results.results[key].eligible).length;
  const selectedAmount = selectedKeys.reduce((sum, key) => sum + (results.results[key].estimatedAnnualAmount ?? 0), 0);
  const totalRange = buildPrePaymentEstimateRange(results);
  const allRequiredDocuments = benefitCardOrder.flatMap((key) => results.results[key].requiredDocuments);

  const summaryMessage =
    eligibleCount === 0
      ? t("results.summary.none")
      : eligibleCount === 1
        ? t("results.summary.one")
        : t("results.summary.multiple");

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] border border-border/50 bg-[linear-gradient(135deg,rgba(250,252,249,0.98),rgba(242,246,240,0.88))] p-4 shadow-[0_24px_70px_rgba(17,36,26,0.08)] sm:rounded-[30px] sm:p-6">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_17rem_17rem]">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-copper/20 bg-copper/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
              <Sparkles className="size-3.5" />
              {t("results.summaryBadge")}
            </div>
            <h3 className="font-heading text-[clamp(1.9rem,3vw,2.7rem)] leading-tight tracking-[-0.04em] text-text">
              {mode === "prePayment" ? t("results.mode.prePayment.title") : t("results.mode.postPayment.title")}
            </h3>
            <p className="max-w-2xl text-sm leading-6 text-secondary">
              {mode === "prePayment"
                ? t("results.mode.prePayment.eligibleCount", { count: eligibleCount })
                : summaryMessage}
            </p>
          </div>

          <div className="rounded-[24px] border border-border/40 bg-white/85 p-4" data-testid="benefits-results-total">
            {mode === "prePayment" ? (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("results.mode.prePayment.rangeLabel")}</p>
                <p className="mt-2 font-heading text-3xl tracking-[-0.03em] text-text">
                  {formatCompactAmount(totalRange.minMonthly)} - {formatCompactAmount(totalRange.maxMonthly)}
                </p>
                <p className="mt-1 text-sm text-secondary">{t("results.range.monthly")}</p>
                <p className="mt-2 text-sm text-secondary">{t("results.mode.prePayment.disclaimer")}</p>
              </>
            ) : (
              <>
                <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("results.totalLabel")}</p>
                <p className="mt-2 font-heading text-3xl tracking-[-0.03em] text-text">EUR {results.totalEstimatedAnnualAmount.toFixed(2)}</p>
                <p className="mt-1 text-sm text-secondary">EUR {results.totalEstimatedMonthlyAmount.toFixed(2)} / {t("results.month")}</p>
                <p className="mt-2 text-sm text-secondary">{t("results.totalCaption")}</p>
              </>
            )}
          </div>

          <div className="rounded-[24px] border border-border/40 bg-white/85 p-4 md:col-span-2 xl:col-span-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("results.eligibleCountLabel")}</p>
            <p className="mt-2 font-heading text-3xl tracking-[-0.03em] text-text">{eligibleCount}</p>
            <p className="mt-2 text-sm text-secondary">{t("results.eligibleCountCaption")}</p>
          </div>
        </div>

        {eligibleCount === 0 ? (
          <div className="mt-5 rounded-[24px] border border-copper/25 bg-copper/8 p-4">
            <p className="text-sm font-semibold text-text">{t("results.noneEligibleTitle")}</p>
            <p className="mt-1 text-sm leading-6 text-secondary">{t("results.noneEligibleCopy")}</p>
          </div>
        ) : null}

        <div className="mt-5 rounded-[24px] border border-border/35 bg-white/75 p-4">
          <div className="flex items-start gap-3">
            <div className="inline-flex size-10 items-center justify-center rounded-2xl border border-border/35 bg-surface2/50 text-copper">
              <FileText className="size-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">
                {mode === "prePayment" ? t("results.mode.prePayment.supportingTitle") : t("results.honestyTitle")}
              </p>
              <p className="mt-1 text-sm leading-6 text-secondary">
                {mode === "prePayment" ? t("results.mode.prePayment.supporting") : t("results.honestyCopy")}
              </p>
            </div>
          </div>
        </div>

        {results.manualReviewRequired ? (
          <div className="mt-5 rounded-[24px] border border-copper/25 bg-copper/10 p-4">
            <p className="text-sm font-semibold text-text">{t("results.manualReviewTitle")}</p>
            <p className="mt-1 text-sm leading-6 text-secondary">
              {mode === "prePayment" ? t("results.mode.prePayment.manualReview") : t("results.manualReviewCopy")}
            </p>
          </div>
        ) : null}
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {benefitCardOrder.map((key) => (
          <BenefitsEligibilityCard
            key={key}
            benefitKey={key}
            result={results.results[key]}
            selected={selectedKeys.includes(key)}
            onToggleSelected={() => onToggleSelected(key)}
            mode={mode}
            range={mode === "prePayment" ? buildBenefitEstimateRange(results.results[key]) : null}
          />
        ))}
      </div>

      <BenefitsBundleSummary
        selectedKeys={selectedKeys}
        selectedAmount={selectedAmount}
        mode={mode}
        range={mode === "prePayment" ? totalRange : null}
        onContinueToCheckout={onContinueToCheckout}
        isCheckoutLoading={isCheckoutLoading}
      />

      {mode === "postPayment" ? <BenefitsPostPaymentNextSteps caseId={caseId} documents={allRequiredDocuments} /> : null}
    </div>
  );
}
