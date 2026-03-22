"use client";

import { FileCheck2, ShieldCheck, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

import { Badge } from "@/components/ui";
import { cn } from "@/lib/cn";

import { taxReturnServices, type TaxReturnServiceKey } from "./wizard";

export function TaxReturnIntro({
  selectedService,
  onSelectService,
  hasSavedProgress,
}: {
  selectedService: TaxReturnServiceKey;
  onSelectService: (service: TaxReturnServiceKey) => void;
  hasSavedProgress: (service: TaxReturnServiceKey) => boolean;
}) {
  const t = useTranslations("TaxReturn");

  const highlights = [
    { icon: ShieldCheck, label: t("intro.highlights.scopeLabel"), value: t("intro.highlights.scopeValue") },
    { icon: FileCheck2, label: t("intro.highlights.documentsLabel"), value: t("intro.highlights.documentsValue") },
    { icon: Sparkles, label: t("intro.highlights.reviewLabel"), value: t("intro.highlights.reviewValue") },
  ];

  return (
    <section className="space-y-5">
      <div className="relative overflow-hidden rounded-[28px] border border-border/55 bg-[linear-gradient(135deg,rgba(17,61,42,0.98),rgba(31,87,58,0.94)_48%,rgba(240,244,236,0.99)_130%)] px-5 py-5 text-white shadow-[0_24px_64px_rgba(16,40,29,0.22)] sm:rounded-[32px] sm:px-7 sm:py-7 lg:px-8">
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.2),transparent_60%)]" />
        <div className="relative grid gap-5 lg:grid-cols-[minmax(0,1fr)_22rem] lg:items-end">
          <div className="space-y-3 sm:space-y-4">
            <div className="inline-flex items-center rounded-full border border-white/18 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/85 sm:text-[11px]">
              {t("intro.eyebrow")}
            </div>
            <div className="max-w-3xl space-y-2.5 sm:space-y-3">
              <h1 className="font-heading text-[clamp(2rem,4vw,3.6rem)] leading-[0.97] tracking-[-0.04em]">{t("heroTitle")}</h1>
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
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {taxReturnServices.map((service) => {
          const isActive = selectedService === service.id;
          const saved = hasSavedProgress(service.id);

          return (
            <button
              key={service.id}
              type="button"
              onClick={() => onSelectService(service.id)}
              className={cn(
                "flex h-full flex-col rounded-[24px] border px-4 py-4 text-left shadow-[0_14px_36px_rgba(18,38,28,0.05)] transition-all",
                isActive
                  ? "border-green/45 bg-[linear-gradient(180deg,rgba(32,111,74,0.12),rgba(255,255,255,0.96))]"
                  : "border-border/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.95),rgba(246,249,244,0.88))] hover:border-green/25",
              )}
            >
              <div className="flex items-center justify-between gap-2">
                <Badge variant={isActive ? "copper" : "neutral"}>{t(`services.${service.translationKey}.badge`)}</Badge>
                {saved ? <Badge variant="success">{t("savedBadge")}</Badge> : null}
              </div>
              <h2 className="mt-4 text-base font-semibold text-text">{t(`services.${service.translationKey}.title`)}</h2>
              <p className="mt-2 text-sm leading-6 text-secondary">{t(`services.${service.translationKey}.description`)}</p>
              <div className="mt-4 flex flex-1 items-end justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("priceLabel")}</p>
                  <p className="mt-1 font-heading text-2xl text-text">EUR {service.priceFrom}</p>
                </div>
                <span className="text-sm font-medium text-green">{saved ? t("continue") : t("start")}</span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
}
