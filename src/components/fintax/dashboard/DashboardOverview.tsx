"use client";

import { ArrowRight, CheckCircle2, Circle, Clock3, FolderCheck, ReceiptText, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { isApiClientError } from "@/hooks/api-client";
import { useCases } from "@/hooks/useCases";
import { useChecklist } from "@/hooks/useChecklist";
import { cn } from "@/lib/cn";
import { CASE_STEPPER_STEPS, mapCaseStatusToStep } from "@/domain/cases/status-stepper";
import { Badge, Card, CardContent, CardDescription, CardHeader, CardTitle, Stepper } from "@/components/ui";

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

function stepDescription(stepId: string) {
  switch (stepId) {
    case "draft":
      return "Case scope and intake confirmed.";
    case "docs":
      return "Required files are uploaded and validated.";
    case "review":
      return "Tax specialist checks your case details.";
    case "payment":
      return "Service payment and authorization are finalized.";
    case "done":
      return "Case is submitted and tracked to closure.";
    default:
      return "";
  }
}

function formatDate(value: string | null | undefined, locale: string) {
  if (!value) return "No date yet";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "2-digit" }).format(parsed);
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
  const checklistItems =
    checklist.length > 0
      ? checklist.map((item) => ({ label: item.label, done: item.is_completed }))
      : fallbackChecklist;

  const openCases = cases.length;
  const pendingDocumentsCount = cases.filter((item) => item.status === "pending_documents").length;
  const estimatedRefundTotal = cases.reduce((sum, item) => sum + (item.estimated_refund ?? 0), 0);
  const fallbackEstimate = Number.parseInt(String(t("refundAmount")).replace(/[^\d]/g, ""), 10) || 1250;
  const refundEstimateBase = estimatedRefundTotal > 0 ? Math.round(estimatedRefundTotal) : fallbackEstimate;

  const currentStatus = activeCase?.status ?? "draft";
  const currentStep = mapCaseStatusToStep(currentStatus);
  const stepperSteps = CASE_STEPPER_STEPS.map((step) => ({ id: step.id, label: step.label, description: stepDescription(step.id) }));
  const checklistProgress = checklistItems.length > 0 ? Math.round((checklistItems.filter((i) => i.done).length / checklistItems.length) * 100) : 0;

  const activeStatusLabel = caseStatusLabel(currentStatus);
  const activeStatusTone = caseStatusTone(currentStatus);
  const activeCaseTitle = activeCase?.display_name ?? t("caseTitle");
  const deadlineText = formatDate(activeCase?.deadline, locale);

  const documentChecklist = checklist.filter((item) => item.is_document_upload);
  const uploadedDocuments = documentChecklist.filter((item) => item.is_completed).length;
  const requiredDocuments = documentChecklist.length;

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
    <section className="space-y-7">
      {casesQuery.isError ? (
        <div className="rounded-[var(--radius-lg)] border border-copper/30 bg-copper/10 p-4">
          <p className="text-xs uppercase tracking-[0.14em] text-copper">Dashboard API</p>
          <p className="mt-1 text-sm text-secondary">
            Case overview could not be refreshed.
            {casesErrorCode ? ` Code: ${casesErrorCode}.` : ""}
          </p>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard title="Open cases" value={`${openCases}`} note="Across tax and benefits flows" tone="neutral" />
        <KpiCard title="Pending documents" value={`${pendingDocumentsCount}`} note="Cases waiting for upload completion" tone="warning" />
        <KpiCard title="Estimated refund" value={`EUR ${refundEstimateBase.toFixed(2)}`} note="Current projected total" tone="success" />
        <KpiCard title="Checklist completion" value={`${checklistProgress}%`} note="Current active case" tone="neutral" />
      </div>

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.62fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <Card variant="panel" padding="lg">
            <CardHeader className="mb-5">
              <div className="mb-3 flex flex-wrap items-center gap-2">
                <Badge variant="copper">Declaration header</Badge>
                <Badge variant={activeStatusTone === "success" ? "success" : "neutral"}>{activeStatusLabel}</Badge>
              </div>
              <CardTitle className="text-3xl">{activeCaseTitle}</CardTitle>
              <CardDescription className="text-sm">
                Deadline: <span className="font-medium text-text">{deadlineText}</span>
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-5">
              <div className="rounded-[var(--radius-lg)] border border-green/25 bg-green/5 p-5">
                <div className="mb-4 flex items-center justify-between gap-4">
                  <p className="text-sm font-medium text-text">Case stepper</p>
                  <span className="font-mono text-xs text-secondary">Step {currentStep} / {stepperSteps.length}</span>
                </div>
                <Stepper steps={stepperSteps} currentStep={currentStep} className="gap-4" />
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Link href="/tax-return" className="inline-flex items-center gap-2 rounded-full border border-green/45 bg-green px-4 py-2 text-sm font-semibold text-white">
                  {t("openCase")}
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link href="/benefits" className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-surface2/60 px-4 py-2 text-sm font-medium text-text">
                  {t("reviewBenefits")}
                </Link>
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card variant="panel" padding="md">
              <CardHeader className="mb-3">
                <CardTitle className="text-xl">Uploaded documents</CardTitle>
                <CardDescription>Files mapped to your active checklist.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 rounded-[var(--radius-lg)] border border-border/40 bg-surface2/35 p-4">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="text-sm text-secondary">Upload progress</span>
                    <span className="font-mono text-sm text-text">{uploadedDocuments}/{requiredDocuments || checklistItems.length}</span>
                  </div>
                  <div className="h-2 overflow-hidden rounded-full bg-surface">
                    <div className="h-full rounded-full bg-green transition-all" style={{ width: `${requiredDocuments > 0 ? Math.round((uploadedDocuments / requiredDocuments) * 100) : checklistProgress}%` }} />
                  </div>
                </div>
                <ul className="space-y-2.5">
                  {checklistItems.slice(0, 5).map((item) => (
                    <li key={item.label} className="flex items-center gap-3 rounded-lg border border-border/35 bg-surface2/25 px-3 py-2.5">
                      {item.done ? <CheckCircle2 className="h-4 w-4 text-green" /> : <Circle className="h-4 w-4 text-muted" />}
                      <span className={cn("text-sm", item.done ? "text-muted line-through" : "text-secondary")}>{item.label}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card variant="panel" padding="md">
              <CardHeader className="mb-3">
                <CardTitle className="text-xl">Refund breakdown</CardTitle>
                <CardDescription>Estimated amounts by active case segment.</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-[var(--radius-lg)] border border-border/40 bg-surface2/25">
                  <div className="grid grid-cols-[1fr_auto] border-b border-border/35 px-4 py-2 text-[11px] uppercase tracking-[0.12em] text-muted">
                    <span>Item</span>
                    <span className="font-mono">Amount</span>
                  </div>
                  {breakdownRows.map((row) => (
                    <div key={row.label} className="grid grid-cols-[1fr_auto] items-center border-b border-border/20 px-4 py-3 last:border-b-0">
                      <span className="text-sm text-secondary">{row.label}</span>
                      <span className="font-mono text-sm font-semibold text-text">EUR {row.amount.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-xs text-muted">This estimate is indicative and validated during specialist review.</p>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="space-y-6 xl:pl-6 2xl:pl-10">
          <Card variant="panel" padding="md">
            <CardHeader className="mb-3">
              <CardTitle className="text-xl">Personal advisor</CardTitle>
              <CardDescription>Who handles your case at this stage.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-[var(--radius-lg)] border border-border/35 bg-surface2/30 p-4">
                <div className="mb-2 flex items-center gap-2 text-text">
                  <ShieldCheck className="h-4 w-4 text-green" />
                  <p className="text-sm font-medium">Advisor assignment status</p>
                </div>
                <p className="text-sm leading-6 text-secondary">
                  {currentStatus === "in_review" || currentStatus === "submitted" || currentStatus === "completed"
                    ? "A tax specialist is assigned and your case is currently being reviewed."
                    : "Advisor assignment starts automatically once documents and payment checks are complete."}
                </p>
              </div>
            </CardContent>
          </Card>

          <Card variant="panel" padding="md">
            <CardHeader className="mb-3">
              <CardTitle className="text-xl">Fiscal history</CardTitle>
              <CardDescription>Recent filing records and status changes.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {taxHistory.length === 0 ? (
                  <li className="rounded-lg border border-border/35 bg-surface2/25 px-3 py-2.5 text-sm text-secondary">No case history yet.</li>
                ) : (
                  taxHistory.map((item) => (
                    <li key={item.id} className="rounded-lg border border-border/35 bg-surface2/25 px-3 py-2.5">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-text">{item.label}</p>
                        <span className="font-mono text-xs text-muted">{item.year ?? "Year n/a"}</span>
                      </div>
                      <p className="mt-1 text-xs text-secondary">{item.status} • {item.updated}</p>
                    </li>
                  ))
                )}
              </ul>
            </CardContent>
          </Card>

          <Card variant="panel" padding="md">
            <CardHeader className="mb-3">
              <CardTitle className="text-xl">Recent activity</CardTitle>
              <CardDescription>Latest operational updates from your cases.</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2.5">
                {recentActivity.length === 0 ? (
                  <li className="rounded-lg border border-border/35 bg-surface2/25 px-3 py-2.5 text-sm text-secondary">No updates yet.</li>
                ) : (
                  recentActivity.map((activity) => (
                    <li key={activity.id} className="rounded-lg border border-border/35 bg-surface2/25 px-3 py-2.5">
                      <div className="flex items-start gap-2">
                        <Clock3 className="mt-0.5 h-4 w-4 text-copper" />
                        <div>
                          <p className="text-sm text-text">{activity.title}</p>
                          <p className="mt-1 text-xs text-secondary">{activity.date}</p>
                        </div>
                      </div>
                    </li>
                  ))
                )}
              </ul>
              <Link href="/tax-return" className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-copper hover:text-text">
                Continue workflow
                <ArrowRight className="h-4 w-4" />
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
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
  const toneClass =
    tone === "success"
      ? "border-green/25 bg-green/7"
      : tone === "warning"
        ? "border-copper/25 bg-copper/7"
        : "border-border/35 bg-surface/35";

  const icon =
    tone === "success" ? <FolderCheck className="h-4 w-4 text-green" /> : tone === "warning" ? <Clock3 className="h-4 w-4 text-copper" /> : <ReceiptText className="h-4 w-4 text-muted" />;

  return (
    <Card variant="soft" padding="sm" className={cn("editorial-frame", toneClass)}>
      <div className="mb-2 flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-[0.14em] text-muted">{title}</p>
        {icon}
      </div>
      <p className="font-mono text-2xl font-semibold tracking-[-0.02em] text-text">{value}</p>
      <p className="mt-1 text-xs text-secondary">{note}</p>
    </Card>
  );
}
