"use client";

import type * as React from "react";
import { AlertTriangle, ArrowRight, CheckCircle2, Clock3, CreditCard, FileText, Gift, UploadCloud } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { isApiClientError } from "@/hooks/api-client";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { useCases } from "@/hooks/useCases";
import { useNotifications } from "@/hooks/useNotifications";
import { useCaseEvents, useCaseProgress, useCaseRequirements } from "@/hooks/useTaxReturnDocFlow";
import { cn } from "@/lib/cn";
import { CASE_STEPPER_STEPS, mapCaseStatusToStep } from "@/domain/cases/status-stepper";
import type { Case, CaseType } from "@/types/database";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { StatusBadge } from "@/components/fintax/ui";

function formatDate(value: string | null | undefined, locale: string, fallbackLabel: string) {
  if (!value) return fallbackLabel;
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { year: "numeric", month: "short", day: "2-digit" }).format(parsed);
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
  const progress = progressQuery.data ?? requirementsQuery.data?.progress ?? null;
  const uploadedDocuments = progress?.uploaded ?? 0;
  const requiredDocuments = progress?.total ?? 0;
  const documentProgress = Math.round(progress?.completionRatio ?? 0);
  const currentStep = mapCaseStatusToStep(activeCase?.status ?? "draft");
  const profileName = profileQuery.profile?.full_name?.split(" ")[0] ?? t("home.fallbackName");
  const activeCaseTitle = activeCase?.display_name ?? (activeCase ? getDeclarationTypeLabel(activeCase.case_type, t) : "");
  const nextStepLabel = activeCase ? t(`stepper.${CASE_STEPPER_STEPS[Math.max(0, Math.min(currentStep - 1, CASE_STEPPER_STEPS.length - 1))]?.id ?? "draft"}`) : "";
  const pendingDocuments = Math.max(0, requiredDocuments - uploadedDocuments);
  const needsPayment = activeCase?.status === "pending_payment";
  const needsReview = Boolean(activeCase && ["in_review", "rejected", "pending_authorization"].includes(activeCase.status));
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
        : cases.slice(0, 3).map((item) => ({
            id: item.id,
            title: t("activity.caseUpdated", {
              caseLabel: item.display_name ?? getDeclarationTypeLabel(item.case_type, t),
            }),
            body: getStatusLabel(item.status, t),
            createdAt: formatDate(item.updated_at, locale, noDateLabel),
          }));

  const casesErrorCode = casesQuery.error && isApiClientError(casesQuery.error) ? casesQuery.error.code : null;
  const visibleActivity = recentActivity.slice(0, 3);

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

      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#74D07B]">{t("home.eyebrow")}</p>
          <h1 className="mt-3 text-[clamp(2.2rem,4vw,3.4rem)] font-bold leading-tight text-white">
            {t("home.greeting", { name: profileName })}
          </h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-[#C8D2DF]">{t("home.subtitle")}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/tax-return" data-testid="dashboard-main-cta-tax-return" className="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#4CAF50] px-5 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(76,175,80,0.22)] transition hover:bg-[#3F9E48]">
            <FileText className="mr-2 size-4" />
            {t("home.taxReturnCta")}
          </Link>
          <Link href="/benefits" data-testid="dashboard-main-cta-benefits" className="inline-flex h-12 items-center justify-center rounded-[16px] border border-white/[0.15] bg-white/[0.06] px-5 text-sm font-semibold text-white transition hover:border-[#4CAF50]/35 hover:bg-white/[0.1]">
            <Gift className="mr-2 size-4" />
            {t("home.benefitsCta")}
          </Link>
        </div>
      </div>

      {hasActiveCase ? (
        <DashboardPrimaryCaseCard
          title={activeCaseTitle}
          status={getStatusLabel(activeCase.status, t)}
          statusTone={getStatusTone(activeCase.status)}
          nextStep={nextStepLabel}
          progress={documentProgress}
          href={getCaseHref(activeCase)}
          cta={t("home.continueCta")}
          updated={formatDate(activeCase.updated_at, locale, noDateLabel)}
        />
      ) : (
        <DashboardEmptyState benefitsLabel={t("home.benefitsCta")} taxReturnLabel={t("home.taxReturnCta")} />
      )}

      {hasActiveCase ? (
        <div className="grid gap-4 md:grid-cols-3">
          <DashboardQuickActionCard
            icon={<UploadCloud className="size-5" />}
            title={t("home.documentsAction")}
            value={pendingDocuments > 0 ? t("home.pendingDocuments", { count: pendingDocuments }) : t("home.noPendingDocuments")}
            href={getCaseHref(activeCase)}
          />
          <DashboardQuickActionCard
            icon={<CreditCard className="size-5" />}
            title={t("home.paymentAction")}
            value={needsPayment ? t("home.paymentPending") : t("home.paymentClear")}
            href={getCaseHref(activeCase)}
          />
          <DashboardQuickActionCard
            icon={<AlertTriangle className="size-5" />}
            title={t("home.reviewAction")}
            value={needsReview ? t("home.reviewNeeded") : t("home.reviewClear")}
            href={getCaseHref(activeCase)}
          />
        </div>
      ) : null}

      {hasActiveCase ? (
        <DashboardSimpleTimeline
          steps={CASE_STEPPER_STEPS.map((step) => t(`stepper.${step.id}`))}
          currentStep={currentStep}
        />
      ) : null}

      {visibleActivity.length > 0 ? (
        <Card variant="glass" padding="md" className="rounded-[28px]" data-testid="dashboard-recent-activity">
          <CardHeader>
            <CardTitle className="text-white">{t("activity.title")}</CardTitle>
            <CardDescription className="text-[#C8D2DF]">{t("activity.description")}</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3">
              {visibleActivity.map((activity) => (
                <li key={activity.id} className="flex items-start gap-3 rounded-[18px] border border-white/10 bg-white/[0.045] px-4 py-3">
                  <Clock3 className="mt-0.5 size-4 text-[#74D07B]" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-white">{activity.title}</p>
                    <p className="mt-1 text-sm text-[#C8D2DF]">{activity.body}</p>
                    <p className="mt-2 text-xs text-[#9FB0C4]">{activity.createdAt}</p>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      ) : null}
    </section>
  );
}

function DashboardEmptyState({ benefitsLabel, taxReturnLabel }: { benefitsLabel: string; taxReturnLabel: string }) {
  const t = useTranslations("Dashboard.overview");

  return (
    <Card variant="glass" padding="lg" className="rounded-[30px]" data-testid="dashboard-empty-state">
      <CardContent className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="max-w-2xl">
          <div className="grid size-14 place-items-center rounded-[20px] bg-[#4CAF50]/[0.14] text-[#74D07B]">
            <FileText className="size-7" />
          </div>
          <h2 className="mt-5 text-3xl font-bold text-white">{t("home.emptyTitle")}</h2>
          <p className="mt-3 text-sm leading-6 text-[#C8D2DF]">{t("home.emptyBody")}</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row lg:flex-col">
          <Link href="/benefits" data-testid="dashboard-main-cta-benefits" className="inline-flex h-12 items-center justify-center rounded-[16px] bg-[#4CAF50] px-5 text-sm font-semibold text-white shadow-[0_16px_28px_rgba(76,175,80,0.22)] transition hover:bg-[#3F9E48]">
            <Gift className="mr-2 size-4" />
            {benefitsLabel}
          </Link>
          <Link href="/tax-return" data-testid="dashboard-main-cta-tax-return" className="inline-flex h-12 items-center justify-center rounded-[16px] border border-white/[0.15] bg-white/[0.06] px-5 text-sm font-semibold text-white transition hover:border-[#4CAF50]/35 hover:bg-white/[0.1]">
            <FileText className="mr-2 size-4" />
            {taxReturnLabel}
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardPrimaryCaseCard({
  title,
  status,
  statusTone,
  nextStep,
  progress,
  href,
  cta,
  updated,
}: {
  title: string;
  status: string;
  statusTone: "success" | "warning" | "neutral";
  nextStep: string;
  progress: number;
  href: string;
  cta: string;
  updated: string;
}) {
  const t = useTranslations("Dashboard.overview");

  return (
    <Card variant="glass" padding="lg" className="rounded-[30px]" data-testid="dashboard-primary-case-card">
      <CardContent className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge tone={statusTone}>{status}</StatusBadge>
            <span className="text-sm text-[#9FB0C4]">{t("home.updated", { value: updated })}</span>
          </div>
          <h2 className="mt-5 text-[clamp(1.8rem,3vw,2.7rem)] font-bold leading-tight text-white">{title}</h2>
          <p className="mt-3 text-sm leading-6 text-[#C8D2DF]">{t("home.nextStep", { step: nextStep })}</p>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-white/[0.045] p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-semibold uppercase tracking-[0.16em] text-[#9FB0C4]">{t("home.progress")}</span>
            <span className="font-mono text-sm font-semibold text-white">{progress}%</span>
          </div>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-[#4CAF50]" style={{ width: `${progress}%` }} />
          </div>
          <Link href={href} className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-[16px] bg-[#4CAF50] px-4 text-sm font-semibold text-white transition hover:bg-[#3F9E48]">
            {cta}
            <ArrowRight className="ml-2 size-4" />
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

function DashboardQuickActionCard({ icon, title, value, href }: { icon: React.ReactNode; title: string; value: string; href: string }) {
  return (
    <Link
      href={href}
      data-testid="dashboard-quick-action-card"
      className="rounded-[24px] border border-white/10 bg-white/[0.045] p-5 text-white transition hover:border-[#4CAF50]/35 hover:bg-white/[0.075]"
    >
      <span className="grid size-11 place-items-center rounded-[16px] bg-[#4CAF50]/[0.14] text-[#74D07B]">{icon}</span>
      <h3 className="mt-4 text-base font-bold">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[#C8D2DF]">{value}</p>
    </Link>
  );
}

function DashboardSimpleTimeline({ steps, currentStep }: { steps: string[]; currentStep: number }) {
  return (
    <Card variant="glass" padding="md" className="rounded-[28px]" data-testid="dashboard-simple-timeline">
      <CardContent>
        <ol className="grid gap-3 md:grid-cols-3 xl:grid-cols-6">
          {steps.map((step, index) => {
            const number = index + 1;
            const completed = number < currentStep;
            const current = number === currentStep;
            return (
              <li key={step} className={cn("rounded-[18px] border p-4", current ? "border-[#4CAF50]/45 bg-[#4CAF50]/[0.14]" : "border-white/10 bg-white/[0.035]")}>
                <div className={cn("grid size-8 place-items-center rounded-full text-sm font-semibold", completed ? "bg-[#4CAF50] text-white" : current ? "bg-[#EAF7EC] text-[#3F9E48]" : "bg-white/[0.08] text-[#9FB0C4]")}>
                  {completed ? <CheckCircle2 className="size-4" /> : number}
                </div>
                <p className="mt-3 text-sm font-semibold text-white">{step}</p>
              </li>
            );
          })}
        </ol>
      </CardContent>
    </Card>
  );
}
