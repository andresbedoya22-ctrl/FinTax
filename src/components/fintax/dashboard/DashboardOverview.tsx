"use client";

import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, Circle, Clock3, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { isApiClientError } from "@/hooks/api-client";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { useCases } from "@/hooks/useCases";
import { useNotifications } from "@/hooks/useNotifications";
import { useCaseEvents, useCaseProgress, useCaseRequirements } from "@/hooks/useTaxReturnDocFlow";
import { useTaxSummary } from "@/hooks/useTaxSummary";
import { cn } from "@/lib/cn";
import { CASE_STEPPER_STEPS, mapCaseStatusToStep } from "@/domain/cases/status-stepper";
import type { Case, CaseType } from "@/types/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { PageHeader, StatusBadge } from "@/components/fintax/ui";
import { DeclarationHeader } from "@/components/fintax/dashboard/DeclarationHeader";
import { HorizontalStepper } from "@/components/fintax/dashboard/HorizontalStepper";

type TimelineMilestone = {
  date: string;
  label: string;
};

function formatDate(value: string | null | undefined, locale: string, fallbackLabel: string) {
  if (!value) return fallbackLabel;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "2-digit" }).format(parsed);
}

function formatMoney(value: number, locale: string) {
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

function isTaxCase(caseType: CaseType) {
  return caseType.startsWith("tax_return") || caseType === "btw_declaration";
}

function getCaseHref(caseItem: Case | null) {
  if (!caseItem) return "/tax-return";
  return isTaxCase(caseItem.case_type) ? `/tax-return/${caseItem.id}` : `/benefits/${caseItem.id}`;
}

function getDeclarationTypeLabel(caseType: CaseType, t: ReturnType<typeof useTranslations<"Dashboard.overview">>) {
  switch (caseType) {
    case "tax_return_m":
      return t("history.types.formM");
    case "tax_return_c":
      return t("history.types.formC");
    case "tax_return_w":
      return t("history.types.zzp");
    case "btw_declaration":
      return t("history.types.vat");
    case "zorgtoeslag":
      return t("history.types.healthcare");
    case "huurtoeslag":
      return t("history.types.rent");
    case "kindgebonden_budget":
      return t("history.types.childBudget");
    case "kinderopvangtoeslag":
      return t("history.types.childcare");
    default:
      return t("history.types.formP");
  }
}

function getStatusLabel(status: string, t: ReturnType<typeof useTranslations<"Dashboard.overview">>) {
  switch (status) {
    case "pending_documents":
      return t("status.pendingDocuments");
    case "in_review":
      return t("status.inReview");
    case "pending_payment":
      return t("status.pendingPayment");
    case "pending_authorization":
      return t("status.pendingAuthorization");
    case "authorized":
      return t("status.authorized");
    case "submitted":
      return t("status.submitted");
    case "completed":
      return t("status.completed");
    case "rejected":
      return t("status.rejected");
    default:
      return t("status.draft");
  }
}

function getStatusTone(status: string) {
  if (status === "completed" || status === "submitted" || status === "authorized") return "success" as const;
  if (status === "pending_documents" || status === "pending_payment" || status === "rejected") return "warning" as const;
  return "neutral" as const;
}

function isDeadlineNear(deadline: string | null | undefined) {
  if (!deadline) return false;
  const parsed = new Date(deadline);
  if (Number.isNaN(parsed.getTime())) return false;
  const now = new Date();
  const diff = parsed.getTime() - now.getTime();
  return diff >= 0 && diff <= 1000 * 60 * 60 * 24 * 30;
}

export function DashboardOverview() {
  const t = useTranslations("Dashboard.overview");
  const locale = useLocale();
  const noDateLabel = t("header.noDate");
  const profileQuery = useCurrentProfile();
  const canLoadDashboardData = !profileQuery.loading && Boolean(profileQuery.profile);
  const casesQuery = useCases(canLoadDashboardData);
  const cases = casesQuery.data ?? [];
  const activeCase = cases[0] ?? null;
  const hasActiveCase = activeCase !== null;
  const requirementsQuery = useCaseRequirements(activeCase?.id ?? "", canLoadDashboardData && hasActiveCase);
  const progressQuery = useCaseProgress(activeCase?.id ?? "", canLoadDashboardData && hasActiveCase);
  const eventsQuery = useCaseEvents(activeCase?.id ?? "", canLoadDashboardData && hasActiveCase);
  const notificationsQuery = useNotifications(6, canLoadDashboardData && hasActiveCase && !eventsQuery.data?.length);
  const taxSummaryQuery = useTaxSummary(activeCase?.id ?? "", canLoadDashboardData && hasActiveCase);
  const requirements = requirementsQuery.data?.requirements ?? [];
  const progress = progressQuery.data ?? requirementsQuery.data?.progress ?? null;
  const checklistItems = requirements.filter((item) => item.status !== "not_applicable").map((item) => ({ label: item.title, done: ["approved", "waived"].includes(item.status) }));
  const uploadedDocuments = progress?.uploaded ?? 0;
  const requiredDocuments = progress?.total ?? 0;
  const documentProgress = Math.round(progress?.completionRatio ?? 0);
  const currentStep = mapCaseStatusToStep(activeCase?.status ?? "draft");
  const taxYear = activeCase?.tax_year ?? new Date().getFullYear();
  const taxSummary = taxSummaryQuery.data ?? {
    box1Income: 0,
    box3Assets: 0,
    credits: 0,
    netResult: activeCase?.estimated_refund ?? 0,
    isFallback: true,
    sourceLabel: "summary_unavailable" as const,
  };
  const milestoneItems = t.raw("calendarMilestones") as TimelineMilestone[];

  const alerts: string[] = [];
  if (taxSummary.box3Assets > 59357) alerts.push(t("alerts.box3Threshold"));
  if (hasActiveCase && (progress?.blockingRemaining ?? 0) > 0) alerts.push(t("alerts.checklistIncomplete"));
  if (isDeadlineNear(activeCase?.deadline)) alerts.push(t("alerts.deadlineNear"));

  const historyItems = cases
    .slice()
    .sort((left, right) => new Date(right.updated_at).getTime() - new Date(left.updated_at).getTime())
    .slice(0, 5);
  const recentActivity =
    eventsQuery.data && eventsQuery.data.length > 0
      ? eventsQuery.data.slice(0, 5).map((item) => ({
          id: item.id,
          title: t(`docFlow.eventTypes.${item.event_type}.title`),
          body: t(`docFlow.eventTypes.${item.event_type}.body`),
          createdAt: formatDate(item.created_at, locale, noDateLabel),
        }))
      : notificationsQuery.data && notificationsQuery.data.length > 0
        ? notificationsQuery.data.slice(0, 5).map((item) => ({
            id: item.id,
            title: item.title,
            body: item.message,
            createdAt: formatDate(item.created_at, locale, noDateLabel),
          }))
        : cases.slice(0, 5).map((item) => ({
            id: item.id,
            title: t("activity.caseUpdated", {
              caseLabel: item.display_name ?? getDeclarationTypeLabel(item.case_type, t),
            }),
            body: getStatusLabel(item.status, t),
            createdAt: formatDate(item.updated_at, locale, noDateLabel),
          }));

  const casesErrorCode = casesQuery.error && isApiClientError(casesQuery.error) ? casesQuery.error.code : null;
  const showAdvisorPanel =
    activeCase !== null &&
    ["in_review", "pending_authorization", "authorized", "submitted", "completed"].includes(activeCase.status);

  return (
    <section className="space-y-7">
      {casesQuery.isError ? (
        <div className="rounded-2xl border border-[#D97706]/30 bg-[#FFF4E5] p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-[#B45309]">{t("apiError.eyebrow")}</p>
          <p className="mt-1 text-sm text-[#102033]">
            {t("apiError.body")}
            {casesErrorCode ? ` ${t("apiError.codePrefix")} ${casesErrorCode}.` : ""}
          </p>
        </div>
      ) : null}

      <PageHeader
        eyebrow={t("header.breadcrumb")}
        title={t("header.breadcrumb")}
        description={`${t("header.declaration")} ${taxYear} · ${t("header.updated", { value: formatDate(activeCase?.updated_at, locale, noDateLabel) })} · ${t("header.deadline", { value: formatDate(activeCase?.deadline, locale, noDateLabel) })}`}
      />

      <DeclarationHeader
        breadcrumbLabel={t("header.breadcrumb")}
        declarationLabel={t("header.declaration")}
        taxYear={taxYear}
        updatedLabel={t("header.updated", { value: formatDate(activeCase?.updated_at, locale, noDateLabel) })}
        deadlineLabel={t("header.deadline", { value: formatDate(activeCase?.deadline, locale, noDateLabel) })}
        primaryHref={getCaseHref(activeCase)}
        primaryLabel={t("header.primaryAction")}
        secondaryLabel={t("header.secondaryAction")}
        secondaryHint={t("header.secondaryHint")}
        secondaryDisabled
      />

      <HorizontalStepper
        currentStep={currentStep}
        steps={CASE_STEPPER_STEPS.map((step) => ({ ...step, label: t(`stepper.${step.id}`) }))}
        currentStepLabel={t("stepper.current")}
        completedStepLabel={t("stepper.completedLabel")}
        pendingStepLabel={t("stepper.pendingLabel")}
      />

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard title={t("kpis.box1Income.title")} value={formatMoney(taxSummary.box1Income, locale)} note={t("kpis.box1Income.note")} />
        <KpiCard title={t("kpis.box3Assets.title")} value={formatMoney(taxSummary.box3Assets, locale)} note={t("kpis.box3Assets.note")} />
        <KpiCard title={t("kpis.credits.title")} value={formatMoney(taxSummary.credits, locale)} note={t("kpis.credits.note")} />
        <KpiCard title={t("kpis.netResult.title")} value={formatMoney(taxSummary.netResult, locale)} note={t("kpis.netResult.note")} highlight />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.45fr)_minmax(320px,0.92fr)]">
        <div className="space-y-5">
          <Card variant="glass" padding="md" className="rounded-[28px]" data-testid="dashboard-panel">
            <CardHeader className="mb-4">
              <CardTitle className="text-[1.7rem] text-white">{t("documents.title")}</CardTitle>
              <CardDescription className="text-[#C8D2DF]">{t("documents.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasActiveCase ? (
                <>
                  <div className="rounded-[1.35rem] border border-white/10 bg-white/[0.045] p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-[#9FB0C4]">{t("documents.progressLabel")}</p>
                        <p className="mt-1 text-2xl font-semibold tracking-normal text-white">{documentProgress}%</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm text-white">
                          {uploadedDocuments}/{requiredDocuments}
                        </p>
                        <p className="text-xs text-[#C8D2DF]">{t("documents.progressCaption")}</p>
                      </div>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
                      <div className="h-full rounded-full bg-[#4CAF50] transition-all" style={{ width: `${documentProgress}%` }} />
                    </div>
                  </div>
                  <ul className="grid gap-2">
                    {checklistItems.slice(0, 6).map((item) => (
                      <li
                        key={item.label}
                        className="flex items-center gap-3 rounded-[1.15rem] border border-white/10 bg-white/[0.045] px-4 py-3 transition-colors hover:border-[#4CAF50]/35 hover:bg-[#4CAF50]/10"
                      >
                        {item.done ? <CheckCircle2 className="h-4 w-4 text-[#4CAF50]" /> : <Circle className="h-4 w-4 text-[#9FB0C4]" />}
                        <span className={cn("text-sm", item.done ? "text-[#9FB0C4] line-through" : "text-[#C8D2DF]")}>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="rounded-[1.35rem] border border-dashed border-white/[0.15] bg-white/[0.04] p-5">
                  <p className="text-sm font-semibold text-white">{t("documents.emptyTitle")}</p>
                  <p className="mt-2 text-sm leading-6 text-[#C8D2DF]">{t("documents.emptyBody")}</p>
                </div>
              )}

              <div className="flex justify-end">
                <Link href={getCaseHref(activeCase)} className="inline-flex items-center gap-2 text-sm font-semibold text-[#74D07B] transition-colors hover:text-white">
                  {t("documents.cta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" padding="md" className="rounded-[28px]" data-testid="dashboard-panel">
            <CardHeader className="mb-4">
              <CardTitle className="text-[1.7rem] text-white">{t("history.title")}</CardTitle>
              <CardDescription className="text-[#C8D2DF]">{t("history.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {historyItems.length === 0 ? (
                <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-[#C8D2DF]">{t("history.empty")}</div>
              ) : (
                <ul className="space-y-3">
                  {historyItems.map((item) => {
                    const statusTone = getStatusTone(item.status);

                    return (
                      <li
                        key={item.id}
                        className="rounded-[1.3rem] border border-white/10 bg-white/[0.045] px-4 py-4 transition-colors hover:border-[#4CAF50]/30 hover:bg-[#4CAF50]/10"
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0 space-y-1">
                            <p className="truncate text-base font-semibold text-white">{item.display_name ?? getDeclarationTypeLabel(item.case_type, t)}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-[#C8D2DF]">
                              <span>{t("history.taxYear", { year: item.tax_year ?? "—" })}</span>
                              <span className="h-1 w-1 rounded-full bg-white/30" aria-hidden="true" />
                              <span>{getDeclarationTypeLabel(item.case_type, t)}</span>
                              <span className="h-1 w-1 rounded-full bg-white/30" aria-hidden="true" />
                              <span>{t("history.updated", { value: formatDate(item.updated_at, locale, noDateLabel) })}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <StatusBadge tone={statusTone}>
                              {getStatusLabel(item.status, t)}
                            </StatusBadge>
                            <Link
                              href={getCaseHref(item)}
                              className="inline-flex h-10 items-center justify-center rounded-full border border-[#4CAF50]/35 bg-[#4CAF50]/[0.14] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#4CAF50]/[0.22]"
                            >
                              {t("history.cta")}
                            </Link>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5">
          <Card variant="glass" padding="md" className="rounded-[28px]" data-testid="dashboard-panel">
            <CardHeader className="mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <StatusBadge tone={taxSummary.isFallback ? "warning" : "success"}>{t(`summary.sources.${taxSummary.sourceLabel}`)}</StatusBadge>
              </div>
              <CardTitle className="text-[1.7rem] text-white">{t("summary.title")}</CardTitle>
              <CardDescription className="text-[#C8D2DF]">{t("summary.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[1.35rem] border border-[#4CAF50]/25 bg-[#4CAF50]/10 p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-[#9FB0C4]">{t("summary.netResultLabel")}</p>
                <p className="mt-2 font-mono text-[2.6rem] font-semibold leading-none tracking-normal text-white">
                  {formatMoney(taxSummary.netResult, locale)}
                </p>
              </div>

              <dl className="grid gap-2">
                <SummaryRow label={t("summary.rows.box1Income")} value={formatMoney(taxSummary.box1Income, locale)} />
                <SummaryRow label={t("summary.rows.box3Assets")} value={formatMoney(taxSummary.box3Assets, locale)} />
                <SummaryRow label={t("summary.rows.credits")} value={formatMoney(taxSummary.credits, locale)} />
                <SummaryRow label={t("summary.rows.netResult")} value={formatMoney(taxSummary.netResult, locale)} emphasized />
              </dl>
            </CardContent>
          </Card>

          <Card variant="glass" padding="md" className="rounded-[28px]" data-testid="dashboard-panel">
            <CardHeader className="mb-4">
              <CardTitle className="text-[1.7rem] text-white">{t("alertsPanel.title")}</CardTitle>
              <CardDescription className="text-[#C8D2DF]">{t("alertsPanel.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-3 flex items-center gap-2 text-white">
                  <CalendarClock className="h-4 w-4 text-[#4CAF50]" />
                  <p className="text-sm font-semibold">{t("alertsPanel.calendarTitle")}</p>
                </div>
                <ul className="space-y-2">
                  {milestoneItems.map((milestone) => (
                    <li key={`${milestone.date}-${milestone.label}`} className="rounded-[1.1rem] border border-white/10 bg-white/[0.045] px-4 py-3">
                      <p className="font-mono text-xs uppercase tracking-[0.14em] text-[#9FB0C4]">{milestone.date}</p>
                      <p className="mt-1 text-sm text-white">{milestone.label}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2 text-white">
                  <AlertTriangle className="h-4 w-4 text-[#D97706]" />
                  <p className="text-sm font-semibold">{t("alertsPanel.alertsTitle")}</p>
                </div>
                {alerts.length === 0 ? (
                  <div className="rounded-[1.1rem] border border-[#4CAF50]/25 bg-[#4CAF50]/10 px-4 py-3 text-sm text-[#C8D2DF]">{t("alertsPanel.empty")}</div>
                ) : (
                  <ul className="space-y-2">
                    {alerts.map((alert) => (
                      <li key={alert} className="rounded-[1.1rem] border border-[#D97706]/25 bg-[#D97706]/10 px-4 py-3 text-sm text-[#FBE3C4]">
                        {alert}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          <Card variant="glass" padding="md" className="rounded-[28px]" data-testid="dashboard-panel">
            <CardHeader className="mb-4">
              <CardTitle className="text-[1.7rem] text-white">{t("activity.title")}</CardTitle>
              <CardDescription className="text-[#C8D2DF]">{t("activity.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="rounded-[1.2rem] border border-white/10 bg-white/[0.045] px-4 py-3 text-sm text-[#C8D2DF]">{t("activity.empty")}</div>
              ) : (
                <ul className="space-y-3">
                  {recentActivity.map((activity) => (
                    <li key={activity.id} className="rounded-[1.15rem] border border-white/10 bg-white/[0.045] px-4 py-3 transition-colors hover:border-[#4CAF50]/30 hover:bg-[#4CAF50]/10">
                      <div className="flex items-start gap-3">
                        <Clock3 className="mt-0.5 h-4 w-4 text-[#D97706]" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-white">{activity.title}</p>
                          <p className="mt-1 text-sm text-[#C8D2DF]">{activity.body}</p>
                          <p className="mt-2 text-xs text-[#9FB0C4]">{activity.createdAt}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {showAdvisorPanel ? (
            <Card variant="glass" padding="md" className="rounded-[28px]" data-testid="dashboard-panel">
              <CardHeader className="mb-4">
                <CardTitle className="text-[1.7rem] text-white">{t("advisor.title")}</CardTitle>
                <CardDescription className="text-[#C8D2DF]">{t("advisor.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[1.2rem] border border-[#4CAF50]/25 bg-[#4CAF50]/10 p-4">
                  <div className="flex items-center gap-2 text-white">
                    <ShieldCheck className="h-4 w-4 text-[#4CAF50]" />
                    <p className="text-sm font-semibold">{t("advisor.statusTitle")}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#C8D2DF]">{t("advisor.body")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="rounded-full border border-[#4CAF50]/40 bg-[#4CAF50] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#3F9E48]">
                    {t("advisor.primaryAction")}
                  </button>
                  <button type="button" className="rounded-full border border-white/[0.15] bg-white/[0.06] px-4 py-2 text-sm font-semibold text-white transition-colors hover:border-[#4CAF50]/30 hover:bg-white/[0.1]">
                    {t("advisor.secondaryAction")}
                  </button>
                </div>
              </CardContent>
            </Card>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function KpiCard({
  title,
  value,
  note,
  highlight = false,
}: {
  title: string;
  value: string;
  note: string;
  highlight?: boolean;
}) {
  return (
    <Card
      variant={highlight ? "darkSoft" : "dark"}
      padding="sm"
      data-testid="dashboard-metric-card"
      className={cn(
        "min-h-[132px] rounded-[1.4rem] border transition-all hover:-translate-y-0.5 hover:border-[#4CAF50]/35",
        highlight && "border-[#4CAF50]/30 bg-[#4CAF50]/[0.14]",
      )}
    >
      <p className="text-[11px] uppercase tracking-[0.16em] text-[#9FB0C4]">{title}</p>
      <p className="mt-3 font-mono text-[1.8rem] font-semibold tracking-normal text-white">{value}</p>
      <p className="mt-1.5 text-xs text-[#C8D2DF]">{note}</p>
    </Card>
  );
}

function SummaryRow({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between rounded-[1rem] border px-4 py-3", emphasized ? "border-[#4CAF50]/30 bg-[#4CAF50]/10" : "border-white/10 bg-white/[0.045]")}>
      <dt className="text-sm text-[#C8D2DF]">{label}</dt>
      <dd className={cn("font-mono text-sm font-semibold", emphasized ? "text-[#74D07B]" : "text-white")}>{value}</dd>
    </div>
  );
}
