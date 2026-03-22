"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";

import { BenefitPanel, BenefitStepLayout, Field, HintCard, inputClass } from "./BenefitsFormPrimitives";
import type { BenefitsFormValues } from "./wizard";

export function BenefitsStepIncome({
  form,
  values,
}: {
  form: UseFormReturn<BenefitsFormValues>;
  values: BenefitsFormValues;
}) {
  const t = useTranslations("Benefits");

  return (
    <BenefitStepLayout
      eyebrow={t("steps.income.short")}
      title={t("steps.income.title")}
      description={t("steps.income.description")}
      aside={
        <div className="space-y-4">
          <HintCard
            label={t("hints.zorgIncomeMax")}
            value={values.householdType === "single" ? "EUR 40,857" : "EUR 51,142"}
          />
          <HintCard label={t("stepAside.income.label")} value={t("stepAside.income.value")} />
        </div>
      }
    >
      <BenefitPanel title={t("sections.income.title")} description={t("sections.income.description")}>
        <Field label={t("fields.annualIncome")} hint={t("fieldsHint.annualIncome")} error={form.formState.errors.annualIncome?.message}>
          <input type="number" className={inputClass} {...form.register("annualIncome", { valueAsNumber: true })} />
        </Field>
      </BenefitPanel>
    </BenefitStepLayout>
  );
}
