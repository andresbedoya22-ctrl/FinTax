"use client";

import { Check } from "lucide-react";

import { cn } from "@/lib/cn";

export interface HorizontalStepperStep {
  id: string;
  label: string;
}

export interface HorizontalStepperProps {
  currentStep: number;
  steps: HorizontalStepperStep[];
  currentStepLabel: string;
}

export function HorizontalStepper({ currentStep, steps, currentStepLabel }: HorizontalStepperProps) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-border/55 bg-surface p-4 shadow-[0_14px_30px_rgba(15,23,42,0.05)] sm:p-5">
      <div className="overflow-x-auto pb-1">
        <ol className="flex min-w-[760px] items-start gap-3 md:min-w-0 md:gap-4" aria-label="Case progress">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isComplete = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <li key={step.id} className="flex min-w-0 flex-1 items-start gap-3">
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-full border text-sm font-semibold transition-colors",
                        isComplete && "border-green bg-green text-white",
                        isCurrent && "border-green bg-green/8 text-green ring-4 ring-green/10",
                        !isComplete && !isCurrent && "border-border/70 bg-surface2/50 text-muted",
                      )}
                      aria-current={isCurrent ? "step" : undefined}
                    >
                      {isComplete ? <Check className="h-4 w-4" /> : stepNumber}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">
                        {isCurrent ? currentStepLabel : isComplete ? "Done" : "Pending"}
                      </p>
                      <p className={cn("text-sm font-semibold", isCurrent ? "text-text" : "text-secondary")}>{step.label}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "hidden h-1 rounded-full md:block",
                      isComplete ? "bg-green" : isCurrent ? "bg-gradient-to-r from-green to-copper" : "bg-border/60",
                    )}
                    aria-hidden="true"
                  />
                </div>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
