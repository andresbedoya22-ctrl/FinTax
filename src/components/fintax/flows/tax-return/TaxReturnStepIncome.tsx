"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";

import { ChoiceCard, ChoiceGrid, ContextNote, Field, HintCard, TaxPanel, TaxStepLayout, inputClass } from "./TaxReturnFormPrimitives";
import type { TaxReturnFormValues } from "./wizard";

export function TaxReturnStepIncome({
  form,
  values,
}: {
  form: UseFormReturn<TaxReturnFormValues>;
  values: TaxReturnFormValues;
}) {
  const t = useTranslations("TaxReturn");

  return (
    <TaxStepLayout
      eyebrow={t("steps.income.eyebrow")}
      title={t("steps.income.title")}
      description={t("steps.income.description")}
      aside={
        <>
          <HintCard label={t("aside.employmentIncomeLabel")} value={`EUR ${values.income.employmentIncome}`} />
          <HintCard label={t("aside.withholdingLabel")} value={`EUR ${values.income.wageTaxWithheld}`} />
          <ContextNote title={t("steps.income.noteTitle")} copy={t("steps.income.noteCopy")} tone="warning" />
        </>
      }
    >
      <TaxPanel title={t("steps.income.sections.profile.title")} description={t("steps.income.sections.profile.description")}>
        <ChoiceGrid>
          {(["employment", "self_employed", "mixed", "benefits", "other"] as const).map((option) => (
            <ChoiceCard
              key={option}
              label={t(`income.profile.${option}.label`)}
              description={t(`income.profile.${option}.description`)}
              active={values.income.incomeProfile === option}
              onClick={() => form.setValue("income.incomeProfile", option, { shouldDirty: true, shouldValidate: true })}
            />
          ))}
        </ChoiceGrid>
      </TaxPanel>

      {values.income.incomeProfile === "employment" || values.income.incomeProfile === "mixed" ? (
        <TaxPanel title={t("steps.income.sections.employment.title")} description={t("steps.income.sections.employment.description")}>
          <div className="grid gap-4 md:grid-cols-2">
            <Field label={t("fields.employerName")} error={form.formState.errors.income?.employerName?.message}>
              <input className={inputClass} {...form.register("income.employerName")} />
            </Field>
            <Field label={t("fields.monthsWorked")} error={form.formState.errors.income?.monthsWorkedInNl?.message}>
              <input type="number" className={inputClass} {...form.register("income.monthsWorkedInNl", { valueAsNumber: true })} />
            </Field>
            <Field label={t("fields.employmentIncome")} error={form.formState.errors.income?.employmentIncome?.message}>
              <input type="number" className={inputClass} {...form.register("income.employmentIncome", { valueAsNumber: true })} />
            </Field>
            <Field label={t("fields.wageTaxWithheld")} hint={t("fields.wageTaxWithheldHint")} error={form.formState.errors.income?.wageTaxWithheld?.message}>
              <input type="number" className={inputClass} {...form.register("income.wageTaxWithheld", { valueAsNumber: true })} />
            </Field>
          </div>
        </TaxPanel>
      ) : null}

      {values.income.incomeProfile === "self_employed" || values.income.incomeProfile === "mixed" ? (
        <TaxPanel title={t("steps.income.sections.selfEmployment.title")} description={t("steps.income.sections.selfEmployment.description")}>
          <Field label={t("fields.selfEmploymentIncome")} error={form.formState.errors.income?.selfEmploymentIncome?.message}>
            <input type="number" className={inputClass} {...form.register("income.selfEmploymentIncome", { valueAsNumber: true })} />
          </Field>
        </TaxPanel>
      ) : null}

      <TaxPanel title={t("steps.income.sections.additional.title")} description={t("steps.income.sections.additional.description")}>
        <Field label={t("fields.otherIncome")} error={form.formState.errors.income?.otherIncome?.message}>
          <input type="number" className={inputClass} {...form.register("income.otherIncome", { valueAsNumber: true })} />
        </Field>
      </TaxPanel>
    </TaxStepLayout>
  );
}
