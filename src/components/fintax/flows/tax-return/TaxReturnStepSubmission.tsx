"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";

import { TaxReturnActionPanel } from "./TaxReturnActionPanel";
import { ContextNote, TaxPanel, TaxStepLayout, ToggleCard } from "./TaxReturnFormPrimitives";
import type { TaxReturnFormValues } from "./wizard";

export function TaxReturnStepSubmission({
  form,
  values,
  caseId,
  updatedAt,
}: {
  form: UseFormReturn<TaxReturnFormValues>;
  values: TaxReturnFormValues;
  caseId: string | null;
  updatedAt?: string | null;
}) {
  const t = useTranslations("TaxReturn");

  return (
    <TaxStepLayout
      eyebrow={t("steps.submission.eyebrow")}
      title={t("steps.submission.title")}
      description={t("steps.submission.description")}
      aside={<TaxReturnActionPanel caseId={caseId} draftSavedAt={updatedAt} readyToContinue={values.submission.readyToContinue} />}
    >
      <TaxPanel title={t("steps.submission.sections.handoff.title")} description={t("steps.submission.sections.handoff.description")}>
        <ul className="space-y-3 text-sm text-secondary">
          {(t.raw("submission.nextSteps") as string[]).map((item) => (
            <li key={item} className="rounded-[22px] border border-border/45 bg-white/80 px-4 py-3.5">
              {item}
            </li>
          ))}
        </ul>
      </TaxPanel>

      <TaxPanel title={t("steps.submission.sections.preferences.title")} description={t("steps.submission.sections.preferences.description")}>
        <div className="space-y-4">
          <ToggleCard
            label={t("submission.reviewCall.label")}
            description={t("submission.reviewCall.description")}
            checked={values.submission.wantsReviewCall}
            onChange={(checked) => form.setValue("submission.wantsReviewCall", checked, { shouldDirty: true, shouldValidate: true })}
          />
          <ToggleCard
            label={t("submission.ready.label")}
            description={t("submission.ready.description")}
            checked={values.submission.readyToContinue}
            onChange={(checked) => form.setValue("submission.readyToContinue", checked, { shouldDirty: true, shouldValidate: true })}
          />
        </div>
      </TaxPanel>

      <ContextNote title={t("submission.authorizationTitle")} copy={t("submission.authorizationCopy")} />
    </TaxStepLayout>
  );
}
