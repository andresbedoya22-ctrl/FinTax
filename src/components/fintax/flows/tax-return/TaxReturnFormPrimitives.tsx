"use client";

import * as React from "react";
import { Check, HelpCircle } from "lucide-react";

import { cn } from "@/lib/cn";

export function TaxStepLayout({
  eyebrow,
  title,
  description,
  children,
  aside,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_20rem] xl:gap-5">
      <div className="space-y-4 sm:space-y-5">
        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-copper">{eyebrow}</p>
          <div className="space-y-2">
            <h3 className="font-heading text-[clamp(1.7rem,3vw,2.3rem)] leading-tight tracking-[-0.03em] text-text">{title}</h3>
            <p className="max-w-2xl text-sm leading-6 text-secondary">{description}</p>
          </div>
        </div>
        {children}
      </div>
      {aside ? <div className="space-y-4 xl:sticky xl:top-24 xl:self-start">{aside}</div> : null}
    </div>
  );
}

export function TaxPanel({
  title,
  description,
  children,
  className,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <section
      className={cn(
        "rounded-[24px] border border-border/50 bg-[linear-gradient(180deg,rgba(250,251,248,0.98),rgba(244,247,242,0.88))] p-4 shadow-[0_18px_44px_rgba(18,38,28,0.06)] sm:rounded-[28px] sm:p-5",
        className,
      )}
    >
      <div className="mb-4 space-y-1">
        <h4 className="text-sm font-semibold text-text">{title}</h4>
        {description ? <p className="text-sm leading-6 text-secondary">{description}</p> : null}
      </div>
      {children}
    </section>
  );
}

export function Field({
  label,
  hint,
  error,
  children,
}: {
  label: string;
  hint?: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{label}</span>
        {hint ? (
          <span className="inline-flex items-center gap-1 text-[11px] text-muted">
            <HelpCircle className="size-3" />
            {hint}
          </span>
        ) : null}
      </div>
      {children}
      {error ? <span className="text-xs text-error">{error}</span> : null}
    </label>
  );
}

export function ChoiceGrid({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("grid gap-3 md:grid-cols-2", className)}>{children}</div>;
}

export function ChoiceCard({
  label,
  description,
  active,
  onClick,
}: {
  label: string;
  description: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "group rounded-[22px] border px-4 py-3.5 text-left transition-all sm:rounded-[24px] sm:py-4",
        active
          ? "border-green/45 bg-[linear-gradient(180deg,rgba(32,111,74,0.12),rgba(255,255,255,0.92))] shadow-[0_16px_34px_rgba(31,95,66,0.12)]"
          : "border-border/45 bg-white/75 hover:border-green/25 hover:bg-white",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-text">{label}</p>
          <p className="mt-1 text-sm leading-6 text-secondary">{description}</p>
        </div>
        <span
          className={cn(
            "mt-0.5 inline-flex size-5 items-center justify-center rounded-full border",
            active ? "border-green bg-green text-white" : "border-border/60 bg-surface text-transparent",
          )}
        >
          <Check className="size-3.5" />
        </span>
      </div>
    </button>
  );
}

export function ToggleCard({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
      className={cn(
        "flex w-full items-center justify-between gap-4 rounded-[22px] border px-4 py-3.5 text-left transition-all sm:rounded-[24px] sm:py-4",
        checked
          ? "border-green/45 bg-[linear-gradient(180deg,rgba(32,111,74,0.11),rgba(255,255,255,0.96))]"
          : "border-border/45 bg-white/75 hover:border-green/20",
      )}
    >
      <div className="space-y-1">
        <p className="text-sm font-semibold text-text">{label}</p>
        <p className="text-sm leading-6 text-secondary">{description}</p>
      </div>
      <span
        className={cn(
          "relative inline-flex h-6 w-11 shrink-0 rounded-full border transition-colors",
          checked ? "border-green/40 bg-green/85" : "border-border/55 bg-surface2/70",
        )}
      >
        <span
          className={cn(
            "absolute top-0.5 h-4.5 w-4.5 rounded-full bg-white shadow-sm transition-transform",
            checked ? "translate-x-[1.3rem]" : "translate-x-[0.15rem]",
          )}
        />
      </span>
    </button>
  );
}

export function HintCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[22px] border border-border/45 bg-[linear-gradient(180deg,rgba(255,255,255,0.9),rgba(247,249,245,0.84))] px-4 py-3.5 sm:rounded-[24px] sm:py-4">
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted">{label}</p>
      <p className="mt-2 text-sm font-medium text-text">{value}</p>
    </div>
  );
}

export function ContextNote({
  tone = "neutral",
  title,
  copy,
}: {
  tone?: "neutral" | "warning" | "success";
  title: string;
  copy: string;
}) {
  const toneClass =
    tone === "warning"
      ? "border-copper/35 bg-copper/10"
      : tone === "success"
        ? "border-green/35 bg-green/10"
        : "border-border/45 bg-surface2/55";

  return (
    <div className={cn("rounded-[22px] border px-4 py-3.5 sm:rounded-[24px] sm:py-4", toneClass)}>
      <p className="text-sm font-semibold text-text">{title}</p>
      <p className="mt-1 text-sm leading-6 text-secondary">{copy}</p>
    </div>
  );
}

export const inputClass =
  "h-12 w-full rounded-[18px] border border-border/50 bg-white/90 px-4 text-sm text-text outline-none ring-0 placeholder:text-muted focus:border-green/40";

export const textareaClass =
  "min-h-28 w-full rounded-[18px] border border-border/50 bg-white/90 px-4 py-3 text-sm text-text outline-none ring-0 placeholder:text-muted focus:border-green/40";
