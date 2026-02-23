"use client";

import { ArrowRight, CheckCircle2, ChevronRight, Circle } from "lucide-react";
import { useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

const chartBars = [35, 45, 52, 61, 58, 70, 85];

export function DashboardOverview() {
  const t = useTranslations("Dashboard.overview");
  const checklistItems = t.raw("checklistItems") as Array<{ label: string; done: boolean }>;
  const caseRows = t.raw("caseRows") as Array<{ label: string; amount: string }>;

  return (
    <section className="grid gap-5 xl:grid-cols-3">
      <div className="flex flex-col gap-5">
        <div className="rounded-2xl border border-white/[0.08] bg-[#0D1E30] p-6">
          <div className="mb-5 flex items-center gap-2">
            <h2 className="flex-1 text-xl font-bold text-white">{t("caseTitle")}</h2>
            <Link
              href="/tax-return"
              className="inline-flex items-center gap-1 text-sm text-teal transition-colors hover:text-white"
            >
              {t("openCase")}
              <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>

          <div className="mb-1 flex items-center gap-2">
            <span className="text-sm text-white/50">{t("statusLabel")}</span>
            <span className="rounded-full bg-green/15 px-2 py-0.5 text-sm font-semibold text-green">
              {t("statusValue")}
            </span>
          </div>

          <div className="mb-5 flex items-center justify-between">
            <span className="text-sm text-white/50">{t("deadlineLabel")}</span>
            <span className="text-base font-semibold text-white">{t("deadlineValue")}</span>
          </div>

          <div className="space-y-2">
            {caseRows.map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between rounded-xl border border-white/[0.08] bg-white/5 px-4 py-2.5 text-sm"
              >
                <span className="text-white/70">{row.label}</span>
                <span className="font-medium text-white">{row.amount}</span>
              </div>
            ))}
          </div>

          <Link
            href="/benefits"
            className="mt-4 flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 px-5 py-3 text-sm font-medium text-white transition-all hover:bg-white/10"
          >
            <span>{t("reviewBenefits")}</span>
            <ChevronRight className="size-4 text-green" aria-hidden="true" />
          </Link>
        </div>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#0D1E30] p-6">
        <h2 className="mb-5 text-xl font-bold text-white">{t("checklistTitle")}</h2>

        <div className="h-2.5 overflow-hidden rounded-full bg-white/[0.08]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-green to-teal"
            style={{ width: `${Math.round((checklistItems.filter((i) => i.done).length / checklistItems.length) * 100)}%` }}
          />
        </div>
        <p className="mt-1 text-right text-sm font-bold text-white">
          {Math.round((checklistItems.filter((i) => i.done).length / checklistItems.length) * 100)}%
        </p>

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
              <span className={cn("text-sm", item.done ? "text-white/80" : "text-white/50")}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>

        <Link
          href="/tax-return"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-teal transition-colors hover:text-white"
        >
          {t("progressLabel")}
          <ChevronRight className="size-4" aria-hidden="true" />
        </Link>
      </div>

      <div className="rounded-2xl border border-white/[0.08] bg-[#0D1E30] p-6">
        <h2 className="text-xl font-bold text-white">{t("refundTitle")}</h2>
        <p className="mb-4 mt-2 text-5xl font-black tracking-tight text-green">EUR {t("refundAmount")}</p>

        <div className="rounded-xl bg-white/[0.04] p-4">
          <p className="mb-3 text-xs uppercase tracking-wider text-white/40">{t("chartTitle")}</p>
          <div className="flex h-28 gap-1.5">
            {chartBars.map((bar, index) => (
              <div key={`bar-${index}`} className="flex flex-1 items-end">
                <div
                  className={cn(
                    "w-full rounded-t-sm",
                    index === chartBars.length - 1 ? "bg-green" : "bg-white/15"
                  )}
                  style={{ height: `${bar}%` }}
                />
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-white/50">{t("chartNote")}</p>
        </div>

        <div className="mt-4 space-y-2">
          {caseRows.map((row) => (
            <div key={`refund-${row.label}`} className="flex items-center justify-between text-sm">
              <span className="text-white/60">{row.label}</span>
              <span className="text-white/80">{row.amount}</span>
            </div>
          ))}
        </div>

        <Link
          href="/benefits"
          className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-gradient-to-r from-green to-teal py-3 text-sm font-bold text-[#08111E] transition-all hover:opacity-90"
        >
          {t("cta")}
        </Link>
      </div>
    </section>
  );
}
