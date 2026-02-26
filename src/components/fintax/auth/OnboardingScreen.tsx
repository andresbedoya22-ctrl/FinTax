"use client";
/* eslint-disable react-hooks/incompatible-library */

import { useTranslations } from "next-intl";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Image from "next/image";
import { ArrowRight, Check, FileText, Globe2, HandCoins, Landmark, Languages, Receipt, Shield } from "lucide-react";

import { Button } from "@/components/fintax/Button";
import { Badge, Card } from "@/components/ui";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";

const LANGUAGES = [
  { code: "en", label: "English", short: "EN" },
  { code: "es", label: "Espanol", short: "ES" },
] as const;

const NEEDS = [
  { key: "tax_return", icon: FileText, labelKey: "needTaxReturn" },
  { key: "zorgtoeslag", icon: Landmark, labelKey: "needZorgtoeslag" },
  { key: "huurtoeslag", icon: Receipt, labelKey: "needHuurtoeslag" },
  { key: "zzp", icon: HandCoins, labelKey: "needZzp" },
  { key: "other", icon: Globe2, labelKey: "needOther" },
] as const;

const onboardingSchema = z.object({
  language: z.enum(["en", "es"]),
  needs: z.array(z.string()).min(1, "Select at least one"),
});

type OnboardingValues = z.infer<typeof onboardingSchema>;

export function OnboardingScreen() {
  const t = useTranslations("Onboarding");
  const router = useRouter();
  const supabase = createClient();
  const [serverError, setServerError] = React.useState<string | null>(null);

  const { handleSubmit, setValue, watch, formState } = useForm<OnboardingValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: { language: "en", needs: [] },
  });
  const selectedLanguage = watch("language");
  const selectedNeeds = watch("needs");

  const toggleNeed = (key: string) => {
    const current = selectedNeeds;
    setValue("needs", current.includes(key) ? current.filter((n) => n !== key) : [...current, key], {
      shouldValidate: true,
      shouldTouch: true,
    });
  };

  const onSubmit = async (values: OnboardingValues) => {
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
        preferred_language: values.language,
        onboarding_completed: true,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id);

    if (error) {
      setServerError(error.message);
      return;
    }

    router.push("/app");
  };

  return (
    <div className="min-h-screen bg-mesh technical-lines">
      <div className="mx-auto grid min-h-screen max-w-[1500px] lg:grid-cols-[1.02fr_0.98fr]">
        <aside className="relative hidden overflow-hidden border-r border-border/35 p-8 lg:flex lg:flex-col lg:justify-between xl:p-10">
          <Image
            src="/visuals/hero-bg.svg"
            alt=""
            width={1600}
            height={900}
            aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-35"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-bg via-bg/85 to-surface/80" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 rounded-lg border border-copper/25 bg-copper/8 px-3 py-2">
              <div className="grid h-7 w-7 place-items-center rounded-md border border-copper/25 bg-copper/10 text-copper">F</div>
              <span className="font-heading text-lg tracking-tight text-text">FinTax</span>
            </div>
          </div>

          <div className="relative z-10 space-y-6">
            <Badge variant="copper" className="w-fit">Workspace setup</Badge>
            <div>
              <h1 className="max-w-[14ch] font-heading text-4xl leading-[0.96] tracking-[-0.04em] text-text xl:text-5xl">
                Configure language and case intent before entering the dashboard
              </h1>
              <p className="mt-4 max-w-[48ch] text-sm leading-6 text-secondary">
                This step only sets presentation preferences and your initial service intent. Account logic and navigation remain unchanged.
              </p>
            </div>

            <div className="grid gap-4">
              <Card variant="panel" padding="sm" className="bg-surface/45">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">Workspace preview</p>
                <Image src="/visuals/app-mock.svg" alt="FinTax dashboard mockup" width={1600} height={1000} className="mt-3 h-[190px] w-full rounded-xl border border-border/40 object-cover" />
              </Card>
              <div className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
                <Card variant="soft" padding="sm" className="bg-surface2/45">
                  <p className="text-xs uppercase tracking-[0.14em] text-muted">Letter routing</p>
                  <Image src="/visuals/letter-mock.svg" alt="Official letter mock" width={1400} height={900} className="mt-3 h-[108px] w-full rounded-lg border border-border/40 object-cover" />
                  <p className="mt-3 text-xs leading-5 text-secondary">Letters and filings enter the same secure case workflow after setup.</p>
                </Card>
                <Card variant="soft" padding="sm" className="bg-surface2/45">
                  <div className="flex items-start gap-3">
                    <div className="grid h-9 w-9 place-items-center rounded-full border border-green/20 bg-green/10 text-green">
                      <Shield className="h-4 w-4" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-text">Privacy by default</p>
                      <p className="mt-1 text-xs leading-5 text-muted">Preference and onboarding state are saved to the existing profile record only.</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          </div>

          <div className="relative z-10 rounded-[var(--radius-lg)] border border-border/35 bg-surface/35 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Supported language UI</p>
            <p className="mt-2 text-sm text-secondary">Global interface supports EN, ES, PL and RO. This onboarding preference currently stores EN or ES only.</p>
          </div>
        </aside>

        <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-[680px]">
            <Card variant="panel" padding="none" className="overflow-hidden">
              <div className="border-b border-border/35 bg-surface/45 p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="neutral">
                    <Languages className="h-3.5 w-3.5" />
                    Setup
                  </Badge>
                  <Badge variant="copper">Step 1</Badge>
                </div>
                <h2 className="mt-3 font-heading text-3xl tracking-[-0.03em] text-text sm:text-4xl">{t("title")}</h2>
                <p className="mt-3 max-w-[58ch] text-sm leading-6 text-secondary">{t("subtitle")}</p>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="grid gap-6 p-5 sm:p-6" noValidate>
                <section className="grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">{t("languageLabel")}</p>
                    <span className="text-xs text-secondary">Choose a stored preference</span>
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {LANGUAGES.map((lang) => {
                      const active = selectedLanguage === lang.code;
                      return (
                        <button
                          key={lang.code}
                          type="button"
                          onClick={() => setValue("language", lang.code, { shouldValidate: true, shouldTouch: true })}
                          className={cn(
                            "focus-ring editorial-frame flex items-center gap-3 rounded-[var(--radius-lg)] border px-4 py-3 text-left transition",
                            active
                              ? "border-green/30 bg-green/8 text-text"
                              : "border-border/35 bg-surface2/28 text-secondary hover:border-copper/20 hover:bg-surface2/38 hover:text-text"
                          )}
                          aria-pressed={active}
                        >
                          <span className={cn(
                            "inline-flex min-w-11 items-center justify-center rounded-md border px-2 py-1 text-[11px] font-semibold tracking-[0.12em]",
                            active ? "border-green/25 bg-green/10 text-green" : "border-border/35 bg-surface/45 text-muted"
                          )}>
                            {lang.short}
                          </span>
                          <span className="flex-1 text-sm font-medium">{lang.label}</span>
                          {active ? <Check className="h-4 w-4 text-green" aria-hidden="true" /> : null}
                        </button>
                      );
                    })}
                  </div>
                </section>

                <section className="grid gap-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">{t("needsLabel")}</p>
                    <span className="text-xs text-secondary">Select all that apply</span>
                  </div>
                  <div className="grid gap-2.5">
                    {NEEDS.map(({ key, icon: Icon, labelKey }) => {
                      const active = selectedNeeds.includes(key);
                      return (
                        <button
                          key={key}
                          type="button"
                          onClick={() => toggleNeed(key)}
                          className={cn(
                            "focus-ring editorial-frame flex items-center gap-3 rounded-[var(--radius-lg)] border px-4 py-3 text-left transition",
                            active
                              ? "border-green/28 bg-green/8 text-text"
                              : "border-border/35 bg-surface2/25 text-secondary hover:border-border/55 hover:bg-surface2/35 hover:text-text"
                          )}
                          aria-pressed={active}
                        >
                          <div className={cn(
                            "grid h-9 w-9 shrink-0 place-items-center rounded-full border",
                            active ? "border-green/20 bg-green/10 text-green" : "border-border/35 bg-surface/45 text-muted"
                          )}>
                            <Icon className="h-4 w-4" aria-hidden="true" />
                          </div>
                          <span className="flex-1 text-sm font-medium">{t(labelKey)}</span>
                          {active ? <Check className="h-4 w-4 text-green" aria-hidden="true" /> : null}
                        </button>
                      );
                    })}
                  </div>
                  {formState.errors.needs ? (
                    <p className="text-xs text-error">{formState.errors.needs.message}</p>
                  ) : null}
                </section>

                {serverError ? (
                  <div className="rounded-[var(--radius-lg)] border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{serverError}</div>
                ) : null}

                <div className="grid gap-3 border-t border-border/35 pt-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <p className="text-xs leading-5 text-muted">
                    Your selections initialize dashboard defaults and can be changed later in settings.
                  </p>
                  <Button
                    type="submit"
                    size="lg"
                    className="w-full rounded-xl sm:w-auto"
                    loading={formState.isSubmitting}
                    rightIcon={<ArrowRight className="size-4" />}
                  >
                    {t("cta")}
                  </Button>
                </div>
              </form>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}
