"use client";

import * as React from "react";

import { cn } from "@/lib/cn";

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function Tooltip({ content, children, className }: TooltipProps) {
  const [open, setOpen] = React.useState(false);
  const tooltipId = React.useId();

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <span aria-describedby={open ? tooltipId : undefined} className="inline-flex">
        {children}
      </span>
      <span
        id={tooltipId}
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 top-full z-30 mt-2 w-64 -translate-x-1/2 rounded-[var(--radius-md)] border border-border/60 bg-[rgba(16,23,18,0.96)] px-3 py-2 text-xs leading-5 text-white shadow-[0_16px_36px_rgba(7,12,10,0.24)] transition duration-150",
          open ? "translate-y-0 opacity-100" : "translate-y-1 opacity-0",
          className,
        )}
      >
        {content}
      </span>
    </span>
  );
}
