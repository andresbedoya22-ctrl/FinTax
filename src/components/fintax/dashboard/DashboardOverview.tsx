"use client";

import { ArrowRight, CheckCircle2, ChevronRight, Circle, Clock3, FolderCheck, ReceiptText, ShieldCheck, Upload } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { isApiClientError } from "@/hooks/api-client";
import { useCases } from "@/hooks/useCases";
import { useChecklist } from "@/hooks/useChecklist";
import { cn } from "@/lib/cn";
import { CASE_STEPPER_STEPS, mapCaseStatusToStep } from "@/domain/cases/status-stepper";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";

type CaseStatusTone = "neutral" | "success" | "warning";

function caseStatusLabel(status: string) {
  switch (status) {
    case "pending_documents":
      return "Pending documents";
    case "in_review":
      return "Under review";
    case "pending_payment":
      return "Pending payment";
    case "pending_authorization":
      return "Pending authorization";
    case "authorized":
      return "Authorized";
    case "submitted":
      return "Submitted";
    case "completed":
      return "Completed";
    case "rejected":
      return "Needs update";
    default:
      return "Draft";
  }
}

function caseStatusTone(status: string): CaseStatusTone {
  if (status === "completed" || status === "authorized" || status === "submitted") return "success";
  if (status === "pending_documents" || status === "pending_payment") return "warning";
  return "neutral";
}

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return "No date yet";
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

export function DashboardOverview() {
  const t = useTranslations("Dashboard.overview");
  const locale = useLocale();
  const casesQuery = useCases();
  const cases = casesQuery.data ?? [];
  const casesErrorCode = casesQuery.error && isApiClientError(casesQuery.error) ? casesQuery.error.code : null;

  const activeCase = cases[0] ?? null;
  const checklistQuery = useChecklist(activeCase?.id ?? "");
  const checklist = checklistQuery.data ?? [];
  const fallbackChecklist = t.raw("checklistItems") as Array<{ label: string; done: boolean }>;
  const checklistItems = checklist.length > 0 ? checklist.map((item) => ({ label: item.label, done: item.is_completed })) : fallbackChecklist;

  const openCases = cases.length;
  const pendingDocumentsCount = cases.filter((item) => item.status === "pending_documents").length;
  const estimatedRefundTotal = cases.reduce((sum, item) => sum + (item.estimated_refund ?? 0), 0);
  const fallbackEstimate = Number.parseInt(String(t("refundAmount")).replace(/[^\d]/g, ""), 10) || 1250;
  const refundEstimateBase = estimatedRefundTotal > 0 ? Math.round(estimatedRefundTotal) : fallbackEstimate;

  const currentStatus = activeCase?.status ?? "draft";
  const currentStep = mapCaseStatusToStep(currentStatus);
  const checklistProgress = checklistItems.length > 0 ? Math.round((checklistItems.filter((i) => i.done).length / checklistItems.length) * 100) : 0;
  const activeStatusLabel = caseStatusLabel(currentStatus);
  const activeStatusTone = caseStatusTone(currentStatus);
  const deadlineText = formatDate(activeCase?.deadline, locale);
  const updatedText = formatDate(activeCase?.updated_at, locale);
  const taxYear = activeCase?.tax_year ?? new Date().getFullYear();

  const documentChecklist = checklist.filter((item) => item.is_document_upload);
  const uploadedDocuments = documentChecklist.filter((item) => item.is_completed).length;
  const requiredDocuments = documentChecklist.length;
  const totalDocumentItems = requiredDocuments || checklistItems.length;
  const documentProgress = totalDocumentItems > 0 ? Math.round((uploadedDocuments / totalDocumentItems) * 100) : checklistProgress;

  const fallbackRows = t.raw("caseRows") as Array<{ label: string; amount: string }>;
  const breakdownRows =
    cases.filter((item) => (item.estimated_refund ?? 0) > 0).length > 0
      ? cases
          .filter((item) => (item.estimated_refund ?? 0) > 0)
          .slice(0, 4)
          .map((item) => ({
            label: item.display_name ?? item.case_type,
            amount: item.estimated_refund ?? 0,
          }))
      : fallbackRows.map((row) => ({ label: row.label, amount: Number.parseFloat(row.amount.replace(/[^\d.]/g, "")) || 0 }));

  const refundBreakdownTotal = breakdownRows.reduce((sum, row) => sum + row.amount, 0);

  const taxHistory = cases.slice(0, 5).map((item) => ({
    id: item.id,
    label: item.display_name ?? item.case_type,
    year: item.tax_year ?? null,
    status: caseStatusLabel(item.status),
    updated: formatDate(item.updated_at, locale),
  }));

  const recentActivity = cases.slice(0, 4).map((item) => ({
    id: item.id,
    title: `${item.display_name ?? item.case_type} moved to ${caseStatusLabel(item.status).toLowerCase()}`,
    date: formatDate(item.updated_at, locale),
  }));

  return (
    <section className="space-y-6">
      {casesQuery.isError ? (
        <div className="rounded-[var(--radius-lg)] border border-copper/30 bg-copper/10 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-copper">Dashboard API</p>
          <p className="mt-1 text-sm text-secondary">
            Case overview could not be refreshed.
            {casesErrorCode ? ` Code: ${casesErrorCode}.` : ""}
          </p>
        </div>
      ) : null}

      <header className="space-y-3 rounded-[var(--radius-xl)] border border-border/65 bg-white px-5 py-5 sm:px-6">
        <div className="flex items-center gap-2 text-sm text-muted">
          <span>Home</span>
          <ChevronRight className="h-4 w-4" />
          <span className="text-text">Declaration {taxYear}</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="space-y-1">
            <h1 className="text-3xl font-semibold tracking-[-0.02em] text-text sm:text-[2.1rem]">Tax declaration {taxYear}</h1>
            <p className="text-sm text-secondary">
              Updated: {updatedText} | Deadline: {deadlineText}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/tax-return"
              className="inline-flex items-center gap-2 rounded-xl border border-green/45 bg-white px-4 py-2.5 text-sm font-semibold text-green hover:bg-green/5"
            >
              <Upload className="h-4 w-4" />
              Upload document
            </Link>
            <Link
              href="/tax-return"
              className="inline-flex items-center gap-2 rounded-xl border border-green/40 bg-green px-4 py-2.5 text-sm font-semibold text-white hover:bg-green-hover"
            >
              View full status
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </header>

      <Card variant="panel" padding="lg" className="border-green/20 bg-white">
        <CardHeader className="mb-4">
          <div className="mb-3 flex flex-wrap items-center gap-2">
            <Badge variant="copper">Case status</Badge>
            <Badge variant={activeStatusTone === "success" ? "success" : "neutral"}>{activeStatusLabel}</Badge>
          </div>
          <CardTitle className="text-2xl">Declaration progress</CardTitle>
          <CardDescription>
            Step {currentStep} of {CASE_STEPPER_STEPS.length}. Your case follows the current fiscal status mapping.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <StatusTimeline currentStep={currentStep} />
        </CardContent>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Open cases" value={`${openCases}`} note="Across tax and benefits flows" tone="neutral" />
        <KpiCard title="Pending documents" value={`${pendingDocumentsCount}`} note="Cases waiting for upload completion" tone="warning" />
        <KpiCard title="Estimated refund" value={formatMoney(refundEstimateBase, locale)} note="Current projected total" tone="success" />
        <KpiCard title="Checklist completion" value={`${checklistProgress}%`} note="Current active case" tone="neutral" />
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.58fr)_minmax(330px,1fr)]">
        <div className="space-y-5">
          <Card variant="panel" padding="md" className="bg-white">
            <CardHeader className="mb-3">
              <CardTitle className="text-2xl">Uploaded documents</CardTitle>
              <CardDescription>Documents attached to your active checklist and review stage.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="mb-4 rounded-[var(--radius-lg)] border border-border/35 bg-surface2/18 p-4">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm text-secondary">Upload progress</span>
                  <span className="font-mono text-sm font-semibold text-text">{uploadedDocuments}/{totalDocumentItems}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-surface">
                  <div className="h-full rounded-full bg-green transition-all" style={{ width: `${documentProgress}%` }} />
                </div>
              </div>

              <ul className="space-y-2.5">
                {checklistItems.slice(0, 5).map((item) => (
                  <li key={item.label} className="flex items-center gap-3 rounded-lg border border-border/30 bg-white px-3.5 py-2.5">
                    {item.done ? <CheckCircle2 className="h-4 w-4 text-green" /> : <Circle className="h-4 w-4 text-muted" />}
                    <span className={cn("text-sm", item.done ? "text-muted line-through" : "text-secondary")}>{item.label}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          <Card variant="panel" padding="md" className="bg-white">
            <CardHeader className="mb-3">
              <CardTitle className="text-2xl">Fiscal history</CardTitle>
              <CardDescription>Recent filing records and status checkpoints, ordered by last updates.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {taxHistory.length === 0 ? (
                  <li className="rounded-lg border border-border/35 bg-surface2/25 px-3 py-2.5 text-sm text-secondary">No case history yet.</li>
                ) : (
                  taxHistory.map((item) => (
                    <li key={item.id} className="rounded-lg border border-border/28 bg-white px-3.5 py-2.5">
                      <div className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-3">
                        <p className="truncate text-sm font-medium text-text">{item.label}</p>
                        <span className="font-mono text-xs text-muted">{item.year ?? "Year n/a"}</span>
                        <span className="text-xs text-secondary">{item.updated}</span>
                      </div>
                      <p className="mt-1 text-xs text-secondary">{item.status}</p>
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>
        </div>

        <div className="space-y-5 xl:pl-5 2xl:pl-8">
          <Card variant="panel" padding="md" className="bg-white">
            <CardHeader className="mb-3">
              <CardTitle className="text-2xl">Breakdown del reembolso</CardTitle>
              <CardDescription>Current estimate by fiscal module, aligned to active case records.</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="font-mono text-[2.6rem] font-semibold leading-none tracking-[-0.04em] text-text">{formatMoney(refundBreakdownTotal || refundEstimateBase, locale)}</p>
              <div className="mt-4 rounded-[var(--radius-lg)] border border-border/40 bg-surface2/20">
                <div className="grid grid-cols-[1fr_auto] border-b border-border/35 px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-muted">
                  <span>Item</span>
                  <span className="font-mono">Amount</span>
                </div>
                {breakdownRows.map((row) => (
                  <div key={row.label} className="grid grid-cols-[1fr_auto] items-center border-b border-border/20 px-4 py-2.5 last:border-b-0">
                    <span className="text-sm text-secondary">{row.label}</span>
                    <span className="font-mono text-sm font-semibold text-text">{formatMoney(row.amount, locale)}</span>
                  </div>
                ))}
              </div>
              <p className="mt-3 text-xs text-muted">Estimate based on current case data and checklist evidence.</p>
              <Link
                href="/tax-return"
                className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-green/45 bg-white px-4 py-2.5 text-sm font-semibold text-green hover:bg-green/5"
              >
                Continue declaration
              </Link>
            </CardContent>
          </Card>

          <Card variant="panel" padding="md" className="bg-white">
            <CardHeader className="mb-3">
              <CardTitle className="text-xl">Personal advisor</CardTitle>
              <CardDescription>Assignment and contact status for your case.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 rounded-[var(--radius-lg)] border border-border/30 bg-surface2/18 p-4">
                <div className="flex items-center gap-2 text-text">
                  <ShieldCheck className="h-4 w-4 text-green" />
                  <p className="text-sm font-medium">Advisor assignment status</p>
                </div>
                <p className="text-sm leading-6 text-secondary">
                  {currentStatus === "in_review" || currentStatus === "submitted" || currentStatus === "completed"
                    ? "A tax specialist is assigned and your case is currently under review."
                    : "Advisor assignment starts automatically once documents and payment checks are complete."}
                </p>
                <div className="flex flex-wrap gap-2">
                  <button type="button" className="rounded-lg border border-green/35 bg-white px-3 py-1.5 text-sm font-medium text-green hover:bg-green/5">
                    Message advisor
                  </button>
                  <button type="button" className="rounded-lg border border-border/45 bg-white px-3 py-1.5 text-sm font-medium text-text hover:bg-surface2/45">
                    Request call
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card variant="panel" padding="md" className="bg-white">
            <CardHeader className="mb-3">
              <CardTitle className="text-xl">Recent activity</CardTitle>
              <CardDescription>Latest operational updates from your active records.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {recentActivity.length === 0 ? (
                  <li className="rounded-lg border border-border/35 bg-surface2/25 px-3 py-2.5 text-sm text-secondary">No updates yet.</li>
                ) : (
                  recentActivity.map((activity) => (
                    <li key={activity.id} className="rounded-lg border border-border/28 bg-white px-3.5 py-2.5">
                      <div className="flex items-start gap-2.5">
                        <Clock3 className="mt-0.5 h-4 w-4 text-copper" />
                        <div className="min-w-0">
                          <p className="text-sm text-text">{activity.title}</p>
                          <p className="mt-1 text-xs text-secondary">{activity.date}</p>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
              <Link href="/tax-return" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-copper hover:text-text">
                View complete timeline
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}

function StatusTimeline({ currentStep }: { currentStep: number }) {
  return (
    <ol className="grid gap-6 md:grid-cols-5 md:gap-3">
      {CASE_STEPPER_STEPS.map((step, index) => {
        const stepNumber = index + 1;
        const isComplete = stepNumber < currentStep;
        const isCurrent = stepNumber === currentStep;
        return (
          <li key={step.id} className="relative">
            <div className="flex items-center md:block">
              <div className="relative flex w-full items-center md:justify-center">
                <span
                  className={cn(
                    "grid h-8 w-8 shrink-0 place-items-center rounded-full border text-xs font-semibold",
                    isComplete && "border-green/45 bg-green text-white",
                    isCurrent && "border-green bg-white text-green ring-4 ring-green/15",
                    !isComplete && !isCurrent && "border-border/70 bg-surface text-muted",
                  )}
                >
                  {isComplete ? <CheckCircle2 className="h-4 w-4" /> : stepNumber}
                </span>
                {index < CASE_STEPPER_STEPS.length - 1 ? (
                  <span
                    className={cn(
                      "mx-2 h-0.5 flex-1 rounded-full md:absolute md:left-[calc(50%+1rem)] md:right-[-50%] md:top-4 md:mx-0",
                      isComplete ? "bg-green" : "bg-border/65",
                    )}
                  />
                ) : null}
              </div>
              <div className="ml-3 md:ml-0 md:mt-2 md:text-center">
                {isCurrent ? <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-green">You are here</p> : null}
                <p className={cn("text-sm font-medium", isCurrent ? "text-text" : "text-secondary")}>{step.label}</p>
              </div>
            </div>
          </li>
        );
      })}
    </ol>
  );
}

function KpiCard({
  title,
  value,
  note,
  tone,
}: {
  title: string;
  value: string;
  note: string;
  tone: "neutral" | "success" | "warning";
}) {
  const toneClass = tone === "success" ? "border-green/25 bg-green/7" : tone === "warning" ? "border-copper/25 bg-copper/7" : "border-border/30 bg-white";
  const icon = tone === "success" ? <FolderCheck className="h-4 w-4 text-green" /> : tone === "warning" ? <Clock3 className="h-4 w-4 text-copper" /> : <ReceiptText className="h-4 w-4 text-muted" />;

  return (
    <Card variant="soft" padding="sm" className={cn("editorial-frame", toneClass)}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{title}</p>
        {icon}
      </div>
      <p className="font-mono text-[1.75rem] font-semibold tracking-[-0.03em] text-text">{value}</p>
      <p className="mt-1.5 text-xs text-secondary">{note}</p>
    </Card>
  );
}
