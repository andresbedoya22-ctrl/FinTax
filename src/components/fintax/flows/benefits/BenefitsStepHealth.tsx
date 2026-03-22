"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";

import { BenefitPanel, BenefitStepLayout, ContextNote, HintCard, ToggleCard } from "./BenefitsFormPrimitives";
import type { BenefitsFormValues } from "./wizard";

export function BenefitsStepHealth({
  form,
  values,
}: {
  form: UseFormReturn<BenefitsFormValues>;
  values: BenefitsFormValues;
}) {
  const t = useTranslations("Benefits");

  return (
    <BenefitStepLayout
      eyebrow={t("steps.health.short")}
      title={t("steps.health.title")}
      description={t("steps.health.description")}
      aside={<HintCard label={t("hints.zorgMax")} value={values.householdType === "single" ? "EUR 1,574 / year" : "EUR 3,010 / year"} />}
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
