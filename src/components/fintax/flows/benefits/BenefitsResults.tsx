"use client";

import { FileText, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import type { EligibilityResults } from "@/lib/utils/eligibility-calculator";

import { BenefitsBundleSummary } from "./BenefitsBundleSummary";
import { BenefitsEligibilityCard } from "./BenefitsEligibilityCard";
import type { BenefitCardKey } from "./wizard";
import { benefitCardOrder } from "./wizard";

export function BenefitsResults({
  results,
  selectedKeys,
  onToggleSelected,
}: {
  results: EligibilityResults;
  selectedKeys: BenefitCardKey[];
  onToggleSelected: (key: BenefitCardKey) => void;
}) {
  const t = useTranslations("Benefits");
  const eligibleCount = benefitCardOrder.filter((key) => results[key].eligible).length;
  const selectedAmount = selectedKeys.reduce((sum, key) => sum + results[key].estimatedAnnualAmount, 0);

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
            <h3 className="font-heading text-[clamp(1.9rem,3vw,2.7rem)] leading-tight tracking-[-0.04em] text-text">{summaryMessage}</h3>
            <p className="max-w-2xl text-sm leading-6 text-secondary">{t("results.disclaimer")}</p>
          </div>

          <div className="rounded-[24px] border border-border/40 bg-white/85 p-4" data-testid="benefits-results-total">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("results.totalLabel")}</p>
            <p className="mt-2 font-heading text-3xl tracking-[-0.03em] text-text">EUR {results.totalEstimatedAnnualAmount.toFixed(2)}</p>
            <p className="mt-2 text-sm text-secondary">{t("results.totalCaption")}</p>
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
              <p className="text-sm font-semibold text-text">{t("results.honestyTitle")}</p>
              <p className="mt-1 text-sm leading-6 text-secondary">{t("results.honestyCopy")}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        {benefitCardOrder.map((key) => (
          <BenefitsEligibilityCard
            key={key}
            benefitKey={key}
            result={results[key]}
            selected={selectedKeys.includes(key)}
            onToggleSelected={() => onToggleSelected(key)}
          />
        ))}
      </div>

      <BenefitsBundleSummary selectedKeys={selectedKeys} selectedAmount={selectedAmount} />
    </div>
  );
}
