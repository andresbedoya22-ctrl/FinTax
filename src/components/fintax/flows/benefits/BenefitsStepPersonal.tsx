"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";

import {
  BenefitPanel,
  BenefitStepLayout,
  ChoiceCard,
  ChoiceGrid,
  ContextNote,
  Field,
  HintCard,
  ToggleCard,
  inputClass,
} from "./BenefitsFormPrimitives";
import type { BenefitsFormValues } from "./wizard";

export function BenefitsStepPersonal({
  form,
  values,
}: {
  form: UseFormReturn<BenefitsFormValues>;
  values: BenefitsFormValues;
}) {
  const t = useTranslations("Benefits");

  return (
    <BenefitStepLayout
      eyebrow={t("steps.personal.short")}
      title={t("steps.personal.title")}
      description={t("steps.personal.description")}
      aside={<HintCard label={t("stepAside.personal.label")} value={t("stepAside.personal.value")} />}
    >
      <BenefitPanel title={t("sections.household.title")} description={t("sections.household.description")}>
        <ChoiceGrid>
          <ChoiceCard
            label={t("options.single")}
            description={t("optionsDescriptions.single")}
            active={values.householdType === "single"}
            onClick={() => form.setValue("householdType", "single", { shouldDirty: true, shouldValidate: true })}
          />
          <ChoiceCard
            label={t("options.partners")}
            description={t("optionsDescriptions.partners")}
            active={values.householdType === "partners"}
            onClick={() => form.setValue("householdType", "partners", { shouldDirty: true, shouldValidate: true })}
          />
        </ChoiceGrid>
      </BenefitPanel>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <BenefitPanel title={t("sections.identity.title")} description={t("sections.identity.description")}>
          <Field label={t("fields.age")} error={form.formState.errors.age?.message}>
            <input type="number" className={inputClass} {...form.register("age", { valueAsNumber: true })} />
          </Field>
        </BenefitPanel>

        <BenefitPanel title={t("sections.residency.title")} description={t("sections.residency.description")}>
          <ToggleCard
            label={t("fields.nlResident")}
            description={t("fieldsHelp.nlResident")}
            checked={values.nlResident}
            onChange={(checked) => form.setValue("nlResident", checked, { shouldDirty: true, shouldValidate: true })}
          />
        </BenefitPanel>
      </div>

      {!values.nlResident ? (
        <ContextNote tone="warning" title={t("conditional.nonResident.title")} copy={t("conditional.nonResident.copy")} />
      ) : null}
    </BenefitStepLayout>
  );
}
