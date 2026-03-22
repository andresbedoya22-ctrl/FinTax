"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";

import {
  BenefitPanel,
  BenefitStepLayout,
  ContextNote,
  Field,
  HintCard,
  ToggleCard,
  inputClass,
} from "./BenefitsFormPrimitives";
import type { BenefitsFormValues } from "./wizard";

export function BenefitsStepChildren({
  form,
  values,
}: {
  form: UseFormReturn<BenefitsFormValues>;
  values: BenefitsFormValues;
}) {
  const t = useTranslations("Benefits");

  return (
    <BenefitStepLayout
      eyebrow={t("steps.children.short")}
      title={t("steps.children.title")}
      description={t("steps.children.description")}
      aside={<HintCard label={t("stepAside.children.label")} value={t("stepAside.children.value")} />}
    >
      <BenefitPanel title={t("sections.children.title")} description={t("sections.children.description")}>
        <Field
          label={t("fields.childrenUnder18")}
          hint={t("fieldsHint.childrenUnder18")}
          error={form.formState.errors.childrenUnder18?.message}
        >
          <input type="number" className={inputClass} {...form.register("childrenUnder18", { valueAsNumber: true })} />
        </Field>

        {values.childrenUnder18 === 0 ? (
          <div className="mt-4">
            <ContextNote title={t("conditional.noChildren.title")} copy={t("conditional.noChildren.copy")} />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div className="grid gap-3 lg:grid-cols-2">
              <ToggleCard
                label={t("fields.receivesKinderbijslag")}
                description={t("fieldsHelp.receivesKinderbijslag")}
                checked={values.receivesKinderbijslag}
                onChange={(checked) => form.setValue("receivesKinderbijslag", checked, { shouldDirty: true, shouldValidate: true })}
              />
              <ToggleCard
                label={t("fields.usesChildcare")}
                description={t("fieldsHelp.usesChildcare")}
                checked={values.usesChildcare}
                onChange={(checked) => form.setValue("usesChildcare", checked, { shouldDirty: true, shouldValidate: true })}
              />
            </div>

            {values.usesChildcare ? (
              <div className="grid gap-4 lg:grid-cols-2">
                <Field
                  label={t("fields.childcareHoursPerMonth")}
                  hint={t("fieldsHint.childcareHoursPerMonth")}
                  error={form.formState.errors.childcareHoursPerMonth?.message}
                >
                  <input type="number" className={inputClass} {...form.register("childcareHoursPerMonth", { valueAsNumber: true })} />
                </Field>

                <Field label={t("fields.childcareType")} hint={t("fieldsHint.childcareType")}>
                  <select className={inputClass} {...form.register("childcareType")}>
                    <option value="daycare">{t("options.daycare")}</option>
                    <option value="outOfSchoolCare">{t("options.outOfSchoolCare")}</option>
                    <option value="childminder">{t("options.childminder")}</option>
                  </select>
                </Field>

                <Field
                  label={t("fields.childcareHourlyRate")}
                  hint={t("fieldsHint.childcareHourlyRate")}
                  error={form.formState.errors.childcareHourlyRate?.message}
                >
                  <input type="number" className={inputClass} {...form.register("childcareHourlyRate", { valueAsNumber: true })} />
                </Field>

                <div className="grid gap-3">
                  <ToggleCard
                    label={t("fields.registeredChildcare")}
                    description={t("fieldsHelp.registeredChildcare")}
                    checked={values.registeredChildcare}
                    onChange={(checked) => form.setValue("registeredChildcare", checked, { shouldDirty: true, shouldValidate: true })}
                  />
                  <ToggleCard
                    label={t("fields.bothParentsWork")}
                    description={t("fieldsHelp.bothParentsWork")}
                    checked={values.bothParentsWork}
                    onChange={(checked) => form.setValue("bothParentsWork", checked, { shouldDirty: true, shouldValidate: true })}
                  />
                </div>
              </div>
            ) : (
              <ContextNote title={t("conditional.noChildcare.title")} copy={t("conditional.noChildcare.copy")} />
            )}
          </div>
        )}
      </BenefitPanel>
    </BenefitStepLayout>
  );
}
