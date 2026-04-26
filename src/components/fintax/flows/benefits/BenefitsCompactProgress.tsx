"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/cn";

export type BenefitsCompactProgressProps = {
  currentStep: number;
  totalSteps: number;
  currentLabel: string;
  previousLabel?: string;
  nextLabel?: string;
  allSteps: string[];
  onStepClick?: (step: number) => void;
};

export function BenefitsCompactProgress({
  currentStep,
  totalSteps,
  currentLabel,
  previousLabel,
  nextLabel,
  allSteps,
  onStepClick,
}: BenefitsCompactProgressProps) {
  const t = useTranslations("Benefits.progress");
  const [open, setOpen] = React.useState(false);
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100);

  return (
    <section
      className="rounded-[24px] border border-white/10 bg-white/[0.045] p-4 text-white shadow-[0_18px_44px_rgba(0,0,0,0.14)]"
      data-testid="benefits-compact-progress"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#74D07B]">
            {t("stepCount", { current: currentStep + 1, total: totalSteps })}
          </p>
          <h2 className="mt-1 text-xl font-bold sm:text-2xl">{currentLabel}</h2>
        </div>
        <div className="text-sm font-semibold text-[#C8D2DF]">{t("completedPercent", { percent: progress })}</div>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10" aria-label={t("completedPercent", { percent: progress })} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress}>
        <div className="h-full rounded-full bg-[#4CAF50]" style={{ width: `${progress}%` }} />
      </div>

      <div className="mt-4 flex flex-col gap-3 text-sm md:flex-row md:items-center md:justify-between">
        <div className="grid gap-2 text-[#C8D2DF] sm:grid-cols-3">
          <span>{previousLabel ? t("previousStep", { step: previousLabel }) : t("firstStep")}</span>
          <span className="font-semibold text-white">{t("currentStep", { step: currentLabel })}</span>
          <span>{nextLabel ? t("nextStep", { step: nextLabel }) : t("lastStep")}</span>
        </div>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white outline-none transition hover:border-[#4CAF50]/35 hover:bg-white/[0.1] focus-visible:ring-4 focus-visible:ring-[#4CAF50]/25"
          aria-expanded={open}
          aria-controls="benefits-progress-disclosure"
          onClick={() => setOpen((value) => !value)}
        >
          {open ? t("hideSteps") : t("showSteps")}
          <ChevronDown className={cn("size-4 transition-transform", open && "rotate-180")} />
        </button>
      </div>

      {open ? (
        <ol id="benefits-progress-disclosure" data-testid="benefits-progress-disclosure" className="mt-4 grid gap-2 rounded-[18px] border border-white/10 bg-[#061426]/50 p-3 sm:grid-cols-2 lg:grid-cols-3">
          {allSteps.map((step, index) => {
            const isCompleted = index < currentStep;
            const isCurrent = index === currentStep;
            const clickable = Boolean(onStepClick && isCompleted);
            return (
              <li key={`${step}-${index}`}>
                <button
                  type="button"
                  disabled={!clickable}
                  onClick={() => onStepClick?.(index)}
                  className={cn(
                    "w-full rounded-[14px] border px-3 py-2 text-left text-sm transition",
                    isCurrent && "border-[#4CAF50]/50 bg-[#4CAF50]/[0.14] text-white",
                    isCompleted && !isCurrent && "border-white/10 bg-white/[0.04] text-[#C8D2DF]",
                    !isCompleted && !isCurrent && "border-transparent text-[#9FB0C4]",
                    clickable && "hover:border-[#4CAF50]/35 hover:bg-white/[0.08]",
                  )}
                >
                  <span className="font-mono text-xs">{index + 1}.</span> {step}
                </button>
              </li>
            );
          })}
        </ol>
      ) : null}
    </section>
  );
}
