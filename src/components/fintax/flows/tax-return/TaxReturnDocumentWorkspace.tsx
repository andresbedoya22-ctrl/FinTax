"use client";

import {
  ArrowLeft,
  ArrowRight,
  Check,
  ChevronRight,
  Clock3,
  FileQuestion,
  FileUp,
  Loader2,
  RefreshCcw,
  Trash2,
  Upload,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";

import { Button } from "@/components/fintax/Button";
import { Card, CardBody, CardHeader } from "@/components/fintax/Card";
import { Badge, Input, Select, Skeleton, Textarea } from "@/components/ui";
import { useCase } from "@/hooks/useCase";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { isApiClientError } from "@/hooks/api-client";
import { useTaxSummary } from "@/hooks/useTaxSummary";
import {
  createDefaultIntakeDraftValues,
  mergeIntakeDraftValues,
  type CaseDocument,
  type TaxReturnIntakeDraftValues,
  useCaseDocuments,
  useCaseIntake,
  useCaseProgress,
  useCaseRequirements,
  useCreateDraftCase,
  useDeleteCaseDocument,
  useLatestActiveTaxCase,
  useRegenerateRequirements,
  useRequirementHelp,
  useRequirementNotAvailable,
  useRequirementNote,
  useSaveCaseIntake,
  useUploadRequirementDocument,
} from "@/hooks/useTaxReturnDocFlow";
import { cn } from "@/lib/cn";
import type { Case, CaseRequirement } from "@/types/database";

type WorkspaceProps = {
  caseId?: string;
  initialService?: string | null;
};

type WizardStepId =
  | "service"
  | "residency"
  | "family"
  | "employment"
  | "selfEmployment"
  | "housing"
  | "assets"
  | "deductions"
  | "review"
  | "requirements";

type WizardStepDefinition = {
  id: WizardStepId;
  sectionKey: string;
  titleKey: string;
  descriptionKey: string;
};

const CASE_TYPES = ["tax_return_p", "tax_return_m", "tax_return_c", "tax_return_w"] as const;

const WIZARD_STEPS: WizardStepDefinition[] = [
  { id: "service", sectionKey: "service", titleKey: "steps.service.title", descriptionKey: "steps.service.description" },
  { id: "residency", sectionKey: "residency", titleKey: "steps.residency.title", descriptionKey: "steps.residency.description" },
  { id: "family", sectionKey: "family", titleKey: "steps.family.title", descriptionKey: "steps.family.description" },
  { id: "employment", sectionKey: "employment", titleKey: "steps.employment.title", descriptionKey: "steps.employment.description" },
  { id: "selfEmployment", sectionKey: "selfEmployment", titleKey: "steps.selfEmployment.title", descriptionKey: "steps.selfEmployment.description" },
  { id: "housing", sectionKey: "housing", titleKey: "steps.housing.title", descriptionKey: "steps.housing.description" },
  { id: "assets", sectionKey: "assets", titleKey: "steps.assets.title", descriptionKey: "steps.assets.description" },
  { id: "deductions", sectionKey: "deductions", titleKey: "steps.deductions.title", descriptionKey: "steps.deductions.description" },
  { id: "review", sectionKey: "review", titleKey: "steps.review.title", descriptionKey: "steps.review.description" },
  { id: "requirements", sectionKey: "requirements", titleKey: "steps.requirements.title", descriptionKey: "steps.requirements.description" },
];

export function TaxReturnDocumentWorkspace({ caseId, initialService }: WorkspaceProps) {
  const t = useTranslations("DocFlow");
  const locale = useLocale();
  const profileQuery = useCurrentProfile();
  const canLoadClientData = !profileQuery.loading && Boolean(profileQuery.profile);
  const activeCases = useLatestActiveTaxCase(caseId ?? null, !caseId && canLoadClientData);
  const currentCaseId = caseId ?? activeCases.selectedCaseId ?? null;
  const canLoadCaseData = Boolean(currentCaseId) && canLoadClientData;
  const caseQuery = useCase(currentCaseId ?? "", canLoadCaseData);
  const caseItem = caseQuery.data ?? null;
  const intakeQuery = useCaseIntake(currentCaseId ?? "", canLoadCaseData);
  const [draft, setDraft] = React.useState<TaxReturnIntakeDraftValues>(() => createDefaultIntakeDraftValues(resolveCaseType(initialService)));
  const [hydrated, setHydrated] = React.useState(false);
  const [stepIndex, setStepIndex] = React.useState(0);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const [stepError, setStepError] = React.useState<string | null>(null);
  const [persistedSignature, setPersistedSignature] = React.useState("");
  const [selectedRequirementSection, setSelectedRequirementSection] = React.useState<string | null>(null);
  const [expandedHelpId, setExpandedHelpId] = React.useState<string | null>(null);
  const [noteDrafts, setNoteDrafts] = React.useState<Record<string, string>>({});
  const [availabilityDrafts, setAvailabilityDrafts] = React.useState<Record<string, string>>({});
  const hydratedKeyRef = React.useRef<string | null>(null);

  const requirementsEnabled = stepIndex === 9 && canLoadCaseData;
  const requirementsQuery = useCaseRequirements(currentCaseId ?? "", requirementsEnabled);
  const progressQuery = useCaseProgress(currentCaseId ?? "", requirementsEnabled);
  const documentsQuery = useCaseDocuments(currentCaseId ?? "", requirementsEnabled);
  const taxSummaryQuery = useTaxSummary(currentCaseId ?? "", requirementsEnabled);
  const helpQuery = useRequirementHelp(currentCaseId ?? "", expandedHelpId ?? "", Boolean(expandedHelpId) && requirementsEnabled);
  const createDraftMutation = useCreateDraftCase();
  const saveIntakeMutation = useSaveCaseIntake(currentCaseId ?? "");
  const regenerateMutation = useRegenerateRequirements(currentCaseId ?? "");
  const uploadMutation = useUploadRequirementDocument(currentCaseId ?? "");
  const deleteDocumentMutation = useDeleteCaseDocument(currentCaseId ?? "");
  const noteMutation = useRequirementNote(currentCaseId ?? "");
  const notAvailableMutation = useRequirementNotAvailable(currentCaseId ?? "");
  const currentStep = WIZARD_STEPS[stepIndex];

  React.useEffect(() => {
    const caseKey = currentCaseId ?? "new";
    if (hydratedKeyRef.current === caseKey) return;

    if (caseItem) {
      const mergedDraft = mergeIntakeDraftValues({
        draftValues: createDefaultIntakeDraftValues(caseItem.case_type),
        caseType: caseItem.case_type,
        snapshot: intakeQuery.data,
      });
      setDraft((previous) => ({
        ...mergedDraft,
        fullName: previous.fullName || profileQuery.profile?.full_name || "",
        bsn: previous.bsn,
      }));
      setStepIndex(readStoredStep(caseKey) ?? inferStepFromCase(caseItem));
      setPersistedSignature(createDraftSignature(mergedDraft));
      hydratedKeyRef.current = caseKey;
      setHydrated(true);
      return;
    }

    if (!profileQuery.loading) {
      const nextDraft = createDefaultIntakeDraftValues(resolveCaseType(initialService));
      const originCountryCode =
        profileQuery.profile?.country_of_origin?.trim().toUpperCase().slice(0, 2) ||
        profileQuery.profile?.address_country?.trim().toUpperCase().slice(0, 2) ||
        "NL";

      const filledDraft: TaxReturnIntakeDraftValues = {
        ...nextDraft,
        fullName: profileQuery.profile?.full_name || "",
        bsn: "",
        payload: {
          ...nextDraft.payload,
          filing: {
            ...nextDraft.payload.filing,
            originCountryCode,
          },
        },
      };

      setDraft(filledDraft);
      setPersistedSignature(createDraftSignature(filledDraft));
      setStepIndex(readStoredStep(caseKey) ?? 0);
      hydratedKeyRef.current = caseKey;
      setHydrated(true);
    }
  }, [caseItem, currentCaseId, initialService, intakeQuery.data, profileQuery.loading, profileQuery.profile]);

  React.useEffect(() => {
    if (!currentCaseId || !hydrated) return;
    persistStep(currentCaseId, stepIndex);
  }, [currentCaseId, hydrated, stepIndex]);

  const requirements = React.useMemo(() => requirementsQuery.data?.requirements ?? [], [requirementsQuery.data]);
  const progress = progressQuery.data ?? requirementsQuery.data?.progress ?? null;
  const documents = React.useMemo(() => documentsQuery.data ?? [], [documentsQuery.data]);
  const pendingRequirements = React.useMemo(
    () => requirements.filter((item) => ["pending", "uploaded", "rejected"].includes(item.status)),
    [requirements],
  );
  const groupedRequirements = React.useMemo(() => groupRequirements(requirements), [requirements]);
  const draftSignature = React.useMemo(() => createDraftSignature(draft), [draft]);
  const hasUnsavedChanges = draftSignature !== persistedSignature;
  const isSaving =
    createDraftMutation.isPending || saveIntakeMutation.isPending || regenerateMutation.isPending || noteMutation.isPending || notAvailableMutation.isPending;

  React.useEffect(() => {
    if (!selectedRequirementSection && groupedRequirements.length > 0) {
      setSelectedRequirementSection(groupedRequirements[0]?.[0] ?? null);
    }
  }, [groupedRequirements, selectedRequirementSection]);

  if (profileQuery.loading || (!caseId && canLoadClientData && activeCases.isLoading) || !hydrated || (canLoadCaseData && caseQuery.isLoading)) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-44 w-full rounded-[1.75rem]" />
        <Skeleton className="h-[680px] w-full rounded-[1.75rem]" />
      </div>
    );
  }

  if (currentCaseId && caseQuery.isError) {
    const code = isApiClientError(caseQuery.error) ? caseQuery.error.code : "unknown";
    return (
      <div className="rounded-[1.25rem] border border-copper/20 bg-copper/8 px-4 py-4 text-sm text-secondary">
        {t("errors.caseLoad", { code: String(code) })}
      </div>
    );
  }

  async function ensureCaseAndPersist() {
    const normalized = normalizeDraft(draft);
    const targetCaseId =
      currentCaseId ??
      (await createDraftMutation.mutateAsync({
        caseType: normalized.payload.caseType ?? resolveCaseType(initialService),
        fullName: normalized.fullName,
        bsn: normalized.bsn,
        taxYear: normalized.payload.filing.taxYear,
        originCountryCode: normalized.payload.filing.originCountryCode,
      }));

    if (!currentCaseId) {
      activeCases.setSelectedCaseId(targetCaseId);
    }

    await saveIntakeMutation.mutateAsync({ caseId: targetCaseId, payload: normalized.payload });
    setPersistedSignature(createDraftSignature(normalized));
    return targetCaseId;
  }

  async function handleNext() {
    setActionError(null);
    const error = validateStep(currentStep.id, draft, t);
    if (error) {
      setStepError(error);
      return;
    }

    setStepError(null);

    try {
      if (currentStep.id === "requirements") return;

      if (currentStep.id === "review") {
        await ensureCaseAndPersist();
        await regenerateMutation.mutateAsync();
        setStepIndex(9);
        return;
      }

      await ensureCaseAndPersist();
      setStepIndex((previous) => Math.min(previous + 1, WIZARD_STEPS.length - 1));
    } catch {
      setActionError(t("wizard.saveError"));
    }
  }

  async function handleBack() {
    if (stepIndex === 0) return;

    setActionError(null);
    setStepError(null);

    try {
      if (stepIndex < 9 && hasUnsavedChanges) {
        await ensureCaseAndPersist();
      }
      setStepIndex((previous) => Math.max(previous - 1, 0));
    } catch {
      setActionError(t("wizard.saveError"));
    }
  }

  function jumpToStep(targetStepId: WizardStepId) {
    const targetIndex = WIZARD_STEPS.findIndex((step) => step.id === targetStepId);
    if (targetIndex >= 0) {
      setStepError(null);
      setStepIndex(targetIndex);
    }
  }

  async function refreshRequirements() {
    setActionError(null);
    try {
      await regenerateMutation.mutateAsync();
    } catch {
      setActionError(t("wizard.refreshError"));
    }
  }

  async function saveRequirementNote(requirementId: string, note: string) {
    await noteMutation.mutateAsync({ requirementId, note });
  }

  async function saveRequirementAvailability(requirementId: string, note: string) {
    await notAvailableMutation.mutateAsync({ requirementId, note });
  }

  async function uploadRequirementFile(requirementId: string, file: File, replacesDocumentId?: string) {
    await uploadMutation.mutateAsync({ requirementId, file, replacesDocumentId });
  }

  async function deleteRequirementDocument(documentId: string) {
    await deleteDocumentMutation.mutateAsync({ documentId });
  }

  const requirementSection = groupedRequirements.find(([section]) => section === selectedRequirementSection) ?? groupedRequirements[0] ?? null;

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border border-border/45 bg-[linear-gradient(180deg,rgba(250,251,248,0.98),rgba(244,247,242,0.96))] shadow-[0_28px_90px_rgba(15,23,42,0.08)]">
        <CardHeader className="space-y-6 border-b border-border/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,249,244,0.95))]">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_320px]">
            <div className="space-y-4">
              <Badge variant="success" className="w-fit">
                {t("hero.eyebrow")}
              </Badge>
              <div className="space-y-3">
                <h1 className="font-heading text-3xl font-semibold tracking-[-0.04em] text-text sm:text-4xl">{t("hero.title")}</h1>
                <p className="max-w-3xl text-sm leading-7 text-secondary">{t("hero.description")}</p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                {(t.raw("hero.highlights") as string[]).map((item) => (
                  <div key={item} className="rounded-[1.15rem] border border-border/40 bg-white/80 px-4 py-3 text-sm text-secondary">
                    {item}
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-border/45 bg-white/80 p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{t("wizard.currentStepLabel")}</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text">{t(currentStep.titleKey)}</p>
              <p className="mt-2 text-sm leading-6 text-secondary">{t(currentStep.descriptionKey)}</p>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-border/40">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green to-copper transition-all"
                  style={{ width: `${Math.round(((stepIndex + 1) / WIZARD_STEPS.length) * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {caseItem ? (
            <div className="flex flex-wrap items-center gap-3">
              <Badge variant="neutral">{t(`caseTypes.${caseItem.case_type}`)}</Badge>
              <Badge variant={caseItem.status === "completed" ? "success" : caseItem.status === "pending_documents" ? "copper" : "neutral"}>
                {t(`status.${caseItem.status}`)}
              </Badge>
              <span className="text-sm text-secondary">
                {caseItem.display_name ?? t("caseMeta.fallbackTitle", { year: caseItem.tax_year ?? draft.payload.filing.taxYear })}
              </span>
            </div>
          ) : null}
        </CardHeader>

        <CardBody className="space-y-6">
          {actionError ? <InlineNotice tone="warning">{actionError}</InlineNotice> : null}
          {stepError ? <InlineNotice tone="warning">{stepError}</InlineNotice> : null}

          <div className="grid gap-6 xl:grid-cols-[280px_minmax(0,1fr)]">
            <aside className="space-y-4">
              <div className="rounded-[1.5rem] border border-border/45 bg-white/85 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{t("wizard.progressLabel")}</p>
                <ol className="mt-4 space-y-2">
                  {WIZARD_STEPS.map((step, index) => {
                    const isCurrent = index === stepIndex;
                    const isComplete = index < stepIndex;
                    return (
                      <li key={step.id}>
                        <button
                          type="button"
                          onClick={() => jumpToStep(step.id)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-[1.1rem] border px-3 py-3 text-left transition-colors",
                            isCurrent
                              ? "border-green/35 bg-green/8"
                              : isComplete
                                ? "border-border/40 bg-surface2/30 hover:border-green/20"
                                : "border-transparent bg-transparent hover:border-border/35 hover:bg-surface2/25",
                          )}
                        >
                          <span
                            className={cn(
                              "inline-flex size-8 items-center justify-center rounded-full border text-xs font-semibold",
                              isComplete ? "border-green bg-green text-white" : isCurrent ? "border-green text-green" : "border-border/60 text-muted",
                            )}
                          >
                            {isComplete ? <Check className="size-4" /> : index + 1}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-text">{t(step.titleKey)}</p>
                            <p className="text-xs text-secondary">{t(`steps.${step.sectionKey}.short`)}</p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              </div>

              <div className="rounded-[1.5rem] border border-border/45 bg-white/85 p-4">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{t("wizard.persistenceLabel")}</p>
                <div className="mt-3 space-y-2 text-sm text-secondary">
                  <p>{hasUnsavedChanges ? t("wizard.unsaved") : t("wizard.saved")}</p>
                  {currentCaseId ? <p>{t("wizard.draftReady")}</p> : <p>{t("wizard.draftNotCreated")}</p>}
                  <p>{t("wizard.persistenceHint")}</p>
                </div>
              </div>
            </aside>

            <div className="space-y-5">
              {renderStep({
                availabilityDrafts,
                documents,
                draft,
                expandedHelpId,
                helpQuery,
                locale,
                noteDrafts,
                onDeleteDocument: deleteRequirementDocument,
                onExpandHelp: setExpandedHelpId,
                onJumpToStep: jumpToStep,
                onRefreshRequirements: refreshRequirements,
                onSaveAvailability: saveRequirementAvailability,
                onSaveNote: saveRequirementNote,
                onUpload: uploadRequirementFile,
                pendingRequirements,
                progress,
                requirementSection,
                requirements,
                requirementsQuery,
                selectedRequirementSection,
                setAvailabilityDrafts,
                setDraft,
                setNoteDrafts,
                setSelectedRequirementSection,
                stepId: currentStep.id,
                t,
                taxSummaryQuery,
                uploadMutation,
              })}

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.5rem] border border-border/45 bg-white/90 px-4 py-4">
                <div className="flex items-center gap-2 text-sm text-secondary">
                  {isSaving ? <Loader2 className="size-4 animate-spin text-green" /> : <Clock3 className="size-4 text-muted" />}
                  <span>{isSaving ? t("wizard.saving") : hasUnsavedChanges ? t("wizard.readyToSave") : t("wizard.savedCopy")}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  <Button type="button" variant="secondary" onClick={handleBack} disabled={stepIndex === 0 || isSaving}>
                    <ArrowLeft className="size-4" />
                    {t("actions.back")}
                  </Button>
                  {currentStep.id !== "requirements" ? (
                    <Button type="button" onClick={handleNext} disabled={isSaving}>
                      {currentStep.id === "review" ? t("actions.reviewToRequirements") : t("actions.next")}
                      <ArrowRight className="size-4" />
                    </Button>
                  ) : (
                    <Button type="button" onClick={refreshRequirements} disabled={regenerateMutation.isPending}>
                      <RefreshCcw className={cn("size-4", regenerateMutation.isPending && "animate-spin")} />
                      {t("actions.refreshRequirements")}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}

function renderStep({
  availabilityDrafts,
  documents,
  draft,
  expandedHelpId,
  helpQuery,
  locale,
  noteDrafts,
  onDeleteDocument,
  onExpandHelp,
  onJumpToStep,
  onRefreshRequirements,
  onSaveAvailability,
  onSaveNote,
  onUpload,
  pendingRequirements,
  progress,
  requirementSection,
  requirements,
  requirementsQuery,
  selectedRequirementSection,
  setAvailabilityDrafts,
  setDraft,
  setNoteDrafts,
  setSelectedRequirementSection,
  stepId,
  t,
  taxSummaryQuery,
  uploadMutation,
}: {
  availabilityDrafts: Record<string, string>;
  documents: CaseDocument[];
  draft: TaxReturnIntakeDraftValues;
  expandedHelpId: string | null;
  helpQuery: { data: Record<string, unknown> | null | undefined; isLoading: boolean };
  locale: string;
  noteDrafts: Record<string, string>;
  onDeleteDocument: (documentId: string) => Promise<void>;
  onExpandHelp: (requirementId: string | null) => void;
  onJumpToStep: (stepId: WizardStepId) => void;
  onRefreshRequirements: () => Promise<void>;
  onSaveAvailability: (requirementId: string, note: string) => Promise<void>;
  onSaveNote: (requirementId: string, note: string) => Promise<void>;
  onUpload: (requirementId: string, file: File, replacesDocumentId?: string) => Promise<void>;
  pendingRequirements: CaseRequirement[];
  progress: { blockingRemaining: number; completed: number; completionRatio: number; rejected: number; total: number; uploaded: number } | null;
  requirementSection: [string, CaseRequirement[]] | null;
  requirements: CaseRequirement[];
  requirementsQuery: { isLoading: boolean };
  selectedRequirementSection: string | null;
  setAvailabilityDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setDraft: React.Dispatch<React.SetStateAction<TaxReturnIntakeDraftValues>>;
  setNoteDrafts: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  setSelectedRequirementSection: React.Dispatch<React.SetStateAction<string | null>>;
  stepId: WizardStepId;
  t: ReturnType<typeof useTranslations<"DocFlow">>;
  taxSummaryQuery: { data: { box1Income: number; box3Assets: number; credits: number; netResult: number } | undefined };
  uploadMutation: { isPending: boolean; variables?: { replacesDocumentId?: string; requirementId?: string } | null };
}) {
  switch (stepId) {
    case "service":
      return (
        <StepCard eyebrow={t("steps.service.short")} title={t("steps.service.title")} description={t("steps.service.description")}>
          <OptionGrid columns={2}>
            {CASE_TYPES.map((caseType) => (
              <ChoiceCard
                key={caseType}
                title={t(`caseTypes.${caseType}`)}
                description={t(`serviceOptions.${caseType}`)}
                selected={(draft.payload.caseType ?? "tax_return_p") === caseType}
                onClick={() =>
                  setDraft((previous) => ({
                    ...previous,
                    payload: {
                      ...previous.payload,
                      caseType,
                      filing: {
                        ...previous.payload.filing,
                        filingRoute:
                          caseType === "tax_return_m"
                            ? "migration"
                            : caseType === "tax_return_c"
                              ? "non_resident"
                              : caseType === "tax_return_w"
                                ? "self_employed"
                                : "standard",
                      },
                      income: {
                        ...previous.payload.income,
                        hasZzpIncome: caseType === "tax_return_w" ? true : previous.payload.income.hasZzpIncome,
                      },
                    },
                  }))
                }
              />
            ))}
          </OptionGrid>

          <div className="grid gap-4 lg:grid-cols-3">
            <Field label={t("fields.taxYear")}>
              <Select
                value={String(draft.payload.filing.taxYear)}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    payload: {
                      ...previous.payload,
                      filing: { ...previous.payload.filing, taxYear: Number(event.target.value) },
                    },
                  }))
                }
              >
                {getTaxYearOptions().map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t("fields.originCountryCode")} hint={t("hints.countryCode")}>
              <Input
                value={draft.payload.filing.originCountryCode}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    payload: {
                      ...previous.payload,
                      filing: { ...previous.payload.filing, originCountryCode: event.target.value.toUpperCase().slice(0, 2) },
                    },
                  }))
                }
              />
            </Field>
            <Field label={t("fields.currentCountryOfResidence")} hint={t("hints.countryCode")}>
              <Input
                value={draft.payload.filing.currentCountryOfResidence}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    payload: {
                      ...previous.payload,
                      filing: { ...previous.payload.filing, currentCountryOfResidence: event.target.value.toUpperCase().slice(0, 2) },
                    },
                  }))
                }
              />
            </Field>
          </div>

          <InlineNotice>{t("wizard.processExplainer")}</InlineNotice>

          <div className="grid gap-4 lg:grid-cols-2">
            <Field label={t("fields.fullName")}>
              <Input value={draft.fullName} onChange={(event) => setDraft((previous) => ({ ...previous, fullName: event.target.value }))} />
            </Field>
            <Field label={t("fields.bsn")} hint={t("hints.bsn")}>
              <Input value={draft.bsn} onChange={(event) => setDraft((previous) => ({ ...previous, bsn: event.target.value }))} />
            </Field>
          </div>
        </StepCard>
      );
    case "residency":
      return (
        <StepCard eyebrow={t("steps.residency.short")} title={t("steps.residency.title")} description={t("steps.residency.description")}>
          <BinaryChoiceField
            label={t("intake.filing.firstDeclarationWithFinTax")}
            value={draft.payload.filing.firstDeclarationWithFinTax}
            onChange={(value) =>
              setDraft((previous) => ({
                ...previous,
                payload: { ...previous.payload, filing: { ...previous.payload.filing, firstDeclarationWithFinTax: value } },
              }))
            }
            t={t}
          />
          <BinaryChoiceField
            label={t("intake.residency.registeredInNlFullYear")}
            value={draft.payload.residency.registeredInNlFullYear}
            onChange={(value) =>
              setDraft((previous) => ({
                ...previous,
                payload: { ...previous.payload, residency: { ...previous.payload.residency, registeredInNlFullYear: value } },
              }))
            }
            t={t}
          />
          <BinaryChoiceField
            label={t("intake.residency.firstRegistrationInNlInTaxYear")}
            value={draft.payload.residency.firstRegistrationInNlInTaxYear}
            onChange={(value) =>
              setDraft((previous) => ({
                ...previous,
                payload: { ...previous.payload, residency: { ...previous.payload.residency, firstRegistrationInNlInTaxYear: value } },
              }))
            }
            t={t}
          />
          {draft.payload.residency.firstRegistrationInNlInTaxYear ? (
            <Field label={t("intake.residency.firstRegistrationDateInNl")}>
              <Input
                type="date"
                value={draft.payload.residency.firstRegistrationDateInNl ?? ""}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    payload: {
                      ...previous.payload,
                      residency: { ...previous.payload.residency, firstRegistrationDateInNl: event.target.value || null },
                    },
                  }))
                }
              />
            </Field>
          ) : null}
          <BinaryChoiceField
            label={t("intake.residency.hadRegistrationInterruption")}
            value={draft.payload.residency.hadRegistrationInterruption}
            onChange={(value) =>
              setDraft((previous) => ({
                ...previous,
                payload: { ...previous.payload, residency: { ...previous.payload.residency, hadRegistrationInterruption: value } },
              }))
            }
            t={t}
          />
          <BinaryChoiceField
            label={t("intake.residency.emigratedOrDeregistered")}
            value={draft.payload.residency.emigratedOrDeregistered}
            onChange={(value) =>
              setDraft((previous) => ({
                ...previous,
                payload: { ...previous.payload, residency: { ...previous.payload.residency, emigratedOrDeregistered: value } },
              }))
            }
            t={t}
          />
          {draft.payload.residency.emigratedOrDeregistered ? (
            <Field label={t("intake.residency.emigrationOrDeregistrationDate")}>
              <Input
                type="date"
                value={draft.payload.residency.emigrationOrDeregistrationDate ?? ""}
                onChange={(event) =>
                  setDraft((previous) => ({
                    ...previous,
                    payload: {
                      ...previous.payload,
                      residency: { ...previous.payload.residency, emigrationOrDeregistrationDate: event.target.value || null },
                    },
                  }))
                }
              />
            </Field>
          ) : null}
        </StepCard>
      );
    case "family":
      return (
        <StepCard eyebrow={t("steps.family.short")} title={t("steps.family.title")} description={t("steps.family.description")}>
          <BinaryChoiceField
            label={t("intake.household.hasChildrenRegisteredSameAddress")}
            value={draft.payload.household.hasChildrenRegisteredSameAddress}
            onChange={(value) =>
              setDraft((previous) => ({
                ...previous,
                payload: {
                  ...previous.payload,
                  household: {
                    ...previous.payload.household,
                    hasChildrenRegisteredSameAddress: value,
                    childrenCountSameAddress: value ? previous.payload.household.childrenCountSameAddress : 0,
                    childrenRegistrationSameAddressDate: value ? previous.payload.household.childrenRegistrationSameAddressDate : null,
                  },
                },
              }))
            }
            t={t}
          />
          {draft.payload.household.hasChildrenRegisteredSameAddress ? (
            <div className="grid gap-4 lg:grid-cols-2">
              <Field label={t("intake.household.childrenCountSameAddress")}>
                <Input
                  type="number"
                  min="0"
                  value={String(draft.payload.household.childrenCountSameAddress)}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      payload: {
                        ...previous.payload,
                        household: {
                          ...previous.payload.household,
                          childrenCountSameAddress: Number(event.target.value || 0),
                        },
                      },
                    }))
                  }
                />
              </Field>
              <Field label={t("fields.childrenRegistrationDate")}>
                <Input
                  type="date"
                  value={draft.payload.household.childrenRegistrationSameAddressDate ?? ""}
                  onChange={(event) =>
                    setDraft((previous) => ({
                      ...previous,
                      payload: {
                        ...previous.payload,
                        household: {
                          ...previous.payload.household,
                          childrenRegistrationSameAddressDate: event.target.value || null,
                        },
                      },
                    }))
                  }
                />
              </Field>
            </div>
          ) : (
            <InlineNotice>{t("family.emptyHint")}</InlineNotice>
          )}
        </StepCard>
      );
    case "employment":
      return (
        <StepCard eyebrow={t("steps.employment.short")} title={t("steps.employment.title")} description={t("steps.employment.description")}>
          <EmployersField
            employers={draft.payload.income.employers}
            onChange={(employers) =>
              setDraft((previous) => ({
                ...previous,
                payload: { ...previous.payload, income: { ...previous.payload.income, employers } },
              }))
            }
            t={t}
          />
          <BinaryChoiceField
            label={t("intake.income.hasUwvIncome")}
            value={draft.payload.income.hasUwvIncome}
            onChange={(value) =>
              setDraft((previous) => ({
                ...previous,
                payload: { ...previous.payload, income: { ...previous.payload.income, hasUwvIncome: value } },
              }))
            }
            t={t}
          />
          <BinaryChoiceField
            label={t("intake.income.hasTransitievergoeding")}
            value={draft.payload.income.hasTransitievergoeding}
            onChange={(value) =>
              setDraft((previous) => ({
                ...previous,
                payload: { ...previous.payload, income: { ...previous.payload.income, hasTransitievergoeding: value } },
              }))
            }
            t={t}
          />
        </StepCard>
      );
    case "selfEmployment":
      return (
        <StepCard eyebrow={t("steps.selfEmployment.short")} title={t("steps.selfEmployment.title")} description={t("steps.selfEmployment.description")}>
          <BinaryChoiceField
            label={t("intake.income.hasZzpIncome")}
            value={draft.payload.income.hasZzpIncome}
            onChange={(value) =>
              setDraft((previous) => ({
                ...previous,
                payload: {
                  ...previous.payload,
                  income: {
                    ...previous.payload.income,
                    hasZzpIncome: value,
                    zzpHoursOver1225: value ? previous.payload.income.zzpHoursOver1225 : false,
                  },
                },
              }))
            }
            t={t}
          />
          {draft.payload.income.hasZzpIncome ? (
            <BinaryChoiceField
              label={t("intake.income.zzpHoursOver1225")}
              value={draft.payload.income.zzpHoursOver1225}
              onChange={(value) =>
                setDraft((previous) => ({
                  ...previous,
                  payload: { ...previous.payload, income: { ...previous.payload.income, zzpHoursOver1225: value } },
                }))
              }
              t={t}
            />
          ) : (
            <InlineNotice>{t("selfEmployment.emptyHint")}</InlineNotice>
          )}
        </StepCard>
      );
    case "housing":
      return (
        <StepCard eyebrow={t("steps.housing.short")} title={t("steps.housing.title")} description={t("steps.housing.description")}>
          <BinaryChoiceField
            label={t("fields.ownsHome")}
            value={draft.payload.housing.ownsHome}
            onChange={(value) =>
              setDraft((previous) => ({
                ...previous,
                payload: {
                  ...previous.payload,
                  housing: {
                    ...previous.payload.housing,
                    ownsHome: value,
                    hasMortgage: value ? previous.payload.housing.hasMortgage : false,
                    hasSvnOrStarterslening: value ? previous.payload.housing.hasSvnOrStarterslening : false,
                  },
                },
              }))
            }
            t={t}
          />
          {draft.payload.housing.ownsHome ? (
            <>
              <BinaryChoiceField
                label={t("intake.housing.hasMortgage")}
                value={draft.payload.housing.hasMortgage}
                onChange={(value) =>
                  setDraft((previous) => ({
                    ...previous,
                    payload: { ...previous.payload, housing: { ...previous.payload.housing, hasMortgage: value } },
                  }))
                }
                t={t}
              />
              <BinaryChoiceField
                label={t("intake.housing.hasSvnOrStarterslening")}
                value={draft.payload.housing.hasSvnOrStarterslening}
                onChange={(value) =>
                  setDraft((previous) => ({
                    ...previous,
                    payload: { ...previous.payload, housing: { ...previous.payload.housing, hasSvnOrStarterslening: value } },
                  }))
                }
                t={t}
              />
            </>
          ) : null}
          <BinaryChoiceField
            label={t("intake.debts.hasConsumerLoans")}
            value={draft.payload.debts.hasConsumerLoans}
            onChange={(value) =>
              setDraft((previous) => ({
                ...previous,
                payload: { ...previous.payload, debts: { ...previous.payload.debts, hasConsumerLoans: value } },
              }))
            }
            t={t}
          />
        </StepCard>
      );
    case "assets":
      return (
        <StepCard eyebrow={t("steps.assets.short")} title={t("steps.assets.title")} description={t("steps.assets.description")}>
          <BinaryChoiceField
            label={t("fields.hasSavingsOrAssets")}
            value={draft.payload.assets.hasNlBankAccounts}
            onChange={(value) =>
              setDraft((previous) => ({
                ...previous,
                payload: { ...previous.payload, assets: { ...previous.payload.assets, hasNlBankAccounts: value } },
              }))
            }
            t={t}
          />
          <BinaryChoiceField
            label={t("intake.assets.hasForeignBankAccounts")}
            value={draft.payload.assets.hasForeignBankAccounts}
            onChange={(value) =>
              setDraft((previous) => ({
                ...previous,
                payload: { ...previous.payload, assets: { ...previous.payload.assets, hasForeignBankAccounts: value } },
              }))
            }
            t={t}
          />
          <BinaryChoiceField
            label={t("intake.assets.hasCrypto")}
            value={draft.payload.assets.hasCrypto}
            onChange={(value) =>
              setDraft((previous) => ({
                ...previous,
                payload: { ...previous.payload, assets: { ...previous.payload.assets, hasCrypto: value } },
              }))
            }
            t={t}
          />
        </StepCard>
      );
    case "deductions":
      return (
        <StepCard eyebrow={t("steps.deductions.short")} title={t("steps.deductions.title")} description={t("steps.deductions.description")}>
          <BinaryChoiceField
            label={t("intake.deductions.hasUnreimbursedDeductibleMedicalCosts")}
            value={draft.payload.deductions.hasUnreimbursedDeductibleMedicalCosts}
            onChange={(value) =>
              setDraft((previous) => ({
                ...previous,
                payload: {
                  ...previous.payload,
                  deductions: { ...previous.payload.deductions, hasUnreimbursedDeductibleMedicalCosts: value },
                },
              }))
            }
            t={t}
          />
          <InlineNotice>{t("deductions.note")}</InlineNotice>
        </StepCard>
      );
    case "review":
      return (
        <StepCard eyebrow={t("steps.review.short")} title={t("steps.review.title")} description={t("steps.review.description")}>
          <ReviewGroup title={t("steps.service.title")} actionLabel={t("actions.edit")} onClick={() => onJumpToStep("service")}>
            <ReviewItem label={t("fields.service")} value={t(`caseTypes.${draft.payload.caseType ?? "tax_return_p"}`)} />
            <ReviewItem label={t("fields.taxYear")} value={String(draft.payload.filing.taxYear)} />
            <ReviewItem label={t("fields.originCountryCode")} value={draft.payload.filing.originCountryCode} />
          </ReviewGroup>
          <ReviewGroup title={t("steps.residency.title")} actionLabel={t("actions.edit")} onClick={() => onJumpToStep("residency")}>
            <ReviewItem label={t("intake.filing.firstDeclarationWithFinTax")} value={formatBoolean(draft.payload.filing.firstDeclarationWithFinTax, t)} />
            <ReviewItem label={t("intake.residency.registeredInNlFullYear")} value={formatBoolean(draft.payload.residency.registeredInNlFullYear, t)} />
            <ReviewItem label={t("intake.residency.emigratedOrDeregistered")} value={formatBoolean(draft.payload.residency.emigratedOrDeregistered, t)} />
          </ReviewGroup>
          <ReviewGroup title={t("steps.family.title")} actionLabel={t("actions.edit")} onClick={() => onJumpToStep("family")}>
            <ReviewItem
              label={t("intake.household.hasChildrenRegisteredSameAddress")}
              value={formatBoolean(draft.payload.household.hasChildrenRegisteredSameAddress, t)}
            />
            {draft.payload.household.hasChildrenRegisteredSameAddress ? (
              <ReviewItem label={t("intake.household.childrenCountSameAddress")} value={String(draft.payload.household.childrenCountSameAddress)} />
            ) : null}
          </ReviewGroup>
          <ReviewGroup title={t("steps.employment.title")} actionLabel={t("actions.edit")} onClick={() => onJumpToStep("employment")}>
            <ReviewItem
              label={t("intake.income.employers")}
              value={draft.payload.income.employers.length > 0 ? draft.payload.income.employers.map((item) => item.name).join(", ") : t("review.none")}
            />
            <ReviewItem label={t("intake.income.hasUwvIncome")} value={formatBoolean(draft.payload.income.hasUwvIncome, t)} />
          </ReviewGroup>
          <ReviewGroup title={t("steps.selfEmployment.title")} actionLabel={t("actions.edit")} onClick={() => onJumpToStep("selfEmployment")}>
            <ReviewItem label={t("intake.income.hasZzpIncome")} value={formatBoolean(draft.payload.income.hasZzpIncome, t)} />
            <ReviewItem label={t("intake.income.zzpHoursOver1225")} value={formatBoolean(draft.payload.income.zzpHoursOver1225, t)} />
          </ReviewGroup>
          <ReviewGroup title={t("steps.housing.title")} actionLabel={t("actions.edit")} onClick={() => onJumpToStep("housing")}>
            <ReviewItem label={t("fields.ownsHome")} value={formatBoolean(draft.payload.housing.ownsHome, t)} />
            <ReviewItem label={t("intake.housing.hasMortgage")} value={formatBoolean(draft.payload.housing.hasMortgage, t)} />
            <ReviewItem label={t("intake.debts.hasConsumerLoans")} value={formatBoolean(draft.payload.debts.hasConsumerLoans, t)} />
          </ReviewGroup>
          <ReviewGroup title={t("steps.assets.title")} actionLabel={t("actions.edit")} onClick={() => onJumpToStep("assets")}>
            <ReviewItem label={t("fields.hasSavingsOrAssets")} value={formatBoolean(draft.payload.assets.hasNlBankAccounts, t)} />
            <ReviewItem label={t("intake.assets.hasForeignBankAccounts")} value={formatBoolean(draft.payload.assets.hasForeignBankAccounts, t)} />
            <ReviewItem label={t("intake.assets.hasCrypto")} value={formatBoolean(draft.payload.assets.hasCrypto, t)} />
          </ReviewGroup>
          <ReviewGroup title={t("steps.deductions.title")} actionLabel={t("actions.edit")} onClick={() => onJumpToStep("deductions")}>
            <ReviewItem
              label={t("intake.deductions.hasUnreimbursedDeductibleMedicalCosts")}
              value={formatBoolean(draft.payload.deductions.hasUnreimbursedDeductibleMedicalCosts, t)}
            />
          </ReviewGroup>
          <InlineNotice>{t("review.regenerateHint")}</InlineNotice>
        </StepCard>
      );
    case "requirements":
      return (
        <StepCard eyebrow={t("steps.requirements.short")} title={t("steps.requirements.title")} description={t("steps.requirements.description")}>
          <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-3">
                {groupRequirements(requirements).map(([section, items]) => (
                  <button
                    key={section}
                    type="button"
                    onClick={() => setSelectedRequirementSection(section)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition-colors",
                      selectedRequirementSection === section
                        ? "border-green/35 bg-green/10 text-green"
                        : "border-border/45 bg-white text-text hover:border-green/20 hover:bg-green/5",
                    )}
                  >
                    <span>{t(`sections.${section}`)}</span>
                    <span className="rounded-full bg-white/80 px-2 py-0.5 text-xs text-secondary">{items.length}</span>
                  </button>
                ))}
              </div>

              {requirementsQuery.isLoading ? (
                <StackSkeleton />
              ) : requirementSection ? (
                <div className="space-y-4">
                  {requirementSection[1].map((requirement) => (
                    <RequirementCard
                      key={requirement.id}
                      availabilityDraft={availabilityDrafts[requirement.id] ?? requirement.availability_note ?? ""}
                      documents={documents.filter((document) => document.requirement_id === requirement.id)}
                      expanded={expandedHelpId === requirement.id}
                      help={helpQuery.data}
                      helpLoading={helpQuery.isLoading && expandedHelpId === requirement.id}
                      locale={locale}
                      noteDraft={noteDrafts[requirement.id] ?? requirement.customer_note ?? ""}
                      onAvailabilityChange={(value) => setAvailabilityDrafts((previous) => ({ ...previous, [requirement.id]: value }))}
                      onDeleteDocument={onDeleteDocument}
                      onExpandHelp={() => onExpandHelp(expandedHelpId === requirement.id ? null : requirement.id)}
                      onNoteChange={(value) => setNoteDrafts((previous) => ({ ...previous, [requirement.id]: value }))}
                      onSaveAvailability={(note) => onSaveAvailability(requirement.id, note)}
                      onSaveNote={(note) => onSaveNote(requirement.id, note)}
                      onUpload={(file, replacesDocumentId) => onUpload(requirement.id, file, replacesDocumentId)}
                      replacementBusy={Boolean(uploadMutation.isPending && uploadMutation.variables?.requirementId === requirement.id)}
                      requirement={requirement}
                      t={t}
                    />
                  ))}
                </div>
              ) : (
                <EmptyStateBox body={t("requirements.empty")} />
              )}
            </div>

            <aside className="space-y-4">
              <SidebarMetric
                eyebrow={t("sidebar.progressEyebrow")}
                title={t("sidebar.progressTitle")}
                description={t("sidebar.progressDescription")}
              >
                <SummaryLine label={t("sidebar.progressCompletion")} value={`${Math.round(progress?.completionRatio ?? 0)}%`} />
                <SummaryLine label={t("summary.metrics.complete")} value={String(progress?.completed ?? 0)} />
                <SummaryLine label={t("summary.metrics.blocked")} value={String(progress?.blockingRemaining ?? 0)} />
                <SummaryLine label={t("summary.metrics.rejected")} value={String(progress?.rejected ?? 0)} />
              </SidebarMetric>

              <SidebarMetric
                eyebrow={t("sidebar.taxSummaryEyebrow")}
                title={t("sidebar.taxSummaryTitle")}
                description={t("sidebar.taxSummaryDescription")}
              >
                <SummaryLine label={t("sidebar.box1")} value={formatMoney(taxSummaryQuery.data?.box1Income ?? 0, locale)} />
                <SummaryLine label={t("sidebar.box3")} value={formatMoney(taxSummaryQuery.data?.box3Assets ?? 0, locale)} />
                <SummaryLine label={t("sidebar.credits")} value={formatMoney(taxSummaryQuery.data?.credits ?? 0, locale)} />
                <SummaryLine label={t("sidebar.net")} value={formatMoney(taxSummaryQuery.data?.netResult ?? 0, locale)} />
              </SidebarMetric>

              <SidebarMetric
                eyebrow={t("sidebar.pendingEyebrow")}
                title={t("sidebar.pendingTitle")}
                description={t("sidebar.pendingDescription")}
              >
                {pendingRequirements.length === 0 ? (
                  <p className="text-sm text-secondary">{t("sidebar.pendingEmpty")}</p>
                ) : (
                  <ul className="space-y-2">
                    {pendingRequirements.slice(0, 5).map((item) => (
                      <li key={item.id} className="rounded-[1rem] border border-border/35 bg-surface2/20 px-3 py-3">
                        <p className="text-sm font-semibold text-text">{item.title}</p>
                        <p className="mt-1 text-xs text-secondary">{t(`requirementStatus.${item.status}`)}</p>
                      </li>
                    ))}
                  </ul>
                )}
                <Button type="button" variant="secondary" size="sm" className="mt-4" onClick={onRefreshRequirements}>
                  <RefreshCcw className="size-4" />
                  {t("actions.refreshRequirements")}
                </Button>
              </SidebarMetric>
            </aside>
          </div>
        </StepCard>
      );
  }
}

function StepCard({
  children,
  description,
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <section className="space-y-5 rounded-[1.75rem] border border-border/45 bg-white/90 p-5 shadow-[0_18px_48px_rgba(15,23,42,0.05)] sm:p-6">
      <div className="space-y-2">
        <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
        <h2 className="font-heading text-3xl font-semibold tracking-[-0.04em] text-text">{title}</h2>
        <p className="max-w-3xl text-sm leading-7 text-secondary">{description}</p>
      </div>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({ children, hint, label }: { children: React.ReactNode; hint?: string; label: string }) {
  return (
    <label className="space-y-2">
      <span className="flex flex-wrap items-center gap-2 text-sm font-semibold text-text">
        {label}
        {hint ? <span className="text-xs font-medium text-muted">{hint}</span> : null}
      </span>
      {children}
    </label>
  );
}

function InlineNotice({
  children,
  tone = "neutral",
}: {
  children: React.ReactNode;
  tone?: "neutral" | "warning";
}) {
  return (
    <div
      className={cn(
        "rounded-[1.15rem] border px-4 py-3 text-sm leading-6",
        tone === "warning" ? "border-copper/20 bg-copper/8 text-secondary" : "border-green/20 bg-green/5 text-secondary",
      )}
    >
      {children}
    </div>
  );
}

function OptionGrid({ children, columns = 2 }: { children: React.ReactNode; columns?: 2 | 4 }) {
  return <div className={cn("grid gap-3", columns === 4 ? "md:grid-cols-2 xl:grid-cols-4" : "md:grid-cols-2")}>{children}</div>;
}

function ChoiceCard({
  description,
  onClick,
  selected,
  title,
}: {
  description: string;
  onClick: () => void;
  selected: boolean;
  title: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onClick}
      className={cn(
        "rounded-[1.35rem] border p-4 text-left transition-all",
        selected
          ? "border-green/40 bg-[linear-gradient(180deg,rgba(21,128,61,0.12),rgba(255,255,255,0.96))] shadow-[0_18px_34px_rgba(21,128,61,0.12)]"
          : "border-border/45 bg-white hover:border-green/20 hover:bg-green/5",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text">{title}</p>
          <p className="mt-1 text-sm leading-6 text-secondary">{description}</p>
        </div>
        <span
          className={cn(
            "inline-flex size-6 items-center justify-center rounded-full border",
            selected ? "border-green bg-green text-white" : "border-border/60 bg-surface2/40 text-transparent",
          )}
        >
          <Check className="size-4" />
        </span>
      </div>
    </button>
  );
}

function BinaryChoiceField({
  label,
  onChange,
  t,
  value,
}: {
  label: string;
  onChange: (value: boolean) => void;
  t: ReturnType<typeof useTranslations<"DocFlow">>;
  value: boolean;
}) {
  return (
    <div className="rounded-[1.35rem] border border-border/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(246,248,243,0.92))] p-4">
      <p className="text-sm font-semibold text-text">{label}</p>
      <div className="mt-3 grid gap-3 md:grid-cols-2" role="radiogroup" aria-label={label}>
        <ChoiceCard title={t("common.yes")} description={t("common.yesDescription")} selected={value} onClick={() => onChange(true)} />
        <ChoiceCard title={t("common.no")} description={t("common.noDescription")} selected={!value} onClick={() => onChange(false)} />
      </div>
    </div>
  );
}

function ReviewGroup({
  actionLabel,
  children,
  onClick,
  title,
}: {
  actionLabel: string;
  children: React.ReactNode;
  onClick: () => void;
  title: string;
}) {
  return (
    <section className="rounded-[1.35rem] border border-border/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,249,244,0.94))] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-base font-semibold text-text">{title}</p>
        <button type="button" onClick={onClick} className="inline-flex items-center gap-2 text-sm font-semibold text-green transition-colors hover:text-text">
          {actionLabel}
          <ChevronRight className="size-4" />
        </button>
      </div>
      <div className="mt-3 grid gap-2">{children}</div>
    </section>
  );
}

function ReviewItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[1rem] border border-border/35 bg-white/80 px-3 py-3">
      <dt className="text-sm text-secondary">{label}</dt>
      <dd className="text-sm font-semibold text-text">{value}</dd>
    </div>
  );
}

function SidebarMetric({
  children,
  description,
  eyebrow,
  title,
}: {
  children: React.ReactNode;
  description: string;
  eyebrow: string;
  title: string;
}) {
  return (
    <div className="rounded-[1.4rem] border border-border/45 bg-white/85 p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
      <p className="mt-2 text-lg font-semibold text-text">{title}</p>
      <p className="mt-1 text-sm leading-6 text-secondary">{description}</p>
      <div className="mt-4 space-y-2">{children}</div>
    </div>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[1rem] border border-border/35 bg-surface2/20 px-3 py-3">
      <span className="text-sm text-secondary">{label}</span>
      <span className="font-mono text-sm font-semibold text-text">{value}</span>
    </div>
  );
}

function EmployersField({
  employers,
  onChange,
  t,
}: {
  employers: Array<{ id?: string; name: string }>;
  onChange: (value: Array<{ id?: string; name: string }>) => void;
  t: ReturnType<typeof useTranslations<"DocFlow">>;
}) {
  return (
    <div className="rounded-[1.35rem] border border-border/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(246,248,243,0.94))] p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text">{t("intake.income.employers")}</p>
          <p className="mt-1 text-sm leading-6 text-secondary">{t("intake.income.employersHelp")}</p>
        </div>
        <Button type="button" size="sm" variant="secondary" onClick={() => onChange([...employers, { name: "" }])}>
          {t("actions.addEmployer")}
        </Button>
      </div>
      <div className="mt-4 space-y-3">
        {employers.length === 0 ? (
          <p className="text-sm text-secondary">{t("intake.income.noEmployers")}</p>
        ) : (
          employers.map((employer, index) => (
            <div key={`${employer.id ?? "emp"}-${index}`} className="flex flex-col gap-3 sm:flex-row">
              <Input
                value={employer.name}
                placeholder={t("intake.income.employerPlaceholder")}
                onChange={(event) => {
                  const next = employers.slice();
                  next[index] = { ...next[index], name: event.target.value };
                  onChange(next);
                }}
              />
              <Button type="button" variant="secondary" size="sm" onClick={() => onChange(employers.filter((_, itemIndex) => itemIndex !== index))}>
                {t("actions.remove")}
              </Button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RequirementCard({
  availabilityDraft,
  documents,
  expanded,
  help,
  helpLoading,
  locale,
  noteDraft,
  onAvailabilityChange,
  onDeleteDocument,
  onExpandHelp,
  onNoteChange,
  onSaveAvailability,
  onSaveNote,
  onUpload,
  replacementBusy,
  requirement,
  t,
}: {
  availabilityDraft: string;
  documents: CaseDocument[];
  expanded: boolean;
  help: Record<string, unknown> | null | undefined;
  helpLoading: boolean;
  locale: string;
  noteDraft: string;
  onAvailabilityChange: (value: string) => void;
  onDeleteDocument: (documentId: string) => Promise<void>;
  onExpandHelp: () => void;
  onNoteChange: (value: string) => void;
  onSaveAvailability: (note: string) => Promise<void>;
  onSaveNote: (note: string) => Promise<void>;
  onUpload: (file: File, replacesDocumentId?: string) => Promise<void>;
  replacementBusy: boolean;
  requirement: CaseRequirement;
  t: ReturnType<typeof useTranslations<"DocFlow">>;
}) {
  return (
    <article className="rounded-[1.4rem] border border-border/45 bg-white p-4 shadow-[0_14px_32px_rgba(15,23,42,0.04)]">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-text">{requirement.title}</p>
            <Badge variant={requirement.status === "approved" || requirement.status === "waived" ? "success" : requirement.status === "rejected" ? "copper" : "neutral"}>
              {t(`requirementStatus.${requirement.status}`)}
            </Badge>
            {requirement.is_blocking ? <Badge variant="copper">{t("requirements.blocking")}</Badge> : null}
          </div>
          <p className="text-sm leading-6 text-secondary">{requirement.description}</p>
          {requirement.rejection_reason ? <p className="text-sm text-copper">{requirement.rejection_reason}</p> : null}
        </div>
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.15fr)_300px]">
        <div className="space-y-4">
          <div className="rounded-[1.2rem] border border-border/35 bg-surface2/20 p-4">
            <div className="flex items-center gap-2">
              <FileUp className="size-4 text-green" />
              <p className="text-sm font-semibold text-text">{t("uploads.centerTitle")}</p>
            </div>
            {requirement.is_document_required ? (
              <div className="mt-4 space-y-3">
                <label className="flex cursor-pointer items-center justify-between rounded-[1rem] border border-dashed border-border/45 bg-white px-4 py-3 text-sm font-semibold text-text">
                  <span>{t("uploads.selectFile")}</span>
                  <Upload className="size-4 text-green" />
                  <input
                    type="file"
                    className="hidden"
                    accept={requirement.accepted_mime_types.join(",")}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void onUpload(file);
                      event.target.value = "";
                    }}
                  />
                </label>
                {documents.length === 0 ? <p className="text-sm text-secondary">{t("uploads.noneForRequirement")}</p> : null}
                {documents.map((document) => (
                  <div key={document.id} className="rounded-[1rem] border border-border/35 bg-white px-3 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-text">{document.file_name}</p>
                      <Badge variant={document.status === "approved" ? "success" : document.status === "rejected" ? "copper" : "neutral"}>
                        {t(`documentStatus.${document.status}`)}
                      </Badge>
                    </div>
                    <p className="mt-1 text-xs text-secondary">
                      {formatBytes(document.file_size)} · {formatDate(document.created_at, locale)}
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-green/25 px-3 py-2 text-xs font-semibold text-green">
                        <RefreshCcw className="size-3.5" />
                        {t("actions.replace")}
                        <input
                          type="file"
                          className="hidden"
                          accept={requirement.accepted_mime_types.join(",")}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) void onUpload(file, document.id);
                            event.target.value = "";
                          }}
                        />
                      </label>
                      <button
                        type="button"
                        onClick={() => void onDeleteDocument(document.id)}
                        className="inline-flex items-center gap-2 rounded-full border border-border/45 px-3 py-2 text-xs font-semibold text-text transition-colors hover:border-copper/30 hover:bg-copper/8"
                      >
                        <Trash2 className="size-3.5" />
                        {t("actions.delete")}
                      </button>
                    </div>
                  </div>
                ))}
                <p className="text-xs text-muted">{t("uploads.validation", { mimes: requirement.accepted_mime_types.join(", "), max: formatBytes(requirement.max_file_size_bytes) })}</p>
                {replacementBusy ? (
                  <div className="inline-flex items-center gap-2 text-sm text-green">
                    <Loader2 className="size-4 animate-spin" />
                    {t("uploads.uploading")}
                  </div>
                ) : null}
              </div>
            ) : (
              <p className="mt-3 text-sm text-secondary">{t("uploads.answerOnlyRequirement")}</p>
            )}
          </div>

          <div className="grid gap-3 lg:grid-cols-2">
            <div className="rounded-[1.2rem] border border-border/35 bg-surface2/20 p-4">
              <p className="text-sm font-semibold text-text">{t("requirements.customerNote")}</p>
              <Textarea className="mt-3 min-h-[120px]" value={noteDraft} onChange={(event) => onNoteChange(event.target.value)} />
              <Button type="button" size="sm" variant="secondary" className="mt-3" onClick={() => void onSaveNote(noteDraft)} disabled={noteDraft.trim().length === 0}>
                {t("actions.saveNote")}
              </Button>
            </div>
            <div className="rounded-[1.2rem] border border-border/35 bg-surface2/20 p-4">
              <p className="text-sm font-semibold text-text">{t("requirements.notAvailableTitle")}</p>
              <Textarea className="mt-3 min-h-[120px]" value={availabilityDraft} onChange={(event) => onAvailabilityChange(event.target.value)} />
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="mt-3"
                onClick={() => void onSaveAvailability(availabilityDraft)}
                disabled={availabilityDraft.trim().length < 3}
              >
                {t("actions.markNotAvailable")}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            type="button"
            onClick={onExpandHelp}
            className="flex w-full items-center justify-between rounded-[1.2rem] border border-border/35 bg-surface2/20 px-4 py-3 text-left text-sm font-semibold text-text transition-colors hover:border-green/20 hover:bg-green/5"
          >
            <span>{t("requirements.howToGet")}</span>
            <ChevronRight className={cn("size-4 transition-transform", expanded && "rotate-90")} />
          </button>
          {expanded ? (
            <div className="rounded-[1.2rem] border border-border/35 bg-white p-4">
              {helpLoading ? (
                <StackSkeleton />
              ) : help ? (
                <div className="space-y-3 text-sm leading-6 text-secondary">
                  <p className="font-semibold text-text">{String(help.title ?? t("requirements.helpFallbackTitle"))}</p>
                  <p>{String(help.why ?? "")}</p>
                  {Array.isArray(help.minimumContent) ? (
                    <ul className="space-y-1">
                      {(help.minimumContent as unknown[]).map((item) => (
                        <li key={String(item)} className="flex items-start gap-2">
                          <Check className="mt-1 size-3.5 text-green" />
                          <span>{String(item)}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                  {help.whenUnavailable ? (
                    <div className="rounded-[1rem] border border-copper/20 bg-copper/8 px-3 py-3">{String(help.whenUnavailable)}</div>
                  ) : null}
                </div>
              ) : (
                <p className="text-sm text-secondary">{t("requirements.helpUnavailable")}</p>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

function EmptyStateBox({ body }: { body: string }) {
  return (
    <div className="rounded-[1.2rem] border border-dashed border-border/55 bg-surface2/20 px-4 py-5 text-sm text-secondary">
      <div className="flex items-start gap-3">
        <FileQuestion className="mt-0.5 size-4 text-muted" />
        <p>{body}</p>
      </div>
    </div>
  );
}

function StackSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-20 w-full rounded-[1rem]" />
      <Skeleton className="h-20 w-full rounded-[1rem]" />
    </div>
  );
}

function resolveCaseType(value?: string | null): Case["case_type"] {
  if (value === "tax_return_m" || value === "tax_return_c" || value === "tax_return_w" || value === "tax_return_p") return value;
  return "tax_return_p";
}

function inferStepFromCase(caseItem: Case | null) {
  if (!caseItem) return 0;
  if (["pending_documents", "in_review", "pending_authorization", "authorized", "submitted", "completed"].includes(caseItem.status)) {
    return 9;
  }
  return 0;
}

function normalizeDraft(draft: TaxReturnIntakeDraftValues): TaxReturnIntakeDraftValues {
  const ownsHome = draft.payload.housing.ownsHome || draft.payload.housing.hasMortgage || draft.payload.housing.hasSvnOrStarterslening;

  return {
    ...draft,
    fullName: draft.fullName.trim(),
    bsn: draft.bsn.trim(),
    payload: {
      ...draft.payload,
      filing: {
        ...draft.payload.filing,
        originCountryCode: draft.payload.filing.originCountryCode.trim().toUpperCase().slice(0, 2),
        currentCountryOfResidence: draft.payload.filing.currentCountryOfResidence.trim().toUpperCase().slice(0, 2),
      },
      residency: {
        ...draft.payload.residency,
        firstRegistrationDateInNl: draft.payload.residency.firstRegistrationInNlInTaxYear ? draft.payload.residency.firstRegistrationDateInNl : null,
        emigrationOrDeregistrationDate: draft.payload.residency.emigratedOrDeregistered ? draft.payload.residency.emigrationOrDeregistrationDate : null,
      },
      household: {
        ...draft.payload.household,
        childrenCountSameAddress: draft.payload.household.hasChildrenRegisteredSameAddress ? draft.payload.household.childrenCountSameAddress : 0,
        childrenRegistrationSameAddressDate: draft.payload.household.hasChildrenRegisteredSameAddress
          ? draft.payload.household.childrenRegistrationSameAddressDate
          : null,
      },
      income: {
        ...draft.payload.income,
        employers: draft.payload.income.employers.filter((item) => item.name.trim().length > 0),
        zzpHoursOver1225: draft.payload.income.hasZzpIncome ? draft.payload.income.zzpHoursOver1225 : false,
      },
      housing: {
        ...draft.payload.housing,
        ownsHome,
        hasMortgage: ownsHome ? draft.payload.housing.hasMortgage : false,
        hasSvnOrStarterslening: ownsHome ? draft.payload.housing.hasSvnOrStarterslening : false,
      },
    },
  };
}

function validateStep(stepId: WizardStepId, draft: TaxReturnIntakeDraftValues, t: ReturnType<typeof useTranslations<"DocFlow">>) {
  switch (stepId) {
    case "service":
      if (draft.fullName.trim().length < 2) return t("validation.fullName");
      if (draft.bsn.trim().length < 4) return t("validation.bsn");
      if (draft.payload.filing.originCountryCode.trim().length !== 2) return t("validation.originCountryCode");
      return null;
    case "residency":
      if (draft.payload.residency.firstRegistrationInNlInTaxYear && !draft.payload.residency.firstRegistrationDateInNl) {
        return t("validation.firstRegistrationDate");
      }
      if (draft.payload.residency.emigratedOrDeregistered && !draft.payload.residency.emigrationOrDeregistrationDate) {
        return t("validation.emigrationDate");
      }
      return null;
    case "family":
      if (draft.payload.household.hasChildrenRegisteredSameAddress && draft.payload.household.childrenCountSameAddress <= 0) {
        return t("validation.childrenCount");
      }
      return null;
    case "employment":
      if (draft.payload.income.employers.some((item) => item.name.trim().length === 0)) {
        return t("validation.employers");
      }
      return null;
    default:
      return null;
  }
}

function groupRequirements(requirements: CaseRequirement[]) {
  const groups = requirements.reduce<Record<string, CaseRequirement[]>>((accumulator, requirement) => {
    if (requirement.status === "not_applicable") return accumulator;
    const bucket = accumulator[requirement.section] ?? [];
    bucket.push(requirement);
    accumulator[requirement.section] = bucket;
    return accumulator;
  }, {});

  return Object.entries(groups);
}

function createDraftSignature(draft: TaxReturnIntakeDraftValues) {
  return JSON.stringify(normalizeDraft(draft));
}

function getTaxYearOptions() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, index) => currentYear - index);
}

function formatBoolean(value: boolean, t: ReturnType<typeof useTranslations<"DocFlow">>) {
  return value ? t("common.yes") : t("common.no");
}

function formatMoney(value: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function formatDate(value: string, locale: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(parsed);
}

function formatBytes(value?: number | null) {
  if (!value) return "0 KB";
  if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(value / 1024))} KB`;
}

function persistStep(caseId: string, stepIndex: number) {
  try {
    window.localStorage.setItem(`tax-return-wizard-step:${caseId}`, String(stepIndex));
  } catch {}
}

function readStoredStep(caseKey: string) {
  try {
    const raw = window.localStorage.getItem(`tax-return-wizard-step:${caseKey}`);
    const parsed = Number(raw);
    if (Number.isInteger(parsed) && parsed >= 0 && parsed < WIZARD_STEPS.length) return parsed;
  } catch {}
  return null;
}
