"use client";

import { useLocale, useTranslations } from "next-intl";
import { Controller, type UseFormReturn } from "react-hook-form";

import { BenefitsOptionCard } from "@/components/fintax/flows/benefits/BenefitsOptionCard";
import type { BenefitCardKey, BenefitsFormValues } from "@/components/fintax/flows/benefits/wizard";
import { benefitIcons } from "@/components/fintax/ui";

const benefitKeys: BenefitCardKey[] = [
  "zorgtoeslag",
  "huurtoeslag",
  "kindgebondenBudget",
  "kinderopvangtoeslag",
];

function StepShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-5">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold tracking-normal text-white">{title}</h3>
        <p className="max-w-3xl text-sm leading-6 text-[#C8D2DF]">{description}</p>
      </div>
      <div className="grid gap-4">{children}</div>
    </section>
  );
}

function Panel({ children }: { children: React.ReactNode }) {
  return <div className="rounded-[24px] border border-white/10 bg-white/[0.06] p-4 text-white sm:p-5">{children}</div>;
}

export function BenefitsSelectionStep({ form }: { form: UseFormReturn<BenefitsFormValues> }) {
  const t = useTranslations("Benefits");
  const locale = useLocale();
  const shouldShowDebug = process.env.NODE_ENV === "development" || process.env.VITEST === "true";
  const helperText =
    locale === "es"
      ? "Selecciona al menos un subsidio para continuar."
      : "Select at least one benefit to continue.";

  return (
    <StepShell title={t("steps.start.title")} description={t("steps.start.description")}>
      <Panel>
        <Controller
          control={form.control}
          name="selectedBenefits"
          render={({ field }) => {
            const selected = field.value ?? [];

            const toggle = (key: BenefitCardKey) => {
              const next = selected.includes(key)
                ? selected.filter((item) => item !== key)
                : [...selected, key];

              field.onChange(Array.from(new Set(next)));
            };

            return (
              <div className="space-y-4">
                <div className="grid gap-3 md:grid-cols-2">
                  {benefitKeys.map((key) => {
                    const Icon = benefitIcons[key];

                    return (
                      <BenefitsOptionCard
                        key={key}
                        selected={selected.includes(key)}
                        title={t(`results.cards.${key}.title`)}
                        description={t(`results.cards.${key}.subtitle`)}
                        icon={<Icon className="size-6" />}
                        onToggle={() => toggle(key)}
                        testId={`benefit-option-${key}`}
                      />
                    );
                  })}
                </div>
                {selected.length === 0 ? (
                  <p className="text-sm font-medium text-[#A7F3D0]" data-testid="benefits-selection-help">
                    {helperText}
                  </p>
                ) : null}
                {shouldShowDebug ? (
                  <pre
                    className="overflow-x-auto rounded-[16px] border border-white/10 bg-[#061426]/70 px-4 py-3 text-xs text-[#C8D2DF]"
                    data-testid="benefits-debug-selected"
                  >
                    {JSON.stringify(selected)}
                  </pre>
                ) : null}
              </div>
            );
          }}
        />
      </Panel>
    </StepShell>
  );
}
