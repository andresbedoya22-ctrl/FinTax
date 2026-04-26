"use client";

import * as React from "react";
import { Check } from "lucide-react";

import { cn } from "@/lib/cn";

export type BenefitsOptionCardProps = {
  selected: boolean;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  onToggle: () => void;
  disabled?: boolean;
  testId?: string;
};

export function BenefitsOptionCard({
  selected,
  title,
  description,
  icon,
  onToggle,
  disabled = false,
  testId = "benefits-option-card",
}: BenefitsOptionCardProps) {
  const skipNextClickRef = React.useRef(false);

  return (
    <button
      type="button"
      aria-pressed={selected}
      disabled={disabled}
      data-state={selected ? "selected" : "unselected"}
      data-testid={testId}
      onClick={() => {
        if (skipNextClickRef.current) {
          skipNextClickRef.current = false;
          return;
        }

        onToggle();
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          skipNextClickRef.current = true;
          onToggle();
        }
      }}
      className={cn(
        "group flex w-full items-start gap-4 rounded-[22px] border p-5 text-left text-white outline-none transition focus-visible:ring-4 focus-visible:ring-[#4CAF50]/25 disabled:cursor-not-allowed disabled:opacity-60",
        selected
          ? "border-[#4CAF50] bg-[#4CAF50]/[0.14] shadow-[0_18px_42px_rgba(76,175,80,0.12)]"
          : "border-white/10 bg-white/[0.045] hover:border-white/[0.18] hover:bg-white/[0.07]",
      )}
    >
      {icon ? (
        <span className="grid size-12 shrink-0 place-items-center rounded-[18px] bg-[#EAF7EC] text-[#3F9E48]">
          {icon}
        </span>
      ) : null}
      <span className="min-w-0 flex-1">
        <span className="block text-base font-bold">{title}</span>
        {description ? <span className="mt-1 block text-sm leading-6 text-[#C8D2DF]">{description}</span> : null}
      </span>
      <span
        className={cn(
          "grid size-7 shrink-0 place-items-center rounded-full border transition",
          selected ? "border-[#4CAF50] bg-[#4CAF50] text-white" : "border-white/15 text-transparent group-hover:text-white/50",
        )}
        aria-hidden="true"
      >
        <Check className="size-4" />
      </span>
    </button>
  );
}
