"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Globe2, HandCoins, Landmark, LoaderCircle, Receipt } from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { z } from "zod";

import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";
import { Badge, Button, Card, Input, Pictogram, Stepper } from "@/components/ui";

type AppLocale = "en" | "nl" | "es" | "pl" | "ro";

const AUTH_INTENT_SESSION_KEY = "fintax.pending_intent";

const LANGUAGE_OPTIONS: ReadonlyArray<{ code: OnboardingValues["language"]; label: string; short: string }> = [
  { code: "en", label: "English", short: "EN" },
  { code: "nl", label: "Nederlands", short: "NL" },
  { code: "es", label: "Espanol", short: "ES" },
  { code: "pl", label: "Polski", short: "PL" },
  { code: "ro", label: "Romana", short: "RO" },
] ;

const TAX_CONTEXT_OPTIONS = [
  { value: "resident", label: "Resident filing", icon: "documento" as const, note: "Standard resident tax return and deductions." },
  { value: "non_resident", label: "Non-resident filing", icon: Landmark, note: "Dutch-source income and treaty-sensitive review." },
  { value: "zzp", label: "ZZP / freelancer", icon: HandCoins, note: "Self-employed filing with entrepreneur checks." },
  { value: "benefits", label: "Benefits only", icon: Receipt, note: "Toeslagen setup and follow-up support." },
  { value: "mixed", label: "Mixed case", icon: Globe2, note: "More than one service path; we will route after intake." },
] as const;

const onboardingSchema = z.object({
  language: z.enum(["en", "nl", "es", "pl", "ro"]),
  fullName: z.string().min(2, "Enter your full name"),
  email: z.string().email(),
  phone: z.string().max(30).optional().or(z.literal("")),
  taxContext: z.enum(["resident", "non_resident", "zzp", "benefits", "mixed"]),
  consentPrivacy: z.boolean().refine((value) => value, "Privacy acknowledgement is required"),
  consentTerms: z.boolean().refine((value) => value, "Terms acknowledgement is required"),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

const steps = [
  { id: "language", label: "Language preference", description: "Set your interface language." },
  { id: "profile", label: "Profile basics", description: "Confirm name, email and optional phone." },
  { id: "tax-context", label: "Tax context", description: "Select the primary service context." },
  { id: "consent", label: "Consent", description: "Confirm privacy and terms before continuing." },
];

function getFinalDestination(nextFromQuery?: string | null) {
  if (nextFromQuery && nextFromQuery.startsWith("/")) return nextFromQuery;

  if (typeof window !== "undefined") {
    try {
      const raw = window.sessionStorage.getItem(AUTH_INTENT_SESSION_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as { next?: string };
        if (parsed.next && parsed.next.startsWith("/")) return parsed.next;
      }
    } catch {
      // Ignore malformed session payload.
    }
  }

  return "/dashboard";
}

function clearAuthIntentSession() {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(AUTH_INTENT_SESSION_KEY);
}

export function OnboardingScreen({ initialNextPath }: { initialNextPath?: string }) {
  const t = useTranslations("Onboarding");
  const locale = useLocale() as AppLocale;
  const router = useRouter();
  const supabase = createClient();
  const [currentStep, setCurrentStep] = React.useState(1);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [authEmail, setAuthEmail] = React.useState("");
  const [authLoaded, setAuthLoaded] = React.useState(false);

  const form = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      language: locale,
      fullName: "",
      email: "",
      phone: "",
      taxContext: "resident",
      consentPrivacy: false,
      consentTerms: false,
    },
    mode: "onTouched",
  });

  React.useEffect(() => {
    const loadProfile = async () => {
      if (!supabase) return setAuthLoaded(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setAuthLoaded(true);
        router.push("/auth");
        return;
      }

      setAuthEmail(user.email ?? "");
      form.setValue("email", user.email ?? "", { shouldValidate: true });

      const { data: profile } = await supabase
        .from("profiles")
        .select("full_name, phone, preferred_language")
        .eq("id", user.id)
        .maybeSingle();

      if (profile) {
        if (profile.full_name) form.setValue("fullName", profile.full_name);
        if (profile.phone) form.setValue("phone", profile.phone);
        if (profile.preferred_language && ["en", "nl", "es", "pl", "ro"].includes(profile.preferred_language)) {
          form.setValue("language", profile.preferred_language as OnboardingValues["language"]);
        }
      }

      setAuthLoaded(true);
    };

    void loadProfile();
  }, [form, router, supabase]);

  const selectedLanguage = useWatch({ control: form.control, name: "language" });
  const selectedTaxContext = useWatch({ control: form.control, name: "taxContext" });
  const watchedEmail = useWatch({ control: form.control, name: "email" });

  const nextStep = async () => {
    setServerError(null);
    const fieldsByStep: Record<number, Array<keyof OnboardingValues>> = {
      1: ["language"],
      2: ["fullName", "email", "phone"],
      3: ["taxContext"],
      4: ["consentPrivacy", "consentTerms"],
    };
    const valid = await form.trigger(fieldsByStep[currentStep]);
    if (!valid) return;
    setCurrentStep((prev) => Math.min(4, prev + 1));
  };

  const prevStep = () => {
    setServerError(null);
    setCurrentStep((prev) => Math.max(1, prev - 1));
  };

  const onSubmit = form.handleSubmit(async (values) => {
    setServerError(null);

    if (!supabase) {
      setServerError("Supabase is not configured in this environment.");
      return;
    }

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/auth");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        full_name: values.fullName,
        phone: values.phone || null,
        preferred_language: values.language as never,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      setServerError(error.message);
      return;
    }

    clearAuthIntentSession();
    router.push(getFinalDestination(initialNextPath));
  });

  return (
    <div className="min-h-screen bg-mesh technical-lines">
      <div className="mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[1.02fr_0.98fr]">
        <aside className="relative hidden overflow-hidden border-r border-border/35 p-8 lg:flex lg:flex-col lg:justify-between xl:p-10">
          <Image src="/visuals/hero-bg.svg" alt="" width={1600} height={900} aria-hidden="true" className="absolute inset-0 h-full w-full object-cover opacity-35" />
          <div className="absolute inset-0 bg-gradient-to-br from-bg via-bg/85 to-surface/80" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-lg border border-copper/25 bg-copper/8 px-3 py-2">
              <div className="grid h-7 w-7 place-items-center rounded-md border border-copper/25 bg-copper/10 text-copper">F</div>
              <span className="font-heading text-lg tracking-tight text-text">FinTax</span>
            </div>
          </div>

          <div className="relative z-10 space-y-6">
            <Badge variant="copper" className="w-fit">Onboarding</Badge>
            <div>
              <h1 className="max-w-[14ch] font-heading text-4xl leading-[0.96] tracking-[-0.04em] text-text xl:text-5xl">
                Configure your workspace before opening the case dashboard
              </h1>
              <p className="mt-4 max-w-[48ch] text-sm leading-6 text-secondary">
                We store only profile basics and language preference here. Service and document details stay inside the secure case flows.
              </p>
            </div>

            <Card variant="panel" padding="sm" className="bg-surface/45">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Workspace preview</p>
              <Image src="/visuals/app-mock.svg" alt="FinTax dashboard mockup" width={1600} height={1000} className="mt-3 h-[190px] w-full rounded-xl border border-border/40 object-cover" />
            </Card>

            <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
              <Card variant="soft" padding="sm" className="bg-surface2/45">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">Letter routing</p>
                <Image src="/visuals/letter-mock.svg" alt="Official letter mock" width={1400} height={900} className="mt-3 h-[108px] w-full rounded-lg border border-border/40 object-cover" />
                <p className="mt-3 text-xs leading-5 text-secondary">Letters and filings continue into the same secure workflow after setup.</p>
              </Card>
              <Card variant="soft" padding="sm" className="bg-surface2/45">
                <div className="flex items-start gap-3">
                  <div className="grid h-9 w-9 place-items-center rounded-full border border-green/20 bg-green/10 text-green">
                    <Pictogram name="escudo" size={20} decorative className="opacity-95" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-text">Profile-safe setup</p>
                    <p className="mt-1 text-xs leading-5 text-muted">No sensitive tax documents or BSN values are collected on this screen.</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>

          <div className="relative z-10 rounded-[var(--radius-lg)] border border-border/35 bg-surface/35 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Supported locales</p>
            <p className="mt-2 text-sm text-secondary">EN, NL, ES, PL and RO are available in the UI and onboarding preference selector.</p>
          </div>
        </aside>

        <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-[760px]">
            <Card variant="panel" padding="none" className="overflow-hidden">
              <div className="border-b border-border/35 bg-surface/45 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral">
                    <Pictogram name="documento" size={16} decorative className="opacity-90" />
                    Setup
                  </Badge>
                  <Badge variant="copper">Step {currentStep} of 4</Badge>
                </div>
                <h2 className="mt-3 font-heading text-3xl tracking-[-0.03em] text-text sm:text-4xl">{t("title")}</h2>
                <p className="mt-3 max-w-[58ch] text-sm leading-6 text-secondary">{t("subtitle")}</p>
              </div>

              <div className="grid gap-5 border-b border-border/35 p-5 sm:p-6 lg:grid-cols-[0.9fr_1.1fr]">
                <Stepper steps={steps} currentStep={currentStep} className="self-start" />
                <div className="rounded-[var(--radius-lg)] border border-border/35 bg-surface2/20 p-4">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">Account email</p>
                  <p className="mt-2 text-sm text-text">{authEmail || "Loading account..."}</p>
                  <p className="mt-2 text-xs leading-5 text-secondary">
                    This email comes from your authenticated account and cannot be edited here.
                  </p>
                </div>
              </div>

              <form onSubmit={onSubmit} className="grid gap-6 p-5 sm:p-6" noValidate>
                {currentStep === 1 ? (
                  <section className="grid gap-3" style={{ animation: "fadeUp 280ms ease both" }}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted">Language preference</p>
                      <span className="text-xs text-secondary">Stored in your profile</span>
                    </div>
                    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {LANGUAGE_OPTIONS.map((lang) => {
                        const active = selectedLanguage === lang.code;
                        return (
                          <button
                            key={lang.code}
                            type="button"
                            onClick={() => form.setValue("language", lang.code, { shouldValidate: true, shouldTouch: true })}
                            className={cn(
                              "focus-ring editorial-frame flex items-center gap-3 rounded-[var(--radius-lg)] border px-4 py-3 text-left transition",
                              active ? "border-green/30 bg-green/8 text-text" : "border-border/35 bg-surface2/28 text-secondary hover:border-copper/20 hover:bg-surface2/38 hover:text-text"
                            )}
                            aria-pressed={active}
                          >
                            <span className={cn("inline-flex min-w-11 items-center justify-center rounded-md border px-2 py-1 text-[11px] font-semibold tracking-[0.12em]", active ? "border-green/25 bg-green/10 text-green" : "border-border/35 bg-surface/45 text-muted")}>
                              {lang.short}
                            </span>
                            <span className="flex-1 text-sm font-medium">{lang.label}</span>
                            {active ? <Pictogram name="check" size={18} decorative className="opacity-90" /> : null}
                          </button>
                        );
                      })}
                    </div>
                    {form.formState.errors.language ? <p className="text-xs text-error">{form.formState.errors.language.message}</p> : null}
                  </section>
                ) : null}

                {currentStep === 2 ? (
                  <section className="grid gap-4" style={{ animation: "fadeUp 280ms ease both" }}>
                    <div className="grid gap-1">
                      <label htmlFor="onb-full-name" className="text-xs uppercase tracking-[0.14em] text-muted">Full name</label>
                      <Input id="onb-full-name" {...form.register("fullName")} placeholder="Your full name" />
                      {form.formState.errors.fullName ? <p className="text-xs text-error">{form.formState.errors.fullName.message}</p> : null}
                    </div>
                    <div className="grid gap-1">
                      <label htmlFor="onb-email" className="text-xs uppercase tracking-[0.14em] text-muted">Email</label>
                      <Input id="onb-email" value={watchedEmail ?? ""} readOnly aria-readonly="true" className="opacity-90" />
                    </div>
                    <div className="grid gap-1">
                      <label htmlFor="onb-phone" className="text-xs uppercase tracking-[0.14em] text-muted">Phone (optional)</label>
                      <Input id="onb-phone" {...form.register("phone")} placeholder="+31 ..." />
                      {form.formState.errors.phone ? <p className="text-xs text-error">{form.formState.errors.phone.message}</p> : null}
                    </div>
                  </section>
                ) : null}

                {currentStep === 3 ? (
                  <section className="grid gap-3" style={{ animation: "fadeUp 280ms ease both" }}>
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted">Tax context</p>
                      <span className="text-xs text-secondary">Helps route your next screen</span>
                    </div>
                    <div className="grid gap-2.5">
                      {TAX_CONTEXT_OPTIONS.map(({ value, label, icon: Icon, note }) => {
                        const active = selectedTaxContext === value;
                        return (
                          <button
                            key={value}
                            type="button"
                            onClick={() => form.setValue("taxContext", value, { shouldValidate: true, shouldTouch: true })}
                            className={cn(
                              "focus-ring editorial-frame flex items-center gap-3 rounded-[var(--radius-lg)] border px-4 py-3 text-left transition",
                              active ? "border-green/28 bg-green/8 text-text" : "border-border/35 bg-surface2/25 text-secondary hover:border-border/55 hover:bg-surface2/35 hover:text-text"
                            )}
                            aria-pressed={active}
                          >
                            <div className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full border", active ? "border-green/20 bg-green/10 text-green" : "border-border/35 bg-surface/45 text-muted")}>
                              {typeof Icon === "string" ? <Pictogram name={Icon} size={20} decorative className="opacity-95" /> : <Icon className="h-4 w-4" aria-hidden="true" />}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-sm font-medium">{label}</p>
                              <p className="mt-0.5 text-xs leading-5 text-muted">{note}</p>
                            </div>
                            {active ? <Pictogram name="check" size={18} decorative className="opacity-90" /> : null}
                          </button>
                        );
                      })}
                    </div>
                    {form.formState.errors.taxContext ? <p className="text-xs text-error">{form.formState.errors.taxContext.message}</p> : null}
                  </section>
                ) : null}

                {currentStep === 4 ? (
                  <section className="grid gap-4" style={{ animation: "fadeUp 280ms ease both" }}>
                    <div className="rounded-[var(--radius-lg)] border border-border/35 bg-surface2/25 p-4">
                      <p className="text-sm font-medium text-text">Before continuing</p>
                      <p className="mt-2 text-sm leading-6 text-secondary">
                        We save your language preference and profile basics, then route you to the intended service flow or dashboard.
                      </p>
                    </div>
                    <label className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-border/35 bg-surface2/20 px-4 py-3 text-sm text-secondary">
                      <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-border/70 accent-[rgb(var(--accent-green))]" {...form.register("consentPrivacy")} />
                      <span>I acknowledge the privacy policy for profile and case processing.</span>
                    </label>
                    {form.formState.errors.consentPrivacy ? <p className="text-xs text-error">{form.formState.errors.consentPrivacy.message}</p> : null}
                    <label className="flex items-start gap-3 rounded-[var(--radius-lg)] border border-border/35 bg-surface2/20 px-4 py-3 text-sm text-secondary">
                      <input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-border/70 accent-[rgb(var(--accent-green))]" {...form.register("consentTerms")} />
                      <span>I accept the terms for using the FinTax workspace and case flows.</span>
                    </label>
                    {form.formState.errors.consentTerms ? <p className="text-xs text-error">{form.formState.errors.consentTerms.message}</p> : null}
                  </section>
                ) : null}

                {serverError ? <div className="rounded-[var(--radius-lg)] border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{serverError}</div> : null}

                <div className="grid gap-3 border-t border-border/35 pt-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <p className="text-xs leading-5 text-muted">
                    Step {currentStep} of 4. You can edit these settings later in the dashboard settings screen.
                  </p>
                  <Button type="button" variant="ghost" onClick={prevStep} disabled={currentStep === 1 || form.formState.isSubmitting}>
                    Back
                  </Button>
                  {currentStep < 4 ? (
                    <Button type="button" onClick={nextStep} disabled={!authLoaded}>
                      Continue
                      <ArrowRight className="size-4" />
                    </Button>
                  ) : (
                    <Button type="submit" disabled={!authLoaded || form.formState.isSubmitting}>
                      {form.formState.isSubmitting ? <LoaderCircle className="size-4 animate-spin" /> : null}
                      {t("cta")}
                      {!form.formState.isSubmitting ? <ArrowRight className="size-4" /> : null}
                    </Button>
                  )}
                </div>
              </form>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
