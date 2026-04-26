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
    <header className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-[#0B2340]/80 p-5 text-white shadow-[0_22px_56px_rgba(0,0,0,0.16)] backdrop-blur sm:p-6 lg:p-7">
      <div className="flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-[#9FB0C4]">
          <span>{breadcrumbLabel}</span>
          <span className="h-1 w-1 rounded-full bg-white/30" aria-hidden="true" />
          <span className="text-[#74D07B]">
            {declarationLabel} {taxYear}
          </span>
        </div>

        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl space-y-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-[#4CAF50]/25 bg-[#4CAF50]/[0.14] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#74D07B] shadow-[0_10px_25px_rgba(76,175,80,0.08)]">
              <FolderOpen className="h-3.5 w-3.5" />
              <span>{declarationLabel}</span>
            </div>
            <div className="space-y-2">
              <h1 className="font-heading text-[2.15rem] leading-none text-white sm:text-[2.45rem] lg:text-[2.8rem]">
                {declarationLabel} {taxYear}
              </h1>
              <div className="flex flex-col gap-2 text-sm text-[#C8D2DF] sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[#D97706]" />
                  {updatedLabel}
                </span>
                <span className="inline-flex items-center gap-2">
                  <CalendarDays className="h-4 w-4 text-[#4CAF50]" />
                  {deadlineLabel}
                </span>
              </div>
            </div>
          </div>

          <div className="flex w-full flex-col gap-2 sm:flex-row sm:flex-wrap xl:w-auto">
            <Link href={primaryHref} className={buttonVariants({ size: "lg" }) + " w-full bg-[#4CAF50] text-white shadow-[0_16px_28px_rgba(76,175,80,0.22)] hover:bg-[#3F9E48] sm:w-auto"}>
              <FileUp className="h-4 w-4" />
              {primaryLabel}
            </Link>
            <Button
              type="button"
              variant="secondary"
              size="lg"
              className="w-full border-white/[0.15] bg-white/[0.06] text-white hover:border-[#4CAF50]/35 hover:bg-white/[0.1] sm:w-auto"
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
