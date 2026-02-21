"use client";

import { CheckCircle2, Clock3, Euro, FileCheck2 } from "lucide-react";
import { useTranslations } from "next-intl";

import { Card, CardBody, CardHeader } from "@/components/fintax/Card";

const chartBars = [35, 45, 52, 61, 58, 70, 85];

export function DashboardOverview() {
  const t = useTranslations("Dashboard.overview");
  const checklistItems = t.raw("checklistItems") as Array<{ label: string; done: boolean }>;
  const caseRows = t.raw("caseRows") as Array<{ label: string; amount: string }>;

  return (
    <section className="grid gap-4 xl:grid-cols-3">
      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-text">{t("caseTitle")}</h2>
        </CardHeader>
        <CardBody>
          <div className="mb-4 rounded-md border border-border/60 bg-surface2 p-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-secondary">{t("statusLabel")}</span>
              <span className="inline-flex items-center gap-1 rounded-full bg-teal/15 px-2 py-0.5 text-xs font-medium text-teal">
                <Clock3 className="size-3.5" />
                {t("statusValue")}
              </span>
            </div>
            <div className="mt-2 flex items-center justify-between text-sm">
              <span className="text-secondary">{t("deadlineLabel")}</span>
              <span className="font-medium text-text">{t("deadlineValue")}</span>
            </div>
          </div>

          <div className="space-y-2">
            {caseRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-md border border-border/50 px-3 py-2 text-sm"
              >
                <span className="text-secondary">{row.label}</span>
                <span className="font-medium text-text">{row.amount}</span>
              </div>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-text">{t("checklistTitle")}</h2>
        </CardHeader>
        <CardBody>
          <div className="mb-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-secondary">{t("progressLabel")}</span>
              <span className="font-semibold text-text">85%</span>
            </div>
            <div className="h-2 rounded-full bg-surface2">
              <div className="h-full w-[85%] rounded-full bg-green" />
            </div>
          </div>

          <ul className="space-y-3">
            {checklistItems.map((item) => (
              <li key={item.label} className="flex items-center gap-2 text-sm">
                <CheckCircle2
                  className={item.done ? "size-4 text-green" : "size-4 text-muted"}
                  aria-hidden="true"
                />
                <span className={item.done ? "text-secondary" : "text-muted"}>{item.label}</span>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      <Card>
        <CardHeader>
          <h2 className="text-lg font-semibold text-text">{t("refundTitle")}</h2>
        </CardHeader>
        <CardBody>
          <div className="mb-5 flex items-end gap-1">
            <Euro className="mb-1 size-6 text-green" aria-hidden="true" />
            <p className="text-4xl font-semibold tracking-tight text-green">{t("refundAmount")}</p>
          </div>

          <div className="rounded-md border border-border/60 bg-surface2 p-3">
            <p className="mb-3 text-xs uppercase tracking-[0.12em] text-muted">{t("chartTitle")}</p>
            <div className="flex h-24 items-end gap-2">
              {chartBars.map((bar, index) => (
                <div
                  key={`${bar}-${index}`}
                  className="flex-1 rounded-sm bg-gradient-to-t from-green to-teal"
                  style={{ height: `${bar}%` }}
                />
              ))}
            </div>
          </div>

          <div className="mt-4 inline-flex items-center gap-2 text-xs text-secondary">
            <FileCheck2 className="size-4 text-teal" />
            {t("chartNote")}
          </div>
        </CardBody>
      </Card>
    </section>
  );
}
