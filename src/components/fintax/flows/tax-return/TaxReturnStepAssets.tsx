"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";

import { ContextNote, Field, HintCard, TaxPanel, TaxStepLayout, ToggleCard, inputClass, textareaClass } from "./TaxReturnFormPrimitives";
import type { TaxReturnFormValues } from "./wizard";

export function TaxReturnStepAssets({
  form,
  values,
}: {
  form: UseFormReturn<TaxReturnFormValues>;
  values: TaxReturnFormValues;
}) {
  const t = useTranslations("TaxReturn");
  const totalAssets = values.assets.taxpayerAssets + values.assets.partnerAssets;

  return (
    <TaxStepLayout
      eyebrow={t("steps.assets.eyebrow")}
      title={t("steps.assets.title")}
      description={t("steps.assets.description")}
      aside={
        <>
          <HintCard label={t("aside.box3Label")} value={values.assets.hasBox3Exposure ? t("common.yes") : t("common.no")} />
          <HintCard label={t("aside.assetTotalLabel")} value={`EUR ${totalAssets}`} />
          <ContextNote title={t("steps.assets.noteTitle")} copy={t("steps.assets.noteCopy")} tone="warning" />
        </>
      }
    >
      <TaxPanel title={t("steps.assets.sections.scope.title")} description={t("steps.assets.sections.scope.description")}>
        <ToggleCard
          label={t("assets.box3.label")}
          description={t("assets.box3.description")}
          checked={values.assets.hasBox3Exposure}
          onChange={(checked) => form.setValue("assets.hasBox3Exposure", checked, { shouldDirty: true, shouldValidate: true })}
        />
      </TaxPanel>

      {values.assets.hasBox3Exposure ? (
        <TaxPanel title={t("steps.assets.sections.details.title")} description={t("steps.assets.sections.details.description")}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("fields.taxpayerAssets")} error={form.formState.errors.assets?.taxpayerAssets?.message}>
              <input type="number" className={inputClass} {...form.register("assets.taxpayerAssets", { valueAsNumber: true })} />
            </Field>
            <Field label={t("fields.partnerAssets")} error={form.formState.errors.assets?.partnerAssets?.message}>
              <input type="number" className={inputClass} {...form.register("assets.partnerAssets", { valueAsNumber: true })} />
            </Field>
          </div>

          <div className="mt-4 space-y-4">
            <ToggleCard
              label={t("assets.foreign.label")}
              description={t("assets.foreign.description")}
              checked={values.assets.hasForeignAssets}
              onChange={(checked) => form.setValue("assets.hasForeignAssets", checked, { shouldDirty: true, shouldValidate: true })}
            />
            <Field label={t("fields.assetNotes")}>
              <textarea className={textareaClass} {...form.register("assets.notes")} />
            </Field>
          </div>
        </TaxPanel>
      ) : null}
    </TaxStepLayout>
  );
}
