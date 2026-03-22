"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";

import { ChoiceCard, ChoiceGrid, ContextNote, Field, HintCard, TaxPanel, TaxStepLayout, inputClass } from "./TaxReturnFormPrimitives";
import type { TaxReturnFormValues } from "./wizard";

export function TaxReturnStepHousing({
  form,
  values,
}: {
  form: UseFormReturn<TaxReturnFormValues>;
  values: TaxReturnFormValues;
}) {
  const t = useTranslations("TaxReturn");

  return (
    <TaxStepLayout
      eyebrow={t("steps.housing.eyebrow")}
      title={t("steps.housing.title")}
      description={t("steps.housing.description")}
      aside={
        <>
          <HintCard label={t("aside.homeSituationLabel")} value={t(`housing.situation.${values.housing.homeSituation}.label`)} />
          <HintCard label={t("aside.householdSizeLabel")} value={String(values.housing.householdSize)} />
          <ContextNote title={t("steps.housing.noteTitle")} copy={t("steps.housing.noteCopy")} />
        </>
      }
    >
      <TaxPanel title={t("steps.housing.sections.status.title")} description={t("steps.housing.sections.status.description")}>
        <ChoiceGrid>
          {(["tenant", "owner", "hosted", "other"] as const).map((option) => (
            <ChoiceCard
              key={option}
              label={t(`housing.situation.${option}.label`)}
              description={t(`housing.situation.${option}.description`)}
              active={values.housing.homeSituation === option}
              onClick={() => form.setValue("housing.homeSituation", option, { shouldDirty: true, shouldValidate: true })}
            />
          ))}
        </ChoiceGrid>
      </TaxPanel>

      <TaxPanel title={t("steps.housing.sections.address.title")} description={t("steps.housing.sections.address.description")}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("fields.address")} error={form.formState.errors.housing?.address?.message}>
            <input className={inputClass} {...form.register("housing.address")} />
          </Field>
          <Field label={t("fields.city")} error={form.formState.errors.housing?.city?.message}>
            <input className={inputClass} {...form.register("housing.city")} />
          </Field>
          <Field label={t("fields.postalCode")} error={form.formState.errors.housing?.postalCode?.message}>
            <input className={inputClass} {...form.register("housing.postalCode")} />
          </Field>
          <Field label={t("fields.householdSize")} error={form.formState.errors.housing?.householdSize?.message}>
            <input type="number" className={inputClass} {...form.register("housing.householdSize", { valueAsNumber: true })} />
          </Field>
          <Field label={t("fields.monthlyHousingCost")} error={form.formState.errors.housing?.monthlyHousingCost?.message}>
            <input type="number" className={inputClass} {...form.register("housing.monthlyHousingCost", { valueAsNumber: true })} />
          </Field>
        </div>
      </TaxPanel>
    </TaxStepLayout>
  );
}
