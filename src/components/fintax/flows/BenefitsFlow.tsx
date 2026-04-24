"use client";
/* eslint-disable react-hooks/incompatible-library */

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";
import { useFieldArray, useForm, type UseFormReturn } from "react-hook-form";

import { Button } from "@/components/fintax/Button";
import { Card, CardBody, CardHeader } from "@/components/fintax/Card";
import {
  BenefitsIntro,
  BenefitsProgressHeader,
  BenefitsResults,
  benefitsDefaultValues,
  benefitsWizardSchema,
  benefitStepKeys,
  createDefaultChild,
  createDefaultChildcareArrangement,
  createDefaultResident,
  getStepFieldNames,
  normalizeBenefitsValues,
  toHouseholdSnapshot,
  type BenefitsFormValues,
  type BenefitCardKey,
} from "@/components/fintax/flows/benefits";
import { evaluateToeslagen } from "@/lib/toeslagen";
import { loadWizardSnapshot, persistWizardSnapshot, readWizardSnapshot } from "@/lib/wizards/persistence";

const storageKey = "fintax-benefits-wizard";

const benefitKeys: BenefitCardKey[] = [
  "zorgtoeslag",
  "huurtoeslag",
  "kindgebondenBudget",
  "kinderopvangtoeslag",
];

export function BenefitsFlow() {
  const t = useTranslations("Benefits");
  const form = useForm<BenefitsFormValues>({
    resolver: zodResolver(benefitsWizardSchema),
    defaultValues: benefitsDefaultValues,
  });
  const [currentStep, setCurrentStep] = React.useState(0);

  const values = form.watch();
  const normalizedValues = React.useMemo(() => normalizeBenefitsValues(values), [values]);
  const evaluation = React.useMemo(
    () => evaluateToeslagen(toHouseholdSnapshot(normalizedValues)),
    [normalizedValues],
  );

  React.useEffect(() => {
    const snapshot = readWizardSnapshot<Record<string, unknown>>(storageKey);
    const nextValues = loadWizardSnapshot(storageKey, benefitsDefaultValues);
    form.reset(nextValues);
    setCurrentStep(
      typeof snapshot?.progressStep === "number"
        ? Math.max(0, Math.min(snapshot.progressStep, benefitStepKeys.length - 1))
        : 0,
    );
  }, [form]);

  React.useEffect(() => {
    void persistWizardSnapshot({
      storageKey,
      payload: {
        ...normalizedValues,
        currentStep,
      },
    });
  }, [currentStep, normalizedValues]);

  React.useEffect(() => {
    if (JSON.stringify(normalizedValues) !== JSON.stringify(values)) {
      form.reset(normalizedValues, { keepDirtyValues: true });
    }
  }, [form, normalizedValues, values]);

  const nextStep = async () => {
    if (benefitStepKeys[currentStep] === "results") return;
    const valid = await form.trigger(getStepFieldNames(currentStep) as never);
    if (!valid) return;
    setCurrentStep((step) => Math.min(step + 1, benefitStepKeys.length - 1));
  };

  const prevStep = () => setCurrentStep((step) => Math.max(step - 1, 0));

  const toggleBundleSelection = (key: BenefitCardKey) => {
    const selected = normalizedValues.selectedBenefits.includes(key);
    form.setValue(
      "selectedBenefits",
      selected
        ? normalizedValues.selectedBenefits.filter((value) => value !== key)
        : [...normalizedValues.selectedBenefits, key],
      { shouldDirty: true, shouldValidate: true },
    );
  };

  return (
    <div className="space-y-6">
      <BenefitsIntro />

      <Card className="overflow-hidden border border-border/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,249,245,0.92))] shadow-[0_26px_80px_rgba(18,38,28,0.08)]">
        <CardHeader className="space-y-5 border-b border-border/45 bg-[linear-gradient(180deg,rgba(250,252,249,0.98),rgba(245,248,243,0.92))]">
          <BenefitsProgressHeader currentStep={currentStep} steps={benefitStepKeys} />
        </CardHeader>

        <CardBody className="space-y-6">
          <form onSubmit={form.handleSubmit(() => undefined)} className="space-y-6" noValidate>
            {benefitStepKeys[currentStep] === "start" ? <StartStep form={form} /> : null}
            {benefitStepKeys[currentStep] === "applicant" ? <ApplicantStep form={form} /> : null}
            {benefitStepKeys[currentStep] === "partner" ? <PartnerStep form={form} /> : null}
            {benefitStepKeys[currentStep] === "income" ? <IncomeStep form={form} /> : null}
            {benefitStepKeys[currentStep] === "health" ? <HealthStep form={form} /> : null}
            {benefitStepKeys[currentStep] === "children" ? <ChildrenStep form={form} /> : null}
            {benefitStepKeys[currentStep] === "childcare" ? <ChildcareStep form={form} /> : null}
            {benefitStepKeys[currentStep] === "residents" ? <ResidentsStep form={form} /> : null}
            {benefitStepKeys[currentStep] === "housing" ? <HousingStep form={form} /> : null}
            {benefitStepKeys[currentStep] === "assets" ? <AssetsStep form={form} /> : null}
            {benefitStepKeys[currentStep] === "specialSituations" ? <SpecialSituationsStep form={form} /> : null}
            {benefitStepKeys[currentStep] === "results" ? (
              <BenefitsResults
                results={evaluation}
                selectedKeys={normalizedValues.selectedBenefits}
                onToggleSelected={toggleBundleSelection}
              />
            ) : null}
          </form>

          <div className="flex items-center justify-between border-t border-border/35 pt-5">
            <Button
              type="button"
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              leftIcon={<ChevronLeft className="size-4" />}
            >
              {t("back")}
            </Button>

            {benefitStepKeys[currentStep] !== "results" ? (
              <Button type="button" onClick={nextStep} rightIcon={<ChevronRight className="size-4" />}>
                {t("next")}
              </Button>
            ) : null}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function StepShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      <div className="space-y-2">
        <h3 className="font-heading text-[clamp(1.6rem,3vw,2.1rem)] tracking-[-0.03em] text-text">{title}</h3>
        <p className="max-w-3xl text-sm leading-6 text-secondary">{description}</p>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[24px] border border-border/45 bg-white/80 p-4 sm:p-5">{children}</div>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{children}</span>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="h-11 w-full rounded-[16px] border border-border/45 bg-white px-3 text-sm text-text" />;
}

function CheckboxRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: (next: boolean) => void;
}) {
  return (
    <label className="flex items-center gap-3 rounded-[18px] border border-border/35 bg-surface2/40 px-3 py-3 text-sm text-text">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} />
      <span>{label}</span>
    </label>
  );
}

function StartStep({ form }: { form: UseFormReturn<BenefitsFormValues> }) {
  const t = useTranslations("Benefits");
  const selected = form.watch("selectedBenefits") ?? [];

  return (
    <StepShell title={t("steps.start.title")} description={t("steps.start.description")}>
      <Panel>
        <div className="grid gap-3 md:grid-cols-2">
          {benefitKeys.map((key) => (
            <CheckboxRow
              key={key}
              checked={selected.includes(key)}
              label={t(`results.cards.${key}.title`)}
              onChange={(checked) => {
                const next = checked ? [...selected, key] : selected.filter((value) => value !== key);
                form.setValue("selectedBenefits", Array.from(new Set(next)), { shouldDirty: true, shouldValidate: true });
              }}
            />
          ))}
        </div>
      </Panel>
    </StepShell>
  );
}

function ApplicantStep({ form }: { form: UseFormReturn<BenefitsFormValues> }) {
  const t = useTranslations("Benefits");

  return (
    <StepShell title={t("steps.applicant.title")} description={t("steps.applicant.description")}>
      <Panel>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("fields.applicantBirthDate")}</Label>
            <Input type="date" {...form.register("applicant.birthDate")} />
          </div>
          <div className="space-y-2">
            <Label>{t("fields.applicantCountryOfResidence")}</Label>
            <Input {...form.register("applicant.countryOfResidence")} />
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <CheckboxRow checked={form.watch("applicant.nlResident")} label={t("fields.applicantNlResident")} onChange={(value) => form.setValue("applicant.nlResident", value, { shouldDirty: true })} />
          <CheckboxRow checked={form.watch("applicant.bsnKnown")} label={t("fields.applicantBsnKnown")} onChange={(value) => form.setValue("applicant.bsnKnown", value, { shouldDirty: true })} />
        </div>
      </Panel>
    </StepShell>
  );
}

function PartnerStep({ form }: { form: UseFormReturn<BenefitsFormValues> }) {
  const t = useTranslations("Benefits");
  const hasPartner = form.watch("hasPartner");

  return (
    <StepShell title={t("steps.partner.title")} description={t("steps.partner.description")}>
      <Panel>
        <CheckboxRow checked={hasPartner} label={t("fields.hasPartner")} onChange={(value) => form.setValue("hasPartner", value, { shouldDirty: true, shouldValidate: true })} />
        {hasPartner ? (
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("fields.partnerBirthDate")}</Label>
              <Input type="date" {...form.register("partner.birthDate")} />
            </div>
            <div className="space-y-2">
              <Label>{t("fields.partnerCountryOfResidence")}</Label>
              <Input {...form.register("partner.countryOfResidence")} />
            </div>
            <CheckboxRow checked={form.watch("partner.sameAddress") ?? true} label={t("fields.partnerSameAddress")} onChange={(value) => form.setValue("partner.sameAddress", value, { shouldDirty: true })} />
            <CheckboxRow checked={form.watch("partner.isToeslagPartner") ?? true} label={t("fields.partnerIsToeslagPartner")} onChange={(value) => form.setValue("partner.isToeslagPartner", value, { shouldDirty: true })} />
          </div>
        ) : null}
      </Panel>
    </StepShell>
  );
}

function IncomeStep({ form }: { form: UseFormReturn<BenefitsFormValues> }) {
  const t = useTranslations("Benefits");
  const hasPartner = form.watch("hasPartner");
  const applicantActivity = form.watch("applicant.activityStatus");
  const partnerActivity = form.watch("partner.activityStatus") ?? [];

  return (
    <StepShell title={t("steps.income.title")} description={t("steps.income.description")}>
      <Panel>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("fields.applicantAnnualIncome")}</Label>
            <Input type="number" {...form.register("applicant.annualIncome", { valueAsNumber: true })} />
          </div>
          {hasPartner ? (
            <div className="space-y-2">
              <Label>{t("fields.partnerAnnualIncome")}</Label>
              <Input type="number" {...form.register("partner.annualIncome", { valueAsNumber: true })} />
            </div>
          ) : null}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {["employed", "selfEmployed", "studentRecognized", "inburgeringCourse", "workReintegration", "trajectoryToWork"].map((status) => (
            <CheckboxRow
              key={status}
              checked={applicantActivity.includes(status as BenefitsFormValues["applicant"]["activityStatus"][number])}
              label={t(`activityStatus.${status}`)}
              onChange={(checked) => {
                const next = checked ? [...applicantActivity, status as BenefitsFormValues["applicant"]["activityStatus"][number]] : applicantActivity.filter((value) => value !== status);
                form.setValue("applicant.activityStatus", next.length ? Array.from(new Set(next)) : ["none"], { shouldDirty: true });
              }}
            />
          ))}
        </div>
        {hasPartner ? (
          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {["employed", "selfEmployed", "studentRecognized", "inburgeringCourse", "workReintegration", "trajectoryToWork"].map((status) => (
              <CheckboxRow
                key={`partner-${status}`}
                checked={partnerActivity.includes(status as BenefitsFormValues["applicant"]["activityStatus"][number])}
                label={t(`activityStatus.${status}`)}
                onChange={(checked) => {
                  const next = checked ? [...partnerActivity, status as BenefitsFormValues["applicant"]["activityStatus"][number]] : partnerActivity.filter((value) => value !== status);
                  form.setValue("partner.activityStatus", next.length ? Array.from(new Set(next)) : ["none"], { shouldDirty: true });
                }}
              />
            ))}
          </div>
        ) : null}
      </Panel>
    </StepShell>
  );
}

function HealthStep({ form }: { form: UseFormReturn<BenefitsFormValues> }) {
  const t = useTranslations("Benefits");
  const hasPartner = form.watch("hasPartner");

  return (
    <StepShell title={t("steps.health.title")} description={t("steps.health.description")}>
      <Panel>
        <div className="grid gap-3 md:grid-cols-2">
          <CheckboxRow checked={form.watch("applicant.hasDutchHealthInsurance")} label={t("fields.applicantHasDutchHealthInsurance")} onChange={(value) => form.setValue("applicant.hasDutchHealthInsurance", value, { shouldDirty: true })} />
          {hasPartner ? (
            <CheckboxRow checked={form.watch("partner.hasDutchHealthInsurance") ?? true} label={t("fields.partnerHasDutchHealthInsurance")} onChange={(value) => form.setValue("partner.hasDutchHealthInsurance", value, { shouldDirty: true })} />
          ) : null}
          <CheckboxRow checked={form.watch("specialSituations.cakInsured")} label={t("fields.cakInsured")} onChange={(value) => form.setValue("specialSituations.cakInsured", value, { shouldDirty: true })} />
        </div>
      </Panel>
    </StepShell>
  );
}

function ChildrenStep({ form }: { form: UseFormReturn<BenefitsFormValues> }) {
  const t = useTranslations("Benefits");
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "children" });

  return (
    <StepShell title={t("steps.children.title")} description={t("steps.children.description")}>
      {fields.map((field, index) => (
        <Panel key={field.id}>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-text">{t("fields.childLabel", { index: index + 1 })}</h4>
            <Button type="button" variant="ghost" onClick={() => remove(index)}><Trash2 className="size-4" /></Button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("fields.childBirthDate")}</Label>
              <Input type="date" {...form.register(`children.${index}.birthDate`)} />
            </div>
            <div className="space-y-2">
              <Label>{t("fields.childDaysPerYearWithApplicant")}</Label>
              <Input type="number" {...form.register(`children.${index}.daysPerYearWithApplicant`, { valueAsNumber: true })} />
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <CheckboxRow checked={form.watch(`children.${index}.livesWithApplicant`)} label={t("fields.childLivesWithApplicant")} onChange={(value) => form.setValue(`children.${index}.livesWithApplicant`, value, { shouldDirty: true })} />
            <CheckboxRow checked={form.watch(`children.${index}.isCoParentingChild`)} label={t("fields.childIsCoParenting")} onChange={(value) => form.setValue(`children.${index}.isCoParentingChild`, value, { shouldDirty: true })} />
            <CheckboxRow checked={form.watch(`children.${index}.receivesKinderbijslag`)} label={t("fields.childReceivesKinderbijslag")} onChange={(value) => form.setValue(`children.${index}.receivesKinderbijslag`, value, { shouldDirty: true })} />
            <CheckboxRow checked={form.watch(`children.${index}.bsnKnown`)} label={t("fields.childBsnKnown")} onChange={(value) => form.setValue(`children.${index}.bsnKnown`, value, { shouldDirty: true })} />
            <CheckboxRow checked={form.watch(`children.${index}.hasIncome`)} label={t("fields.childHasIncome")} onChange={(value) => form.setValue(`children.${index}.hasIncome`, value, { shouldDirty: true })} />
            <CheckboxRow checked={form.watch(`children.${index}.goesToChildcare`)} label={t("fields.childGoesToChildcare")} onChange={(value) => form.setValue(`children.${index}.goesToChildcare`, value, { shouldDirty: true })} />
          </div>
          {form.watch(`children.${index}.hasIncome`) ? (
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("fields.childAnnualIncome")}</Label>
                <Input type="number" {...form.register(`children.${index}.annualIncome`, { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>{t("fields.childAssets1Jan")}</Label>
                <Input type="number" {...form.register(`children.${index}.assets1Jan`, { valueAsNumber: true })} />
              </div>
            </div>
          ) : null}
        </Panel>
      ))}
      <Button type="button" variant="secondary" onClick={() => append(createDefaultChild(fields.length))} leftIcon={<Plus className="size-4" />}>
        {t("actions.addChild")}
      </Button>
    </StepShell>
  );
}

function ChildcareStep({ form }: { form: UseFormReturn<BenefitsFormValues> }) {
  const t = useTranslations("Benefits");
  const children = form.watch("children");

  return (
    <StepShell title={t("steps.childcare.title")} description={t("steps.childcare.description")}>
      {children.filter((child) => child.goesToChildcare).length === 0 ? (
        <Panel>{t("emptyStates.noChildcareChildren")}</Panel>
      ) : (
        children.map((child, index) =>
          child.goesToChildcare ? (
            <ChildcareChildEditor key={child.id} childIndex={index} form={form} />
          ) : null,
        )
      )}
    </StepShell>
  );
}

function ChildcareChildEditor({
  childIndex,
  form,
}: {
  childIndex: number;
  form: UseFormReturn<BenefitsFormValues>;
}) {
  const t = useTranslations("Benefits");
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: `children.${childIndex}.childcareArrangements`,
  });

  return (
    <Panel>
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold text-text">{t("fields.childLabel", { index: childIndex + 1 })}</h4>
        <Button type="button" variant="secondary" onClick={() => append(createDefaultChildcareArrangement(fields.length))} leftIcon={<Plus className="size-4" />}>
          {t("actions.addArrangement")}
        </Button>
      </div>
      <div className="mt-4 space-y-4">
        {fields.map((field, arrangementIndex) => (
          <div key={field.id} className="rounded-[18px] border border-border/35 p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-text">{t("fields.arrangementLabel", { index: arrangementIndex + 1 })}</p>
              <Button type="button" variant="ghost" onClick={() => remove(arrangementIndex)}><Trash2 className="size-4" /></Button>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{t("fields.childcareKind")}</Label>
                <Input {...form.register(`children.${childIndex}.childcareArrangements.${arrangementIndex}.childcareKind`)} />
              </div>
              <div className="space-y-2">
                <Label>{t("fields.providerType")}</Label>
                <Input {...form.register(`children.${childIndex}.childcareArrangements.${arrangementIndex}.providerType`)} />
              </div>
              <div className="space-y-2">
                <Label>{t("fields.monthlyHours")}</Label>
                <Input type="number" {...form.register(`children.${childIndex}.childcareArrangements.${arrangementIndex}.monthlyHours`, { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>{t("fields.hourlyRate")}</Label>
                <Input type="number" step="0.01" {...form.register(`children.${childIndex}.childcareArrangements.${arrangementIndex}.hourlyRate`, { valueAsNumber: true })} />
              </div>
              <div className="space-y-2">
                <Label>{t("fields.lrkNumber")}</Label>
                <Input {...form.register(`children.${childIndex}.childcareArrangements.${arrangementIndex}.lrkNumber`)} />
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <CheckboxRow checked={form.watch(`children.${childIndex}.childcareArrangements.${arrangementIndex}.registeredLrk`)} label={t("fields.registeredLrk")} onChange={(value) => form.setValue(`children.${childIndex}.childcareArrangements.${arrangementIndex}.registeredLrk`, value, { shouldDirty: true })} />
              <CheckboxRow checked={form.watch(`children.${childIndex}.childcareArrangements.${arrangementIndex}.hasContract`)} label={t("fields.hasContract")} onChange={(value) => form.setValue(`children.${childIndex}.childcareArrangements.${arrangementIndex}.hasContract`, value, { shouldDirty: true })} />
              <CheckboxRow checked={form.watch(`children.${childIndex}.childcareArrangements.${arrangementIndex}.parentsPayContribution`)} label={t("fields.parentsPayContribution")} onChange={(value) => form.setValue(`children.${childIndex}.childcareArrangements.${arrangementIndex}.parentsPayContribution`, value, { shouldDirty: true })} />
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function ResidentsStep({ form }: { form: UseFormReturn<BenefitsFormValues> }) {
  const t = useTranslations("Benefits");
  const { fields, append, remove } = useFieldArray({ control: form.control, name: "residents" });

  return (
    <StepShell title={t("steps.residents.title")} description={t("steps.residents.description")}>
      {fields.map((field, index) => (
        <Panel key={field.id}>
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-text">{t("fields.residentLabel", { index: index + 1 })}</h4>
            <Button type="button" variant="ghost" onClick={() => remove(index)}><Trash2 className="size-4" /></Button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label>{t("fields.residentBirthDate")}</Label>
              <Input type="date" {...form.register(`residents.${index}.birthDate`)} />
            </div>
            <div className="space-y-2">
              <Label>{t("fields.residentRelationship")}</Label>
              <Input {...form.register(`residents.${index}.relationship`)} />
            </div>
            <div className="space-y-2">
              <Label>{t("fields.residentAnnualIncome")}</Label>
              <Input type="number" {...form.register(`residents.${index}.annualIncome`, { valueAsNumber: true })} />
            </div>
            <div className="space-y-2">
              <Label>{t("fields.residentAssets1Jan")}</Label>
              <Input type="number" {...form.register(`residents.${index}.assets1Jan`, { valueAsNumber: true })} />
            </div>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <CheckboxRow checked={form.watch(`residents.${index}.sameAddressRegistered`)} label={t("fields.sameAddressRegistered")} onChange={(value) => form.setValue(`residents.${index}.sameAddressRegistered`, value, { shouldDirty: true })} />
            <CheckboxRow checked={form.watch(`residents.${index}.isSubtenant`)} label={t("fields.isSubtenant")} onChange={(value) => form.setValue(`residents.${index}.isSubtenant`, value, { shouldDirty: true })} />
            <CheckboxRow checked={form.watch(`residents.${index}.hasSubrentContract`)} label={t("fields.hasSubrentContract")} onChange={(value) => form.setValue(`residents.${index}.hasSubrentContract`, value, { shouldDirty: true })} />
          </div>
        </Panel>
      ))}
      <Button type="button" variant="secondary" onClick={() => append(createDefaultResident(fields.length))} leftIcon={<Plus className="size-4" />}>
        {t("actions.addResident")}
      </Button>
    </StepShell>
  );
}

function HousingStep({ form }: { form: UseFormReturn<BenefitsFormValues> }) {
  const t = useTranslations("Benefits");

  return (
    <StepShell title={t("steps.housing.title")} description={t("steps.housing.description")}>
      <Panel>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("fields.basicMonthlyRent")}</Label>
            <Input type="number" step="0.01" {...form.register("housing.basicMonthlyRent", { valueAsNumber: true })} />
          </div>
          <div className="space-y-2">
            <Label>{t("fields.monthlyStandplaatsCost")}</Label>
            <Input type="number" step="0.01" {...form.register("housing.monthlyStandplaatsCost", { valueAsNumber: true })} />
          </div>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <CheckboxRow checked={form.watch("housing.independentHome")} label={t("fields.independentHome")} onChange={(value) => form.setValue("housing.independentHome", value, { shouldDirty: true })} />
          <CheckboxRow checked={form.watch("housing.hasRentalContract")} label={t("fields.hasRentalContract")} onChange={(value) => form.setValue("housing.hasRentalContract", value, { shouldDirty: true })} />
          <CheckboxRow checked={form.watch("housing.rentsRoom")} label={t("fields.rentsRoom")} onChange={(value) => form.setValue("housing.rentsRoom", value, { shouldDirty: true })} />
          <CheckboxRow checked={form.watch("housing.groupHousingForElderlyOrAssistedLiving")} label={t("fields.groupHousing")} onChange={(value) => form.setValue("housing.groupHousingForElderlyOrAssistedLiving", value, { shouldDirty: true })} />
          <CheckboxRow checked={form.watch("housing.recognizedException")} label={t("fields.recognizedException")} onChange={(value) => form.setValue("housing.recognizedException", value, { shouldDirty: true })} />
          <CheckboxRow checked={form.watch("housing.isWoonwagen")} label={t("fields.isWoonwagen")} onChange={(value) => form.setValue("housing.isWoonwagen", value, { shouldDirty: true })} />
        </div>
      </Panel>
    </StepShell>
  );
}

function AssetsStep({ form }: { form: UseFormReturn<BenefitsFormValues> }) {
  const t = useTranslations("Benefits");
  const hasPartner = form.watch("hasPartner");

  return (
    <StepShell title={t("steps.assets.title")} description={t("steps.assets.description")}>
      <Panel>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>{t("fields.applicantAssets1Jan")}</Label>
            <Input type="number" {...form.register("assets.applicantAssets1Jan", { valueAsNumber: true })} />
          </div>
          {hasPartner ? (
            <div className="space-y-2">
              <Label>{t("fields.partnerAssets1Jan")}</Label>
              <Input type="number" {...form.register("assets.partnerAssets1Jan", { valueAsNumber: true })} />
            </div>
          ) : null}
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          <CheckboxRow checked={form.watch("assets.hasSpecialAssets")} label={t("fields.hasSpecialAssets")} onChange={(value) => form.setValue("assets.hasSpecialAssets", value, { shouldDirty: true })} />
        </div>
      </Panel>
    </StepShell>
  );
}

function SpecialSituationsStep({ form }: { form: UseFormReturn<BenefitsFormValues> }) {
  const t = useTranslations("Benefits");
  const toggles = [
    "foreignResidence",
    "foreignWork",
    "childAbroad",
    "childcareAbroad",
    "cakInsured",
    "military",
    "detained",
    "gemoedsbezwaarde",
    "noFixedAddress",
    "bijzondereVermogen",
    "bijzonderInkomen",
    "longAbsenceFromHome",
    "homeCareSituation",
    "composedFamily",
    "adoptionFosterStepChild",
  ] as const;

  return (
    <StepShell title={t("steps.specialSituations.title")} description={t("steps.specialSituations.description")}>
      <Panel>
        <div className="grid gap-3 md:grid-cols-2">
          {toggles.map((key) => (
            <CheckboxRow
              key={key}
              checked={form.watch(`specialSituations.${key}`)}
              label={t(`fields.${key}`)}
              onChange={(value) => form.setValue(`specialSituations.${key}`, value, { shouldDirty: true })}
            />
          ))}
        </div>
        <div className="mt-4 space-y-2">
          <Label>{t("fields.manualReviewNotes")}</Label>
          <Input {...form.register("specialSituations.manualReviewNotes")} />
        </div>
      </Panel>
    </StepShell>
  );
}
