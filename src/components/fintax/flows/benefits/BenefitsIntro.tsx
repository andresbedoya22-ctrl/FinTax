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
    <section className="relative overflow-hidden rounded-[32px] border border-border/55 bg-[linear-gradient(135deg,rgba(12,61,36,0.96),rgba(30,86,58,0.94)_48%,rgba(240,244,236,0.98)_120%)] px-6 py-7 text-white shadow-[0_28px_80px_rgba(16,40,29,0.24)] sm:px-8">
      <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_60%)]" />
      <div className="relative grid gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] lg:items-end">
        <div className="space-y-4">
          <div className="inline-flex items-center rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white/85">
            {t("intro.eyebrow")}
          </div>
          <div className="max-w-3xl space-y-3">
            <h1 className="font-heading text-[clamp(2.2rem,4vw,3.75rem)] leading-[0.95] tracking-[-0.04em]">
              {t("heroTitle")}
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-white/78 sm:text-base">{t("heroSubtitle")}</p>
          </div>
        </div>

        <div className="grid gap-3">
          {highlights.map(({ icon: Icon, label, value }) => (
            <div
              key={label}
              className="rounded-[24px] border border-white/16 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),rgba(255,255,255,0.05))] px-4 py-4 backdrop-blur"
            >
              <div className="mb-2 inline-flex size-9 items-center justify-center rounded-2xl border border-white/15 bg-white/10">
                <Icon className="size-4" />
              </div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/62">{label}</p>
              <p className="mt-1 text-sm font-medium text-white">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
