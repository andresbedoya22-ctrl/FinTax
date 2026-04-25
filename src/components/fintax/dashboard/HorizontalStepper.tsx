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
  completedStepLabel: string;
  pendingStepLabel: string;
}

export function HorizontalStepper({
  currentStep,
  steps,
  currentStepLabel,
  completedStepLabel,
  pendingStepLabel,
}: HorizontalStepperProps) {
  return (
    <div className="overflow-hidden rounded-[1.6rem] border border-white/10 bg-white/[0.045] p-4 text-white shadow-[0_18px_44px_rgba(0,0,0,0.14)] sm:p-5">
      <ol className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5 lg:gap-4" aria-label="Case progress">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isComplete = stepNumber < currentStep;
            const isCurrent = stepNumber === currentStep;

            return (
              <li key={step.id} className="flex min-w-0">
                <div className="flex min-w-0 flex-1 flex-col gap-3 rounded-[1.2rem] border border-white/10 bg-white/[0.045] p-3 sm:p-4">
                  <div className="flex items-center gap-3">
                    <span
                      className={cn(
                        "grid h-10 w-10 shrink-0 place-items-center rounded-full border text-sm font-semibold transition-colors",
                        isComplete && "border-[#4CAF50] bg-[#4CAF50] text-white",
                        isCurrent && "border-[#4CAF50] bg-[#4CAF50]/[0.14] text-[#74D07B] ring-4 ring-[#4CAF50]/10",
                        !isComplete && !isCurrent && "border-white/[0.15] bg-white/[0.06] text-[#9FB0C4]",
                      )}
                      aria-current={isCurrent ? "step" : undefined}
                    >
                      {isComplete ? <Check className="h-4 w-4" /> : stepNumber}
                    </span>
                    <div className="min-w-0">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9FB0C4]">
                        {isCurrent ? currentStepLabel : isComplete ? completedStepLabel : pendingStepLabel}
                      </p>
                      <p className={cn("text-sm font-semibold", isCurrent ? "text-white" : "text-[#C8D2DF]")}>{step.label}</p>
                    </div>
                  </div>
                  <span
                    className={cn(
                      "h-1 rounded-full",
                      isComplete ? "bg-[#4CAF50]" : isCurrent ? "bg-[#4CAF50]" : "bg-white/10",
                    )}
                    aria-hidden="true"
                  />
                </div>
              </li>
            );
          })}
      </ol>
    </div>
  );
}
