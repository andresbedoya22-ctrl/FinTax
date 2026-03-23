"use client";

import { useLocale, useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";

import { BenefitPanel, BenefitStepLayout, ContextNote, Field, HintCard, formatBenefitCurrency, inputClass } from "./BenefitsFormPrimitives";
import type { BenefitsFormValues } from "./wizard";

export function BenefitsStepAssets({
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
      eyebrow={t("steps.assets.short")}
      title={t("steps.assets.title")}
      description={t("steps.assets.description")}
      aside={
        <div className="space-y-4">
          <HintCard
            label={t("hints.assetThresholds")}
            value={t(values.householdType === "single" ? "hintValues.assetThresholds.single" : "hintValues.assetThresholds.partners", {
              primary: formatBenefitCurrency(values.householdType === "single" ? 38479 : 76958, locale, 0),
              secondary: formatBenefitCurrency(values.householdType === "single" ? 146011 : 184633, locale, 0),
            })}
          />
          <HintCard
            label={t("fields.householdAssets")}
            value={formatBenefitCurrency(values.applicantAssets + (values.partnerAssets ?? 0), locale, 0)}
          />
          <HintCard label={t("stepAside.assets.label")} value={t("stepAside.assets.value")} />
        </div>
      }
    >
      <BenefitPanel title={t("sections.assets.title")} description={t("sections.assets.description")}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field
            label={t("fields.applicantAssets")}
            hint={t("fieldsHint.applicantAssets")}
            error={form.formState.errors.applicantAssets?.message}
          >
            <input type="number" className={inputClass} {...form.register("applicantAssets", { valueAsNumber: true })} />
          </Field>

          {values.householdType === "partners" ? (
            <Field
              label={t("fields.partnerAssets")}
              hint={t("fieldsHint.partnerAssets")}
              error={form.formState.errors.partnerAssets?.message}
            >
              <input
                type="number"
                className={inputClass}
                {...form.register("partnerAssets", {
                  setValueAs: (value) => (value === "" ? null : Number(value)),
                })}
              />
            </Field>
          ) : null}
        </div>
      </BenefitPanel>

      {values.householdType === "partners" ? (
        <ContextNote tone="neutral" title={t("conditional.partnerAssets.title")} copy={t("conditional.partnerAssets.copy")} />
      ) : null}
    </BenefitStepLayout>
  );
}
