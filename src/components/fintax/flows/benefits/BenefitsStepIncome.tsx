"use client";

import { useLocale, useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";

import { BenefitPanel, BenefitStepLayout, ContextNote, Field, HintCard, formatBenefitCurrency, inputClass } from "./BenefitsFormPrimitives";
import type { BenefitsFormValues } from "./wizard";

export function BenefitsStepIncome({
  form,
  values,
}: {
  form: UseFormReturn<BenefitsFormValues>;
  values: BenefitsFormValues;
}) {
  const locale = useLocale();
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
            value={t(values.householdType === "single" ? "hintValues.zorgIncomeMax.single" : "hintValues.zorgIncomeMax.partners", {
              amount: formatBenefitCurrency(values.householdType === "single" ? 40857 : 51142, locale, 0),
            })}
          />
          <HintCard
            label={t("fields.householdAnnualIncome")}
            value={formatBenefitCurrency(values.applicantAnnualIncome + (values.partnerAnnualIncome ?? 0), locale, 0)}
          />
          <HintCard label={t("stepAside.income.label")} value={t("stepAside.income.value")} />
        </div>
      }
    >
      <BenefitPanel title={t("sections.income.title")} description={t("sections.income.description")}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label={t("fields.applicantAnnualIncome")}
            hint={t("fieldsHint.applicantAnnualIncome")}
            error={form.formState.errors.applicantAnnualIncome?.message}
          >
            <input type="number" className={inputClass} {...form.register("applicantAnnualIncome", { valueAsNumber: true })} />
          </Field>

          {values.householdType === "partners" ? (
            <Field
              label={t("fields.partnerAnnualIncome")}
              hint={t("fieldsHint.partnerAnnualIncome")}
              error={form.formState.errors.partnerAnnualIncome?.message}
            >
              <input
                type="number"
                className={inputClass}
                {...form.register("partnerAnnualIncome", {
                  setValueAs: (value) => (value === "" ? null : Number(value)),
                })}
              />
            </Field>
          ) : null}
        </div>
      </BenefitPanel>

      {values.householdType === "partners" ? (
        <ContextNote tone="neutral" title={t("conditional.partnerIncome.title")} copy={t("conditional.partnerIncome.copy")} />
      ) : null}
    </BenefitStepLayout>
  );
}
