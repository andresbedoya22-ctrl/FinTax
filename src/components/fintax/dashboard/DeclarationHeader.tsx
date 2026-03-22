"use client";

import { CalendarDays, Download, FileUp, FolderOpen } from "lucide-react";

import { Link } from "@/i18n/navigation";
import { Button, buttonVariants } from "@/components/ui";

export interface DeclarationHeaderProps {
  breadcrumbLabel: string;
  declarationLabel: string;
  taxYear: number;
  updatedLabel: string;
  deadlineLabel: string;
  primaryHref: string;
  primaryLabel: string;
  secondaryLabel: string;
  secondaryHint?: string;
  secondaryDisabled?: boolean;
}

export function DeclarationHeader({
  breadcrumbLabel,
  declarationLabel,
  taxYear,
  updatedLabel,
  deadlineLabel,
  primaryHref,
  primaryLabel,
  secondaryLabel,
  secondaryHint,
  secondaryDisabled = false,
}: DeclarationHeaderProps) {
  return (
    <header className="overflow-hidden rounded-[1.75rem] border border-border/55 bg-[linear-gradient(135deg,rgba(247,250,248,0.98),rgba(238,244,239,0.92))] p-5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] sm:p-6 lg:p-7">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          <span>{breadcrumbLabel}</span>
          <span className="h-1 w-1 rounded-full bg-border/80" aria-hidden="true" />
          <span className="text-green">
            {declarationLabel} {taxYear}
          </span>
        </div>

        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-green/20 bg-white/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-green shadow-[0_10px_25px_rgba(21,128,61,0.08)]">
              <FolderOpen className="h-3.5 w-3.5" />
              <span>{declarationLabel}</span>
            </div>
            <div className="space-y-2">
              <h1 className="font-heading text-[2.15rem] leading-none tracking-[-0.05em] text-text sm:text-[2.45rem] lg:text-[2.8rem]">
                {declarationLabel} {taxYear}
              </h1>
              <div className="flex flex-col gap-2 text-sm text-secondary sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-copper" />
                  {updatedLabel}
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-green" />
                  {deadlineLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap xl:w-auto">
            <Link href={primaryHref} className={buttonVariants({ size: "lg" }) + " w-full sm:w-auto"}>
              <FileUp className="h-4 w-4" />
              {primaryLabel}
            </Link>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
              disabled={secondaryDisabled}
              title={secondaryDisabled ? secondaryHint : undefined}
            >
              <Download className="h-4 w-4" />
              {secondaryLabel}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
