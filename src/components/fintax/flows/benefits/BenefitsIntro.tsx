"use client";

import { FileCheck2, ShieldCheck, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

export function BenefitsIntro() {
  const t = useTranslations("Benefits");

  const highlights = [
    { icon: ShieldCheck, label: t("intro.highlights.rulesLabel"), value: t("intro.highlights.rulesValue") },
    { icon: FileCheck2, label: t("intro.highlights.scopeLabel"), value: t("intro.highlights.scopeValue") },
    { icon: Sparkles, label: t("intro.highlights.reviewLabel"), value: t("intro.highlights.reviewValue") },
  ];

  return (
    <section className="relative overflow-hidden rounded-[28px] border border-border/55 bg-[linear-gradient(135deg,rgba(12,61,36,0.96),rgba(30,86,58,0.94)_48%,rgba(240,244,236,0.98)_120%)] px-5 py-5 text-white shadow-[0_24px_64px_rgba(16,40,29,0.22)] sm:rounded-[32px] sm:px-7 sm:py-7 lg:px-8">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_60%)]" />
      <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-end">
        <div className="space-y-3 sm:space-y-4">
          <div className="inline-flex items-center rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85 sm:text-[11px]">
            {t("intro.eyebrow")}
          </div>
          <div className="max-w-3xl space-y-2.5 sm:space-y-3">
            <h1 className="font-heading text-[clamp(2rem,4vw,3.75rem)] leading-[0.97] tracking-[-0.04em]">
              {t("heroTitle")}
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-white/78 sm:text-base sm:leading-7">{t("heroSubtitle")}</p>
          </div>
        </div>

        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-1 lg:gap-3">
          {highlights.map(({ icon: Icon, label, value }, index) => (
            <div
              key={label}
              className={`rounded-[22px] border border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.05))] px-3.5 py-3.5 backdrop-blur sm:px-4 sm:py-4 ${index === 2 ? "sm:col-span-2 lg:col-span-1" : ""}`}
            >
              <div className="mb-2 inline-flex size-8 items-center justify-center rounded-2xl border border-white/15 bg-white/10 sm:size-9">
                <Icon className="size-3.5 sm:size-4" />
              </div>
              <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-white/62 sm:text-[11px]">{label}</p>
              <p className="mt-1 text-sm font-medium leading-6 text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
