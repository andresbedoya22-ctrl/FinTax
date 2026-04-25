"use client";

import { FileCheck2, Search, ShieldCheck, UploadCloud } from "lucide-react";
import { useTranslations } from "next-intl";

import {
  ActionPanel,
  BenefitSummaryCard,
  DetailAccordion,
  HeroSummaryCard,
  InfoBanner,
  PageHeader,
  PremiumStepper,
  ProcessTimeline,
  StatusBadge,
  UnlocksCard,
  benefitIcons,
} from "@/components/fintax/ui";
import {
  buildBenefitEstimateRange,
  buildPrePaymentEstimateRange,
  type BenefitsResultsMode,
  type ToeslagenEvaluation,
} from "@/lib/toeslagen";

import { BenefitsPostPaymentNextSteps } from "./BenefitsPostPaymentNextSteps";
import type { BenefitCardKey } from "./wizard";

const benefitCardOrder: BenefitCardKey[] = [
  "zorgtoeslag",
  "huurtoeslag",
  "kindgebondenBudget",
  "kinderopvangtoeslag",
];

function formatCompactAmount(value: number, exact = false) {
  return new Intl.NumberFormat("nl-NL", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: exact ? 2 : 0,
    maximumFractionDigits: exact ? 2 : 0,
  }).format(value);
}

function formatRange(range: { minMonthly: number; maxMonthly: number }) {
  return `${formatCompactAmount(range.minMonthly)} - ${formatCompactAmount(range.maxMonthly)}`;
}

function asStringArray(value: unknown, fallback: string[]) {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : fallback;
}

function asProcessSteps(value: unknown, fallback: { title: string; body: string }[]) {
  return Array.isArray(value) && value.every((item) => item && typeof item === "object" && "title" in item && "body" in item)
    ? (value as { title: string; body: string }[])
    : fallback;
}

export function BenefitsResults({
  results,
  selectedKeys,
  mode = "prePayment",
  caseId = null,
  onContinueToCheckout,
  isCheckoutLoading = false,
}: {
  results: ToeslagenEvaluation;
  selectedKeys: BenefitCardKey[];
  onToggleSelected: (key: BenefitCardKey) => void;
  mode?: BenefitsResultsMode;
  caseId?: string | null;
  onContinueToCheckout?: () => void;
  isCheckoutLoading?: boolean;
}) {
  const t = useTranslations("Benefits");
  const eligibleCount = benefitCardOrder.filter((key) => results.results[key].eligible).length;
  const totalRange = buildPrePaymentEstimateRange(results);
  const allRequiredDocuments = benefitCardOrder.flatMap((key) => results.results[key].requiredDocuments);
  const manualReviewCount = benefitCardOrder.filter((key) => results.results[key].manualReviewRequired).length;
  const stepLabels = asStringArray(t.raw("premium.stepper"), ["Diagnosis", "Result", "Payment", "Documents", "Application"]);
  const processSteps = asProcessSteps(t.raw("premium.process.steps"), [
    { title: "Free diagnosis", body: "We analyze your information and calculate possible benefits." },
    { title: "Secure payment", body: "Choose your plan and complete payment securely." },
    { title: "Document upload", body: "Upload documents and we prepare them for review." },
    { title: "Application preparation", body: "We prepare your application file and follow up on the case." },
  ]);
  const unlocks = asStringArray(t.raw("premium.unlocks.items"), [
    "Detailed calculation by benefit",
    "Personalized document checklist",
    "Expert case review",
    "Application preparation for submission",
  ]);

  return (
    <div className="space-y-8">
      <PremiumStepper steps={stepLabels} currentStep={mode === "prePayment" ? 1 : 3} />

      <PageHeader
        title={mode === "prePayment" ? t("results.mode.prePayment.title") : t("results.mode.postPayment.title")}
        description={mode === "prePayment" ? t("premium.prePaymentSubtitle") : t("premium.postPaymentSubtitle")}
      />

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(330px,0.46fr)]">
        <HeroSummaryCard
          testId="benefits-results-total"
          label={mode === "prePayment" ? t("premium.totalEstimateLabel") : t("results.totalLabel")}
          amount={mode === "prePayment" ? `${t("premium.between")} ${formatRange(totalRange)}` : formatCompactAmount(results.totalEstimatedMonthlyAmount, true)}
          caption={mode === "prePayment" ? t("results.range.monthly") : `/ ${t("results.month")}`}
          badges={
            <>
              <StatusBadge tone="success">{t("premium.potentialCount", { count: eligibleCount })}</StatusBadge>
              {manualReviewCount > 0 ? <StatusBadge tone="warning">{t("premium.manualReviewCount", { count: manualReviewCount })}</StatusBadge> : null}
            </>
          }
        >
          {benefitCardOrder.map((key) => {
            const result = results.results[key];
            const range = buildBenefitEstimateRange(result);
            const showRange = mode === "prePayment" && range.maxMonthly > 0 && (result.eligible || result.manualReviewRequired);
            const value = mode === "postPayment"
              ? `${formatCompactAmount(result.estimatedMonthlyAmount ?? 0, true)} / ${t("results.month")}`
              : showRange
                ? `${formatRange(range)}/${t("results.month")}`
                : undefined;
            return (
              <BenefitSummaryCard
                key={key}
                icon={benefitIcons[key]}
                title={t(`results.cards.${key}.title`)}
                status={result.manualReviewRequired ? t("results.manualReview") : result.eligible ? t("results.eligible") : t("results.notEligible")}
                statusTone={result.manualReviewRequired ? "warning" : result.eligible ? "success" : "neutral"}
                value={value}
              />
            );
          })}
        </HeroSummaryCard>

        <ActionPanel
          title={mode === "prePayment" ? t("premium.action.title") : t("premium.action.postTitle")}
          copy={mode === "prePayment" ? t("premium.action.copy") : t("premium.action.postCopy")}
          cta={mode === "prePayment" ? t("results.mode.prePayment.cta") : t("bundle.continue")}
          footer={t("premium.action.footer")}
          onClick={mode === "prePayment" ? onContinueToCheckout : undefined}
          disabled={mode === "prePayment" && selectedKeys.length === 0}
          loading={isCheckoutLoading}
        />
      </div>

      <InfoBanner tone={results.manualReviewRequired ? "warning" : "info"}>
        {mode === "prePayment" ? t("results.mode.prePayment.disclaimer") : t("results.honestyCopy")}
      </InfoBanner>

      {mode === "postPayment" ? (
        <section className="grid gap-4 rounded-[28px] bg-white p-6 text-[#102033] shadow-[0_30px_80px_rgba(0,0,0,0.16)] lg:p-8">
          <h2 className="text-2xl font-bold">{t("results.mode.postPayment.nextStep")}</h2>
          <div className="grid gap-4 xl:grid-cols-2">
            {benefitCardOrder.map((key) => {
              const result = results.results[key];
              return (
                <article key={key} className="rounded-[22px] border border-slate-200 bg-white p-5">
                  <h3 className="text-lg font-bold">{t(`results.cards.${key}.title`)}</h3>
                  <p className="mt-1 text-sm text-[#667085]">{t(`results.cards.${key}.subtitle`)}</p>
                  <p className="mt-4 font-mono text-2xl font-bold text-[#3F9E48]">
                    {formatCompactAmount(result.estimatedAnnualAmount ?? 0, true)}
                  </p>
                  <p className="text-sm text-[#667085]">{formatCompactAmount(result.estimatedMonthlyAmount ?? 0, true)} / {t("results.month")}</p>
                  <div className="mt-5 grid gap-3">
                    <DetailAccordion title={t("results.calculationTraceLabel")}>
                      <ul className="space-y-2 text-sm leading-6">
                        {result.calculationSteps.map((step) => (
                          <li key={step.code} className="rounded-[14px] border border-slate-200 bg-white px-3 py-2">
                            <span className="font-semibold">{t(step.labelKey.replace(/^Benefits\./, ""))}</span>: {String(step.value)}
                            {step.formula ? <span className="block text-xs text-[#667085]">{step.formula}</span> : null}
                          </li>
                        ))}
                      </ul>
                    </DetailAccordion>
                    <DetailAccordion title={t("results.documentsLabel")}>
                      <ul className="space-y-2 text-sm leading-6">
                        {[...result.requiredDocuments, ...result.optionalDocuments].map((document) => (
                          <li key={document.code} className="flex items-start gap-2">
                            <FileCheck2 className="mt-1 size-4 text-[#4CAF50]" />
                            <span>{t(document.labelKey.replace(/^Benefits\./, ""))}</span>
                          </li>
                        ))}
                      </ul>
                    </DetailAccordion>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="grid gap-8 xl:grid-cols-[minmax(0,1.45fr)_minmax(330px,0.68fr)]">
        <ProcessTimeline
          title={t("premium.process.title")}
          steps={processSteps.map((step, index) => ({
            ...step,
            icon: [Search, ShieldCheck, UploadCloud, FileCheck2][index],
          }))}
        />
        <UnlocksCard title={t("premium.unlocks.title")} items={unlocks} />
      </div>

      {mode === "postPayment" ? <BenefitsPostPaymentNextSteps caseId={caseId} documents={allRequiredDocuments} /> : null}
    </div>
  );
}
