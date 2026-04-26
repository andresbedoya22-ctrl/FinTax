"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { BriefcaseBusiness, ChevronLeft, ChevronRight, Plus, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";
import { useFieldArray, useForm, useWatch, type UseFormReturn } from "react-hook-form";

import { Button } from "@/components/fintax/Button";
import {
  BenefitsResults,
  BenefitsSelectionStep,
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
import { BenefitsCompactProgress } from "@/components/fintax/flows/benefits/BenefitsCompactProgress";
import { BenefitsOptionCard } from "@/components/fintax/flows/benefits/BenefitsOptionCard";
import { apiGet, apiPost, isApiClientError } from "@/hooks/api-client";
import { useRouter } from "@/i18n/navigation";
import { createClient } from "@/lib/supabase/client";
import { evaluateToeslagen, parseStoredBenefitsCasePayload, type BenefitsResultsMode } from "@/lib/toeslagen";
import type { Case } from "@/types/database";
import { loadWizardSnapshot, persistWizardSnapshot, readWizardSnapshot } from "@/lib/wizards/persistence";

const storageKey = "fintax-benefits-wizard";

export function BenefitsFlow({
  initialMode = "prePayment",
  initialCaseId = null,
}: {
  initialMode?: BenefitsResultsMode;
  initialCaseId?: string | null;
}) {
  const t = useTranslations("Benefits");
  const locale = useLocale();
  const router = useRouter();
  const form = useForm<BenefitsFormValues>({
    resolver: zodResolver(benefitsWizardSchema),
    defaultValues: benefitsDefaultValues,
  });
  const [currentStep, setCurrentStep] = React.useState(0);
  const [mode, setMode] = React.useState<BenefitsResultsMode>(initialMode);
  const [checkoutError, setCheckoutError] = React.useState<string | null>(null);
  const [isCheckoutLoading, setIsCheckoutLoading] = React.useState(false);
  const [postPaymentCaseId, setPostPaymentCaseId] = React.useState<string | null>(initialCaseId);
  const [postPaymentEvaluation, setPostPaymentEvaluation] = React.useState<ReturnType<typeof evaluateToeslagen> | null>(null);
  const [postPaymentSelectedBenefits, setPostPaymentSelectedBenefits] = React.useState<BenefitCardKey[] | null>(null);
  const [postPaymentLoading, setPostPaymentLoading] = React.useState(false);
  const hasAutoCheckoutRef = React.useRef(false);

  const values = form.watch();
  const selectedBenefits = useWatch({ control: form.control, name: "selectedBenefits" }) ?? [];
  const normalizedValues = React.useMemo(() => normalizeBenefitsValues(values), [values]);
  const evaluation = React.useMemo(
    () => (normalizedValues.selectedBenefits.length > 0 ? evaluateToeslagen(toHouseholdSnapshot(normalizedValues)) : null),
    [normalizedValues],
  );

  React.useEffect(() => {
    const snapshot = readWizardSnapshot<Record<string, unknown>>(storageKey);
    const nextValues = loadWizardSnapshot(storageKey, benefitsDefaultValues);
    form.reset(nextValues);
    const searchParams = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
    const requestedMode = searchParams?.get("mode");
    const requestedCaseId = searchParams?.get("caseId");

    if (requestedMode === "postPayment" && requestedCaseId) {
      setMode("postPayment");
      setPostPaymentCaseId(requestedCaseId);
      setCurrentStep(benefitStepKeys.length - 1);
      return;
    }

    setCurrentStep(
      typeof snapshot?.progressStep === "number"
        ? Math.max(0, Math.min(snapshot.progressStep, benefitStepKeys.length - 1))
        : 0,
    );
  }, [form]);

  React.useEffect(() => {
    void persistWizardSnapshot({
      storageKey,
      caseId: postPaymentCaseId ?? undefined,
      payload: {
        ...normalizedValues,
        currentStep,
        draftStatus: mode === "postPayment" ? "paid_document_collection" : null,
      },
    });
  }, [currentStep, mode, normalizedValues, postPaymentCaseId]);

  React.useEffect(() => {
    if (mode !== "postPayment" || !postPaymentCaseId) {
      return;
    }

    let active = true;
    setPostPaymentLoading(true);
    setCheckoutError(null);

    void apiGet<Case>(`/api/cases/${postPaymentCaseId}`)
      .then((caseRecord) => {
        if (!active) {
          return;
        }

        const parsed = parseStoredBenefitsCasePayload(caseRecord.wizard_data);
        if (!parsed.success) {
          setCheckoutError(t("checkout.caseLoadError"));
          return;
        }

        setPostPaymentEvaluation(parsed.data.evaluation);
        setPostPaymentSelectedBenefits(parsed.data.selectedBenefits);
      })
      .catch(() => {
        if (active) {
          setCheckoutError(t("checkout.caseLoadError"));
        }
      })
      .finally(() => {
        if (active) {
          setPostPaymentLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [mode, postPaymentCaseId, t]);

  const continueToCheckout = React.useCallback(async () => {
    if (normalizedValues.selectedBenefits.length === 0) {
      return;
    }

    setCheckoutError(null);
    setIsCheckoutLoading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

      if (!user) {
        await persistWizardSnapshot({
          storageKey,
          payload: {
            ...normalizedValues,
            currentStep: benefitStepKeys.length - 1,
            draftStatus: "checkout_pending",
          },
        });
        window.location.assign(`/${locale}/auth?intent=benefits&next=/${locale}/benefits`);
        return;
      }

      const snapshot = toHouseholdSnapshot(normalizedValues);
      const draft = await apiPost<{ caseId: string }, { locale: string; selectedBenefits: BenefitCardKey[]; snapshot: typeof snapshot; evaluation: typeof evaluation }>(
        "/api/benefits/draft",
        {
          locale,
          selectedBenefits: normalizedValues.selectedBenefits,
          snapshot,
          evaluation: evaluation!,
        },
      );

      await persistWizardSnapshot({
        storageKey,
        caseId: draft.caseId,
        payload: {
          ...normalizedValues,
          currentStep: benefitStepKeys.length - 1,
          draftStatus: "payment_pending",
        },
      });

      const checkout = await apiPost<{ checkoutUrl: string }, { caseId: string; locale: string }>("/api/stripe/checkout", {
        caseId: draft.caseId,
        locale,
      });

      window.location.assign(checkout.checkoutUrl);
    } catch (error) {
      if (isApiClientError(error) && error.code === "unauthorized") {
        router.push("/auth?intent=benefits");
        return;
      }

      setCheckoutError(t("checkout.error"));
    } finally {
      setIsCheckoutLoading(false);
    }
  }, [evaluation, locale, normalizedValues, router, t]);

  React.useEffect(() => {
    const snapshot = readWizardSnapshot<Record<string, unknown>>(storageKey);
    if (
      hasAutoCheckoutRef.current ||
      mode !== "prePayment" ||
      benefitStepKeys[currentStep] !== "results" ||
      snapshot?.draftStatus !== "checkout_pending"
    ) {
      return;
    }

    const supabase = createClient();
    if (!supabase) {
      return;
    }

    let active = true;

    void supabase.auth.getUser().then(({ data }) => {
      if (!active || !data.user) {
        return;
      }

      hasAutoCheckoutRef.current = true;
      void continueToCheckout();
    });

    return () => {
      active = false;
    };
  }, [continueToCheckout, currentStep, mode]);

  const nextStep = async () => {
    if (benefitStepKeys[currentStep] === "results") return;
    if (benefitStepKeys[currentStep] === "start" && selectedBenefits.length === 0) {
      await form.trigger("selectedBenefits");
      return;
    }
    const valid = await form.trigger(getStepFieldNames(currentStep) as never);
    if (!valid) return;
    setCurrentStep((step) => Math.min(step + 1, benefitStepKeys.length - 1));
  };

  const prevStep = () => setCurrentStep((step) => Math.max(step - 1, 0));

  const toggleBundleSelection = (key: BenefitCardKey) => {
    if (mode === "postPayment") {
      return;
    }

    const selected = normalizedValues.selectedBenefits.includes(key);
    form.setValue(
      "selectedBenefits",
      selected
        ? normalizedValues.selectedBenefits.filter((value) => value !== key)
        : [...normalizedValues.selectedBenefits, key],
      { shouldDirty: true, shouldValidate: true },
    );
  };
  const isResultsStage = mode === "postPayment" || benefitStepKeys[currentStep] === "results";

  return (
    <div className="space-y-6" data-testid="benefits-wizard-shell">
      <BenefitsWizardShell
        isResultsStage={isResultsStage}
        currentStep={currentStep}
        stepTitle={t(`steps.${benefitStepKeys[currentStep]}.title`)}
        stepDescription={t(`steps.${benefitStepKeys[currentStep]}.description`)}
        onStepClick={(step) => setCurrentStep(step)}
      >
          {checkoutError ? (
            <div className="rounded-[20px] border border-[#D97706]/25 bg-[#FFF4E5] px-4 py-3 text-sm text-[#8A4B0B]">
              {checkoutError}
            </div>
          ) : null}

          {mode === "postPayment" ? (
            postPaymentLoading || !postPaymentEvaluation || !postPaymentSelectedBenefits ? (
              <div className="rounded-[20px] border border-white/10 bg-white/[0.05] px-4 py-5 text-sm text-[#C8D2DF]">
                {t("checkout.loading")}
              </div>
            ) : (
              <BenefitsResults
                mode="postPayment"
                caseId={postPaymentCaseId}
                results={postPaymentEvaluation}
                selectedKeys={postPaymentSelectedBenefits}
                onToggleSelected={toggleBundleSelection}
              />
            )
          ) : (
            <>
              <form onSubmit={form.handleSubmit(() => undefined)} className="space-y-6" noValidate>
                {benefitStepKeys[currentStep] === "start" ? <BenefitsSelectionStep form={form} /> : null}
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
                    mode="prePayment"
                    results={evaluation!}
                    selectedKeys={normalizedValues.selectedBenefits}
                    onToggleSelected={toggleBundleSelection}
                    onContinueToCheckout={continueToCheckout}
                    isCheckoutLoading={isCheckoutLoading}
                  />
                ) : null}
              </form>

              <div className="flex items-center justify-between border-t border-white/10 pt-5">
                <Button
                  type="button"
                  variant="secondary"
                  className="rounded-[16px] border-white/[0.15] bg-white/[0.07] text-white hover:bg-white/[0.1]"
                  data-testid="benefits-back-button"
                  onClick={prevStep}
                  disabled={currentStep === 0}
                  leftIcon={<ChevronLeft className="size-4" />}
                >
                  {t("back")}
                </Button>

                {benefitStepKeys[currentStep] !== "results" ? (
                  <Button
                    type="button"
                    className="rounded-[16px] px-6"
                    onClick={nextStep}
                    rightIcon={<ChevronRight className="size-4" />}
                    data-testid="benefits-next-button"
                    disabled={benefitStepKeys[currentStep] === "start" && selectedBenefits.length === 0}
                  >
                    {t("next")}
                  </Button>
                ) : null}
              </div>
            </>
          )}
      </BenefitsWizardShell>
    </div>
  );
}

function BenefitsWizardShell({
  isResultsStage,
  currentStep,
  stepTitle,
  stepDescription,
  onStepClick,
  children,
}: {
  isResultsStage: boolean;
  currentStep: number;
  stepTitle: string;
  stepDescription: string;
  onStepClick: (step: number) => void;
  children: React.ReactNode;
}) {
  const t = useTranslations("Benefits");
  const steps = benefitStepKeys.map((step) => t(`steps.${step}.short`));

  if (isResultsStage) {
    return <div className="space-y-6">{children}</div>;
  }

  return (
    <section className="space-y-6">
      <BenefitsCompactProgress
        currentStep={currentStep}
        totalSteps={benefitStepKeys.length}
        currentLabel={steps[currentStep]}
        previousLabel={currentStep > 0 ? steps[currentStep - 1] : undefined}
        nextLabel={currentStep < steps.length - 1 ? steps[currentStep + 1] : undefined}
        allSteps={steps}
        onStepClick={onStepClick}
      />
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="overflow-hidden rounded-[30px] border border-white/10 bg-[#0B2340]/[0.86] shadow-[0_28px_70px_rgba(0,0,0,0.22)] backdrop-blur" data-testid="benefits-step-main-card">
          <div className="border-b border-white/10 px-5 py-5 sm:px-7">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#74cf7a]">
              {t("progress.stepCount", { current: currentStep + 1, total: benefitStepKeys.length })}
            </p>
            <h1 className="mt-2 text-[clamp(1.8rem,3vw,2.7rem)] font-bold tracking-normal text-white">{stepTitle}</h1>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#C8D2DF]">{stepDescription}</p>
          </div>
          <div className="space-y-6 px-5 py-5 sm:px-7 sm:py-7">{children}</div>
        </div>
        <aside className="rounded-[30px] border border-white/10 bg-white/[0.045] p-6 text-white shadow-[0_24px_64px_rgba(0,0,0,0.16)]" data-testid="benefits-step-help-panel">
          <div className="grid size-12 place-items-center rounded-[18px] bg-[#4CAF50]/[0.18] text-[#74cf7a]">
            <BriefcaseBusiness className="size-6" />
          </div>
          <h2 className="mt-5 text-2xl font-bold">{t("intro.highlights.reviewLabel")}</h2>
          <p className="mt-3 text-sm leading-6 text-[#C8D2DF]">{t("intro.highlights.reviewValue")}</p>
          <div className="mt-6 rounded-[20px] border border-white/10 bg-white/[0.05] p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#74cf7a]">{t("progress.completionLabel")}</p>
            <div className="mt-3 h-2 rounded-full bg-white/10">
              <div className="h-full rounded-full bg-[#4CAF50]" style={{ width: `${Math.round(((currentStep + 1) / benefitStepKeys.length) * 100)}%` }} />
            </div>
          </div>
        </aside>
      </div>
    </section>
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
    <section className="space-y-5">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold tracking-normal text-white">{title}</h3>
        <p className="max-w-3xl text-sm leading-6 text-[#C8D2DF]">{description}</p>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-4 text-white sm:p-5">{children}</div>;
}

function Label({ children }: { children: React.ReactNode }) {
  return <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9FB0C4]">{children}</span>;
}

function Input(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className="h-12 w-full rounded-[16px] border border-white/[0.12] bg-[#061426]/70 px-4 text-sm text-white outline-none transition focus:border-[#4CAF50] focus:ring-4 focus:ring-[#4CAF50]/[0.15]" />;
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
    <BenefitsOptionCard selected={checked} title={label} onToggle={() => onChange(!checked)} />
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
          <CheckboxRow checked={form.watch("applicant.nlResident")} label={t("fields.applicantNlResident")} onChange={(value) => form.setValue("applicant.nlResident", value, { shouldDirty: true, shouldValidate: true })} />
          <CheckboxRow checked={form.watch("applicant.bsnKnown")} label={t("fields.applicantBsnKnown")} onChange={(value) => form.setValue("applicant.bsnKnown", value, { shouldDirty: true, shouldValidate: true })} />
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
            <CheckboxRow checked={form.watch("partner.sameAddress") ?? true} label={t("fields.partnerSameAddress")} onChange={(value) => form.setValue("partner.sameAddress", value, { shouldDirty: true, shouldValidate: true })} />
            <CheckboxRow checked={form.watch("partner.isToeslagPartner") ?? true} label={t("fields.partnerIsToeslagPartner")} onChange={(value) => form.setValue("partner.isToeslagPartner", value, { shouldDirty: true, shouldValidate: true })} />
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
                form.setValue("applicant.activityStatus", next.length ? Array.from(new Set(next)) : ["none"], { shouldDirty: true, shouldValidate: true });
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
                  form.setValue("partner.activityStatus", next.length ? Array.from(new Set(next)) : ["none"], { shouldDirty: true, shouldValidate: true });
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
          <CheckboxRow checked={form.watch("applicant.hasDutchHealthInsurance")} label={t("fields.applicantHasDutchHealthInsurance")} onChange={(value) => form.setValue("applicant.hasDutchHealthInsurance", value, { shouldDirty: true, shouldValidate: true })} />
          {hasPartner ? (
            <CheckboxRow checked={form.watch("partner.hasDutchHealthInsurance") ?? true} label={t("fields.partnerHasDutchHealthInsurance")} onChange={(value) => form.setValue("partner.hasDutchHealthInsurance", value, { shouldDirty: true, shouldValidate: true })} />
          ) : null}
          <CheckboxRow checked={form.watch("specialSituations.cakInsured")} label={t("fields.cakInsured")} onChange={(value) => form.setValue("specialSituations.cakInsured", value, { shouldDirty: true, shouldValidate: true })} />
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
            <h4 className="text-sm font-semibold text-white">{t("fields.childLabel", { index: index + 1 })}</h4>
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
            <CheckboxRow checked={form.watch(`children.${index}.livesWithApplicant`)} label={t("fields.childLivesWithApplicant")} onChange={(value) => form.setValue(`children.${index}.livesWithApplicant`, value, { shouldDirty: true, shouldValidate: true })} />
            <CheckboxRow checked={form.watch(`children.${index}.isCoParentingChild`)} label={t("fields.childIsCoParenting")} onChange={(value) => form.setValue(`children.${index}.isCoParentingChild`, value, { shouldDirty: true, shouldValidate: true })} />
            <CheckboxRow checked={form.watch(`children.${index}.receivesKinderbijslag`)} label={t("fields.childReceivesKinderbijslag")} onChange={(value) => form.setValue(`children.${index}.receivesKinderbijslag`, value, { shouldDirty: true, shouldValidate: true })} />
            <CheckboxRow checked={form.watch(`children.${index}.bsnKnown`)} label={t("fields.childBsnKnown")} onChange={(value) => form.setValue(`children.${index}.bsnKnown`, value, { shouldDirty: true, shouldValidate: true })} />
            <CheckboxRow checked={form.watch(`children.${index}.hasIncome`)} label={t("fields.childHasIncome")} onChange={(value) => form.setValue(`children.${index}.hasIncome`, value, { shouldDirty: true, shouldValidate: true })} />
            <CheckboxRow checked={form.watch(`children.${index}.goesToChildcare`)} label={t("fields.childGoesToChildcare")} onChange={(value) => form.setValue(`children.${index}.goesToChildcare`, value, { shouldDirty: true, shouldValidate: true })} />
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
        <h4 className="text-sm font-semibold text-white">{t("fields.childLabel", { index: childIndex + 1 })}</h4>
        <Button type="button" variant="secondary" onClick={() => append(createDefaultChildcareArrangement(fields.length))} leftIcon={<Plus className="size-4" />}>
          {t("actions.addArrangement")}
        </Button>
      </div>
      <div className="mt-4 space-y-4">
        {fields.map((field, arrangementIndex) => (
          <div key={field.id} className="rounded-[18px] border border-white/10 bg-white/[0.04] p-4">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-white">{t("fields.arrangementLabel", { index: arrangementIndex + 1 })}</p>
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
              <CheckboxRow checked={form.watch(`children.${childIndex}.childcareArrangements.${arrangementIndex}.registeredLrk`)} label={t("fields.registeredLrk")} onChange={(value) => form.setValue(`children.${childIndex}.childcareArrangements.${arrangementIndex}.registeredLrk`, value, { shouldDirty: true, shouldValidate: true })} />
              <CheckboxRow checked={form.watch(`children.${childIndex}.childcareArrangements.${arrangementIndex}.hasContract`)} label={t("fields.hasContract")} onChange={(value) => form.setValue(`children.${childIndex}.childcareArrangements.${arrangementIndex}.hasContract`, value, { shouldDirty: true, shouldValidate: true })} />
              <CheckboxRow checked={form.watch(`children.${childIndex}.childcareArrangements.${arrangementIndex}.parentsPayContribution`)} label={t("fields.parentsPayContribution")} onChange={(value) => form.setValue(`children.${childIndex}.childcareArrangements.${arrangementIndex}.parentsPayContribution`, value, { shouldDirty: true, shouldValidate: true })} />
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
            <h4 className="text-sm font-semibold text-white">{t("fields.residentLabel", { index: index + 1 })}</h4>
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
            <CheckboxRow checked={form.watch(`residents.${index}.sameAddressRegistered`)} label={t("fields.sameAddressRegistered")} onChange={(value) => form.setValue(`residents.${index}.sameAddressRegistered`, value, { shouldDirty: true, shouldValidate: true })} />
            <CheckboxRow checked={form.watch(`residents.${index}.isSubtenant`)} label={t("fields.isSubtenant")} onChange={(value) => form.setValue(`residents.${index}.isSubtenant`, value, { shouldDirty: true, shouldValidate: true })} />
            <CheckboxRow checked={form.watch(`residents.${index}.hasSubrentContract`)} label={t("fields.hasSubrentContract")} onChange={(value) => form.setValue(`residents.${index}.hasSubrentContract`, value, { shouldDirty: true, shouldValidate: true })} />
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
          <CheckboxRow checked={form.watch("housing.independentHome")} label={t("fields.independentHome")} onChange={(value) => form.setValue("housing.independentHome", value, { shouldDirty: true, shouldValidate: true })} />
          <CheckboxRow checked={form.watch("housing.hasRentalContract")} label={t("fields.hasRentalContract")} onChange={(value) => form.setValue("housing.hasRentalContract", value, { shouldDirty: true, shouldValidate: true })} />
          <CheckboxRow checked={form.watch("housing.rentsRoom")} label={t("fields.rentsRoom")} onChange={(value) => form.setValue("housing.rentsRoom", value, { shouldDirty: true, shouldValidate: true })} />
          <CheckboxRow checked={form.watch("housing.groupHousingForElderlyOrAssistedLiving")} label={t("fields.groupHousing")} onChange={(value) => form.setValue("housing.groupHousingForElderlyOrAssistedLiving", value, { shouldDirty: true, shouldValidate: true })} />
          <CheckboxRow checked={form.watch("housing.recognizedException")} label={t("fields.recognizedException")} onChange={(value) => form.setValue("housing.recognizedException", value, { shouldDirty: true, shouldValidate: true })} />
          <CheckboxRow checked={form.watch("housing.isWoonwagen")} label={t("fields.isWoonwagen")} onChange={(value) => form.setValue("housing.isWoonwagen", value, { shouldDirty: true, shouldValidate: true })} />
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
          <CheckboxRow checked={form.watch("assets.hasSpecialAssets")} label={t("fields.hasSpecialAssets")} onChange={(value) => form.setValue("assets.hasSpecialAssets", value, { shouldDirty: true, shouldValidate: true })} />
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
              onChange={(value) => form.setValue(`specialSituations.${key}`, value, { shouldDirty: true, shouldValidate: true })}
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
