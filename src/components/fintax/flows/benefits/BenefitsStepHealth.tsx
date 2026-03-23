"use client";

import { useLocale, useTranslations } from "next-intl";
import type { UseFormReturn } from "react-hook-form";

import { BenefitPanel, BenefitStepLayout, ContextNote, HintCard, ToggleCard, formatBenefitCurrency } from "./BenefitsFormPrimitives";
import type { BenefitsFormValues } from "./wizard";

export function BenefitsStepHealth({
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
      eyebrow={t("steps.health.short")}
      title={t("steps.health.title")}
      description={t("steps.health.description")}
      aside={
        <HintCard
          label={t("hints.zorgMax")}
          value={t(values.householdType === "single" ? "hintValues.zorgMax.single" : "hintValues.zorgMax.partners", {
            amount: formatBenefitCurrency(values.householdType === "single" ? 1574 : 3010, locale, 0),
          })}
        />
      }
    >
      <BenefitPanel title={t("sections.health.title")} description={t("sections.health.description")}>
        {values.nlResident ? (
          <ToggleCard
            label={t("fields.hasHealthInsurance")}
            description={t("fieldsHelp.hasHealthInsurance")}
            checked={values.hasHealthInsurance}
            onChange={(checked) => form.setValue("hasHealthInsurance", checked, { shouldDirty: true, shouldValidate: true })}
          />
        ) : (
          <ContextNote tone="warning" title={t("conditional.healthBlocked.title")} copy={t("conditional.healthBlocked.copy")} />
        )}

        {values.nlResident && !values.hasHealthInsurance ? (
          <div className="mt-4">
            <ContextNote tone="warning" title={t("conditional.noInsurance.title")} copy={t("conditional.noInsurance.copy")} />
          </div>
        ) : null}
      </BenefitPanel>
    </BenefitStepLayout>
  );
}
