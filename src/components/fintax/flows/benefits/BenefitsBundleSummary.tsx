"use client";

import { ArrowRight, LifeBuoy } from "lucide-react";
import { useTranslations } from "next-intl";

import { Button } from "@/components/fintax/Button";

import type { BenefitCardKey } from "./wizard";

export function BenefitsBundleSummary({
  selectedKeys,
  selectedAmount,
}: {
  selectedKeys: BenefitCardKey[];
  selectedAmount: number;
}) {
  const t = useTranslations("Benefits");

  return (
    <section className="rounded-[28px] border border-border/50 bg-[linear-gradient(180deg,rgba(251,252,249,0.98),rgba(242,246,240,0.88))] p-5 shadow-[0_18px_44px_rgba(17,36,26,0.07)]">
      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">{t("bundle.eyebrow")}</p>
        <h3 className="font-heading text-2xl tracking-[-0.03em] text-text">{t("bundle.title")}</h3>
        <p className="text-sm leading-6 text-secondary">{t("bundle.copy")}</p>
      </div>

      <div className="mt-5 grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="rounded-[24px] border border-border/40 bg-white/80 p-4">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("bundle.selectedServicesLabel")}</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {selectedKeys.length > 0 ? (
              selectedKeys.map((key) => (
                <span key={key} className="rounded-full border border-green/25 bg-green/10 px-3 py-1 text-sm text-text">
                  {t(`results.cards.${key}.title`)}
                </span>
              ))
            ) : (
              <span className="text-sm text-secondary">{t("bundle.empty")}</span>
            )}
          </div>
          <div className="mt-5 rounded-[22px] border border-border/35 bg-surface2/45 p-4">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{t("bundle.recommendedNextLabel")}</p>
            <p className="mt-2 text-sm leading-6 text-text">
              {selectedKeys.length > 0 ? t("bundle.recommendedNextSelected") : t("bundle.recommendedNextNone")}
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-green/18 bg-[linear-gradient(180deg,rgba(19,78,50,0.97),rgba(30,97,63,0.93))] p-4 text-white">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-white/68">{t("bundle.annualImpactLabel")}</p>
          <p className="mt-2 font-heading text-3xl tracking-[-0.03em]">EUR {selectedAmount.toFixed(2)}</p>
          <p className="mt-2 text-sm leading-6 text-white/80">{t("bundle.annualImpactCopy")}</p>

          <div className="mt-5 grid gap-3">
            <Button type="button" className="justify-center bg-white text-green hover:bg-white/95" rightIcon={<ArrowRight className="size-4" />}>
              {t("bundle.continue")}
            </Button>
            <Button type="button" variant="secondary" className="justify-center border-white/20 bg-white/8 text-white hover:bg-white/12">
              <LifeBuoy className="size-4" />
              {t("bundle.askHelp")}
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
