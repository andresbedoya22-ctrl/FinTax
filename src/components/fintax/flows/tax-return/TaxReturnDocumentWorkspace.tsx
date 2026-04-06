"use client";

import { ArrowRight, Clock3, FileQuestion, FileUp, Loader2, RefreshCcw, Sparkles, Trash2, Upload } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";

import { Button } from "@/components/fintax/Button";
import { Card, CardBody, CardHeader } from "@/components/fintax/Card";
import { Link } from "@/i18n/navigation";
import { useCase } from "@/hooks/useCase";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { isApiClientError } from "@/hooks/api-client";
import { useTaxSummary } from "@/hooks/useTaxSummary";
import {
  createDefaultIntakeDraftValues,
  mergeIntakeDraftValues,
  useCaseDocuments,
  useCaseEvents,
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
  type CaseDocument,
  type TaxReturnIntakeDraftValues,
} from "@/hooks/useTaxReturnDocFlow";
import { cn } from "@/lib/cn";
import { CASE_STEPPER_STEPS, mapCaseStatusToStep } from "@/domain/cases/status-stepper";
import type { Case, CaseEvent, CaseRequirement } from "@/types/database";
import { Badge, Input, Select, Skeleton, Stepper, Textarea } from "@/components/ui";

type WorkspaceProps = {
  caseId?: string;
  initialService?: string | null;
};

const STAGES = ["selection", "intake", "requirements", "uploads", "timeline", "summary"] as const;
const CASE_TYPES = ["tax_return_p", "tax_return_m", "tax_return_c", "tax_return_w"] as const;

export function TaxReturnDocumentWorkspace({ caseId, initialService }: WorkspaceProps) {
  const t = useTranslations("DocFlow");
  const locale = useLocale();
  const activeCases = useLatestActiveTaxCase(caseId ?? null);
  const currentCaseId = caseId ?? activeCases.selectedCaseId ?? null;
  const caseQuery = useCase(currentCaseId ?? "");
  const profileQuery = useCurrentProfile();
  const caseItem = caseQuery.data ?? null;
  const intakeQuery = useCaseIntake(currentCaseId ?? "");
  const requirementsQuery = useCaseRequirements(currentCaseId ?? "");
  const progressQuery = useCaseProgress(currentCaseId ?? "");
  const documentsQuery = useCaseDocuments(currentCaseId ?? "");
  const eventsQuery = useCaseEvents(currentCaseId ?? "");
  const taxSummaryQuery = useTaxSummary(currentCaseId ?? "");
  const createDraftMutation = useCreateDraftCase();
  const saveIntakeMutation = useSaveCaseIntake(currentCaseId ?? "");
  const regenerateMutation = useRegenerateRequirements(currentCaseId ?? "");
  const uploadMutation = useUploadRequirementDocument(currentCaseId ?? "");
  const deleteDocumentMutation = useDeleteCaseDocument(currentCaseId ?? "");
  const noteMutation = useRequirementNote(currentCaseId ?? "");
  const notAvailableMutation = useRequirementNotAvailable(currentCaseId ?? "");
  const [draft, setDraft] = React.useState<TaxReturnIntakeDraftValues>(() => createDefaultIntakeDraftValues(resolveCaseType(initialService)));
  const [stage, setStage] = React.useState(0);
  const [hydrated, setHydrated] = React.useState(false);
  const [noteDrafts, setNoteDrafts] = React.useState<Record<string, string>>({});
  const [availabilityDrafts, setAvailabilityDrafts] = React.useState<Record<string, string>>({});
  const [expandedHelpId, setExpandedHelpId] = React.useState<string | null>(null);
  const [actionError, setActionError] = React.useState<string | null>(null);
  const helpQuery = useRequirementHelp(currentCaseId ?? "", expandedHelpId ?? "", Boolean(expandedHelpId));

  React.useEffect(() => {
    if (!caseItem) {
      setHydrated(true);
      return;
    }

    setDraft(
      mergeIntakeDraftValues({
        draftValues: createDefaultIntakeDraftValues(caseItem.case_type),
        caseType: caseItem.case_type,
        snapshot: intakeQuery.data,
      }),
    );
    setHydrated(true);
  }, [caseItem, intakeQuery.data]);

  React.useEffect(() => {
    if (caseItem || !profileQuery.profile) return;
    const originCountryCode =
      profileQuery.profile.country_of_origin?.trim().toUpperCase().slice(0, 2) ||
      profileQuery.profile.address_country?.trim().toUpperCase().slice(0, 2) ||
      "NL";

    setDraft((prev) => ({
      ...prev,
      fullName: prev.fullName || profileQuery.profile?.full_name || "",
      payload: {
        ...prev.payload,
        filing: {
          ...prev.payload.filing,
          originCountryCode,
        },
      },
    }));
  }, [caseItem, profileQuery.profile]);

  React.useEffect(() => {
    if (!caseItem || !progressQuery.data) return;
    if (progressQuery.data.total === 0) {
      setStage(1);
      return;
    }
    if (progressQuery.data.rejected > 0 || progressQuery.data.blockingRemaining > 0) {
      setStage(3);
      return;
    }
    if (["submitted", "completed"].includes(caseItem.status)) {
      setStage(5);
      return;
    }
    if (["in_review", "pending_authorization", "authorized", "pending_payment"].includes(caseItem.status)) {
      setStage(4);
      return;
    }
    setStage(2);
  }, [caseItem, progressQuery.data]);

  if (activeCases.isLoading || (currentCaseId ? caseQuery.isLoading : false) || !hydrated) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-40 w-full rounded-[1.5rem]" />
        <Skeleton className="h-[520px] w-full rounded-[1.5rem]" />
      </div>
    );
  }

  if (currentCaseId && caseQuery.isError) {
    const code = isApiClientError(caseQuery.error) ? caseQuery.error.code : "unknown";
    return <div className="rounded-[1.25rem] border border-copper/20 bg-copper/8 px-4 py-4 text-sm text-secondary">{t("errors.caseLoad", { code: String(code) })}</div>;
  }

  const requirements = requirementsQuery.data?.requirements ?? [];
  const progress = progressQuery.data ?? requirementsQuery.data?.progress ?? null;
  const documents = documentsQuery.data ?? [];
  const pendingRequirements = requirements.filter((item) => ["pending", "uploaded", "rejected"].includes(item.status));
  const currentStep = mapCaseStatusToStep(caseItem?.status ?? "draft");

  async function saveIntake() {
    setActionError(null);
    try {
      const nextCaseId =
        currentCaseId ??
        (await createDraftMutation.mutateAsync({
          caseType: draft.payload.caseType ?? resolveCaseType(initialService),
          fullName: draft.fullName,
          bsn: draft.bsn,
          taxYear: draft.payload.filing.taxYear,
          originCountryCode: draft.payload.filing.originCountryCode,
        }));

      if (!currentCaseId) activeCases.setSelectedCaseId(nextCaseId);
      await saveIntakeMutation.mutateAsync({ caseId: nextCaseId, payload: draft.payload });
      setStage(2);
    } catch {
      setActionError(t("errors.saveIntake"));
    }
  }

  return (
    <div className="space-y-6">
      <Card className="overflow-hidden border border-border/45 bg-[linear-gradient(135deg,rgba(249,251,247,0.98),rgba(242,247,241,0.94))] shadow-[0_28px_90px_rgba(15,23,42,0.08)]">
        <CardHeader className="space-y-6 border-b border-border/40 bg-[linear-gradient(180deg,rgba(255,255,255,0.98),rgba(247,249,245,0.96))]">
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_360px]">
            <div className="space-y-4">
              <Badge variant="success" className="w-fit">{t("hero.eyebrow")}</Badge>
              <h1 className="font-heading text-3xl font-semibold tracking-[-0.04em] text-text sm:text-4xl">{t("hero.title")}</h1>
              <p className="max-w-3xl text-sm leading-7 text-secondary">{t("hero.description")}</p>
              <div className="grid gap-3 sm:grid-cols-3">
                {(t.raw("hero.highlights") as string[]).map((item) => (
                  <div key={item} className="rounded-[1.2rem] border border-border/35 bg-white/75 px-4 py-3 text-sm text-secondary">{item}</div>
                ))}
              </div>
            </div>
            <div className="rounded-[1.5rem] border border-border/40 bg-white/80 p-5">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{t("hero.progressEyebrow")}</p>
              <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text">{t(`stages.${STAGES[stage]}.title`)}</p>
              <p className="mt-2 text-sm text-secondary">{t(`stages.${STAGES[stage]}.description`)}</p>
            </div>
          </div>

          {caseItem ? (
            <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_360px]">
              <div className="rounded-[1.4rem] border border-border/35 bg-white/80 p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral">{t(`caseTypes.${caseItem.case_type}`)}</Badge>
                  <Badge variant={caseItem.status === "pending_documents" ? "copper" : caseItem.status === "completed" ? "success" : "neutral"}>
                    {t(`status.${caseItem.status}`)}
                  </Badge>
                </div>
                <h2 className="mt-3 text-2xl font-semibold tracking-[-0.03em] text-text">{caseItem.display_name ?? t("caseMeta.fallbackTitle", { year: caseItem.tax_year ?? draft.payload.filing.taxYear })}</h2>
                <p className="mt-2 text-sm text-secondary">{t("caseMeta.description")}</p>
                <div className="mt-5">
                  <Stepper steps={CASE_STEPPER_STEPS.map((stepItem) => ({ ...stepItem, label: t(`stepper.${stepItem.id}`) }))} currentStep={currentStep} />
                </div>
              </div>
              <div className="rounded-[1.4rem] border border-border/35 bg-white/80 p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{t("caseMeta.progressEyebrow")}</p>
                <p className="mt-2 text-3xl font-semibold tracking-[-0.05em] text-text">{Math.round(progress?.completionRatio ?? 0)}%</p>
                <p className="mt-2 text-sm text-secondary">
                  {t("caseMeta.progressCaption", { complete: progress?.completed ?? 0, total: progress?.total ?? 0, blockers: progress?.blockingRemaining ?? 0 })}
                </p>
              </div>
            </div>
          ) : null}
        </CardHeader>
        <CardBody className="space-y-6">
          {actionError ? <div className="rounded-[1rem] border border-copper/20 bg-copper/8 px-4 py-3 text-sm text-secondary">{actionError}</div> : null}
          <section className="grid gap-5 xl:grid-cols-[minmax(0,1.2fr)_360px]">
            <div className="space-y-5">
              <Card className={cn("border border-border/45 bg-white/90", stage === 0 ? "ring-1 ring-copper/20" : "")}>
                <CardHeader>
                  <SectionHeading eyebrow={t("stages.selection.short")} title={t("selection.title")} description={t("selection.description")} />
                </CardHeader>
                <CardBody className="space-y-5">
                  <div className="grid gap-4 md:grid-cols-2">
                    <FieldCard title={t("selection.caseType")} description={t("selection.caseTypeDescription")}>
                      <Select
                        value={draft.payload.caseType ?? resolveCaseType(initialService)}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            payload: {
                            ...prev.payload,
                              caseType: event.target.value as TaxReturnIntakeDraftValues["payload"]["caseType"],
                            },
                          }))
                        }
                      >
                        {CASE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {t(`caseTypes.${type}`)}
                          </option>
                        ))}
                      </Select>
                    </FieldCard>
                    <FieldCard title={t("selection.taxYear")} description={t("selection.taxYearDescription")}>
                      <Select
                        value={String(draft.payload.filing.taxYear)}
                        onChange={(event) =>
                          setDraft((prev) => ({
                            ...prev,
                            payload: {
                              ...prev.payload,
                              filing: {
                                ...prev.payload.filing,
                                taxYear: Number(event.target.value),
                              },
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
                    </FieldCard>
                  </div>
                  <div className="rounded-[1.2rem] border border-green/20 bg-green/5 px-4 py-4 text-sm text-secondary">{t("selection.explainer")}</div>
                  <div className="flex flex-wrap gap-3">
                    <Button type="button" onClick={() => setStage(1)} rightIcon={<ArrowRight className="size-4" />}>
                      {t("actions.startIntake")}
                    </Button>
                    {caseItem ? (
                      <Link href={`/tax-return/${caseItem.id}`} className="inline-flex h-11 items-center rounded-full border border-border/45 px-4 text-sm font-semibold text-text transition-colors hover:border-green/25 hover:bg-green/5">
                        {t("actions.openCase")}
                      </Link>
                    ) : null}
                  </div>
                </CardBody>
              </Card>

              <Card className={cn("border border-border/45 bg-white/90", stage === 1 ? "ring-1 ring-copper/20" : "")}>
                <CardHeader>
                  <SectionHeading eyebrow={t("stages.intake.short")} title={t("intake.title")} description={t("intake.description")} />
                </CardHeader>
                <CardBody className="space-y-6">
                  {!caseItem ? (
                    <div className="grid gap-4 md:grid-cols-2">
                      <Field label={t("intake.identity.fullName")} value={draft.fullName} onChange={(value) => setDraft((prev) => ({ ...prev, fullName: value }))} />
                      <Field label={t("intake.identity.bsn")} value={draft.bsn} onChange={(value) => setDraft((prev) => ({ ...prev, bsn: value }))} />
                    </div>
                  ) : null}

                  <div className="grid gap-4 md:grid-cols-2">
                    <Field
                      label={t("intake.filing.originCountryCode")}
                      value={draft.payload.filing.originCountryCode}
                      onChange={(value) =>
                        setDraft((prev) => ({
                          ...prev,
                          payload: {
                            ...prev.payload,
                            filing: { ...prev.payload.filing, originCountryCode: value.toUpperCase().slice(0, 2) },
                          },
                        }))
                      }
                    />
                    <Field
                      label={t("intake.filing.currentCountryOfResidence")}
                      value={draft.payload.filing.currentCountryOfResidence}
                      onChange={(value) =>
                        setDraft((prev) => ({
                          ...prev,
                          payload: {
                            ...prev.payload,
                            filing: { ...prev.payload.filing, currentCountryOfResidence: value.toUpperCase().slice(0, 2) },
                          },
                        }))
                      }
                    />
                  </div>

                  <ToggleGrid
                    t={t}
                    items={[
                      {
                        label: t("intake.filing.firstDeclarationWithFinTax"),
                        value: draft.payload.filing.firstDeclarationWithFinTax,
                        onChange: (value) =>
                          setDraft((prev) => ({
                            ...prev,
                            payload: { ...prev.payload, filing: { ...prev.payload.filing, firstDeclarationWithFinTax: value } },
                          })),
                      },
                      {
                        label: t("intake.residency.registeredInNlFullYear"),
                        value: draft.payload.residency.registeredInNlFullYear,
                        onChange: (value) =>
                          setDraft((prev) => ({
                            ...prev,
                            payload: { ...prev.payload, residency: { ...prev.payload.residency, registeredInNlFullYear: value } },
                          })),
                      },
                      {
                        label: t("intake.residency.firstRegistrationInNlInTaxYear"),
                        value: draft.payload.residency.firstRegistrationInNlInTaxYear,
                        onChange: (value) =>
                          setDraft((prev) => ({
                            ...prev,
                            payload: { ...prev.payload, residency: { ...prev.payload.residency, firstRegistrationInNlInTaxYear: value } },
                          })),
                      },
                      {
                        label: t("intake.residency.hadRegistrationInterruption"),
                        value: draft.payload.residency.hadRegistrationInterruption,
                        onChange: (value) =>
                          setDraft((prev) => ({
                            ...prev,
                            payload: { ...prev.payload, residency: { ...prev.payload.residency, hadRegistrationInterruption: value } },
                          })),
                      },
                      {
                        label: t("intake.residency.emigratedOrDeregistered"),
                        value: draft.payload.residency.emigratedOrDeregistered,
                        onChange: (value) =>
                          setDraft((prev) => ({
                            ...prev,
                            payload: { ...prev.payload, residency: { ...prev.payload.residency, emigratedOrDeregistered: value } },
                          })),
                      },
                      {
                        label: t("intake.household.hasChildrenRegisteredSameAddress"),
                        value: draft.payload.household.hasChildrenRegisteredSameAddress,
                        onChange: (value) =>
                          setDraft((prev) => ({
                            ...prev,
                            payload: { ...prev.payload, household: { ...prev.payload.household, hasChildrenRegisteredSameAddress: value } },
                          })),
                      },
                      {
                        label: t("intake.income.hasUwvIncome"),
                        value: draft.payload.income.hasUwvIncome,
                        onChange: (value) =>
                          setDraft((prev) => ({
                            ...prev,
                            payload: { ...prev.payload, income: { ...prev.payload.income, hasUwvIncome: value } },
                          })),
                      },
                      {
                        label: t("intake.income.hasTransitievergoeding"),
                        value: draft.payload.income.hasTransitievergoeding,
                        onChange: (value) =>
                          setDraft((prev) => ({
                            ...prev,
                            payload: { ...prev.payload, income: { ...prev.payload.income, hasTransitievergoeding: value } },
                          })),
                      },
                      {
                        label: t("intake.income.hasZzpIncome"),
                        value: draft.payload.income.hasZzpIncome,
                        onChange: (value) =>
                          setDraft((prev) => ({
                            ...prev,
                            payload: { ...prev.payload, income: { ...prev.payload.income, hasZzpIncome: value } },
                          })),
                      },
                      {
                        label: t("intake.income.zzpHoursOver1225"),
                        value: draft.payload.income.zzpHoursOver1225,
                        onChange: (value) =>
                          setDraft((prev) => ({
                            ...prev,
                            payload: { ...prev.payload, income: { ...prev.payload.income, zzpHoursOver1225: value } },
                          })),
                      },
                      {
                        label: t("intake.housing.hasMortgage"),
                        value: draft.payload.housing.hasMortgage,
                        onChange: (value) =>
                          setDraft((prev) => ({
                            ...prev,
                            payload: { ...prev.payload, housing: { ...prev.payload.housing, hasMortgage: value } },
                          })),
                      },
                      {
                        label: t("intake.housing.hasSvnOrStarterslening"),
                        value: draft.payload.housing.hasSvnOrStarterslening,
                        onChange: (value) =>
                          setDraft((prev) => ({
                            ...prev,
                            payload: { ...prev.payload, housing: { ...prev.payload.housing, hasSvnOrStarterslening: value } },
                          })),
                      },
                      {
                        label: t("intake.assets.hasForeignBankAccounts"),
                        value: draft.payload.assets.hasForeignBankAccounts,
                        onChange: (value) =>
                          setDraft((prev) => ({
                            ...prev,
                            payload: { ...prev.payload, assets: { ...prev.payload.assets, hasForeignBankAccounts: value } },
                          })),
                      },
                      {
                        label: t("intake.assets.hasCrypto"),
                        value: draft.payload.assets.hasCrypto,
                        onChange: (value) =>
                          setDraft((prev) => ({
                            ...prev,
                            payload: { ...prev.payload, assets: { ...prev.payload.assets, hasCrypto: value } },
                          })),
                      },
                      {
                        label: t("intake.debts.hasConsumerLoans"),
                        value: draft.payload.debts.hasConsumerLoans,
                        onChange: (value) =>
                          setDraft((prev) => ({
                            ...prev,
                            payload: { ...prev.payload, debts: { ...prev.payload.debts, hasConsumerLoans: value } },
                          })),
                      },
                      {
                        label: t("intake.deductions.hasUnreimbursedDeductibleMedicalCosts"),
                        value: draft.payload.deductions.hasUnreimbursedDeductibleMedicalCosts,
                        onChange: (value) =>
                          setDraft((prev) => ({
                            ...prev,
                            payload: {
                              ...prev.payload,
                              deductions: { ...prev.payload.deductions, hasUnreimbursedDeductibleMedicalCosts: value },
                            },
                          })),
                      },
                    ]}
                  />

                  <EmployersField
                    employers={draft.payload.income.employers}
                    onChange={(employers) =>
                      setDraft((prev) => ({
                        ...prev,
                        payload: { ...prev.payload, income: { ...prev.payload.income, employers } },
                      }))
                    }
                    t={t}
                  />

                  <div className="grid gap-4 md:grid-cols-3">
                    <DateField
                      label={t("intake.residency.firstRegistrationDateInNl")}
                      value={draft.payload.residency.firstRegistrationDateInNl ?? ""}
                      onChange={(value) =>
                        setDraft((prev) => ({
                          ...prev,
                          payload: { ...prev.payload, residency: { ...prev.payload.residency, firstRegistrationDateInNl: value || null } },
                        }))
                      }
                    />
                    <DateField
                      label={t("intake.residency.emigrationOrDeregistrationDate")}
                      value={draft.payload.residency.emigrationOrDeregistrationDate ?? ""}
                      onChange={(value) =>
                        setDraft((prev) => ({
                          ...prev,
                          payload: { ...prev.payload, residency: { ...prev.payload.residency, emigrationOrDeregistrationDate: value || null } },
                        }))
                      }
                    />
                    <NumberField
                      label={t("intake.household.childrenCountSameAddress")}
                      value={draft.payload.household.childrenCountSameAddress}
                      onChange={(value) =>
                        setDraft((prev) => ({
                          ...prev,
                          payload: { ...prev.payload, household: { ...prev.payload.household, childrenCountSameAddress: value } },
                        }))
                      }
                    />
                  </div>

                  <div className="grid gap-4 md:grid-cols-4">
                    <NumberField
                      label={t("intake.summary.box1Income")}
                      value={draft.payload.summary.box1Income}
                      onChange={(value) => setDraft((prev) => ({ ...prev, payload: { ...prev.payload, summary: { ...prev.payload.summary, box1Income: value } } }))}
                    />
                    <NumberField
                      label={t("intake.summary.box3Assets")}
                      value={draft.payload.summary.box3Assets}
                      onChange={(value) => setDraft((prev) => ({ ...prev, payload: { ...prev.payload, summary: { ...prev.payload.summary, box3Assets: value } } }))}
                    />
                    <NumberField
                      label={t("intake.summary.credits")}
                      value={draft.payload.summary.credits}
                      onChange={(value) => setDraft((prev) => ({ ...prev, payload: { ...prev.payload, summary: { ...prev.payload.summary, credits: value } } }))}
                    />
                    <NumberField
                      label={t("intake.summary.netResult")}
                      value={draft.payload.summary.netResult}
                      onChange={(value) => setDraft((prev) => ({ ...prev, payload: { ...prev.payload, summary: { ...prev.payload.summary, netResult: value } } }))}
                    />
                  </div>

                  <div className="flex flex-wrap gap-3">
                    <Button type="button" onClick={() => void saveIntake()} loading={createDraftMutation.isPending || saveIntakeMutation.isPending} rightIcon={<Sparkles className="size-4" />}>
                      {t("actions.generateRequirements")}
                    </Button>
                    {caseItem ? (
                      <Button type="button" variant="secondary" onClick={() => void regenerateMutation.mutateAsync()} loading={regenerateMutation.isPending} rightIcon={<RefreshCcw className="size-4" />}>
                        {t("actions.refreshRequirements")}
                      </Button>
                    ) : null}
                  </div>
                </CardBody>
              </Card>

              <Card className={cn("border border-border/45 bg-white/90", stage === 2 ? "ring-1 ring-copper/20" : "")}>
                <CardHeader>
                  <SectionHeading eyebrow={t("stages.requirements.short")} title={t("requirements.title")} description={t("requirements.description")} />
                </CardHeader>
                <CardBody>
                  {!currentCaseId ? (
                    <EmptyBox body={t("requirements.emptyBeforeSave")} />
                  ) : requirementsQuery.isLoading ? (
                    <StackSkeleton />
                  ) : requirements.length === 0 ? (
                    <EmptyBox body={t("requirements.empty")} />
                  ) : (
                    <div className="space-y-4">
                      {groupRequirements(requirements).map(([section, items]) => (
                        <div key={section} className="rounded-[1.25rem] border border-border/35 bg-surface2/20 p-4">
                          <div className="mb-4 flex items-center justify-between gap-3">
                            <h3 className="text-lg font-semibold tracking-[-0.02em] text-text">{t(`sections.${section}`)}</h3>
                            <Badge variant="neutral">{items.length}</Badge>
                          </div>
                          <div className="space-y-3">
                            {items.map((requirement) => (
                              <RequirementRow
                                availabilityDraft={availabilityDrafts[requirement.id] ?? requirement.availability_note ?? ""}
                                documents={documents.filter((document) => document.requirement_id === requirement.id)}
                                expanded={expandedHelpId === requirement.id}
                                help={expandedHelpId === requirement.id ? helpQuery.data : null}
                                helpLoading={expandedHelpId === requirement.id && helpQuery.isLoading}
                                key={requirement.id}
                                locale={locale}
                                noteDraft={noteDrafts[requirement.id] ?? requirement.customer_note ?? ""}
                                onAvailabilityChange={(value) => setAvailabilityDrafts((prev) => ({ ...prev, [requirement.id]: value }))}
                                onDeleteDocument={(documentId) => void deleteDocumentMutation.mutateAsync({ documentId })}
                                onExpandHelp={() => setExpandedHelpId((prev) => (prev === requirement.id ? null : requirement.id))}
                                onNoteChange={(value) => setNoteDrafts((prev) => ({ ...prev, [requirement.id]: value }))}
                                onSaveAvailability={(note) => void notAvailableMutation.mutateAsync({ requirementId: requirement.id, note })}
                                onSaveNote={(note) => void noteMutation.mutateAsync({ requirementId: requirement.id, note })}
                                onUpload={(file, replacesDocumentId) => void uploadMutation.mutateAsync({ requirementId: requirement.id, file, replacesDocumentId })}
                                replacementBusy={uploadMutation.isPending && uploadMutation.variables?.requirementId === requirement.id}
                                requirement={requirement}
                                t={t}
                              />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>

              <Card className={cn("border border-border/45 bg-white/90", stage === 3 ? "ring-1 ring-copper/20" : "")}>
                <CardHeader>
                  <SectionHeading eyebrow={t("stages.uploads.short")} title={t("uploads.title")} description={t("uploads.description")} />
                </CardHeader>
                <CardBody>
                  {!currentCaseId ? (
                    <EmptyBox body={t("uploads.emptyBeforeSave")} />
                  ) : documentsQuery.isLoading ? (
                    <StackSkeleton />
                  ) : documents.length === 0 ? (
                    <EmptyBox body={t("uploads.empty")} />
                  ) : (
                    <div className="space-y-3">
                      {documents.map((document) => (
                        <div key={document.id} className="rounded-[1.15rem] border border-border/35 bg-surface2/20 px-4 py-4">
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <div>
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-text">{document.file_name}</p>
                                <Badge variant={document.status === "approved" ? "success" : document.status === "rejected" ? "copper" : "neutral"}>{t(`documentStatus.${document.status}`)}</Badge>
                              </div>
                              <p className="mt-1 text-xs text-secondary">{formatBytes(document.file_size)} · {document.mime_type ?? "application/octet-stream"}</p>
                              {document.review_notes ? <p className="mt-2 text-sm text-copper">{document.review_notes}</p> : null}
                            </div>
                            <button type="button" onClick={() => void deleteDocumentMutation.mutateAsync({ documentId: document.id })} className="inline-flex h-10 items-center rounded-full border border-border/45 px-4 text-sm font-semibold text-text transition-colors hover:border-copper/25 hover:bg-copper/5">
                              <Trash2 className="mr-2 size-4" />
                              {t("actions.delete")}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardBody>
              </Card>

              <Card className={cn("border border-border/45 bg-white/90", stage === 4 ? "ring-1 ring-copper/20" : "")}>
                <CardHeader>
                  <SectionHeading eyebrow={t("stages.timeline.short")} title={t("timeline.title")} description={t("timeline.description")} />
                </CardHeader>
                <CardBody>
                  {!currentCaseId ? (
                    <EmptyBox body={t("timeline.emptyBeforeSave")} />
                  ) : eventsQuery.isLoading ? (
                    <StackSkeleton />
                  ) : (eventsQuery.data ?? []).length === 0 ? (
                    <EmptyBox body={t("timeline.empty")} />
                  ) : (
                    <ul className="space-y-3">
                      {(eventsQuery.data ?? []).map((event) => (
                        <li key={event.id} className="rounded-[1.15rem] border border-border/35 bg-surface2/20 px-4 py-4">
                          <div className="flex gap-3">
                            <Clock3 className="mt-0.5 size-4 text-copper" />
                            <div>
                              <p className="text-sm font-semibold text-text">{formatEventTitle(event, t)}</p>
                              <p className="mt-1 text-sm text-secondary">{formatEventBody(event, t)}</p>
                              <p className="mt-2 text-xs text-muted">{formatDate(event.created_at, locale)}</p>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardBody>
              </Card>

              <Card className={cn("border border-border/45 bg-white/90", stage === 5 ? "ring-1 ring-copper/20" : "")}>
                <CardHeader>
                  <SectionHeading eyebrow={t("stages.summary.short")} title={t("summary.title")} description={t("summary.description")} />
                </CardHeader>
                <CardBody>
                  {!currentCaseId ? (
                    <EmptyBox body={t("summary.emptyBeforeSave")} />
                  ) : (
                    <div className="grid gap-4 md:grid-cols-2">
                      <SummaryTile label={t("summary.metrics.complete")} value={String(requirements.filter((item) => ["approved", "waived"].includes(item.status)).length)} />
                      <SummaryTile label={t("summary.metrics.partial")} value={String(requirements.filter((item) => ["pending", "uploaded"].includes(item.status)).length)} />
                      <SummaryTile label={t("summary.metrics.blocked")} value={String(progress?.blockingRemaining ?? 0)} />
                      <SummaryTile label={t("summary.metrics.rejected")} value={String(progress?.rejected ?? 0)} />
                    </div>
                  )}
                </CardBody>
              </Card>
            </div>
            <aside className="space-y-5">
              <Card className="border border-border/45 bg-white/90">
                <CardHeader>
                  <SectionHeading eyebrow={t("sidebar.progressEyebrow")} title={t("sidebar.progressTitle")} description={t("sidebar.progressDescription")} />
                </CardHeader>
                <CardBody className="space-y-3">
                  <LineItem label={t("sidebar.progressCompletion")} value={`${Math.round(progress?.completionRatio ?? 0)}%`} />
                  <LineItem label={t("sidebar.pendingUploads")} value={String(progress?.uploaded ?? 0)} />
                  <LineItem label={t("sidebar.pendingReview")} value={String(progress?.pending ?? 0)} />
                  <LineItem label={t("sidebar.rejected")} value={String(progress?.rejected ?? 0)} />
                </CardBody>
              </Card>

              <Card className="border border-border/45 bg-white/90">
                <CardHeader>
                  <SectionHeading eyebrow={t("sidebar.taxSummaryEyebrow")} title={t("sidebar.taxSummaryTitle")} description={t("sidebar.taxSummaryDescription")} />
                </CardHeader>
                <CardBody className="space-y-3">
                  <LineItem label={t("sidebar.box1")} value={formatMoney(taxSummaryQuery.data?.box1Income ?? 0, locale)} />
                  <LineItem label={t("sidebar.box3")} value={formatMoney(taxSummaryQuery.data?.box3Assets ?? 0, locale)} />
                  <LineItem label={t("sidebar.credits")} value={formatMoney(taxSummaryQuery.data?.credits ?? 0, locale)} />
                  <LineItem label={t("sidebar.net")} value={formatMoney(taxSummaryQuery.data?.netResult ?? 0, locale)} />
                </CardBody>
              </Card>

              <Card className="border border-border/45 bg-white/90">
                <CardHeader>
                  <SectionHeading eyebrow={t("sidebar.pendingEyebrow")} title={t("sidebar.pendingTitle")} description={t("sidebar.pendingDescription")} />
                </CardHeader>
                <CardBody>
                  {pendingRequirements.length === 0 ? (
                    <p className="text-sm text-secondary">{t("sidebar.pendingEmpty")}</p>
                  ) : (
                    <ul className="space-y-2">
                      {pendingRequirements.slice(0, 8).map((item) => (
                        <li key={item.id} className="rounded-[1rem] border border-border/35 bg-surface2/20 px-3 py-3">
                          <p className="text-sm font-semibold text-text">{item.title}</p>
                          <p className="mt-1 text-xs text-secondary">{t(`requirementStatus.${item.status}`)}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardBody>
              </Card>
            </aside>
          </section>
        </CardBody>
      </Card>
    </div>
  );
}

function resolveCaseType(value?: string | null): Case["case_type"] {
  if (value === "tax_return_m" || value === "tax_return_c" || value === "tax_return_w" || value === "tax_return_p") return value;
  return "tax_return_p";
}

function getTaxYearOptions() {
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 6 }, (_, index) => currentYear - index);
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

function SectionHeading({ description, eyebrow, title }: { description: string; eyebrow: string; title: string }) {
  return (
    <div className="space-y-2">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{eyebrow}</p>
      <h2 className="text-2xl font-semibold tracking-[-0.04em] text-text">{title}</h2>
      <p className="text-sm leading-6 text-secondary">{description}</p>
    </div>
  );
}

function FieldCard({ children, description, title }: { children: React.ReactNode; description: string; title: string }) {
  return (
    <div className="rounded-[1.2rem] border border-border/35 bg-white/80 p-4">
      <p className="text-sm font-semibold text-text">{title}</p>
      <p className="mt-1 text-sm text-secondary">{description}</p>
      <div className="mt-3">{children}</div>
    </div>
  );
}

function Field({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-text">{label}</span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function NumberField({ label, onChange, value }: { label: string; onChange: (value: number) => void; value: number }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-text">{label}</span>
      <Input type="number" value={String(value)} onChange={(event) => onChange(Number(event.target.value || 0))} />
    </label>
  );
}

function DateField({ label, onChange, value }: { label: string; onChange: (value: string) => void; value: string }) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-medium text-text">{label}</span>
      <Input type="date" value={value} onChange={(event) => onChange(event.target.value)} />
    </label>
  );
}

function ToggleGrid({
  items,
  t,
}: {
  items: Array<{ label: string; onChange: (value: boolean) => void; value: boolean }>;
  t: ReturnType<typeof useTranslations<"DocFlow">>;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="rounded-[1.1rem] border border-border/35 bg-surface2/20 p-4">
          <p className="text-sm font-medium text-text">{item.label}</p>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={() => item.onChange(true)}
              className={cn(
                "inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition-colors",
                item.value ? "border-green/30 bg-green/10 text-green" : "border-border/45 bg-white text-secondary",
              )}
            >
              {t("common.yes")}
            </button>
            <button
              type="button"
              onClick={() => item.onChange(false)}
              className={cn(
                "inline-flex h-10 items-center rounded-full border px-4 text-sm font-semibold transition-colors",
                !item.value ? "border-green/30 bg-green/10 text-green" : "border-border/45 bg-white text-secondary",
              )}
            >
              {t("common.no")}
            </button>
          </div>
        </div>
      ))}
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
    <div className="rounded-[1.2rem] border border-border/35 bg-surface2/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text">{t("intake.income.employers")}</p>
          <p className="mt-1 text-sm text-secondary">{t("intake.income.employersHelp")}</p>
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
            <div key={`${employer.id ?? "emp"}-${index}`} className="flex gap-3">
              <Input
                value={employer.name}
                placeholder={t("intake.income.employerPlaceholder")}
                onChange={(event) => {
                  const next = employers.slice();
                  next[index] = { ...next[index], name: event.target.value };
                  onChange(next);
                }}
              />
              <button
                type="button"
                onClick={() => onChange(employers.filter((_, itemIndex) => itemIndex !== index))}
                className="inline-flex h-11 items-center rounded-full border border-border/45 px-4 text-sm font-semibold text-text"
              >
                {t("actions.remove")}
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function RequirementRow({
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
  onDeleteDocument: (documentId: string) => void;
  onExpandHelp: () => void;
  onNoteChange: (value: string) => void;
  onSaveAvailability: (note: string) => void;
  onSaveNote: (note: string) => void;
  onUpload: (file: File, replacesDocumentId?: string) => void;
  replacementBusy: boolean;
  requirement: CaseRequirement;
  t: ReturnType<typeof useTranslations<"DocFlow">>;
}) {
  return (
    <article className="rounded-[1.15rem] border border-border/35 bg-white p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-sm font-semibold text-text">{requirement.title}</p>
            <Badge variant={requirement.status === "approved" || requirement.status === "waived" ? "success" : requirement.status === "rejected" ? "copper" : "neutral"}>
              {t(`requirementStatus.${requirement.status}`)}
            </Badge>
            <Badge variant="neutral">{t(`requirementTypes.${requirement.requirement_type}`)}</Badge>
          </div>
          <p className="mt-2 text-sm text-secondary">{requirement.description}</p>
          {requirement.rejection_reason ? <p className="mt-2 text-sm text-copper">{requirement.rejection_reason}</p> : null}
        </div>
        {requirement.is_blocking ? <Badge variant="copper">{t("requirements.blocking")}</Badge> : null}
      </div>

      <div className="mt-4 grid gap-4 xl:grid-cols-[minmax(0,1.1fr)_320px]">
        <div className="space-y-3">
          <div className="rounded-[1rem] border border-border/35 bg-surface2/20 p-4">
            <div className="mb-3 flex items-center gap-2">
              <FileUp className="size-4 text-green" />
              <p className="text-sm font-semibold text-text">{t("uploads.centerTitle")}</p>
            </div>
            {requirement.is_document_required ? (
              <div className="space-y-3">
                <label className="flex cursor-pointer items-center justify-between rounded-[1rem] border border-dashed border-border/45 bg-white px-4 py-3 text-sm font-semibold text-text">
                  <span>{t("uploads.selectFile")}</span>
                  <Upload className="size-4 text-green" />
                  <input
                    type="file"
                    className="hidden"
                    accept={requirement.accepted_mime_types.join(",")}
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) onUpload(file);
                      event.target.value = "";
                    }}
                  />
                </label>
                {documents.length === 0 ? <p className="text-sm text-secondary">{t("uploads.noneForRequirement")}</p> : null}
                {documents.map((document) => (
                  <div key={document.id} className="rounded-[1rem] border border-border/35 bg-white px-3 py-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-text">{document.file_name}</p>
                      <Badge variant={document.status === "approved" ? "success" : document.status === "rejected" ? "copper" : "neutral"}>{t(`documentStatus.${document.status}`)}</Badge>
                    </div>
                    <p className="mt-1 text-xs text-secondary">{formatBytes(document.file_size)} · {formatDate(document.created_at, locale)}</p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <label className="inline-flex cursor-pointer items-center rounded-full border border-green/25 px-3 py-2 text-xs font-semibold text-green">
                        {t("actions.replace")}
                        <input
                          type="file"
                          className="hidden"
                          accept={requirement.accepted_mime_types.join(",")}
                          onChange={(event) => {
                            const file = event.target.files?.[0];
                            if (file) onUpload(file, document.id);
                            event.target.value = "";
                          }}
                        />
                      </label>
                      <button type="button" onClick={() => onDeleteDocument(document.id)} className="inline-flex items-center rounded-full border border-border/45 px-3 py-2 text-xs font-semibold text-text">
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
              <p className="text-sm text-secondary">{t("uploads.answerOnlyRequirement")}</p>
            )}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[1rem] border border-border/35 bg-surface2/20 p-4">
              <p className="text-sm font-semibold text-text">{t("requirements.customerNote")}</p>
              <Textarea className="mt-3 min-h-[110px]" value={noteDraft} onChange={(event) => onNoteChange(event.target.value)} />
              <Button type="button" className="mt-3" size="sm" variant="secondary" onClick={() => onSaveNote(noteDraft)} disabled={noteDraft.trim().length === 0}>
                {t("actions.saveNote")}
              </Button>
            </div>
            <div className="rounded-[1rem] border border-border/35 bg-surface2/20 p-4">
              <p className="text-sm font-semibold text-text">{t("requirements.notAvailableTitle")}</p>
              <Textarea className="mt-3 min-h-[110px]" value={availabilityDraft} onChange={(event) => onAvailabilityChange(event.target.value)} />
              <Button type="button" className="mt-3" size="sm" variant="secondary" onClick={() => onSaveAvailability(availabilityDraft)} disabled={availabilityDraft.trim().length < 3}>
                {t("actions.markNotAvailable")}
              </Button>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button type="button" onClick={onExpandHelp} className="flex w-full items-center justify-between rounded-[1rem] border border-border/35 bg-surface2/20 px-4 py-3 text-left text-sm font-semibold text-text">
            <span>{t("requirements.howToGet")}</span>
            <ArrowRight className={cn("size-4 transition-transform", expanded && "rotate-90")} />
          </button>
          {expanded ? (
            <div className="rounded-[1rem] border border-border/35 bg-white p-4">
              {helpLoading ? (
                <StackSkeleton />
              ) : help ? (
                <div className="space-y-3 text-sm text-secondary">
                  <p className="font-semibold text-text">{String(help.title ?? t("requirements.helpFallbackTitle"))}</p>
                  <p>{String(help.why ?? "")}</p>
                  {Array.isArray(help.minimumContent) ? (
                    <ul className="space-y-1">
                      {(help.minimumContent as unknown[]).map((item) => (
                        <li key={String(item)}>{String(item)}</li>
                      ))}
                    </ul>
                  ) : null}
                  <div className="rounded-[0.9rem] border border-copper/20 bg-copper/8 px-3 py-3 text-secondary">{String(help.whenUnavailable ?? "")}</div>
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

function EmptyBox({ body }: { body: string }) {
  return (
    <div className="rounded-[1.2rem] border border-dashed border-border/50 bg-surface2/20 px-4 py-5 text-sm text-secondary">
      <div className="flex items-start gap-3">
        <FileQuestion className="mt-0.5 size-4 text-muted" />
        <p>{body}</p>
      </div>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.1rem] border border-border/35 bg-surface2/20 px-4 py-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-text">{value}</p>
    </div>
  );
}

function LineItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-[1rem] border border-border/35 bg-surface2/20 px-3 py-3">
      <dt className="text-sm text-secondary">{label}</dt>
      <dd className="font-mono text-sm font-semibold text-text">{value}</dd>
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

function formatDate(value: string, locale: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit" }).format(parsed);
}

function formatMoney(value: number, locale: string) {
  return new Intl.NumberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(value);
}

function formatBytes(value?: number | null) {
  if (!value) return "0 KB";
  if (value >= 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(value / 1024))} KB`;
}

function formatEventTitle(event: CaseEvent, t: ReturnType<typeof useTranslations<"DocFlow">>) {
  return t(`timeline.eventTypes.${event.event_type}.title`);
}

function formatEventBody(event: CaseEvent, t: ReturnType<typeof useTranslations<"DocFlow">>) {
  const payload = event.payload ?? {};
  const fileName = typeof payload.fileName === "string" ? payload.fileName : t("timeline.fallbackFile");
  const count = typeof payload.requirementsTotal === "number" ? payload.requirementsTotal : 0;
  const status = typeof payload.status === "string" ? payload.status : t("timeline.fallbackStatus");

  switch (event.event_type) {
    case "requirements_regenerated":
      return t("timeline.eventTypes.requirements_regenerated.body", { count });
    case "document_upload_session_issued":
    case "document_uploaded":
    case "document_deleted":
      return t(`timeline.eventTypes.${event.event_type}.body`, { fileName });
    case "document_reviewed":
    case "requirement_reviewed":
      return t(`timeline.eventTypes.${event.event_type}.body`, { status });
    default:
      return t(`timeline.eventTypes.${event.event_type}.body`);
  }
}
