"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";

import { BenefitPanel, BenefitStepLayout, Field, HintCard, inputClass } from "./BenefitsFormPrimitives";
import type { BenefitsFormValues } from "./wizard";

export function BenefitsStepAssets({
  form,
  values,
}: {
  form: UseFormReturn<BenefitsFormValues>;
  values: BenefitsFormValues;
}) {
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
            value={values.householdType === "single" ? "EUR 38,479 / 146,011" : "EUR 76,958 / 184,633"}
          />
          <HintCard label={t("stepAside.assets.label")} value={t("stepAside.assets.value")} />
        </div>
      }
    >
      <BenefitPanel title={t("sections.assets.title")} description={t("sections.assets.description")}>
        <Field label={t("fields.assets")} hint={t("fieldsHint.assets")} error={form.formState.errors.assets?.message}>
          <input type="number" className={inputClass} {...form.register("assets", { valueAsNumber: true })} />
        </Field>
      </BenefitPanel>
    </BenefitStepLayout>
  );
}
