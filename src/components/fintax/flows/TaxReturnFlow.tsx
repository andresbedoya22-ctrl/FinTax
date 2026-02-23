"use client";
/* eslint-disable react-hooks/incompatible-library */

import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, ChevronLeft, ChevronRight, FileCheck2, Landmark, LockKeyhole, Receipt, Wallet } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/fintax/Button";
import { Card, CardBody, CardHeader } from "@/components/fintax/Card";
import { loadWizardSnapshot, persistWizardSnapshot } from "@/lib/wizards/persistence";

const taxWizardSchema = z.object({
  fullName: z.string().min(2),
  bsn: z.string().min(4),
  taxYear: z.number().int().min(2020).max(2030),
  employerName: z.string().min(2),
  grossIncome: z.number().min(0),
  monthsWorked: z.number().min(0).max(12),
  address: z.string().min(5),
  monthlyRent: z.number().min(0),
  ownsHome: z.boolean(),
  box3Assets: z.number().min(0),
  partnerAssets: z.number().min(0),
  healthcareCosts: z.number().min(0),
  educationCosts: z.number().min(0),
  donationCosts: z.number().min(0),
  machtigingCode: z.string().optional(),
});

type TaxWizardValues = z.infer<typeof taxWizardSchema>;

type ServiceCard = {
  id: string;
  title: string;
  price: number;
  description: string;
};

const stepKeys = [
  "personal",
  "employment",
  "housing",
  "assets",
  "deductions",
  "summary",
  "postPayment",
] as const;

const defaultValues: TaxWizardValues = {
  fullName: "",
  bsn: "",
  taxYear: 2025,
  employerName: "",
  grossIncome: 0,
  monthsWorked: 12,
  address: "",
  monthlyRent: 0,
  ownsHome: false,
  box3Assets: 0,
  partnerAssets: 0,
  healthcareCosts: 0,
  educationCosts: 0,
  donationCosts: 0,
  machtigingCode: "",
};

function estimateRefund(values: TaxWizardValues) {
  const deductionTotal = values.healthcareCosts + values.educationCosts + values.donationCosts;
  const assetsPenalty = Math.max(0, (values.box3Assets + values.partnerAssets - 57000) * 0.01);
  const grossBase = Math.max(0, values.grossIncome * 0.06);
  return Math.max(0, Math.round((grossBase + deductionTotal * 0.18 - assetsPenalty) * 100) / 100);
}

export function TaxReturnFlow() {
  const t = useTranslations("TaxReturn");
  const [selectedService, setSelectedService] = React.useState<string>("tax_return_p");
  const [currentStep, setCurrentStep] = React.useState(0);
  const [paymentCompleted, setPaymentCompleted] = React.useState(false);

  const services = React.useMemo<ServiceCard[]>(
    () => [
      { id: "tax_return_p", title: t("services.formP.title"), price: 89, description: t("services.formP.description") },
      { id: "tax_return_m", title: t("services.formM.title"), price: 119, description: t("services.formM.description") },
      { id: "tax_return_c", title: t("services.formC.title"), price: 99, description: t("services.formC.description") },
      { id: "tax_return_w", title: t("services.zzp.title"), price: 149, description: t("services.zzp.description") },
      { id: "btw_declaration", title: t("services.btw.title"), price: 59, description: t("services.btw.description") },
    ],
    [t]
  );

  const form = useForm<TaxWizardValues>({
    resolver: zodResolver(taxWizardSchema),
    defaultValues,
  });

  React.useEffect(() => {
    form.reset(loadWizardSnapshot<TaxWizardValues>(`fintax-tax-${selectedService}`, defaultValues));
    setCurrentStep(0);
  }, [form, selectedService]);

  React.useEffect(() => {
    const subscription = form.watch((values) => {
      void persistWizardSnapshot({
        storageKey: `fintax-tax-${selectedService}`,
        caseId: undefined,
        payload: { ...values, selectedService },
      });
    });
    return () => subscription.unsubscribe();
  }, [form, selectedService]);

  const values = form.watch();
  const refund = estimateRefund(values);
  const selectedPrice = services.find((service) => service.id === selectedService)?.price ?? 0;

  const nextStep = async () => {
    const fieldsByStep: Array<(keyof TaxWizardValues)[]> = [
      ["fullName", "bsn", "taxYear"],
      ["employerName", "grossIncome", "monthsWorked"],
      ["address", "monthlyRent", "ownsHome"],
      ["box3Assets", "partnerAssets"],
      ["healthcareCosts", "educationCosts", "donationCosts"],
      [],
      ["machtigingCode"],
    ];
    const valid = await form.trigger(fieldsByStep[currentStep]);
    if (!valid) return;
    setCurrentStep((prev) => Math.min(prev + 1, stepKeys.length - 1));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-white">{t("catalogTitle")}</h2>
        <p className="mt-1 text-sm text-white/60">{t("catalogSubtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {services.map((service) => {
          const isActive = selectedService === service.id;
          const hasSavedProgress = typeof window !== "undefined" && window.localStorage.getItem(`fintax-tax-${service.id}`);
          return (
            <Card key={service.id} className={isActive ? "border-green/60" : undefined}>
              <CardHeader className="space-y-1">
                <h3 className="text-sm font-semibold text-white">{service.title}</h3>
                <p className="text-xs text-white/50">{service.description}</p>
              </CardHeader>
              <CardBody>
                <p className="text-2xl font-bold text-green">EUR {service.price}</p>
                <Button
                  type="button"
                  size="sm"
                  className="mt-4 w-full"
                  variant={isActive ? "primary" : "secondary"}
                  onClick={() => setSelectedService(service.id)}
                >
                  {hasSavedProgress ? t("continue") : t("start")}
                </Button>
              </CardBody>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">{t("wizardTitle")}</h3>
            <p className="text-sm text-white/60">{t(`steps.${stepKeys[currentStep]}.title`)}</p>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {stepKeys.map((step, index) => (
              <span
                key={step}
                className={
                  index <= currentStep
                    ? "rounded-full bg-green/15 px-2 py-1 text-xs font-medium text-green"
                    : "rounded-full bg-white/5 px-2 py-1 text-xs text-white/50"
                }
              >
                {index + 1}. {t(`steps.${step}.short`) }
              </span>
            ))}
          </div>
        </CardHeader>
        <CardBody>
          <form className="space-y-5" onSubmit={form.handleSubmit(() => undefined)} noValidate>
            {currentStep === 0 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t("fields.fullName")} error={form.formState.errors.fullName?.message}>
                  <input className={inputClass} {...form.register("fullName")} />
                </Field>
                <Field label={t("fields.bsn")} error={form.formState.errors.bsn?.message}>
                  <input className={inputClass} {...form.register("bsn")} />
                </Field>
                <Field label={t("fields.taxYear")} error={form.formState.errors.taxYear?.message}>
                  <input type="number" className={inputClass} {...form.register("taxYear", { valueAsNumber: true })} />
                </Field>
              </div>
            )}

            {currentStep === 1 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t("fields.employerName")} error={form.formState.errors.employerName?.message}>
                  <input className={inputClass} {...form.register("employerName")} />
                </Field>
                <Field label={t("fields.grossIncome")} error={form.formState.errors.grossIncome?.message}>
                  <input type="number" className={inputClass} {...form.register("grossIncome", { valueAsNumber: true })} />
                </Field>
                <Field label={t("fields.monthsWorked")} error={form.formState.errors.monthsWorked?.message}>
                  <input type="number" className={inputClass} {...form.register("monthsWorked", { valueAsNumber: true })} />
                </Field>
              </div>
            )}

            {currentStep === 2 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t("fields.address")} error={form.formState.errors.address?.message}>
                  <input className={inputClass} {...form.register("address")} />
                </Field>
                <Field label={t("fields.monthlyRent")} error={form.formState.errors.monthlyRent?.message}>
                  <input type="number" className={inputClass} {...form.register("monthlyRent", { valueAsNumber: true })} />
                </Field>
                <label className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                  <input type="checkbox" {...form.register("ownsHome")} />
                  {t("fields.ownsHome")}
                </label>
              </div>
            )}

            {currentStep === 3 && (
              <div className="grid gap-4 md:grid-cols-2">
                <Field label={t("fields.box3Assets")} error={form.formState.errors.box3Assets?.message}>
                  <input type="number" className={inputClass} {...form.register("box3Assets", { valueAsNumber: true })} />
                </Field>
                <Field label={t("fields.partnerAssets")} error={form.formState.errors.partnerAssets?.message}>
                  <input type="number" className={inputClass} {...form.register("partnerAssets", { valueAsNumber: true })} />
                </Field>
              </div>
            )}

            {currentStep === 4 && (
              <div className="grid gap-4 md:grid-cols-3">
                <Field label={t("fields.healthcareCosts")} error={form.formState.errors.healthcareCosts?.message}>
                  <input type="number" className={inputClass} {...form.register("healthcareCosts", { valueAsNumber: true })} />
                </Field>
                <Field label={t("fields.educationCosts")} error={form.formState.errors.educationCosts?.message}>
                  <input type="number" className={inputClass} {...form.register("educationCosts", { valueAsNumber: true })} />
                </Field>
                <Field label={t("fields.donationCosts")} error={form.formState.errors.donationCosts?.message}>
                  <input type="number" className={inputClass} {...form.register("donationCosts", { valueAsNumber: true })} />
                </Field>
              </div>
            )}

            {currentStep === 5 && (
              <div className="grid gap-4 lg:grid-cols-3">
                <SummaryTile icon={FileCheck2} title={t("summary.estimate")} value={`EUR ${refund.toFixed(2)}`} />
                <SummaryTile icon={Receipt} title={t("summary.serviceFee")} value={`EUR ${selectedPrice.toFixed(2)}`} />
                <SummaryTile icon={Wallet} title={t("summary.netPotential")} value={`EUR ${Math.max(0, refund - selectedPrice).toFixed(2)}`} />
                <div className="lg:col-span-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="text-sm text-white/70">{t("summary.copy")}</p>
                  <Button type="button" className="mt-4" onClick={() => setPaymentCompleted(true)}>
                    {paymentCompleted ? t("summary.paid") : t("summary.pay")}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-white">
                    <LockKeyhole className="size-4 text-teal" />
                    <h4 className="font-medium">{t("postPayment.machtigingTitle")}</h4>
                  </div>
                  <p className="text-sm text-white/70">{t("postPayment.machtigingCopy")}</p>
                  <Field label={t("fields.machtigingCode")} error={form.formState.errors.machtigingCode?.message}>
                    <input className={`${inputClass} mt-2`} {...form.register("machtigingCode")} />
                  </Field>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-2 flex items-center gap-2 text-white">
                    <Landmark className="size-4 text-green" />
                    <h4 className="font-medium">{t("postPayment.checklistTitle")}</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-white/70">
                    {(t.raw("postPayment.checklist") as string[]).map((item) => (
                      <li key={item} className="flex items-center gap-2">
                        <CheckCircle2 className="size-4 text-green" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between border-t border-white/10 pt-4">
              <Button type="button" variant="ghost" onClick={prevStep} disabled={currentStep === 0} leftIcon={<ChevronLeft className="size-4" />}>
                {t("back")}
              </Button>
              <Button type="button" onClick={nextStep} rightIcon={<ChevronRight className="size-4" />}>
                {currentStep === stepKeys.length - 1 ? t("finish") : t("next")}
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}

function Field(props: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <label className="block space-y-1">
      <span className="text-xs font-medium text-white/70">{props.label}</span>
      {props.children}
      {props.error ? <span className="text-xs text-error">{props.error}</span> : null}
    </label>
  );
}

function SummaryTile({ icon: Icon, title, value }: { icon: React.ComponentType<{ className?: string }>; title: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 text-teal">
        <Icon className="size-4" />
      </div>
      <p className="text-xs text-white/50">{title}</p>
      <p className="text-lg font-semibold text-white">{value}</p>
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none ring-0 placeholder:text-white/30 focus:border-green/40";
