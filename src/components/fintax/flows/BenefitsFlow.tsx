"use client";
/* eslint-disable react-hooks/incompatible-library */

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ChevronLeft, ChevronRight, CircleX, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/fintax/Button";
import { Card, CardBody, CardHeader } from "@/components/fintax/Card";
import { Badge, Skeleton, Stepper } from "@/components/ui";
import { calculateEligibility, type BenefitsWizardInput } from "@/lib/utils/eligibility-calculator";
import { loadWizardSnapshot, persistWizardSnapshot } from "@/lib/wizards/persistence";

const steps = ["personal", "income", "assets", "housing", "health", "children", "results"] as const;

const schema = z.object({
  age: z.number().min(0).max(120),
  householdType: z.enum(["single", "partners"]),
  annualIncome: z.number().min(0),
  assets: z.number().min(0),
  nlResident: z.boolean(),
  hasHealthInsurance: z.boolean(),
  hasIndependentHome: z.boolean(),
  hasRentalContract: z.boolean(),
  monthlyRent: z.number().min(0),
  childrenUnder18: z.number().min(0).max(12),
  receivesKinderbijslag: z.boolean(),
  childcareHoursPerMonth: z.number().min(0),
  childcareType: z.enum(["daycare", "outOfSchoolCare", "childminder"]),
  childcareHourlyRate: z.number().min(0),
  registeredChildcare: z.boolean(),
  bothParentsWork: z.boolean(),
});

type FormValues = z.infer<typeof schema>;

const defaults: FormValues = {
  age: 30,
  householdType: "single",
  annualIncome: 32000,
  assets: 15000,
  nlResident: true,
  hasHealthInsurance: true,
  hasIndependentHome: true,
  hasRentalContract: true,
  monthlyRent: 950,
  childrenUnder18: 0,
  receivesKinderbijslag: false,
  childcareHoursPerMonth: 0,
  childcareType: "daycare",
  childcareHourlyRate: 10,
  registeredChildcare: false,
  bothParentsWork: false,
};

export function BenefitsFlow() {
  const t = useTranslations("Benefits");
  const form = useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: defaults });
  const [step, setStep] = React.useState(0);
  const [bundleSelected, setBundleSelected] = React.useState<string[]>([]);

  React.useEffect(() => {
    form.reset(loadWizardSnapshot<FormValues>("fintax-benefits-wizard", defaults));
  }, [form]);

  React.useEffect(() => {
    const sub = form.watch((values) => {
      void persistWizardSnapshot({ storageKey: "fintax-benefits-wizard", payload: { ...(values as Record<string, unknown>), currentStep: step } });
    });
    return () => sub.unsubscribe();
  }, [form, step]);

  const values = form.watch();
  const results = calculateEligibility(values as BenefitsWizardInput);

  const next = async () => {
    const fields: Array<(keyof FormValues)[]> = [
      ["age", "householdType", "nlResident"],
      ["annualIncome"],
      ["assets"],
      ["hasIndependentHome", "hasRentalContract", "monthlyRent"],
      ["hasHealthInsurance"],
      ["childrenUnder18", "receivesKinderbijslag", "childcareHoursPerMonth", "childcareType", "childcareHourlyRate", "registeredChildcare", "bothParentsWork"],
      [],
    ];
    const ok = await form.trigger(fields[step]);
    if (!ok) return;
    setStep((s) => Math.min(s + 1, steps.length - 1));
  };

  const prev = () => setStep((s) => Math.max(s - 1, 0));

  const toggleBundle = (id: string) =>
    setBundleSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const bundlePrice = bundleSelected.length === 0 ? 0 : Math.max(39, bundleSelected.length * 39 - (bundleSelected.length >= 2 ? 10 : 0));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-copper">Benefits flow</p>
        <h2 className="mt-2 font-heading text-3xl tracking-[-0.03em] text-text">{t("heroTitle")}</h2>
        <p className="mt-2 text-sm text-secondary">{t("heroSubtitle")}</p>
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="font-heading text-xl font-semibold text-text">{t("wizardTitle")}</h3>
            <p className="text-sm text-secondary">{t(`steps.${steps[step]}.title`)}</p>
          </div>
          <div className="min-w-0 sm:max-w-[52%]">
            <Stepper
              steps={steps.map((key, idx) => ({ id: key, label: `${idx + 1}. ${t(`steps.${key}.short`)}` }))}
              currentStep={step + 1}
            />
          </div>
        </CardHeader>
        <CardBody>
          <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="rounded-xl border border-border/35 bg-surface2/25 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Eligibility intake progress</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-copper to-green" style={{ width: `${Math.round(((step + 1) / steps.length) * 100)}%` }} />
              </div>
              <p className="mt-2 text-xs text-secondary">{Math.round(((step + 1) / steps.length) * 100)}% complete</p>
            </div>
            <div className="hidden w-44 rounded-xl border border-border/35 bg-surface2/20 p-3 md:block">
              <p className="mb-2 text-xs uppercase tracking-[0.14em] text-muted">Rules load</p>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-5/6" />
              <Skeleton className="mt-2 h-3 w-3/4" />
            </div>
          </div>
          <form className="space-y-5" onSubmit={form.handleSubmit(() => undefined)} noValidate>
            {step === 0 && (
              <div className="grid gap-4 md:grid-cols-3">
                <Field label={t("fields.age")} error={form.formState.errors.age?.message}><input type="number" className={inputClass} {...form.register("age", { valueAsNumber: true })} /></Field>
                <Field label={t("fields.householdType")}>
                  <select className={inputClass} {...form.register("householdType")}>
                    <option value="single">{t("options.single")}</option>
                    <option value="partners">{t("options.partners")}</option>
                  </select>
                </Field>
                <Toggle label={t("fields.nlResident")} checked={values.nlResident} onChange={(v) => form.setValue("nlResident", v)} />
              </div>
            )}

            {step === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t("fields.annualIncome")} error={form.formState.errors.annualIncome?.message}><input type="number" className={inputClass} {...form.register("annualIncome", { valueAsNumber: true })} /></Field>
                <ResultHint label={t("hints.zorgIncomeMax")} value={values.householdType === "single" ? "EUR 40,857" : "EUR 51,142"} />
              </div>
            )}

            {step === 2 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t("fields.assets")} error={form.formState.errors.assets?.message}><input type="number" className={inputClass} {...form.register("assets", { valueAsNumber: true })} /></Field>
                <ResultHint label={t("hints.assetThresholds")} value={values.householdType === "single" ? "EUR 38,479 / 146,011" : "EUR 76,958 / 184,633"} />
              </div>
            )}

            {step === 3 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Toggle label={t("fields.hasIndependentHome")} checked={values.hasIndependentHome} onChange={(v) => form.setValue("hasIndependentHome", v)} />
                <Toggle label={t("fields.hasRentalContract")} checked={values.hasRentalContract} onChange={(v) => form.setValue("hasRentalContract", v)} />
                <Field label={t("fields.monthlyRent")} error={form.formState.errors.monthlyRent?.message}><input type="number" className={inputClass} {...form.register("monthlyRent", { valueAsNumber: true })} /></Field>
                <ResultHint label={t("hints.huurRentCap")} value={values.age < 23 ? "EUR 498.20" : "EUR 932.93"} />
              </div>
            )}

            {step === 4 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Toggle label={t("fields.hasHealthInsurance")} checked={values.hasHealthInsurance} onChange={(v) => form.setValue("hasHealthInsurance", v)} />
                <ResultHint label={t("hints.zorgMax")} value={values.householdType === "single" ? "EUR 1,574 / year" : "EUR 3,010 / year"} />
              </div>
            )}

            {step === 5 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t("fields.childrenUnder18")} error={form.formState.errors.childrenUnder18?.message}><input type="number" className={inputClass} {...form.register("childrenUnder18", { valueAsNumber: true })} /></Field>
                <Toggle label={t("fields.receivesKinderbijslag")} checked={values.receivesKinderbijslag} onChange={(v) => form.setValue("receivesKinderbijslag", v)} />
                <Field label={t("fields.childcareHoursPerMonth")} error={form.formState.errors.childcareHoursPerMonth?.message}><input type="number" className={inputClass} {...form.register("childcareHoursPerMonth", { valueAsNumber: true })} /></Field>
                <Field label={t("fields.childcareType")}>
                  <select className={inputClass} {...form.register("childcareType")}>
                    <option value="daycare">{t("options.daycare")}</option>
                    <option value="outOfSchoolCare">{t("options.outOfSchoolCare")}</option>
                    <option value="childminder">{t("options.childminder")}</option>
                  </select>
                </Field>
                <Field label={t("fields.childcareHourlyRate")} error={form.formState.errors.childcareHourlyRate?.message}><input type="number" className={inputClass} {...form.register("childcareHourlyRate", { valueAsNumber: true })} /></Field>
                <Toggle label={t("fields.registeredChildcare")} checked={values.registeredChildcare} onChange={(v) => form.setValue("registeredChildcare", v)} />
                <Toggle label={t("fields.bothParentsWork")} checked={values.bothParentsWork} onChange={(v) => form.setValue("bothParentsWork", v)} />
              </div>
            )}

            {step === 6 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border/35 bg-surface2/25 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="size-4 text-teal" />
                    <p className="text-sm font-semibold text-text">{t("results.totalLabel")}: EUR {results.totalEstimatedAnnualAmount.toFixed(2)}</p>
                  </div>
                  <p className="mt-2 text-sm text-secondary">{t("results.copy")}</p>
                </div>

                <div className="grid gap-3 md:grid-cols-2">
                  {([
                    ["zorgtoeslag", results.zorgtoeslag],
                    ["huurtoeslag", results.huurtoeslag],
                    ["kindgebondenBudget", results.kindgebondenBudget],
                    ["kinderopvangtoeslag", results.kinderopvangtoeslag],
                  ] as const).map(([key, result]) => (
                    <button
                      type="button"
                      key={key}
                      onClick={() => result.eligible && toggleBundle(key)}
                      className={`rounded-xl border p-4 text-left transition-colors ${result.eligible ? "border-green/30 bg-green/8 hover:bg-green/12" : "border-border/35 bg-surface2/20"}`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <p className="font-medium text-text">{t(`results.cards.${key}.title`)}</p>
                        {result.eligible ? <CheckCircle2 className="size-4 text-green" /> : <CircleX className="size-4 text-error" />}
                      </div>
                      <p className="mt-1 text-sm text-secondary">
                        {result.eligible ? t("results.eligible") : t("results.notEligible")}
                      </p>
                      <p className="mt-2 font-heading text-xl font-semibold text-green">EUR {result.estimatedAnnualAmount.toFixed(2)}</p>
                      <p className="mt-2 text-xs text-muted">{t("results.applyFee")}</p>
                      {result.eligible && (
                        <p className="mt-1 text-xs text-copper">
                          {bundleSelected.includes(key) ? t("results.selected") : t("results.select")}
                        </p>
                      )}
                    </button>
                  ))}
                </div>

                <div className="rounded-xl border border-border/35 bg-surface2/25 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-secondary">{t("bundle.label")}: {bundleSelected.length}</p>
                    <Badge variant="copper">Bundle</Badge>
                  </div>
                  <p className="mt-1 font-heading text-2xl font-semibold text-text">EUR {bundlePrice.toFixed(2)}</p>
                  <Button type="button" className="mt-3">{t("bundle.checkout")}</Button>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-border/35 pt-4">
              <Button type="button" variant="ghost" onClick={prev} disabled={step === 0} leftIcon={<ChevronLeft className="size-4" />}>
                {t("back")}
              </Button>
              <Button type="button" onClick={next} rightIcon={<ChevronRight className="size-4" />}>
                {step === steps.length - 1 ? t("finish") : t("next")}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted">{label}</span>
      {children}
      {error ? <span className="text-xs text-error">{error}</span> : null}
    </label>
  );
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex h-11 items-center justify-between rounded-xl border px-3 text-sm ${checked ? "border-green/40 bg-green/10 text-text" : "border-border/35 bg-surface2/25 text-secondary"}`}
    >
      <span>{label}</span>
      <span className={`h-2.5 w-2.5 rounded-full ${checked ? "bg-green" : "bg-white/30"}`} />
    </button>
  );
}

function ResultHint({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/35 bg-surface2/20 px-4 py-3">
      <p className="text-xs uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="text-sm font-medium text-text">{value}</p>
    </div>
  );
}

const inputClass = "h-11 w-full rounded-xl border border-border/35 bg-surface/45 px-3 text-sm text-text outline-none focus:border-copper/40";
