"use client";
/* eslint-disable react-hooks/incompatible-library */

import { zodResolver } from "@hookform/resolvers/zod";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";

import { Button } from "@/components/fintax/Button";
import { Card, CardBody, CardHeader } from "@/components/fintax/Card";
import {
  BenefitsDocumentReviewStep,
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
  createBenefitsWizardSchema,
  getEligibleBenefitKeys,
  getStepFieldNames,
  hydrateBenefitsValues,
  mapBenefitsValuesToEligibilityInput,
  normalizeBenefitsValues,
  type BenefitCardKey,
  type BenefitsFormValues,
} from "@/components/fintax/flows/benefits";
import { getPrimaryBenefitCaseType } from "@/components/fintax/flows/benefits/document-review";
import { apiGet, apiPatch, apiPost, isApiClientError } from "@/hooks/api-client";
import type { AppLocale } from "@/i18n/routing";
import { createBenefitsDraftPayload, isBenefitCardKey, parseBenefitsDraftCase, type BenefitsDraftPayload } from "@/lib/benefits/contracts";
import { calculateEligibility } from "@/lib/utils/eligibility-calculator";
import { loadWizardSnapshot, persistWizardSnapshot, readWizardSnapshot } from "@/lib/wizards/persistence";
import type { Case } from "@/types/database";

const storageKey = "fintax-benefits-wizard";

export function BenefitsFlow() {
  const t = useTranslations("Benefits");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const validationSchema = React.useMemo(
    () =>
      createBenefitsWizardSchema(
        {
          enterNumber: (field) => t("validation.enterNumber", { field }),
          minValue: (field, min) => t("validation.minValue", { field, min }),
          maxValue: (field, max) => t("validation.maxValue", { field, max }),
          partnerAnnualIncomeRequired: t("validation.partnerAnnualIncomeRequired"),
          partnerAssetsRequired: t("validation.partnerAssetsRequired"),
        },
        {
          age: t("fields.age"),
          applicantAnnualIncome: t("fields.applicantAnnualIncome"),
          partnerAnnualIncome: t("fields.partnerAnnualIncome"),
          applicantAssets: t("fields.applicantAssets"),
          partnerAssets: t("fields.partnerAssets"),
          monthlyRent: t("fields.monthlyRent"),
          childrenUnder18: t("fields.childrenUnder18"),
          childcareHoursPerMonth: t("fields.childcareHoursPerMonth"),
          childcareHourlyRate: t("fields.childcareHourlyRate"),
        },
      ),
    [t],
  );
  const form = useForm<BenefitsFormValues>({
    resolver: zodResolver(validationSchema),
    defaultValues: benefitsDefaultValues,
  });

  const [currentStep, setCurrentStep] = React.useState(0);
  const [bundleSelected, setBundleSelected] = React.useState<BenefitCardKey[]>([]);
  const [draftCaseId, setDraftCaseId] = React.useState<string | null>(null);
  const [lastSavedAt, setLastSavedAt] = React.useState<string | null>(null);
  const [isNavigatingToWorkspace, setIsNavigatingToWorkspace] = React.useState(false);
  const [serverState, setServerState] = React.useState<"loading" | "ready" | "fallback" | "error">("loading");
  const [workspaceError, setWorkspaceError] = React.useState<string | null>(null);
  const [syncError, setSyncError] = React.useState<string | null>(null);
  const hasAutoSelected = React.useRef(false);
  const lastPersistedSignature = React.useRef<string | null>(null);

  React.useEffect(() => {
    let isMounted = true;
    const snapshot = readWizardSnapshot<Record<string, unknown>>(storageKey);
    const localCaseId = typeof snapshot?.caseId === "string" ? snapshot.caseId : null;
    const nextValues = hydrateBenefitsValues(loadWizardSnapshot(storageKey, benefitsDefaultValues));
    const persistedSelection = Array.isArray(snapshot?.payload?.selectedBenefits)
      ? snapshot.payload.selectedBenefits.filter(isBenefitCardKey)
      : [];
    const localStep =
      typeof snapshot?.progressStep === "number"
        ? Math.max(0, Math.min(snapshot.progressStep, benefitStepKeys.length - 1))
        : 0;

    const restoreLocalFallback = () => {
      form.reset(nextValues);
      setCurrentStep(localStep);
      setBundleSelected(persistedSelection);
      setDraftCaseId(null);
      setLastSavedAt(typeof snapshot?.updatedAt === "string" ? snapshot.updatedAt : null);
      setServerState("fallback");
      setSyncError(null);
      lastPersistedSignature.current = null;
    };

    void (async () => {
      try {
        const caseItem = await apiGet<Case>("/api/cases/benefits-draft");
        if (!isMounted) return;

        const parsed = parseBenefitsDraftCase(caseItem);
        const localPayload = createBenefitsDraftPayload({
          ...nextValues,
          currentStep: localStep,
          selectedBenefits: persistedSelection,
          lastSavedAt: typeof snapshot?.updatedAt === "string" ? snapshot.updatedAt : null,
        });
        const hasServerWizardData =
          caseItem.wizard_data && typeof caseItem.wizard_data === "object" && Object.keys(caseItem.wizard_data).length > 0;
        const shouldPreferLocalDraft = !hasServerWizardData && (persistedSelection.length > 0 || localStep > 0);
        const restoredPayload = shouldPreferLocalDraft ? localPayload : parsed?.payload ?? createBenefitsDraftPayload({});
        form.reset(hydrateBenefitsValues(restoredPayload));
        setCurrentStep(restoredPayload.currentStep);
        setBundleSelected(restoredPayload.selectedBenefits);
        setDraftCaseId(shouldPreferLocalDraft ? localCaseId : caseItem.id);
        setLastSavedAt(shouldPreferLocalDraft ? (typeof snapshot?.updatedAt === "string" ? snapshot.updatedAt : null) : caseItem.updated_at);
        setServerState("ready");
        setSyncError(null);
        lastPersistedSignature.current = null;
      } catch (error) {
        if (!isMounted) return;

        if (isApiClientError(error) && error.code === "not_found" && !localCaseId) {
          restoreLocalFallback();
          return;
        }

        if (!localCaseId) {
          restoreLocalFallback();
        } else {
          form.reset(benefitsDefaultValues);
          setCurrentStep(0);
          setBundleSelected([]);
          setDraftCaseId(localCaseId);
          setLastSavedAt(null);
          setServerState("error");
        }

        setSyncError(t("syncErrors.unavailable"));
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [form, t]);

  const values = form.watch();
  const normalizedValues = React.useMemo(() => normalizeBenefitsValues(values), [values]);
  const eligibilityInput = React.useMemo(() => mapBenefitsValuesToEligibilityInput(normalizedValues), [normalizedValues]);
  const results = React.useMemo(() => calculateEligibility(eligibilityInput), [eligibilityInput]);
  const selectedAmount = React.useMemo(
    () => bundleSelected.reduce((sum, key) => sum + results[key].estimatedAnnualAmount, 0),
    [bundleSelected, results],
  );

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

  const persistCurrentSnapshot = React.useCallback(async () => {
    const updatedAt = new Date().toISOString();
    const payload = createBenefitsDraftPayload({
      ...normalizedValues,
      currentStep,
      selectedBenefits: bundleSelected,
      draftStatus: currentStep >= benefitStepKeys.indexOf("documentReview") ? "ready_for_review" : "in_progress",
      lastSavedAt: updatedAt,
    });
    const signature = JSON.stringify({
      caseId: draftCaseId,
      payload: {
        ...payload,
        lastSavedAt: null,
      },
    });

    if (signature === lastPersistedSignature.current) return;
    lastPersistedSignature.current = signature;

    setLastSavedAt(updatedAt);
    await persistWizardSnapshot({
      storageKey,
      payload,
    });

    if (!draftCaseId) return;

    try {
      const preferredCaseType = getPrimaryBenefitCaseType(bundleSelected) ?? undefined;
      const updated = await apiPatch<Case, { caseId: string; payload: BenefitsDraftPayload; preferredCaseType?: string }>(
        "/api/cases/benefits-draft",
        {
          caseId: draftCaseId,
          payload,
          preferredCaseType,
        },
      );
      setDraftCaseId(updated.id);
      setLastSavedAt(updated.updated_at);
      setServerState("ready");
      setSyncError(null);
    } catch (error) {
      setServerState("error");
      setSyncError(
        isApiClientError(error)
          ? t("syncErrors.syncFailedWithCode", { code: error.code })
          : t("syncErrors.syncFailed"),
      );
    }
  }, [bundleSelected, currentStep, draftCaseId, normalizedValues, t]);

  React.useEffect(() => {
    const subscription = form.watch(() => {
      void persistCurrentSnapshot();
    });

    return () => subscription.unsubscribe();
  }, [form, persistCurrentSnapshot]);

  React.useEffect(() => {
    if (serverState === "loading") return;
    void persistCurrentSnapshot();
  }, [persistCurrentSnapshot, serverState]);

  const createDraftCase = React.useCallback(
    async (nextStepIndex: number) => {
      if (draftCaseId) return draftCaseId;

      const payload = createBenefitsDraftPayload({
        ...normalizedValues,
        currentStep: nextStepIndex,
        selectedBenefits: bundleSelected,
        draftStatus: "in_progress",
        lastSavedAt: new Date().toISOString(),
      });
      const preferredCaseType = getPrimaryBenefitCaseType(bundleSelected) ?? undefined;

      try {
        const created = await apiPost<Case, { payload: BenefitsDraftPayload; preferredCaseType?: string }>(
          "/api/cases/benefits-draft",
          {
            payload,
            preferredCaseType,
          },
        );
        setDraftCaseId(created.id);
        setLastSavedAt(created.updated_at);
        setServerState("ready");
        setSyncError(null);
        lastPersistedSignature.current = null;
        return created.id;
      } catch (error) {
        setServerState("error");
        setSyncError(
          isApiClientError(error)
            ? t("syncErrors.creationFailedWithCode", { code: error.code })
            : t("syncErrors.creationFailed"),
        );
        return null;
      }
    },
    [bundleSelected, draftCaseId, normalizedValues, t],
  );

  const nextStep = async () => {
    const stepKey = benefitStepKeys[currentStep];
    if (stepKey === "results" || stepKey === "documentReview") return;

    const valid = await form.trigger(getStepFieldNames(currentStep, normalizedValues));
    if (!valid) return;

    const nextStepIndex = Math.min(currentStep + 1, benefitStepKeys.length - 1);
    if (stepKey === "personal") {
      await createDraftCase(nextStepIndex);
    }

    setCurrentStep(nextStepIndex);
  };

  const prevStep = () => {
    setWorkspaceError(null);
    setCurrentStep((step) => Math.max(step - 1, 0));
  };

  const toggleBundleSelection = (key: BenefitCardKey) => {
    setBundleSelected((previous) =>
      previous.includes(key) ? previous.filter((value) => value !== key) : [...previous, key],
    );
  };

  const continueToDocumentReview = () => {
    if (bundleSelected.length === 0) return;
    setWorkspaceError(null);
    setCurrentStep(benefitStepKeys.indexOf("documentReview"));
  };

  const upsertBenefitsDraft = async () => {
    const payload = createBenefitsDraftPayload({
      ...normalizedValues,
      currentStep: benefitStepKeys.indexOf("documentReview"),
      selectedBenefits: bundleSelected,
      draftStatus: "ready_for_review",
      lastSavedAt: new Date().toISOString(),
    });
    const preferredCaseType = getPrimaryBenefitCaseType(bundleSelected) ?? undefined;

    if (draftCaseId) {
      const updated = await apiPatch<Case, { caseId: string; payload: typeof payload; preferredCaseType?: typeof preferredCaseType }>(
        "/api/cases/benefits-draft",
        {
          caseId: draftCaseId,
          payload,
          preferredCaseType,
        },
      );
      setDraftCaseId(updated.id);
      return updated.id;
    }

      const created = await apiPost<Case, { payload: typeof payload; preferredCaseType?: typeof preferredCaseType }>(
        "/api/cases/benefits-draft",
        {
        payload,
        preferredCaseType,
      },
    );
    setDraftCaseId(created.id);
    return created.id;
  };

  const openCaseWorkspace = async () => {
    setWorkspaceError(null);
    setIsNavigatingToWorkspace(true);

    try {
      const caseId = await upsertBenefitsDraft();

      await persistWizardSnapshot({
        storageKey,
        payload: {
          ...normalizedValues,
          currentStep: benefitStepKeys.indexOf("documentReview"),
          selectedBenefits: bundleSelected,
          draftStatus: "ready_for_review",
          lastSavedAt: new Date().toISOString(),
        },
      });

      router.push(`/${locale}/benefits/${caseId}`);
    } catch {
      setWorkspaceError(t("documentReview.launchError"));
      setIsNavigatingToWorkspace(false);
    }
  };

  return (
    <div className="space-y-6">
      <BenefitsIntro />

      {draftCaseId ? (
        <div className="rounded-2xl border border-border/45 bg-white/90 px-4 py-3 text-sm text-secondary">
          <span className="font-semibold text-text">{t("caseDraft.connected")}</span>
          {lastSavedAt ? ` ${t("caseDraft.lastSaved", { value: new Date(lastSavedAt).toLocaleString(locale) })}` : ""}
        </div>
      ) : null}

      {syncError ? <div className="rounded-2xl border border-copper/35 bg-copper/10 px-4 py-3 text-sm text-secondary">{syncError}</div> : null}

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
                onContinue={continueToDocumentReview}
              />
            ) : null}
            {benefitStepKeys[currentStep] === "documentReview" ? (
              <BenefitsDocumentReviewStep
                selectedKeys={bundleSelected}
                selectedAmount={selectedAmount}
                values={normalizedValues}
                results={results}
                draftCaseId={draftCaseId}
                isLaunching={isNavigatingToWorkspace}
                launchError={workspaceError}
                onContinueToWorkspace={openCaseWorkspace}
              />
            ) : null}
          </form>

          <div className="flex items-center justify-between border-t border-border/35 pt-5">
            <Button
              type="button"
              variant="ghost"
              onClick={prevStep}
              disabled={currentStep === 0 || serverState === "loading"}
              leftIcon={<ChevronLeft className="size-4" />}
            >
              {t("back")}
            </Button>

            {benefitStepKeys[currentStep] !== "results" && benefitStepKeys[currentStep] !== "documentReview" ? (
              <Button type="button" onClick={nextStep} rightIcon={<ChevronRight className="size-4" />} disabled={serverState === "loading"}>
                {t("next")}
              </Button>
            ) : null}
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function areSameSelection(left: BenefitCardKey[], right: BenefitCardKey[]) {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}
