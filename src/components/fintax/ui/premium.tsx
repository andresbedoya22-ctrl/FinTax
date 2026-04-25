"use client";

import * as React from "react";
import {
  Baby,
  Calculator,
  Check,
  CheckCircle2,
  Circle,
  Euro,
  FileCheck2,
  HeartPulse,
  Home,
  ListChecks,
  Lock,
  Search,
  ShieldCheck,
  Sparkles,
  UploadCloud,
  Users,
  WalletCards,
  type LucideIcon,
} from "lucide-react";

import { Button } from "@/components/fintax/Button";
import { cn } from "@/lib/cn";

export type StatusTone = "success" | "warning" | "danger" | "neutral" | "info";

const toneClasses: Record<StatusTone, string> = {
  success: "border-[#4CAF50]/20 bg-[#EAF7EC] text-[#2f8738]",
  warning: "border-[#D97706]/20 bg-[#FFF4E5] text-[#B45309]",
  danger: "border-[#DC2626]/20 bg-[#FEE2E2] text-[#B91C1C]",
  neutral: "border-slate-200 bg-slate-50 text-slate-600",
  info: "border-[#2f7fd8]/20 bg-[#eaf3ff] text-[#1d5f9f]",
};

export const benefitIcons = {
  zorgtoeslag: HeartPulse,
  huurtoeslag: Home,
  kindgebondenBudget: Users,
  kinderopvangtoeslag: Baby,
} satisfies Record<string, LucideIcon>;

export function StatusBadge({ tone = "neutral", children }: { tone?: StatusTone; children: React.ReactNode }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold", toneClasses[tone])}>
      {children}
    </span>
  );
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
}) {
  return (
    <header className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
      <div className="max-w-4xl">
        {eyebrow ? <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#74cf7a]">{eyebrow}</p> : null}
        <h1 className="mt-3 max-w-[18ch] text-[clamp(2.1rem,4vw,3.6rem)] font-bold leading-[1.02] tracking-[-0.03em] text-white">
          {title}
        </h1>
        {description ? <p className="mt-4 max-w-3xl text-base leading-7 text-[#C8D2DF]">{description}</p> : null}
      </div>
      {actions ? <div className="flex flex-wrap gap-3">{actions}</div> : null}
    </header>
  );
}

export function PremiumStepper({
  steps,
  currentStep,
}: {
  steps: readonly string[];
  currentStep: number;
}) {
  return (
    <nav aria-label="Benefits progress" className="overflow-x-auto pb-1">
      <ol className="grid min-w-[720px] grid-cols-5 items-center gap-4">
        {steps.map((step, index) => {
          const completed = index < currentStep;
          const current = index === currentStep;
          return (
            <li key={step} className="flex items-center gap-4">
              <div className="flex min-w-0 items-center gap-3">
                <span
                  className={cn(
                    "grid size-9 shrink-0 place-items-center rounded-full text-sm font-bold",
                    completed || current ? "bg-[#4CAF50] text-white" : "bg-white/12 text-[#C8D2DF]",
                  )}
                >
                  {completed ? <Check className="size-4" /> : index + 1}
                </span>
                <span className={cn("truncate text-sm font-semibold", current ? "text-white" : completed ? "text-[#C8D2DF]" : "text-[#8EA1B8]")}>
                  {step}
                </span>
              </div>
              {index < steps.length - 1 ? (
                <span className={cn("h-px flex-1", completed ? "bg-[#4CAF50]" : "bg-white/14")} aria-hidden="true" />
              ) : null}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export function HeroSummaryCard({
  label,
  amount,
  caption,
  badges,
  children,
  testId,
}: {
  label: string;
  amount: string;
  caption: string;
  badges?: React.ReactNode;
  children: React.ReactNode;
  testId?: string;
}) {
  return (
    <section data-testid={testId} className="rounded-[28px] border border-white/70 bg-white p-6 text-[#102033] shadow-[0_30px_80px_rgba(0,0,0,0.18)] sm:p-8">
      <div className="grid gap-6 lg:grid-cols-[11rem_minmax(0,1fr)] lg:items-center">
        <div className="grid size-36 place-items-center rounded-full bg-[#EAF7EC] text-[#4CAF50]">
          <WalletCards className="size-16" />
        </div>
        <div>
          <p className="text-lg font-semibold text-[#344054]">{label}</p>
          <p className="mt-3 text-[clamp(2.4rem,5vw,4rem)] font-bold leading-none tracking-[-0.04em] text-[#3F9E48]">
            {amount} <span className="text-2xl text-[#102033]">{caption}</span>
          </p>
          {badges ? <div className="mt-5 flex flex-wrap gap-3">{badges}</div> : null}
        </div>
      </div>
      <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">{children}</div>
    </section>
  );
}

export function BenefitSummaryCard({
  icon: Icon,
  title,
  status,
  statusTone,
  value,
}: {
  icon: LucideIcon;
  title: string;
  status: string;
  statusTone: StatusTone;
  value?: string;
}) {
  return (
    <article className="rounded-[20px] border border-slate-200 bg-white p-5 shadow-[0_12px_28px_rgba(16,32,51,0.05)]">
      <div className="flex items-start gap-4">
        <span className={cn("grid size-14 shrink-0 place-items-center rounded-full", statusTone === "warning" ? "bg-[#FFF4E5] text-[#B45309]" : "bg-[#EAF7EC] text-[#4CAF50]")}>
          <Icon className="size-7" />
        </span>
        <div className="min-w-0">
          <h3 className="text-base font-bold text-[#102033]">{title}</h3>
          <StatusBadge tone={statusTone}>{status}</StatusBadge>
          {value ? <p className="mt-4 font-mono text-lg font-bold text-[#3F9E48]">{value}</p> : null}
        </div>
      </div>
    </article>
  );
}

export function ActionPanel({
  title,
  copy,
  cta,
  footer,
  onClick,
  disabled,
  loading,
}: {
  title: string;
  copy: string;
  cta: string;
  footer: string;
  onClick?: () => void;
  disabled?: boolean;
  loading?: boolean;
}) {
  return (
    <aside className="relative overflow-hidden rounded-[30px] border border-white/12 bg-[linear-gradient(145deg,#0B2340,#061426)] p-7 text-white shadow-[0_26px_70px_rgba(0,0,0,0.24)] lg:p-9">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_86%_18%,rgba(76,175,80,0.14),transparent_36%)]" />
      <div className="relative">
        <span className="grid size-16 place-items-center rounded-[18px] bg-[#4CAF50]/18 text-[#EAF7EC]">
          <Sparkles className="size-8" />
        </span>
        <h2 className="mt-8 max-w-[12ch] text-[clamp(2rem,3vw,3rem)] font-bold leading-[1.06] tracking-[-0.03em]">{title}</h2>
        <p className="mt-5 max-w-[42ch] text-base leading-7 text-[#C8D2DF]">{copy}</p>
        <Button
          type="button"
          className="mt-9 min-h-14 w-full justify-center rounded-[18px] bg-[#4CAF50] px-6 text-base font-bold text-white hover:bg-[#3F9E48]"
          onClick={onClick}
          disabled={disabled}
          loading={loading}
          rightIcon={<CheckCircle2 className="size-5" />}
        >
          {cta}
        </Button>
        <p className="mt-7 flex items-center justify-center gap-2 text-sm text-[#C8D2DF]">
          <Lock className="size-4" />
          {footer}
        </p>
      </div>
    </aside>
  );
}

export function ProcessTimeline({ title, steps }: { title: string; steps: { title: string; body: string; icon?: LucideIcon }[] }) {
  return (
    <section className="rounded-[24px] border border-white/12 bg-white/[0.035] p-6 text-white">
      <h2 className="text-2xl font-bold">{title}</h2>
      <ol className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {steps.map((step, index) => {
          const Icon = step.icon ?? [Search, ShieldCheck, UploadCloud, FileCheck2][index] ?? Circle;
          return (
            <li key={step.title} className="relative">
              <span className="absolute -top-3 left-0 grid size-8 place-items-center rounded-full bg-[#4CAF50] text-sm font-bold text-white">{index + 1}</span>
              <div className="mt-3 rounded-[20px] bg-white/8 p-5">
                <Icon className="size-9 text-white" />
                <h3 className="mt-4 font-bold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#C8D2DF]">{step.body}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export function UnlocksCard({ title, items }: { title: string; items: string[] }) {
  const icons = [Calculator, ListChecks, Users, FileCheck2];
  return (
    <section className="rounded-[24px] border border-white/12 bg-white/[0.035] p-6 text-white">
      <h2 className="text-2xl font-bold">{title}</h2>
      <ul className="mt-5 grid gap-4">
        {items.map((item, index) => {
          const Icon = icons[index % icons.length] ?? Check;
          return (
            <li key={item} className="flex items-center gap-4 text-[#C8D2DF]">
              <span className="grid size-8 place-items-center rounded-full bg-[#4CAF50] text-white">
                <Check className="size-4" />
              </span>
              <Icon className="size-5 text-white" />
              <span>{item}</span>
            </li>
          );
        })}
      </ul>
    </section>
  );
}

export function DetailAccordion({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="rounded-[20px] border border-slate-200 bg-[#F6F8F5] p-4">
      <summary className="cursor-pointer text-sm font-bold text-[#102033]">{title}</summary>
      <div className="mt-4">{children}</div>
    </details>
  );
}

export function DocumentChecklistCard({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-6 shadow-[0_18px_44px_rgba(16,32,51,0.06)]">
      <div className="flex items-start gap-4">
        <span className="grid size-12 place-items-center rounded-[18px] bg-[#EAF7EC] text-[#3F9E48]">
          <UploadCloud className="size-6" />
        </span>
        <div>
          <h2 className="text-2xl font-bold text-[#102033]">{title}</h2>
          {description ? <p className="mt-2 text-sm leading-6 text-[#667085]">{description}</p> : null}
        </div>
      </div>
      <div className="mt-5">{children}</div>
    </section>
  );
}

export function EmptyState({ title, description, cta }: { title: string; description: string; cta?: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-dashed border-slate-300 bg-white p-8 text-center">
      <Euro className="mx-auto size-10 text-[#4CAF50]" />
      <h3 className="mt-4 text-xl font-bold text-[#102033]">{title}</h3>
      <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-[#667085]">{description}</p>
      {cta ? <div className="mt-5">{cta}</div> : null}
    </div>
  );
}

export function InfoBanner({ children, tone = "info" }: { children: React.ReactNode; tone?: StatusTone }) {
  return <div className={cn("rounded-[18px] border px-4 py-3 text-sm leading-6", toneClasses[tone])}>{children}</div>;
}
