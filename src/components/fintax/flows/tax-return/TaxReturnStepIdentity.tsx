"use client";

import type { UseFormReturn } from "react-hook-form";
import { useTranslations } from "next-intl";

import { ChoiceCard, ChoiceGrid, ContextNote, Field, HintCard, TaxPanel, TaxStepLayout, inputClass } from "./TaxReturnFormPrimitives";
import type { TaxReturnFormValues } from "./wizard";

export function TaxReturnStepIdentity({
  form,
  values,
}: {
  form: UseFormReturn<TaxReturnFormValues>;
  values: TaxReturnFormValues;
}) {
  const t = useTranslations("TaxReturn");

  return (
    <TaxStepLayout
      eyebrow={t("steps.identity.eyebrow")}
      title={t("steps.identity.title")}
      description={t("steps.identity.description")}
      aside={
        <>
          <HintCard label={t("aside.caseTypeLabel")} value={t(`services.${serviceKey(values.service)}.title`)} />
          <HintCard label={t("aside.taxYearLabel")} value={String(values.filing.taxYear)} />
          <ContextNote title={t("steps.identity.noteTitle")} copy={t("steps.identity.noteCopy")} />
        </>
      }
    >
      <TaxPanel title={t("steps.identity.sections.person.title")} description={t("steps.identity.sections.person.description")}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("fields.fullName")} error={form.formState.errors.identity?.fullName?.message}>
            <input className={inputClass} {...form.register("identity.fullName")} />
          </Field>
          <Field label={t("fields.bsn")} hint={t("fields.bsnHint")} error={form.formState.errors.identity?.bsn?.message}>
            <input className={inputClass} {...form.register("identity.bsn")} />
          </Field>
        </div>
      </TaxPanel>

      <TaxPanel title={t("steps.identity.sections.filing.title")} description={t("steps.identity.sections.filing.description")}>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label={t("fields.taxYear")} error={form.formState.errors.filing?.taxYear?.message}>
            <input type="number" className={inputClass} {...form.register("filing.taxYear", { valueAsNumber: true })} />
          </Field>
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("fields.residency")}</p>
            <ChoiceGrid>
              {(["resident", "migration", "non_resident"] as const).map((option) => (
                <ChoiceCard
                  key={option}
                  label={t(`identity.residency.${option}.label`)}
                  description={t(`identity.residency.${option}.description`)}
                  active={values.filing.residency === option}
                  onClick={() => form.setValue("filing.residency", option, { shouldDirty: true, shouldValidate: true })}
                />
              ))}
            </ChoiceGrid>
          </div>

          <div>
            <p className="mb-3 text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("fields.filingStatus")}</p>
            <ChoiceGrid>
              {(["single", "married", "fiscal_partner"] as const).map((option) => (
                <ChoiceCard
                  key={option}
                  label={t(`identity.filingStatus.${option}.label`)}
                  description={t(`identity.filingStatus.${option}.description`)}
                  active={values.filing.filingStatus === option}
                  onClick={() => form.setValue("filing.filingStatus", option, { shouldDirty: true, shouldValidate: true })}
                />
              ))}
            </ChoiceGrid>
          </div>

          {values.filing.hasFiscalPartner ? (
            <Field label={t("fields.partnerName")} error={form.formState.errors.filing?.partnerName?.message}>
              <input className={inputClass} {...form.register("filing.partnerName")} />
            </Field>
          ) : null}
        </div>
      </TaxPanel>
    </TaxStepLayout>
  );
}

function serviceKey(service: TaxReturnFormValues["service"]) {
  switch (service) {
    case "tax_return_m":
      return "formM";
    case "tax_return_c":
      return "formC";
    case "tax_return_w":
      return "zzp";
    default:
      return "formP";
  }
}
