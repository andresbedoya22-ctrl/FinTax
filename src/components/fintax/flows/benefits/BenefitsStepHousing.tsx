"use client";

import { useLocale, useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";

import {
  BenefitPanel,
  BenefitStepLayout,
  ContextNote,
  Field,
  HintCard,
  ToggleCard,
  formatBenefitCurrency,
  inputClass,
} from "./BenefitsFormPrimitives";
import type { BenefitsFormValues } from "./wizard";

export function BenefitsStepHousing({
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
      eyebrow={t("steps.housing.short")}
      title={t("steps.housing.title")}
      description={t("steps.housing.description")}
      aside={
        <HintCard
          label={t("hints.huurRentCap")}
          value={t(values.age < 23 ? "hintValues.huurRentCap.under23" : "hintValues.huurRentCap.standard", {
            amount: formatBenefitCurrency(values.age < 23 ? 498.2 : 932.93, locale),
          })}
        />
      }
    >
      <BenefitPanel title={t("sections.housing.title")} description={t("sections.housing.description")}>
        <div className="grid gap-3 lg:grid-cols-2">
          <ToggleCard
            label={t("fields.hasIndependentHome")}
            description={t("fieldsHelp.hasIndependentHome")}
            checked={values.hasIndependentHome}
            onChange={(checked) => form.setValue("hasIndependentHome", checked, { shouldDirty: true, shouldValidate: true })}
          />
          <ToggleCard
            label={t("fields.hasRentalContract")}
            description={t("fieldsHelp.hasRentalContract")}
            checked={values.hasRentalContract}
            onChange={(checked) => form.setValue("hasRentalContract", checked, { shouldDirty: true, shouldValidate: true })}
          />
        </div>

        {values.hasIndependentHome && values.hasRentalContract ? (
          <div className="mt-4">
            <Field label={t("fields.monthlyRent")} hint={t("fieldsHint.monthlyRent")} error={form.formState.errors.monthlyRent?.message}>
              <input type="number" className={inputClass} {...form.register("monthlyRent", { valueAsNumber: true })} />
            </Field>
          </div>
        ) : (
          <div className="mt-4">
            <ContextNote
              title={t("conditional.housingSimplified.title")}
              copy={
                values.hasIndependentHome
                  ? t("conditional.housingSimplified.noRentalContract")
                  : t("conditional.housingSimplified.noIndependentHome")
              }
            />
          </div>
        )}
      </BenefitPanel>
    </BenefitStepLayout>
  );
}
