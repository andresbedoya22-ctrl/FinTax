"use client";

import { ArrowRight, CheckCircle2, CircleX, FileWarning } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/fintax/Button";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { BenefitEvaluationResult } from "@/lib/toeslagen";

import type { BenefitCardKey } from "./wizard";

export function BenefitsEligibilityCard({
  benefitKey,
  result,
  selected,
  onToggleSelected,
}: {
  benefitKey: BenefitCardKey;
  result: BenefitEvaluationResult;
  selected: boolean;
  onToggleSelected: () => void;
}) {
  const t = useTranslations("Benefits");
  const topReasons = [...result.blockingReasons, ...result.warningReasons].slice(0, 3);
  const amount = result.estimatedAnnualAmount ?? 0;
  const monthlyAmount = result.estimatedMonthlyAmount ?? 0;

  return (
    <article
      className={cn(
        "rounded-[24px] border p-4 shadow-[0_18px_40px_rgba(17,36,26,0.06)] sm:rounded-[28px] sm:p-5",
        result.eligible
          ? "border-green/30 bg-[linear-gradient(180deg,rgba(248,251,248,0.96),rgba(233,245,237,0.8))]"
          : "border-border/50 bg-[linear-gradient(180deg,rgba(250,251,248,0.94),rgba(245,247,243,0.82))]",
      )}
      data-testid={`benefit-card-${benefitKey}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-semibold text-text">{t(`results.cards.${benefitKey}.title`)}</h4>
          <p className="mt-1 text-sm text-secondary">{t(`results.cards.${benefitKey}.subtitle`)}</p>
        </div>
        <Badge variant={result.eligible ? "success" : result.manualReviewRequired ? "copper" : "outline"}>
          {result.manualReviewRequired ? t("results.manualReview") : result.eligible ? t("results.eligible") : t("results.notEligible")}
        </Badge>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div
          className={cn(
            "inline-flex size-10 items-center justify-center rounded-2xl border",
            result.eligible ? "border-green/35 bg-green/12 text-green" : "border-border/45 bg-surface text-muted",
          )}
        >
          {result.eligible ? <CheckCircle2 className="size-5" /> : <CircleX className="size-5" />}
        </div>
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("results.estimatedAnnualLabel")}</p>
          <p className="font-heading text-3xl tracking-[-0.03em] text-text">EUR {amount.toFixed(2)}</p>
          <p className="mt-1 text-sm text-secondary">EUR {monthlyAmount.toFixed(2)} / {t("results.month")}</p>
        </div>
      </div>

      <div className="mt-4 rounded-[20px] border border-border/35 bg-white/70 p-4 sm:mt-5 sm:rounded-[22px]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("results.topReasonsLabel")}</p>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-secondary">
          {topReasons.map((reason) => (
            <li key={reason} className="flex gap-2">
              <span className="mt-2 size-1.5 rounded-full bg-copper/85" />
              <span>{t(`reasonCodes.${reason}`)}</span>
            </li>
          ))}
        </ul>
      </div>

      <details className="mt-4 rounded-[20px] border border-border/35 bg-surface2/40 p-4 sm:rounded-[22px]">
        <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("results.calculationTraceLabel")}</summary>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-text">
          {result.calculationSteps.map((step) => (
            <li key={step.code} className="rounded-[14px] border border-border/30 bg-white/70 px-3 py-2">
              <span className="font-medium">{t(step.labelKey.replace(/^Benefits\./, ""))}</span>: {String(step.value)}
              {step.formula ? <span className="block text-xs text-secondary">{step.formula}</span> : null}
            </li>
          ))}
        </ul>
      </details>

      <details className="mt-4 rounded-[20px] border border-border/35 bg-surface2/40 p-4 sm:rounded-[22px]">
        <summary className="cursor-pointer text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("results.documentsLabel")}</summary>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-text">
          {[...result.requiredDocuments, ...result.optionalDocuments].map((document) => (
            <li key={document.code} className="flex items-start gap-2">
              <FileWarning className="mt-1 size-4 text-copper" />
              <span>{t(document.labelKey.replace(/^Benefits\./, ""))}</span>
            </li>
          ))}
        </ul>
      </details>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {result.eligible ? (
          <Button type="button" variant={selected ? "secondary" : "primary"} onClick={onToggleSelected}>
            {selected ? t("results.removeFromPlan") : t("results.addToPlan")}
          </Button>
        ) : null}
        <div className="inline-flex items-center gap-1 text-sm text-secondary">
          <ArrowRight className="size-4 text-copper" />
          {result.manualReviewRequired ? t("results.manualReviewNotice") : t("results.reviewNotice")}
        </div>
      </div>
    </article>
  );
}
