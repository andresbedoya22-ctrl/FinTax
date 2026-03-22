"use client";

import Link from "next/link";
import { ArrowRight, FolderKanban, Save } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/fintax/Button";

import { ContextNote, TaxPanel } from "./TaxReturnFormPrimitives";

export function TaxReturnActionPanel({
  caseId,
  draftSavedAt,
  readyToContinue,
}: {
  caseId: string | null;
  draftSavedAt?: string | null;
  readyToContinue: boolean;
}) {
  const t = useTranslations("TaxReturn");

  return (
    <TaxPanel title={t("submission.panelTitle")} description={t("submission.panelDescription")} className="space-y-4">
      <div className="rounded-[22px] border border-border/45 bg-white/80 px-4 py-3.5">
        <div className="flex items-center gap-2 text-text">
          <Save className="size-4 text-green" />
          <p className="text-sm font-semibold">{t("submission.saveTitle")}</p>
        </div>
        <p className="mt-2 text-sm leading-6 text-secondary">
          {caseId ? t("submission.saveConnected") : t("submission.saveLocal")}
        </p>
        <p className="mt-2 text-xs text-muted">{draftSavedAt ? new Date(draftSavedAt).toLocaleString() : t("summary.justNow")}</p>
      </div>

      <ContextNote title={t("submission.nextTitle")} copy={t("submission.nextCopy")} tone="success" />

      <div className="flex flex-col gap-3 sm:flex-row">
        {caseId ? (
          <Button asChild className="sm:flex-1" rightIcon={<ArrowRight className="size-4" />}>
            <Link href={`/tax-return/${caseId}`}>{t("submission.openCase")}</Link>
          </Button>
        ) : null}
        <Button variant="secondary" type="button" className="sm:flex-1" disabled={!readyToContinue} leftIcon={<FolderKanban className="size-4" />}>
          {t("submission.readyForReview")}
        </Button>
      </div>
    </TaxPanel>
  );
}
