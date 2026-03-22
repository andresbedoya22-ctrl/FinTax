"use client";
/* eslint-disable react-hooks/incompatible-library */

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/fintax/Button";
import { Card, CardBody, CardHeader } from "@/components/fintax/Card";
import {
  BenefitsIntro,
  BenefitsProgressHeader,
  BenefitsResults,
  BenefitsStepAssets,
  BenefitsStepChildren,
  BenefitsStepHealth,
  BenefitsStepHousing,
  BenefitsStepIncome,
  BenefitsStepPersonal,
  benefitStepKeys,
  benefitsDefaultValues,
  benefitsWizardSchema,
  getEligibleBenefitKeys,
  getStepFieldNames,
  normalizeBenefitsValues,
  type BenefitCardKey,
  type BenefitsFormValues,
} from "@/components/fintax/flows/benefits";
import { calculateEligibility, type BenefitsWizardInput } from "@/lib/utils/eligibility-calculator";
import { loadWizardSnapshot, persistWizardSnapshot, readWizardSnapshot } from "@/lib/wizards/persistence";

const storageKey = "fintax-benefits-wizard";

export function BenefitsFlow() {
  const t = useTranslations("Benefits");
  const form = useForm<BenefitsFormValues>({
    resolver: zodResolver(benefitsWizardSchema),
    defaultValues: benefitsDefaultValues,
  });
  const [currentStep, setCurrentStep] = React.useState(0);
  const [bundleSelected, setBundleSelected] = React.useState<BenefitCardKey[]>([]);
  const hasAutoSelected = React.useRef(false);

  React.useEffect(() => {
    const snapshot = readWizardSnapshot<Record<string, unknown>>(storageKey);
    const nextValues = loadWizardSnapshot(storageKey, benefitsDefaultValues);
    form.reset(nextValues);
    setCurrentStep(
      typeof snapshot?.progressStep === "number"
        ? Math.max(0, Math.min(snapshot.progressStep, benefitStepKeys.length - 1))
        : 0,
    );

    const persistedSelection = Array.isArray(snapshot?.payload?.selectedBenefits)
      ? snapshot.payload.selectedBenefits.filter(isBenefitCardKey)
      : [];
    setBundleSelected(persistedSelection);
  }, [form]);

  const values = form.watch();
  const normalizedValues = React.useMemo(
    () => normalizeBenefitsValues(values),
    [values],
  );
  const results = React.useMemo(
    () => calculateEligibility(normalizedValues as BenefitsWizardInput),
    [normalizedValues],
  );

  React.useEffect(() => {
    void persistWizardSnapshot({
      storageKey,
      payload: {
        ...normalizedValues,
        currentStep,
        selectedBenefits: bundleSelected,
      },
    });
  }, [bundleSelected, currentStep, normalizedValues]);

  React.useEffect(() => {
    const cleanedValues = normalizeBenefitsValues(values);
    if (JSON.stringify(cleanedValues) !== JSON.stringify(values)) {
      form.reset(cleanedValues, { keepDirtyValues: true });
    }
  }, [form, values]);

  React.useEffect(() => {
    setBundleSelected((previous) => {
      const nextSelection = previous.filter((key) => results[key].eligible);
      return areSameSelection(previous, nextSelection) ? previous : nextSelection;
    });
  }, [results]);

  React.useEffect(() => {
    if (benefitStepKeys[currentStep] !== "results" || hasAutoSelected.current || bundleSelected.length > 0) {
      return;
    }

    const recommended = getEligibleBenefitKeys(results);
    if (recommended.length > 0) {
      setBundleSelected(recommended);
    }
    hasAutoSelected.current = true;
  }, [bundleSelected.length, currentStep, results]);

  const nextStep = async () => {
    if (benefitStepKeys[currentStep] === "results") return;

    const valid = await form.trigger(getStepFieldNames(currentStep, normalizedValues));
    if (!valid) return;
    setCurrentStep((step) => Math.min(step + 1, benefitStepKeys.length - 1));
  };

  const prevStep = () => setCurrentStep((step) => Math.max(step - 1, 0));

  const toggleBundleSelection = (key: BenefitCardKey) => {
    setBundleSelected((previous) =>
      previous.includes(key) ? previous.filter((value) => value !== key) : [...previous, key],
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
          <form onSubmit={form.handleSubmit(() => undefined)} noValidate>
            {benefitStepKeys[currentStep] === "personal" ? <BenefitsStepPersonal form={form} values={normalizedValues} /> : null}
            {benefitStepKeys[currentStep] === "income" ? <BenefitsStepIncome form={form} values={normalizedValues} /> : null}
            {benefitStepKeys[currentStep] === "assets" ? <BenefitsStepAssets form={form} values={normalizedValues} /> : null}
            {benefitStepKeys[currentStep] === "housing" ? <BenefitsStepHousing form={form} values={normalizedValues} /> : null}
            {benefitStepKeys[currentStep] === "health" ? <BenefitsStepHealth form={form} values={normalizedValues} /> : null}
            {benefitStepKeys[currentStep] === "children" ? <BenefitsStepChildren form={form} values={normalizedValues} /> : null}
            {benefitStepKeys[currentStep] === "results" ? (
              <BenefitsResults
                results={results}
                selectedKeys={bundleSelected}
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

function isBenefitCardKey(value: unknown): value is BenefitCardKey {
  return value === "zorgtoeslag" || value === "huurtoeslag" || value === "kindgebondenBudget" || value === "kinderopvangtoeslag";
}

function areSameSelection(left: BenefitCardKey[], right: BenefitCardKey[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
