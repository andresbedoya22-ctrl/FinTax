"use client";

import {
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Circle,
  RefreshCw,
  Settings,
  Shield,
} from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/lib/cn";

const chartBars = [35, 45, 52, 61, 58, 70, 85];

export function DashboardOverview() {
  const t = useTranslations("Dashboard.overview");
  const checklistItems = t.raw("checklistItems") as Array<{ label: string; done: boolean }>;
  const caseRows = t.raw("caseRows") as Array<{ label: string; amount: string }>;

  return (
    <section className="grid gap-5 xl:grid-cols-3">
      {/* ── CARD 1: Casus ── */}
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0D1E30] p-6">
          {/* Header */}
          <div className="mb-5 flex items-center gap-2">
            <h2 className="flex-1 text-xl font-bold text-white">{t("caseTitle")}</h2>
            <Settings className="size-5 text-white/40" aria-hidden="true" />
            <ArrowRight className="size-5 text-white/40" aria-hidden="true" />
          </div>

          {/* Status */}
          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm text-white/50">{t("statusLabel")}</span>
            <span className="text-base font-semibold text-white">{t("statusValue")}</span>
            <span className="text-base font-semibold text-green">te dienen</span>
          </div>

          {/* Deadline */}
          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm text-white/50">{t("deadlineLabel")}</span>
            <span className="text-lg font-bold text-white">{t("deadlineValue")}</span>
          </div>

          {/* Case rows */}
          <div className="space-y-2">
            {caseRows.map((row, idx) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/5 px-4 py-2.5 text-sm"
              >
                <span className="text-white/70">{row.label}</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-white">{row.amount}</span>
                  {idx === caseRows.length - 1 && (
                    <span className="text-green">›</span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Bottom CTA */}
          <button
            type="button"
            className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
          >
            <span>Controleer alles nog eens</span>
            <ChevronRight className="size-4 text-green" aria-hidden="true" />
          </button>
        </div>

        {/* Mini shield card */}
        <div className="flex items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0D1E30] px-5 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green/15">
            <Shield className="size-4 text-green" aria-hidden="true" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white">Klaar om in te ienen</p>
            <div className="mt-1.5 h-1.5 w-24 overflow-hidden rounded-full bg-white/10">
              <div className="h-full rounded-full bg-green" style={{ width: "85%" }} />
            </div>
          </div>
        </div>
      </div>

      {/* ── CARD 2: Checklist ── */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0D1E30] p-6">
        <h2 className="mb-5 text-xl font-bold text-white">{t("checklistTitle")}</h2>

        {/* Progress bar */}
        <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green to-teal"
            style={{ width: "85%" }}
          />
        </div>
        <p className="mt-1 text-right text-sm font-bold text-white">85%</p>

        {/* Checklist items */}
        <ul className="mt-4">
          {checklistItems.map((item) => (
            <li
              key={item.label}
              className="flex items-center gap-3 border-b border-white/[0.06] py-2.5 last:border-0"
            >
              {item.done ? (
                <CheckCircle2 className="size-5 shrink-0 text-green" aria-hidden="true" />
              ) : (
                <Circle className="size-5 shrink-0 text-white/20" aria-hidden="true" />
              )}
              <span className={cn("text-sm", item.done ? "text-white/80" : "text-white/30")}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>

        {/* Bottom link */}
        <button
          type="button"
          className="mt-4 flex cursor-pointer items-center gap-1.5 text-sm font-medium text-teal transition-colors hover:text-white"
        >
          <RefreshCw className="size-4" aria-hidden="true" />
          {t("progressLabel")}
        </button>
      </div>

      {/* ── CARD 3: Schatting van Teruggaaf ── */}
      <div className="rounded-2xl border border-white/[0.08] bg-[#0D1E30] p-6">
        <h2 className="text-xl font-bold text-white">{t("refundTitle")}</h2>

        {/* Big refund amount */}
        <p className="mb-4 mt-2 text-5xl font-black tracking-tight text-green">
          €{t("refundAmount")},00
        </p>

        {/* Toon details row */}
        <button
          type="button"
          className="mb-5 flex w-full cursor-pointer items-center justify-between rounded-xl border border-white/[0.08] bg-white/5 px-4 py-2.5"
        >
          <span className="text-sm text-white/70">Toon details ›</span>
          <ChevronDown className="size-4 text-white/40" aria-hidden="true" />
        </button>

        {/* Bar chart */}
        <div className="rounded-xl bg-white/[0.04] p-4">
          <p className="mb-3 text-xs uppercase tracking-wider text-white/40">{t("chartTitle")}</p>

          <div className="flex h-28 gap-1.5">
            {chartBars.map((bar, index) => {
              const isLast = index === chartBars.length - 1;
              const isSecondLast = index === chartBars.length - 2;
              return (
                <div key={`bar-${index}`} className="relative flex flex-1 items-end">
                  {isLast && (
                    <span className="absolute -top-5 inset-x-0 text-center text-xs font-medium text-green">
                      €3.450
                    </span>
                  )}
                  <div
                    className={cn(
                      "w-full rounded-t-sm",
                      isLast ? "bg-green" : isSecondLast ? "bg-teal/60" : "bg-white/15"
                    )}
                    style={{ height: `${bar}%` }}
                  />
                </div>
              );
            })}
          </div>

          {/* Chart x-labels */}
          <div className="mt-1 flex justify-between">
            <span className="text-[10px] text-white/30">Uur</span>
            <span className="text-[10px] text-white/30">Biebating</span>
            <span className="text-[10px] text-white/30">Kinaectylag</span>
          </div>
        </div>

        {/* Breakdown rows */}
        <div className="mt-4 space-y-2">
          {/* Dropdown selector row */}
          <div className="flex items-center justify-between rounded-xl border border-white/10 bg-white/[0.06] px-4 py-2.5 text-sm text-white/70">
            <div className="flex items-center gap-2">
              <span>INI : Zoergmeols</span>
              <ChevronDown className="size-3.5 text-white/40" aria-hidden="true" />
            </div>
            <span className="font-medium text-white">€ 6.455</span>
          </div>

          {/* Case row 0 */}
          {caseRows[0] && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-white/60">{caseRows[0].label}</span>
              <span className="text-white/80">{caseRows[0].amount}</span>
            </div>
          )}

          {/* Reeds betaald */}
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Reeds betaald</span>
            <span className="text-white/80">€ 1.200</span>
          </div>

          <div className="my-3 border-t border-white/[0.08]" />

          {/* Total */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-white">Totaairaal</span>
            <span className="text-lg font-black text-green">€1.045,00</span>
          </div>
        </div>

        {/* CTA button */}
        <button
          type="button"
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-green to-teal py-3 text-sm font-bold text-[#08111E] transition-all hover:opacity-90"
        >
          Aangifte Schatten
        </button>
      </div>
    </section>
  );
}
