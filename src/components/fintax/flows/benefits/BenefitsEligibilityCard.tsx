"use client";

import { ArrowRight, CheckCircle2, CircleX } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/fintax/Button";
import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";
import type { BenefitResult } from "@/lib/utils/eligibility-calculator";

import type { BenefitCardKey } from "./wizard";

export function BenefitsEligibilityCard({
  benefitKey,
  result,
  selected,
  onToggleSelected,
}: {
  benefitKey: BenefitCardKey;
  result: BenefitResult;
  selected: boolean;
  onToggleSelected: () => void;
}) {
  const t = useTranslations("Benefits");

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
        <Badge variant={result.eligible ? "success" : "outline"}>
          {result.eligible ? t("results.eligible") : t("results.notEligible")}
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
          <p className="font-heading text-3xl tracking-[-0.03em] text-text">EUR {result.estimatedAnnualAmount.toFixed(2)}</p>
        </div>
      </div>

      <div className="mt-4 rounded-[20px] border border-border/35 bg-white/70 p-4 sm:mt-5 sm:rounded-[22px]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("results.whyLabel")}</p>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-secondary">
          {result.reasoning.map((reason) => (
            <li key={reason} className="flex gap-2">
              <span className="mt-2 size-1.5 rounded-full bg-copper/85" />
              <span>{t(`results.reasonCodes.${reason}`)}</span>
            </li>
          ))}
        </ul>
      </div>

      <div className="mt-4 rounded-[20px] border border-border/35 bg-surface2/40 p-4 sm:rounded-[22px]">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("results.nextStepLabel")}</p>
        <p className="mt-2 text-sm leading-6 text-text">{t(`results.nextSteps.${result.nextStep}`)}</p>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {result.eligible ? (
          <Button type="button" variant={selected ? "secondary" : "primary"} onClick={onToggleSelected}>
            {selected ? t("results.removeFromPlan") : t("results.addToPlan")}
          </Button>
        ) : null}
        <div className="inline-flex items-center gap-1 text-sm text-secondary">
          <ArrowRight className="size-4 text-copper" />
          {t("results.reviewNotice")}
        </div>
      </div>
    </article>
  );
}
