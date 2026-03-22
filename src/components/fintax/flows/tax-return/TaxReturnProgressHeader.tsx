"use client";

import { useTranslations } from "next-intl";

import { Badge, Stepper } from "@/components/ui";

import type { TaxReturnStepKey } from "./wizard";

export function TaxReturnProgressHeader({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: readonly TaxReturnStepKey[];
}) {
  const t = useTranslations("TaxReturn");
  const completion = Math.round(((currentStep + 1) / steps.length) * 100);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="copper">{t("progress.badge")}</Badge>
            <Badge variant="neutral">{t("progress.stepCount", { current: currentStep + 1, total: steps.length })}</Badge>
          </div>
          <div className="space-y-1">
            <h2 className="font-heading text-2xl tracking-[-0.03em] text-text">{t("wizardTitle")}</h2>
            <p className="text-sm text-secondary">{t(`steps.${steps[currentStep]}.description`)}</p>
          </div>
        </div>

        <div className="min-w-0 rounded-[24px] border border-border/45 bg-[linear-gradient(180deg,rgba(251,252,249,0.96),rgba(244,247,242,0.82))] px-4 py-4 lg:w-[23rem]">
          <div className="flex items-center justify-between gap-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("progress.completionLabel")}</p>
            <p className="text-sm font-semibold text-text">{completion}%</p>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface2/80" data-testid="tax-return-progress-bar">
            <div className="h-full rounded-full bg-[linear-gradient(90deg,#1f6a47,#c58f43)]" style={{ width: `${completion}%` }} />
          </div>
          <p className="mt-3 text-sm text-secondary">{t("progress.currentStepLabel", { step: t(`steps.${steps[currentStep]}.title`) })}</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2 sm:grid-cols-7 md:hidden" aria-label={t("progress.completionLabel")}>
        {steps.map((step, index) => {
          const active = currentStep === index;
          const complete = currentStep > index;

          return (
            <div
              key={step}
              className={`rounded-2xl border px-2 py-2 text-center ${active ? "border-green/35 bg-green/8" : complete ? "border-copper/30 bg-copper/8" : "border-border/40 bg-white/75"}`}
            >
              <p className={`text-xs font-semibold ${active ? "text-green" : complete ? "text-copper" : "text-muted"}`}>{index + 1}</p>
            </div>
          );
        })}
      </div>

      <Stepper
        steps={steps.map((step, index) => ({
          id: step,
          label: `${index + 1}. ${t(`steps.${step}.short`)}`,
          description: t(`steps.${step}.description`),
        }))}
        currentStep={currentStep + 1}
        className="hidden md:grid md:grid-cols-2 xl:grid-cols-4"
      />
    </div>
  );
}
