"use client";

import { CheckCircle2, Circle, FileText } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/fintax/Button";
import { useCaseProgress, useCaseRequirements } from "@/hooks/useTaxReturnDocFlow";
import type { DocumentRequirement } from "@/lib/toeslagen";

function buildFallbackItems(documents: DocumentRequirement[]) {
  const seen = new Set<string>();

  return documents.filter((document) => {
    if (seen.has(document.code)) {
      return false;
    }

    seen.add(document.code);
    return true;
  });
}

export function BenefitsPostPaymentNextSteps({
  caseId,
  documents,
}: {
  caseId?: string | null;
  documents: DocumentRequirement[];
}) {
  const t = useTranslations("Benefits");
  const requirementsQuery = useCaseRequirements(caseId ?? "", Boolean(caseId));
  const progressQuery = useCaseProgress(caseId ?? "", Boolean(caseId));
  const requirementItems = requirementsQuery.data?.requirements ?? [];
  const fallbackItems = buildFallbackItems(documents);
  const connectedChecklist = requirementItems.length > 0;
  const progress = progressQuery.data ?? requirementsQuery.data?.progress ?? null;

  return (
    <section className="rounded-[24px] border border-border/45 bg-[linear-gradient(180deg,rgba(251,252,249,0.98),rgba(244,247,242,0.9))] p-4 sm:rounded-[28px] sm:p-5">
      <div className="flex items-start gap-3">
        <div className="inline-flex size-11 items-center justify-center rounded-2xl border border-green/25 bg-green/10 text-green">
          <CheckCircle2 className="size-5" />
        </div>
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-copper">{t("results.mode.postPayment.status")}</p>
          <h3 className="font-heading text-2xl tracking-[-0.03em] text-text">{t("results.mode.postPayment.nextStep")}</h3>
          <p className="text-sm leading-6 text-secondary">{t("results.mode.postPayment.documentsIntro")}</p>
        </div>
      </div>

      <div className="mt-5 rounded-[22px] border border-border/35 bg-white/80 p-4 sm:rounded-[24px]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("results.documentsLabel")}</p>
            <p className="mt-1 text-sm text-secondary">
              {connectedChecklist && progress
                ? t("documents.readyForReview", {
                    completed: progress.completed,
                    total: progress.total,
                  })
                : t("documents.uploadNext")}
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full border border-border/35 bg-surface2/45 px-3 py-1 text-xs text-secondary">
            <FileText className="size-3.5 text-copper" />
            {connectedChecklist ? t("documents.connectedFlow") : t("documents.stagedFlow")}
          </div>
        </div>

        <ul className="mt-4 space-y-2 text-sm leading-6 text-text">
          {connectedChecklist
            ? requirementItems.slice(0, 8).map((requirement) => (
                <li key={requirement.id} className="flex items-start gap-2 rounded-[16px] border border-border/30 bg-surface2/30 px-3 py-2">
                  {["approved", "waived"].includes(requirement.status) ? (
                    <CheckCircle2 className="mt-1 size-4 text-green" />
                  ) : (
                    <Circle className="mt-1 size-4 text-copper" />
                  )}
                  <span>{requirement.title}</span>
                </li>
              ))
            : fallbackItems.slice(0, 8).map((document) => (
                <li key={document.code} className="flex items-start gap-2 rounded-[16px] border border-border/30 bg-surface2/30 px-3 py-2">
                  <Circle className="mt-1 size-4 text-copper" />
                  <span>{t(document.labelKey.replace(/^Benefits\./, ""))}</span>
                </li>
              ))}
        </ul>
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Button type="button" disabled={!connectedChecklist}>
          {t("documents.uploadNext")}
        </Button>
        <p className="max-w-2xl text-sm leading-6 text-secondary">{t("results.mode.postPayment.reviewPromise")}</p>
      </div>
    </section>
  );
}
