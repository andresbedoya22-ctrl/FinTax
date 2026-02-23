"use client";
/* eslint-disable react-hooks/incompatible-library */

import { useTranslations } from "next-intl";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Globe2, FileText, Landmark, Receipt, HandCoins } from "lucide-react";

import { Button } from "@/components/fintax/Button";
import { useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";

const LANGUAGES = [
  { code: "en", label: "English", flag: "🇬🇧" },
  { code: "es", label: "Español", flag: "🇪🇸" },
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
    setValue(
      "needs",
      current.includes(key) ? current.filter((n) => n !== key) : [...current, key]
    );
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
    <div className="min-h-screen bg-[#08111E] flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="flex items-center gap-2.5 mb-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green to-teal flex items-center justify-center text-sm font-black text-bg">
            F
          </div>
          <span className="font-heading text-lg font-semibold text-text">FinTax</span>
        </div>

        {/* Heading */}
        <h1 className="font-heading text-3xl font-bold text-text mb-2">{t("title")}</h1>
        <p className="text-secondary text-sm mb-10">{t("subtitle")}</p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Language selection */}
          <div>
            <p className="text-sm font-medium text-text mb-3">{t("languageLabel")}</p>
            <div className="grid grid-cols-2 gap-3">
              {LANGUAGES.map((lang) => (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => setValue("language", lang.code)}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all",
                    selectedLanguage === lang.code
                      ? "border-green/50 bg-green/10 text-white"
                      : "border-white/10 bg-white/5 text-white/60 hover:bg-white/[0.08]"
                  )}
                >
                  <span className="text-xl">{lang.flag}</span>
                  <span className="font-medium">{lang.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Needs selection */}
          <div>
            <p className="text-sm font-medium text-text mb-3">{t("needsLabel")}</p>
            <div className="grid gap-2.5">
              {NEEDS.map(({ key, icon: Icon, labelKey }) => {
                const active = selectedNeeds.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleNeed(key)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl border px-4 py-3 text-left text-sm transition-all",
                      active
                        ? "border-green/50 bg-green/10 text-white"
                        : "border-white/10 bg-white/5 text-white/60 hover:bg-white/[0.08]"
                    )}
                  >
                    <Icon className="size-4 shrink-0" aria-hidden="true" />
                    <span className="font-medium">{t(labelKey)}</span>
                    {active && (
                      <span className="ml-auto text-green text-xs font-semibold">✓</span>
                    )}
                  </button>
                );
              })}
            </div>
            {formState.errors.needs && (
              <p className="mt-2 text-xs text-error">{formState.errors.needs.message}</p>
            )}
          </div>

          {serverError && (
            <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              {serverError}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full rounded-xl"
            loading={formState.isSubmitting}
            rightIcon={<ArrowRight className="size-4" />}
          >
            {t("cta")}
          </Button>
        </form>
      </div>
    </div>
  );
}
