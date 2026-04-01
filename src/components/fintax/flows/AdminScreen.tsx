"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import * as React from "react";

import { Button } from "@/components/fintax/Button";
import { Card, CardBody, CardHeader } from "@/components/fintax/Card";
import { Badge, EmptyState, Skeleton } from "@/components/ui";
import { apiPatch, isApiClientError } from "@/hooks/api-client";
import { useAdminCases } from "@/hooks/useAdminCases";
import { useServicePricing } from "@/hooks/useServicePricing";
import type { AdminCase, CaseStatus } from "@/types/database";

const CASE_STATUSES: CaseStatus[] = [
  "draft",
  "pending_payment",
  "paid",
  "pending_authorization",
  "authorized",
  "in_review",
  "pending_documents",
  "submitted",
  "completed",
  "rejected",
];

export function AdminScreen() {
  const t = useTranslations("Admin");
  const queryClient = useQueryClient();
  const casesQuery = useAdminCases();
  const pricingQuery = useServicePricing();
  const cases = casesQuery.data ?? [];
  const pricingItems = pricingQuery.data ?? [];
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [statusOverrides, setStatusOverrides] = React.useState<Record<string, CaseStatus>>({});
  const [savingCaseId, setSavingCaseId] = React.useState<string | null>(null);
  const [bannerMessage, setBannerMessage] = React.useState<string | null>(null);
  const [bannerError, setBannerError] = React.useState<string | null>(null);

  const updateStatus = (id: string, status: CaseStatus) => {
    setStatusOverrides((prev) => ({ ...prev, [id]: status }));
  };

  const saveCase = async (item: AdminCase, options?: { assignToSelf?: boolean; sendNotification?: boolean }) => {
    setSavingCaseId(item.id);
    setBannerMessage(null);
    setBannerError(null);

    try {
      await apiPatch(`/api/admin/cases/${item.id}`, {
        status: statusOverrides[item.id] ?? item.status,
        notesInternal: notes[item.id] ?? item.notes_internal ?? null,
        assignToSelf: options?.assignToSelf ?? false,
        sendNotification: options?.sendNotification ?? false,
        locale: item.profile?.preferred_language ?? "en",
      });
      await queryClient.invalidateQueries({ queryKey: ["admin-cases"] });
      setBannerMessage("Admin update saved.");
    } catch (error) {
      setBannerError(isApiClientError(error) ? `Admin update failed: ${error.code}` : "Admin update failed.");
    } finally {
      setSavingCaseId(null);
    }
  };

  const casesErrorCode = casesQuery.error && isApiClientError(casesQuery.error) ? casesQuery.error.code : null;
  const pricingErrorCode = pricingQuery.error && isApiClientError(pricingQuery.error) ? pricingQuery.error.code : null;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-copper">Admin</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.03em] text-text">{t("title")}</h2>
        <p className="mt-2 text-sm text-secondary">{t("subtitle")}</p>
      </div>

      {bannerMessage ? <div className="rounded-xl border border-green/25 bg-green/10 px-4 py-3 text-sm text-green">{bannerMessage}</div> : null}
      {bannerError ? <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{bannerError}</div> : null}

      <div className="grid gap-4 lg:grid-cols-4">
        <Kpi title={t("kpi.activeCases")} value={String(cases.length)} tone="neutral" />
        <Kpi title={t("kpi.pendingPayment")} value={String(cases.filter((c) => c.status === "pending_payment").length)} tone="copper" />
        <Kpi title={t("kpi.inReview")} value={String(cases.filter((c) => c.status === "in_review").length)} tone="neutral" />
        <Kpi title={t("kpi.completed")} value={String(cases.filter((c) => c.status === "completed").length)} tone="success" />
      </div>

      <Card>
        <CardHeader><h3 className="text-base font-semibold text-text">{t("sections.caseManagement")}</h3></CardHeader>
        <CardBody className="space-y-3">
          {casesQuery.isLoading ? (
            <>
              <Skeleton className="h-20 w-full rounded-xl" />
              <Skeleton className="h-20 w-full rounded-xl" />
            </>
          ) : casesQuery.isError ? (
            <EmptyState
              title="Admin cases tijdelijk niet beschikbaar"
              description={casesErrorCode ? `API error code: ${casesErrorCode}` : "Controleer je sessie en probeer opnieuw."}
            />
          ) : cases.length === 0 ? (
            <EmptyState
              title="Geen actieve cases"
              description="Er zijn nog geen cases om te beheren."
            />
          ) : (
            cases.map((item) => (
              <div key={item.id} className="rounded-xl border border-border/35 bg-surface2/20 p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                  <div>
                    <div className="mb-1 flex flex-wrap items-center gap-2">
                      <Badge variant="neutral">{item.case_type}</Badge>
                      <span
                        className={
                          item.status === "pending_payment" || item.status === "pending_documents"
                            ? "inline-flex items-center rounded-full border border-amber-400/30 bg-amber-400/10 px-2 py-1 text-xs text-amber-200"
                            : item.status === "completed"
                              ? "inline-flex items-center rounded-full border border-green/25 bg-green/10 px-2 py-1 text-xs text-green"
                              : "inline-flex items-center rounded-full border border-copper/25 bg-copper/10 px-2 py-1 text-xs text-copper"
                        }
                      >
                        {item.status}
                      </span>
                    </div>
                    <p className="font-medium text-text">{item.display_name}</p>
                    <p className="text-xs text-muted">{item.profile?.full_name ?? "Unknown user"} · {item.profile?.email ?? "No email"}</p>
                    <p className="text-xs text-muted">{item.id}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select
                      className="h-10 rounded-xl border border-border/35 bg-surface/45 px-3 text-sm text-text"
                      value={statusOverrides[item.id] ?? item.status}
                      onChange={(e) => updateStatus(item.id, e.target.value as CaseStatus)}
                    >
                      {CASE_STATUSES.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <Button type="button" size="sm" variant="secondary" disabled={savingCaseId === item.id} onClick={() => void saveCase(item, { sendNotification: true })}>
                      {t("actions.notify")}
                    </Button>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
                  <input
                    value={notes[item.id] ?? item.notes_internal ?? ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    placeholder={t("placeholders.internalNote")}
                    className="h-10 rounded-xl border border-border/35 bg-surface/45 px-3 text-sm text-text outline-none"
                  />
                  <Button type="button" size="sm" variant="secondary" disabled={savingCaseId === item.id} onClick={() => void saveCase(item, { assignToSelf: true })}>
                    {t("actions.assign")}
                  </Button>
                  <Button type="button" size="sm" disabled={savingCaseId === item.id} onClick={() => void saveCase(item)}>
                    {t("actions.save")}
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <div className="grid gap-4 xl:grid-cols-[11fr_9fr]">
        <Card>
          <CardHeader><h3 className="text-base font-semibold text-text">{t("sections.users")}</h3></CardHeader>
          <CardBody className="space-y-2 text-sm text-secondary">
            {cases.slice(0, 5).map((item) => (
              <div key={`user-${item.id}`} className="rounded-xl border border-border/35 bg-surface2/20 px-4 py-3">
                {item.profile?.email ?? "unknown@fintax.local"} · {item.assigned_admin ? "assigned" : "unassigned"}
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="text-base font-semibold text-text">{t("sections.pricing")}</h3></CardHeader>
          <CardBody className="space-y-2">
            {pricingQuery.isLoading ? (
              <>
                <Skeleton className="h-10 w-full rounded-xl" />
                <Skeleton className="h-10 w-full rounded-xl" />
              </>
            ) : pricingQuery.isError ? (
              <EmptyState
                title="Pricing tijdelijk niet beschikbaar"
                description={pricingErrorCode ? `API error code: ${pricingErrorCode}` : "Kon service_pricing niet laden."}
              />
            ) : pricingItems.length === 0 ? (
              <EmptyState
                title="Geen prijsregels gevonden"
                description="Configureer minimaal een actieve service_pricing regel."
              />
            ) : (
              pricingItems.map((price) => (
                <div key={price.id} className="flex items-center justify-between rounded-xl border border-border/35 bg-surface2/20 px-4 py-3 text-sm text-secondary">
                  <span>{price.name}</span>
                  <span className="font-heading tracking-[-0.02em] text-green">EUR {price.price.toFixed(2)}</span>
                </div>
              ))
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ title, value, tone }: { title: string; value: string; tone: "neutral" | "success" | "copper" }) {
  const toneClass = tone === "success" ? "border-green/25 bg-green/8" : tone === "copper" ? "border-copper/25 bg-copper/8" : "border-border/35 bg-surface2/20";
  return (
    <Card>
      <CardBody className={toneClass}>
        <p className="text-xs uppercase tracking-[0.12em] text-muted">{title}</p>
        <p className="mt-1 font-heading text-2xl font-semibold text-text">{value}</p>
      </CardBody>
    </Card>
  );
}
