import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/cn";

export interface StepItem {
  id: string;
  label: string;
  description?: string;
}

export interface StepperProps extends React.HTMLAttributes<HTMLOListElement> {
  steps: StepItem[];
  currentStep: number;
}

function Stepper({ steps, currentStep, className, ...props }: StepperProps) {
  return (
    <ol className={cn("grid gap-3", className)} {...props}>
      {steps.map((step, index) => {
        const stepNumber = index + 1;
        const isComplete = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        return (
          <li
            key={step.id}
            className={cn(
              "editorial-frame relative overflow-hidden rounded-[var(--radius-lg)] p-4",
              "bg-surface/65",
              isCurrent && "border-green/35 bg-green/5",
              isComplete && "border-copper/25 bg-copper/5",
            )}
          >
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "mt-0.5 grid h-7 w-7 place-items-center rounded-full border text-xs font-semibold",
                  isComplete && "border-copper/40 bg-copper/15 text-copper",
                  isCurrent && "border-green/40 bg-green/15 text-green-hover",
                  !isCurrent && !isComplete && "border-border/70 bg-surface2/80 text-muted",
                )}
              >
                {isComplete ? <Check className="h-3.5 w-3.5" /> : stepNumber}
              </div>
              <div className="min-w-0">
                <p className={cn("text-sm font-medium text-secondary", isCurrent && "text-text")}>{step.label}</p>
                {step.description ? <p className="mt-1 text-xs leading-5 text-muted">{step.description}</p> : null}
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

export { Stepper };
