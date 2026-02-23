"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { Button } from "@/components/fintax/Button";
import { Card, CardBody, CardHeader } from "@/components/fintax/Card";
import { mockCases, mockServicePricing } from "@/lib/mock-data";
import type { CaseStatus } from "@/types/database";

export function AdminScreen() {
  const t = useTranslations("Admin");
  const [cases, setCases] = React.useState(mockCases);
  const [notes, setNotes] = React.useState<Record<string, string>>({});

  const updateStatus = (id: string, status: CaseStatus) => {
    setCases((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">{t("title")}</h2>
        <p className="mt-1 text-sm text-white/60">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 lg:grid-cols-4">
        <Kpi title={t("kpi.activeCases")} value={String(cases.length)} />
        <Kpi title={t("kpi.pendingPayment")} value={String(cases.filter((c) => c.status === "pending_payment").length)} />
        <Kpi title={t("kpi.inReview")} value={String(cases.filter((c) => c.status === "in_review").length)} />
        <Kpi title={t("kpi.completed")} value={String(cases.filter((c) => c.status === "completed").length)} />
      </div>

      <Card>
        <CardHeader><h3 className="text-base font-semibold text-white">{t("sections.caseManagement")}</h3></CardHeader>
        <CardBody className="space-y-3">
          {cases.map((item) => (
            <div key={item.id} className="rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-medium text-white">{item.display_name}</p>
                  <p className="text-xs text-white/50">{item.id} · {item.case_type}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select
                    className="h-10 rounded-xl border border-white/10 bg-[#0A1628] px-3 text-sm text-white"
                    value={item.status}
                    onChange={(e) => updateStatus(item.id, e.target.value as CaseStatus)}
                  >
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
                  className="h-10 rounded-xl border border-white/10 bg-[#0A1628] px-3 text-sm text-white outline-none"
                />
                <Button type="button" size="sm" variant="secondary">{t("actions.assign")}</Button>
                <Button type="button" size="sm">{t("actions.save")}</Button>
              </div>
            </div>
          ))}
        </CardBody>
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><h3 className="text-base font-semibold text-white">{t("sections.users")}</h3></CardHeader>
          <CardBody className="space-y-2 text-sm text-white/70">
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">demo@fintax.test · user</div>
            <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">ops@fintax.test · admin</div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="text-base font-semibold text-white">{t("sections.pricing")}</h3></CardHeader>
          <CardBody className="space-y-2">
            {mockServicePricing.map((price) => (
              <div key={price.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                <span>{price.name}</span>
                <span className="text-green">EUR {price.price.toFixed(2)}</span>
              </div>
            ))}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function Kpi({ title, value }: { title: string; value: string }) {
  return (
    <Card>
      <CardBody>
        <p className="text-xs text-white/50">{title}</p>
        <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      </CardBody>
    </Card>
  );
}
