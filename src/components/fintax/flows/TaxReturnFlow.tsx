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
  TaxReturnIntro,
  TaxReturnProgressHeader,
  TaxReturnStepAssets,
  TaxReturnStepDeductions,
  TaxReturnStepHousing,
  TaxReturnStepIdentity,
  TaxReturnStepIncome,
  TaxReturnStepSubmission,
  TaxReturnStepSummary,
  createTaxReturnDefaultValues,
  getTaxReturnEstimate,
  getTaxReturnStepFieldNames,
  normalizeTaxReturnValues,
  resolveTaxReturnService,
  taxReturnStepKeys,
  taxReturnWizardSchema,
  type TaxReturnFormValues,
  type TaxReturnServiceKey,
} from "@/components/fintax/flows/tax-return";
import { hasLocalWizardProgress, loadWizardSnapshot, persistWizardSnapshot, readWizardSnapshot } from "@/lib/wizards/persistence";

export function TaxReturnFlow({ initialService }: { initialService?: string | null } = {}) {
  const t = useTranslations("TaxReturn");
  const [selectedService, setSelectedService] = React.useState<TaxReturnServiceKey>(resolveTaxReturnService(initialService));
  const [currentStep, setCurrentStep] = React.useState(0);
  const [draftCaseId, setDraftCaseId] = React.useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);
  const lastPersistedSignature = React.useRef<string | null>(null);

  const form = useForm<TaxReturnFormValues>({
    resolver: zodResolver(taxReturnWizardSchema),
    defaultValues: createTaxReturnDefaultValues(selectedService),
  });

  const storageKey = `fintax-tax-${selectedService}`;

  React.useEffect(() => {
    const defaults = createTaxReturnDefaultValues(selectedService);
    const snapshot = readWizardSnapshot<Record<string, unknown>>(storageKey);
    const nextValues = loadWizardSnapshot(storageKey, defaults);
    const restoredValues = normalizeTaxReturnValues({ ...nextValues, service: selectedService });

    form.reset(restoredValues);
    lastPersistedSignature.current = null;
    setCurrentStep(typeof snapshot?.progressStep === "number" ? Math.max(0, Math.min(snapshot.progressStep, taxReturnStepKeys.length - 1)) : 0);
    setDraftCaseId(typeof snapshot?.caseId === "string" ? snapshot.caseId : null);
    setLastSavedAt(typeof snapshot?.updatedAt === "string" ? snapshot.updatedAt : null);
  }, [form, selectedService, storageKey]);

  const values = form.watch();
  const normalizedValues = React.useMemo(() => normalizeTaxReturnValues(values), [values]);
  const estimate = React.useMemo(() => getTaxReturnEstimate(normalizedValues), [normalizedValues]);

  React.useEffect(() => {
    if (JSON.stringify(normalizedValues) !== JSON.stringify(values)) {
      form.reset(normalizedValues, { keepDirtyValues: true });
    }
  }, [form, normalizedValues, values]);

  const persistCurrentSnapshot = React.useCallback(() => {
    const updatedAt = new Date().toISOString();
    const latestValues = normalizeTaxReturnValues(form.getValues());
    const payload = {
      ...latestValues,
      selectedService,
      currentStep,
      draftStatus: currentStep >= taxReturnStepKeys.length - 2 ? "ready_for_review" : "in_progress",
      lastSavedAt: updatedAt,
    };
    const signature = JSON.stringify({ storageKey, caseId: draftCaseId, payload: { ...payload, lastSavedAt: null } });

    if (signature === lastPersistedSignature.current) return;

    lastPersistedSignature.current = signature;
    setLastSavedAt(updatedAt);

    void persistWizardSnapshot({
      storageKey,
      caseId: draftCaseId ?? undefined,
      payload,
    });
  }, [currentStep, draftCaseId, form, selectedService, storageKey]);

  React.useEffect(() => {
    const subscription = form.watch(() => {
      persistCurrentSnapshot();
    });

    return () => subscription.unsubscribe();
  }, [form, persistCurrentSnapshot]);

  React.useEffect(() => {
    persistCurrentSnapshot();
  }, [persistCurrentSnapshot]);

  const createDraftCase = async () => {
    if (draftCaseId) return draftCaseId;

    try {
      const response = await fetch("/api/cases/draft", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caseType: selectedService,
          fullName: normalizedValues.identity.fullName,
          bsn: normalizedValues.identity.bsn,
          taxYear: normalizedValues.filing.taxYear,
        }),
      });
      const data = (await response.json().catch(() => null)) as { caseId?: string | null } | null;
      const caseId = data?.caseId ?? null;
      if (caseId) {
        setDraftCaseId(caseId);
      }
      return caseId;
    } catch {
      return null;
    }
  };

  const nextStep = async () => {
    const stepKey = taxReturnStepKeys[currentStep];
    if (stepKey === "submission") return;

    if (stepKey !== "summary") {
      const valid = await form.trigger(getTaxReturnStepFieldNames(currentStep, normalizedValues));
      if (!valid) return;
    }

    if (stepKey === "identity") {
      await createDraftCase();
    }

    setCurrentStep((step) => Math.min(step + 1, taxReturnStepKeys.length - 1));
  };

  const prevStep = () => setCurrentStep((step) => Math.max(step - 1, 0));

  return (
    <div className="space-y-6">
      <TaxReturnIntro
        selectedService={selectedService}
        onSelectService={setSelectedService}
        hasSavedProgress={(service) => hasLocalWizardProgress(`fintax-tax-${service}`)}
      />

      <Card className="overflow-hidden border border-border/55 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,249,245,0.92))] shadow-[0_26px_80px_rgba(18,38,28,0.08)]">
        <CardHeader className="space-y-5 border-b border-border/45 bg-[linear-gradient(180deg,rgba(250,252,249,0.98),rgba(245,248,243,0.92))]">
          <TaxReturnProgressHeader currentStep={currentStep} steps={taxReturnStepKeys} />
        </CardHeader>

        <CardBody className="space-y-5 sm:space-y-6">
          <form onSubmit={form.handleSubmit(() => undefined)} noValidate>
            {taxReturnStepKeys[currentStep] === "identity" ? <TaxReturnStepIdentity form={form} values={normalizedValues} /> : null}
            {taxReturnStepKeys[currentStep] === "income" ? <TaxReturnStepIncome form={form} values={normalizedValues} /> : null}
            {taxReturnStepKeys[currentStep] === "housing" ? <TaxReturnStepHousing form={form} values={normalizedValues} /> : null}
            {taxReturnStepKeys[currentStep] === "assets" ? <TaxReturnStepAssets form={form} values={normalizedValues} /> : null}
            {taxReturnStepKeys[currentStep] === "deductions" ? <TaxReturnStepDeductions form={form} values={normalizedValues} /> : null}
            {taxReturnStepKeys[currentStep] === "summary" ? (
              <TaxReturnStepSummary values={normalizedValues} estimate={estimate} caseId={draftCaseId} updatedAt={lastSavedAt} />
            ) : null}
            {taxReturnStepKeys[currentStep] === "submission" ? (
              <TaxReturnStepSubmission form={form} values={normalizedValues} caseId={draftCaseId} updatedAt={lastSavedAt} />
            ) : null}
          </form>

          <div className="flex flex-col-reverse gap-3 border-t border-border/35 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0}
              leftIcon={<ChevronLeft className="size-4" />}
              className="w-full sm:w-auto"
            >
              {t("back")}
            </Button>

            {currentStep < taxReturnStepKeys.length - 1 ? (
              <Button type="button" onClick={nextStep} rightIcon={<ChevronRight className="size-4" />} className="w-full sm:w-auto">
                {t("next")}
              </Button>
            ) : null}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
