"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useTranslations } from "next-intl";

import { TaxPanel } from "./TaxReturnFormPrimitives";
import type { TaxReturnFormValues } from "./wizard";

export function TaxReturnDocumentChecklist({ values }: { values: TaxReturnFormValues }) {
  const t = useTranslations("TaxReturn");

  const items = [
    { key: "identity", done: Boolean(values.identity.fullName && values.identity.bsn) },
    { key: "annualStatement", done: values.income.employmentIncome <= 0 || Boolean(values.income.employerName && values.income.wageTaxWithheld > 0) },
    { key: "housing", done: Boolean(values.housing.address && values.housing.city && values.housing.postalCode) },
    { key: "assets", done: !values.assets.hasBox3Exposure || values.assets.taxpayerAssets > 0 || values.assets.partnerAssets > 0 },
    {
      key: "deductions",
      done:
        values.deductions.healthcareCosts + values.deductions.educationCosts + values.deductions.donationCosts === 0 ||
        values.deductions.otherContext.length > 0,
    },
  ] as const;

  return (
    <TaxPanel title={t("documents.title")} description={t("documents.description")}>
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.key} className="flex items-start gap-3 rounded-[22px] border border-border/45 bg-white/80 px-4 py-3.5">
            {item.done ? <CheckCircle2 className="mt-0.5 size-4 text-green" /> : <Circle className="mt-0.5 size-4 text-muted" />}
            <div>
              <p className="text-sm font-semibold text-text">{t(`documents.items.${item.key}.title`)}</p>
              <p className="mt-1 text-sm leading-6 text-secondary">{t(`documents.items.${item.key}.description`)}</p>
            </div>
          </li>
        ))}
      </ul>
    </TaxPanel>
  );
}
