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
import { Badge, Skeleton, Stepper } from "@/components/ui";
import { cn } from "@/lib/cn";
import { hasLocalWizardProgress, loadWizardSnapshot, persistWizardSnapshot } from "@/lib/wizards/persistence";

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
  const [draftCaseId, setDraftCaseId] = React.useState<string | null>(null);

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
        caseId: draftCaseId ?? undefined,
        payload: { ...values, selectedService, currentStep },
      });
    });
    return () => subscription.unsubscribe();
  }, [form, selectedService, currentStep, draftCaseId]);

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
    if (currentStep === 0 && !draftCaseId) {
      try {
        const response = await fetch("/api/cases/draft", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            caseType: selectedService,
            fullName: form.getValues("fullName"),
            bsn: form.getValues("bsn"),
            taxYear: form.getValues("taxYear"),
          }),
        });
        const data = (await response.json().catch(() => null)) as { caseId?: string | null } | null;
        if (data?.caseId) setDraftCaseId(data.caseId);
      } catch {
        // Non-blocking: wizard can continue and persist local metadata only.
      }
    }
    setCurrentStep((prev) => Math.min(prev + 1, stepKeys.length - 1));
  };

  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-copper">Tax return flow</p>
        <h2 className="mt-2 font-heading text-3xl tracking-[-0.03em] text-text">{t("catalogTitle")}</h2>
        <p className="mt-2 text-sm text-secondary">{t("catalogSubtitle")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {services.map((service) => {
          const isActive = selectedService === service.id;
          const hasSavedProgress = hasLocalWizardProgress(`fintax-tax-${service.id}`);
          return (
            <Card key={service.id} className={cn("rounded-[var(--radius-lg)] border border-border/35 bg-surface/55", isActive ? "border-copper/35 bg-copper/6" : "")}>
              <CardHeader className="space-y-1">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <Badge variant={isActive ? "copper" : "neutral"}>{service.id.replaceAll("_", " ")}</Badge>
                  {hasSavedProgress ? <Badge variant="success">saved</Badge> : null}
                </div>
                <h3 className="text-sm font-semibold text-text">{service.title}</h3>
                <p className="text-xs text-muted">{service.description}</p>
              </CardHeader>
              <CardBody>
                <p className="font-heading text-2xl font-bold text-green">EUR {service.price}</p>
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
            <h3 className="font-heading text-xl font-semibold text-text">{t("wizardTitle")}</h3>
            <p className="text-sm text-secondary">{t(`steps.${stepKeys[currentStep]}.title`)}</p>
          </div>
          <div className="min-w-0 sm:max-w-[52%]">
            <Stepper
              steps={stepKeys.map((step, index) => ({
                id: step,
                label: `${index + 1}. ${t(`steps.${step}.short`)}`,
              }))}
              currentStep={currentStep + 1}
              className="grid-cols-1"
            />
          </div>
        </CardHeader>
        <CardBody>
          <div className="mb-5 grid gap-3 md:grid-cols-[1fr_auto]">
            <div className="rounded-xl border border-border/35 bg-surface2/25 px-4 py-3">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Progress</p>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/10">
                <div className="h-full rounded-full bg-gradient-to-r from-green to-copper" style={{ width: `${Math.round(((currentStep + 1) / stepKeys.length) * 100)}%` }} />
              </div>
              <p className="mt-2 text-xs text-secondary">{Math.round(((currentStep + 1) / stepKeys.length) * 100)}% complete · {stepKeys.length - currentStep - 1} steps left</p>
            </div>
            <div className="hidden w-44 rounded-xl border border-border/35 bg-surface2/20 p-3 md:block">
              <p className="mb-2 text-xs uppercase tracking-[0.14em] text-muted">Review queue</p>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-4/5" />
              <Skeleton className="mt-2 h-3 w-3/5" />
            </div>
          </div>
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
                <label className="flex items-center gap-2 rounded-xl border border-border/35 bg-surface2/25 px-4 py-3 text-sm text-secondary">
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
                <div className="lg:col-span-3 rounded-xl border border-border/35 bg-surface2/25 p-4">
                  <p className="text-sm text-secondary">{t("summary.copy")}</p>
                  <Button type="button" className="mt-4" onClick={() => setPaymentCompleted(true)}>
                    {paymentCompleted ? t("summary.paid") : t("summary.pay")}
                  </Button>
                </div>
              </div>
            )}

            {currentStep === 6 && (
              <div className="space-y-4">
                <div className="rounded-xl border border-border/35 bg-surface2/25 p-4">
                  <div className="mb-2 flex items-center gap-2 text-text">
                    <LockKeyhole className="size-4 text-teal" />
                    <h4 className="font-medium">{t("postPayment.machtigingTitle")}</h4>
                  </div>
                  <p className="text-sm text-secondary">{t("postPayment.machtigingCopy")}</p>
                  <Field label={t("fields.machtigingCode")} error={form.formState.errors.machtigingCode?.message}>
                    <input className={`${inputClass} mt-2`} {...form.register("machtigingCode")} />
                  </Field>
                </div>

                <div className="rounded-xl border border-border/35 bg-surface2/25 p-4">
                  <div className="mb-2 flex items-center gap-2 text-text">
                    <Landmark className="size-4 text-green" />
                    <h4 className="font-medium">{t("postPayment.checklistTitle")}</h4>
                  </div>
                  <ul className="space-y-2 text-sm text-secondary">
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

            <div className="flex items-center justify-between border-t border-border/35 pt-4">
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
      <span className="text-xs font-medium uppercase tracking-[0.12em] text-muted">{props.label}</span>
      {props.children}
      {props.error ? <span className="text-xs text-error">{props.error}</span> : null}
    </label>
  );
}

function SummaryTile({ icon: Icon, title, value }: { icon: React.ComponentType<{ className?: string }>; title: string; value: string }) {
  return (
    <div className="rounded-xl border border-border/35 bg-surface2/25 p-4">
      <div className="mb-2 inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border/30 bg-surface/35 text-copper">
        <Icon className="size-4" />
      </div>
      <p className="text-xs uppercase tracking-[0.12em] text-muted">{title}</p>
      <p className="font-heading text-xl font-semibold text-text">{value}</p>
    </div>
  );
}

const inputClass =
  "h-11 w-full rounded-xl border border-border/35 bg-surface/45 px-3 text-sm text-text outline-none ring-0 placeholder:text-muted focus:border-copper/40";
