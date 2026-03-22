"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";

import { ChoiceCard, ChoiceGrid, ContextNote, Field, HintCard, TaxPanel, TaxStepLayout, inputClass, textareaClass } from "./TaxReturnFormPrimitives";
import type { TaxReturnFormValues } from "./wizard";

export function TaxReturnStepDeductions({
  form,
  values,
}: {
  form: UseFormReturn<TaxReturnFormValues>;
  values: TaxReturnFormValues;
}) {
  const t = useTranslations("TaxReturn");
  const deductionTotal =
    values.deductions.healthcareCosts + values.deductions.educationCosts + values.deductions.donationCosts;

  return (
    <TaxStepLayout
      eyebrow={t("steps.deductions.eyebrow")}
      title={t("steps.deductions.title")}
      description={t("steps.deductions.description")}
      aside={
        <>
          <HintCard label={t("aside.deductionTotalLabel")} value={`EUR ${deductionTotal}`} />
          <HintCard label={t("aside.preferredContactLabel")} value={t(`submission.contact.${values.submission.preferredContact}.label`)} />
          <ContextNote title={t("steps.deductions.noteTitle")} copy={t("steps.deductions.noteCopy")} />
        </>
      }
    >
      <TaxPanel title={t("steps.deductions.sections.expenses.title")} description={t("steps.deductions.sections.expenses.description")}>
        <div className="grid gap-4 md:grid-cols-3">
          <Field label={t("fields.healthcareCosts")} error={form.formState.errors.deductions?.healthcareCosts?.message}>
            <input type="number" className={inputClass} {...form.register("deductions.healthcareCosts", { valueAsNumber: true })} />
          </Field>
          <Field label={t("fields.educationCosts")} error={form.formState.errors.deductions?.educationCosts?.message}>
            <input type="number" className={inputClass} {...form.register("deductions.educationCosts", { valueAsNumber: true })} />
          </Field>
          <Field label={t("fields.donationCosts")} error={form.formState.errors.deductions?.donationCosts?.message}>
            <input type="number" className={inputClass} {...form.register("deductions.donationCosts", { valueAsNumber: true })} />
          </Field>
        </div>
      </TaxPanel>

      <TaxPanel title={t("steps.deductions.sections.context.title")} description={t("steps.deductions.sections.context.description")}>
        <Field label={t("fields.otherContext")}>
          <textarea className={textareaClass} {...form.register("deductions.otherContext")} />
        </Field>
      </TaxPanel>

      <TaxPanel title={t("steps.deductions.sections.contact.title")} description={t("steps.deductions.sections.contact.description")}>
        <ChoiceGrid className="md:grid-cols-3">
          {(["portal", "email", "phone"] as const).map((option) => (
            <ChoiceCard
              key={option}
              label={t(`submission.contact.${option}.label`)}
              description={t(`submission.contact.${option}.description`)}
              active={values.submission.preferredContact === option}
              onClick={() => form.setValue("submission.preferredContact", option, { shouldDirty: true, shouldValidate: true })}
            />
          ))}
        </ChoiceGrid>
      </TaxPanel>
    </TaxStepLayout>
  );
}
