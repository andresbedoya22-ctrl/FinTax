"use client";

import { AlertTriangle, ArrowRight, CalendarClock, CheckCircle2, Circle, Clock3, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { isApiClientError } from "@/hooks/api-client";
import { useCases } from "@/hooks/useCases";
import { useNotifications } from "@/hooks/useNotifications";
import { useCaseEvents, useCaseProgress, useCaseRequirements } from "@/hooks/useTaxReturnDocFlow";
import { useTaxSummary } from "@/hooks/useTaxSummary";
import { cn } from "@/lib/cn";
import { CASE_STEPPER_STEPS, mapCaseStatusToStep } from "@/domain/cases/status-stepper";
import type { Case, CaseType } from "@/types/database";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
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
  if (status === "pending_documents" || status === "pending_payment" || status === "rejected") return "copper" as const;
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
  const casesQuery = useCases();
  const notificationsQuery = useNotifications(6);
  const cases = casesQuery.data ?? [];
  const activeCase = cases[0] ?? null;
  const hasActiveCase = activeCase !== null;
  const requirementsQuery = useCaseRequirements(activeCase?.id ?? "");
  const progressQuery = useCaseProgress(activeCase?.id ?? "");
  const eventsQuery = useCaseEvents(activeCase?.id ?? "");
  const taxSummaryQuery = useTaxSummary(activeCase?.id ?? "");
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
    <section className="space-y-5">
      {casesQuery.isError ? (
        <div className="rounded-2xl border border-copper/30 bg-copper/10 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-copper">{t("apiError.eyebrow")}</p>
          <p className="mt-1 text-sm text-secondary">
            {t("apiError.body")}
            {casesErrorCode ? ` ${t("apiError.codePrefix")} ${casesErrorCode}.` : ""}
          </p>
        </div>
      ) : null}

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
          <Card variant="panel" padding="md" className="shadow-[0_14px_28px_rgba(15,23,42,0.04)]">
            <CardHeader className="mb-4">
              <CardTitle className="text-[1.7rem]">{t("documents.title")}</CardTitle>
              <CardDescription>{t("documents.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {hasActiveCase ? (
                <>
                  <div className="rounded-[1.35rem] border border-border/45 bg-surface2/20 p-4">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{t("documents.progressLabel")}</p>
                        <p className="mt-1 text-2xl font-semibold tracking-[-0.03em] text-text">{documentProgress}%</p>
                      </div>
                      <div className="text-right">
                        <p className="font-mono text-sm text-text">
                          {uploadedDocuments}/{requiredDocuments}
                        </p>
                        <p className="text-xs text-secondary">{t("documents.progressCaption")}</p>
                      </div>
                    </div>
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-border/40">
                      <div className="h-full rounded-full bg-gradient-to-r from-green to-copper transition-all" style={{ width: `${documentProgress}%` }} />
                    </div>
                  </div>
                  <ul className="grid gap-2">
                    {checklistItems.slice(0, 6).map((item) => (
                      <li
                        key={item.label}
                        className="flex items-center gap-3 rounded-[1.15rem] border border-border/35 bg-surface px-4 py-3 transition-colors hover:border-green/25 hover:bg-green/5"
                      >
                        {item.done ? <CheckCircle2 className="h-4 w-4 text-green" /> : <Circle className="h-4 w-4 text-muted" />}
                        <span className={cn("text-sm", item.done ? "text-muted line-through" : "text-secondary")}>{item.label}</span>
                      </li>
                    ))}
                  </ul>
                </>
              ) : (
                <div className="rounded-[1.35rem] border border-dashed border-border/55 bg-surface2/18 p-5">
                  <p className="text-sm font-semibold text-text">{t("documents.emptyTitle")}</p>
                  <p className="mt-2 text-sm leading-6 text-secondary">{t("documents.emptyBody")}</p>
                </div>
              )}

              <div className="flex justify-end">
                <Link href={getCaseHref(activeCase)} className="inline-flex items-center gap-2 text-sm font-semibold text-green transition-colors hover:text-text">
                  {t("documents.cta")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </CardContent>
          </Card>

          <Card variant="panel" padding="md" className="shadow-[0_14px_28px_rgba(15,23,42,0.04)]">
            <CardHeader className="mb-4">
              <CardTitle className="text-[1.7rem]">{t("history.title")}</CardTitle>
              <CardDescription>{t("history.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {historyItems.length === 0 ? (
                <div className="rounded-[1.2rem] border border-border/35 bg-surface2/20 px-4 py-3 text-sm text-secondary">{t("history.empty")}</div>
              ) : (
                <ul className="space-y-3">
                  {historyItems.map((item) => {
                    const statusTone = getStatusTone(item.status);

                    return (
                      <li
                        key={item.id}
                        className="rounded-[1.3rem] border border-border/35 bg-surface px-4 py-4 transition-colors hover:border-green/20 hover:bg-green/5"
                      >
                        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                          <div className="min-w-0 space-y-1">
                            <p className="truncate text-base font-semibold text-text">{item.display_name ?? getDeclarationTypeLabel(item.case_type, t)}</p>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-secondary">
                              <span>{t("history.taxYear", { year: item.tax_year ?? "—" })}</span>
                              <span className="h-1 w-1 rounded-full bg-border/80" aria-hidden="true" />
                              <span>{getDeclarationTypeLabel(item.case_type, t)}</span>
                              <span className="h-1 w-1 rounded-full bg-border/80" aria-hidden="true" />
                              <span>{t("history.updated", { value: formatDate(item.updated_at, locale, noDateLabel) })}</span>
                            </div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant={statusTone === "success" ? "success" : statusTone === "copper" ? "copper" : "neutral"}>
                              {getStatusLabel(item.status, t)}
                            </Badge>
                            <Link
                              href={getCaseHref(item)}
                              className="inline-flex h-10 items-center justify-center rounded-full border border-green/30 bg-white/80 px-4 text-sm font-semibold text-green transition-colors hover:bg-green/5 hover:text-text"
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
          <Card variant="panel" padding="md" className="shadow-[0_14px_28px_rgba(15,23,42,0.04)]">
            <CardHeader className="mb-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={taxSummary.isFallback ? "copper" : "success"}>{t(`summary.sources.${taxSummary.sourceLabel}`)}</Badge>
              </div>
              <CardTitle className="text-[1.7rem]">{t("summary.title")}</CardTitle>
              <CardDescription>{t("summary.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="rounded-[1.35rem] border border-border/45 bg-[linear-gradient(135deg,rgba(15,23,42,0.02),rgba(21,128,61,0.06))] p-4">
                <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{t("summary.netResultLabel")}</p>
                <p className="mt-2 font-mono text-[2.6rem] font-semibold leading-none tracking-[-0.05em] text-text">
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

          <Card variant="panel" padding="md" className="shadow-[0_14px_28px_rgba(15,23,42,0.04)]">
            <CardHeader className="mb-4">
              <CardTitle className="text-[1.7rem]">{t("alertsPanel.title")}</CardTitle>
              <CardDescription>{t("alertsPanel.description")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="mb-3 flex items-center gap-2 text-text">
                  <CalendarClock className="h-4 w-4 text-green" />
                  <p className="text-sm font-semibold">{t("alertsPanel.calendarTitle")}</p>
                </div>
                <ul className="space-y-2">
                  {milestoneItems.map((milestone) => (
                    <li key={`${milestone.date}-${milestone.label}`} className="rounded-[1.1rem] border border-border/35 bg-surface2/20 px-4 py-3">
                      <p className="font-mono text-xs uppercase tracking-[0.14em] text-muted">{milestone.date}</p>
                      <p className="mt-1 text-sm text-text">{milestone.label}</p>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="mb-3 flex items-center gap-2 text-text">
                  <AlertTriangle className="h-4 w-4 text-copper" />
                  <p className="text-sm font-semibold">{t("alertsPanel.alertsTitle")}</p>
                </div>
                {alerts.length === 0 ? (
                  <div className="rounded-[1.1rem] border border-green/20 bg-green/5 px-4 py-3 text-sm text-secondary">{t("alertsPanel.empty")}</div>
                ) : (
                  <ul className="space-y-2">
                    {alerts.map((alert) => (
                      <li key={alert} className="rounded-[1.1rem] border border-copper/20 bg-copper/8 px-4 py-3 text-sm text-secondary">
                        {alert}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </CardContent>
          </Card>

          <Card variant="panel" padding="md" className="shadow-[0_14px_28px_rgba(15,23,42,0.04)]">
            <CardHeader className="mb-4">
              <CardTitle className="text-[1.7rem]">{t("activity.title")}</CardTitle>
              <CardDescription>{t("activity.description")}</CardDescription>
            </CardHeader>
            <CardContent>
              {recentActivity.length === 0 ? (
                <div className="rounded-[1.2rem] border border-border/35 bg-surface2/20 px-4 py-3 text-sm text-secondary">{t("activity.empty")}</div>
              ) : (
                <ul className="space-y-3">
                  {recentActivity.map((activity) => (
                    <li key={activity.id} className="rounded-[1.15rem] border border-border/35 bg-surface px-4 py-3 transition-colors hover:border-green/20 hover:bg-green/5">
                      <div className="flex items-start gap-3">
                        <Clock3 className="mt-0.5 h-4 w-4 text-copper" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-text">{activity.title}</p>
                          <p className="mt-1 text-sm text-secondary">{activity.body}</p>
                          <p className="mt-2 text-xs text-muted">{activity.createdAt}</p>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          {showAdvisorPanel ? (
            <Card variant="panel" padding="md" className="shadow-[0_14px_28px_rgba(15,23,42,0.04)]">
              <CardHeader className="mb-4">
                <CardTitle className="text-[1.7rem]">{t("advisor.title")}</CardTitle>
                <CardDescription>{t("advisor.description")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-[1.2rem] border border-green/20 bg-green/5 p-4">
                  <div className="flex items-center gap-2 text-text">
                    <ShieldCheck className="h-4 w-4 text-green" />
                    <p className="text-sm font-semibold">{t("advisor.statusTitle")}</p>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-secondary">{t("advisor.body")}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="rounded-full border border-green/30 bg-white px-4 py-2 text-sm font-semibold text-green transition-colors hover:bg-green/5 hover:text-text">
                    {t("advisor.primaryAction")}
                  </button>
                  <button type="button" className="rounded-full border border-border/45 bg-surface px-4 py-2 text-sm font-semibold text-text transition-colors hover:border-green/20 hover:bg-green/5">
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
      variant="soft"
      padding="sm"
      className={cn(
        "min-h-[132px] rounded-[1.4rem] border transition-all hover:-translate-y-0.5 hover:shadow-[0_14px_28px_rgba(15,23,42,0.08)]",
        highlight ? "border-green/25 bg-[linear-gradient(135deg,rgba(21,128,61,0.08),rgba(195,145,91,0.08))]" : "border-border/35 bg-surface",
      )}
    >
      <p className="text-[11px] uppercase tracking-[0.16em] text-muted">{title}</p>
      <p className="mt-3 font-mono text-[1.8rem] font-semibold tracking-[-0.04em] text-text">{value}</p>
      <p className="mt-1.5 text-xs text-secondary">{note}</p>
    </Card>
  );
}

function SummaryRow({ label, value, emphasized = false }: { label: string; value: string; emphasized?: boolean }) {
  return (
    <div className={cn("flex items-center justify-between rounded-[1rem] border px-4 py-3", emphasized ? "border-green/25 bg-green/5" : "border-border/35 bg-surface")}>
      <dt className="text-sm text-secondary">{label}</dt>
      <dd className={cn("font-mono text-sm font-semibold", emphasized ? "text-green" : "text-text")}>{value}</dd>
    </div>
  );
}
