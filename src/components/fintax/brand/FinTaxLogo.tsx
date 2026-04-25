import * as React from "react";

import { cn } from "@/lib/cn";

export function FinTaxLogo({
  className,
  markClassName,
  wordmarkClassName,
}: {
  className?: string;
  markClassName?: string;
  wordmarkClassName?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-3", className)}>
      <span
        className={cn(
          "relative grid size-10 place-items-center rounded-[14px] bg-[#4CAF50] shadow-[0_10px_24px_rgba(76,175,80,0.25)]",
          markClassName,
        )}
        aria-hidden="true"
      >
        <svg viewBox="0 0 32 32" className="size-7 text-white" fill="none">
          <path d="M7 9.5C7 6.46 9.46 4 12.5 4H25v4.8H12.6a.8.8 0 0 0-.8.8v.2H25v4.7H7V9.5Z" fill="currentColor" />
          <path d="M7 16.4h14.2v4.7H11.8v.2a.8.8 0 0 0 .8.8h8.6V27h-8.7C9.46 27 7 24.54 7 21.5v-5.1Z" fill="currentColor" opacity=".88" />
        </svg>
      </span>
      <span className={cn("font-body text-2xl font-bold tracking-[-0.03em] text-white", wordmarkClassName)}>
        FinTax
      </span>
    </span>
  );
}
