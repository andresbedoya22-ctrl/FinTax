"use client";

import { AlertCircle, ArrowRight, FileCheck2, FolderKanban, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Button } from "@/components/fintax/Button";
import type { EligibilityResults } from "@/lib/utils/eligibility-calculator";

import { formatBenefitCurrency } from "./BenefitsFormPrimitives";
import { deriveBenefitDocumentSuggestions } from "./document-review";
import type { BenefitCardKey, BenefitsFormValues } from "./wizard";

export function BenefitsDocumentReviewStep({
  selectedKeys,
  selectedAmount,
  values,
  results,
  draftCaseId,
  isLaunching,
  launchError,
  onContinueToWorkspace,
}: {
  selectedKeys: BenefitCardKey[];
  selectedAmount: number;
  values: BenefitsFormValues;
  results: EligibilityResults;
  draftCaseId: string | null;
  isLaunching: boolean;
  launchError: string | null;
  onContinueToWorkspace: () => void;
}) {
  const locale = useLocale();
  const t = useTranslations("Benefits");
  const documentSuggestions = deriveBenefitDocumentSuggestions(selectedKeys, values);
  const householdLabel =
    values.householdType === "partners" ? t("documentReview.household.partnerHousehold") : t("documentReview.household.singleHousehold");

  if (selectedKeys.length === 0) {
    return (
      <section className="rounded-[24px] border border-border/45 bg-white/90 p-5 shadow-[0_18px_44px_rgba(17,36,26,0.06)] sm:rounded-[28px] sm:p-6">
        <div className="flex items-start gap-3">
          <div className="inline-flex size-11 items-center justify-center rounded-2xl border border-copper/20 bg-copper/10 text-copper">
            <AlertCircle className="size-5" />
          </div>
          <div className="space-y-2">
            <h3 className="font-heading text-2xl tracking-[-0.03em] text-text">{t("documentReview.emptyTitle")}</h3>
            <p className="max-w-2xl text-sm leading-6 text-secondary">{t("documentReview.emptyCopy")}</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[24px] border border-border/50 bg-[linear-gradient(180deg,rgba(251,252,249,0.98),rgba(242,246,240,0.9))] p-5 shadow-[0_22px_60px_rgba(17,36,26,0.08)] sm:rounded-[28px] sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-copper/20 bg-copper/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">
              <FileCheck2 className="size-3.5" />
              {t("documentReview.eyebrow")}
            </div>
            <div>
              <h3 className="font-heading text-[clamp(1.9rem,3vw,2.7rem)] leading-tight tracking-[-0.04em] text-text">{t("documentReview.title")}</h3>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-secondary">{t("documentReview.copy")}</p>
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <MetricCard
              label={t("documentReview.metrics.selectedBenefits")}
              value={String(selectedKeys.length)}
              copy={t("documentReview.metrics.selectedBenefitsCopy")}
            />
            <MetricCard
              label={t("documentReview.metrics.annualEstimate")}
              value={formatBenefitCurrency(selectedAmount, locale)}
              copy={householdLabel}
            />
          </div>
        </div>

        <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_20rem]">
          <div className="rounded-[22px] border border-border/40 bg-white/85 p-4 sm:rounded-[24px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("documentReview.selectedBenefitsLabel")}</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedKeys.map((benefitKey) => (
                <span key={benefitKey} className="rounded-full border border-green/20 bg-green/10 px-3 py-1 text-sm text-text">
                  {t(`results.cards.${benefitKey}.title`)}
                </span>
              ))}
            </div>
            <ul className="mt-4 space-y-2 text-sm text-secondary">
              {selectedKeys.map((benefitKey) => (
                <li key={benefitKey} className="rounded-[18px] border border-border/35 bg-surface2/30 px-3 py-2">
                  <span className="font-medium text-text">{t(`results.cards.${benefitKey}.title`)}</span>
                  <span className="text-secondary">{" · "}{t(`results.nextSteps.${results[benefitKey].nextStep}`)}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-[22px] border border-border/40 bg-white/85 p-4 sm:rounded-[24px]">
            <div className="flex items-start gap-3">
              <div className="inline-flex size-10 items-center justify-center rounded-2xl border border-green/20 bg-green/10 text-green">
                <ShieldCheck className="size-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-text">{t("documentReview.reviewReadinessTitle")}</p>
                <p className="mt-1 text-sm leading-6 text-secondary">{t("documentReview.reviewReadinessCopy")}</p>
              </div>
            </div>
            {draftCaseId ? (
              <div className="mt-4 rounded-[18px] border border-green/20 bg-green/10 px-3 py-3 text-sm text-text">
                <span className="font-medium">{t("documentReview.connectedCaseTitle")}</span>
                <span className="text-secondary">{" · "}{t("documentReview.connectedCaseCopy", { caseId: draftCaseId })}</span>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="rounded-[24px] border border-border/45 bg-white/92 p-5 shadow-[0_18px_44px_rgba(17,36,26,0.05)] sm:rounded-[28px] sm:p-6">
          <div className="space-y-2">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-copper">{t("documentReview.documentsLabel")}</p>
            <h4 className="font-heading text-2xl tracking-[-0.03em] text-text">{t("documentReview.documentsTitle")}</h4>
            <p className="text-sm leading-6 text-secondary">{t("documentReview.documentsCopy")}</p>
          </div>

          <div className="mt-5 space-y-3">
            {documentSuggestions.map((suggestion) => (
              <article key={suggestion.id} className="rounded-[22px] border border-border/35 bg-surface2/28 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h5 className="text-sm font-semibold text-text">{t(suggestion.titleKey)}</h5>
                    <p className="mt-1 text-sm leading-6 text-secondary">{t(suggestion.descriptionKey)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {suggestion.benefitKeys.map((benefitKey) => (
                      <span key={benefitKey} className="rounded-full border border-border/35 bg-white px-2.5 py-1 text-xs font-medium text-secondary">
                        {t(`results.cards.${benefitKey}.title`)}
                      </span>
                    ))}
                  </div>
                </div>
                {suggestion.hintKeys.length > 0 ? (
                  <ul className="mt-3 space-y-2">
                    {suggestion.hintKeys.map((hintKey) => (
                      <li key={hintKey} className="rounded-[16px] border border-copper/18 bg-copper/8 px-3 py-2 text-sm text-secondary">
                        {t(hintKey)}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </article>
            ))}
          </div>
        </div>

        <aside className="space-y-4">
          <div className="rounded-[24px] border border-green/18 bg-[linear-gradient(180deg,rgba(19,78,50,0.97),rgba(30,97,63,0.93))] p-5 text-white shadow-[0_22px_60px_rgba(19,78,50,0.25)] sm:rounded-[28px] sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/68">{t("documentReview.workspaceLabel")}</p>
            <h4 className="mt-3 font-heading text-2xl tracking-[-0.03em]">{t("documentReview.workspaceTitle")}</h4>
            <p className="mt-2 text-sm leading-6 text-white/80">{t("documentReview.workspaceCopy")}</p>

            <Button
              type="button"
              className="mt-5 w-full justify-center bg-white text-green hover:bg-white/95"
              onClick={onContinueToWorkspace}
              disabled={isLaunching}
              leftIcon={<FolderKanban className="size-4" />}
              rightIcon={<ArrowRight className="size-4" />}
            >
              {isLaunching ? t("documentReview.workspaceLoading") : t("documentReview.workspaceCta")}
            </Button>

            {launchError ? (
              <div className="mt-3 rounded-[18px] border border-white/12 bg-white/10 px-3 py-3 text-sm text-white/88">
                {launchError}
              </div>
            ) : null}
          </div>

          <div className="rounded-[24px] border border-border/40 bg-white/90 p-4 sm:rounded-[28px]">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("documentReview.householdHintsLabel")}</p>
            <ul className="mt-3 space-y-2 text-sm text-secondary">
              {values.householdType === "partners" ? <li>{t("documentReview.hints.partnerHousehold")}</li> : null}
              {values.childrenUnder18 > 0 ? <li>{t("documentReview.hints.childHousehold")}</li> : null}
              {values.usesChildcare ? <li>{t("documentReview.hints.childcareHours")}</li> : null}
              <li>{t("documentReview.hints.reviewOnly")}</li>
            </ul>
          </div>
        </aside>
      </div>
    </section>
  );
}

function MetricCard({
  label,
  value,
  copy,
}: {
  label: string;
  value: string;
  copy: string;
}) {
  return (
    <div className="min-w-[12rem] rounded-[22px] border border-border/35 bg-white/85 p-4 sm:rounded-[24px]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 font-heading text-3xl tracking-[-0.03em] text-text">{value}</p>
      <p className="mt-2 text-sm text-secondary">{copy}</p>
    </div>
  );
}
