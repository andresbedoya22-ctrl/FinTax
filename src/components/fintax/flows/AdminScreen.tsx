"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { Button } from "@/components/fintax/Button";
import { Card, CardBody, CardHeader } from "@/components/fintax/Card";
import { Badge, EmptyState, Skeleton } from "@/components/ui";
import { isApiClientError } from "@/hooks/api-client";
import { useCases } from "@/hooks/useCases";
import { useServicePricing } from "@/hooks/useServicePricing";
import type { CaseStatus } from "@/types/database";

export function AdminScreen() {
  const t = useTranslations("Admin");
  const casesQuery = useCases();
  const pricingQuery = useServicePricing();
  const cases = casesQuery.data ?? [];
  const pricingItems = pricingQuery.data ?? [];
  const [notes, setNotes] = React.useState<Record<string, string>>({});
  const [statusOverrides, setStatusOverrides] = React.useState<Record<string, CaseStatus>>({});

  const updateStatus = (id: string, status: CaseStatus) => {
    // Local-only UI state for status preview until admin mutation endpoint is wired.
    setStatusOverrides((prev) => ({ ...prev, [id]: status }));
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
                    <p className="text-xs text-muted">{item.id}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <select className="h-10 rounded-xl border border-border/35 bg-surface/45 px-3 text-sm text-text" value={statusOverrides[item.id] ?? item.status} onChange={(e) => updateStatus(item.id, e.target.value as CaseStatus)}>
                      {(["draft","pending_payment","paid","pending_authorization","authorized","in_review","pending_documents","submitted","completed","rejected"] as const).map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                    <Button type="button" size="sm" variant="secondary">{t("actions.notify")}</Button>
                  </div>
                </div>
                <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_auto_auto]">
                  <input
                    value={notes[item.id] ?? ""}
                    onChange={(e) => setNotes((prev) => ({ ...prev, [item.id]: e.target.value }))}
                    placeholder={t("placeholders.internalNote")}
                    className="h-10 rounded-xl border border-border/35 bg-surface/45 px-3 text-sm text-text outline-none"
                  />
                  <Button type="button" size="sm" variant="secondary">{t("actions.assign")}</Button>
                  <Button type="button" size="sm">{t("actions.save")}</Button>
                </div>
              </div>
            ))
          )}
        </CardBody>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><h3 className="text-base font-semibold text-text">{t("sections.users")}</h3></CardHeader>
          <CardBody className="space-y-2 text-sm text-secondary">
            <div className="rounded-xl border border-border/35 bg-surface2/20 px-4 py-3">demo@fintax.test · user</div>
            <div className="rounded-xl border border-border/35 bg-surface2/20 px-4 py-3">ops@fintax.test · admin</div>
            <div className="rounded-xl border border-border/35 bg-surface2/15 p-3">
              <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted">Queue placeholder</p>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-2/3" />
            </div>
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
