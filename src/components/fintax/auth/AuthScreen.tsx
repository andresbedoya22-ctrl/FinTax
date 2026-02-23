"use client";

import { Apple, Check, Eye, EyeOff, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

import { Button } from "@/components/fintax/Button";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";

type AuthMode = "login" | "register";

type FormState = {
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;
type ValidationTranslator = (key: "invalidEmail" | "passwordLength" | "passwordMismatch") => string;

function validate(mode: AuthMode, form: FormState, t: ValidationTranslator): FormErrors {
  const errors: FormErrors = {};
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  if (!emailOk) errors.email = t("invalidEmail");
  if (form.password.length < 8) errors.password = t("passwordLength");
  if (mode === "register" && form.confirmPassword !== form.password) {
    errors.confirmPassword = t("passwordMismatch");
  }

  return errors;
}

const inputClass =
  "h-12 w-full rounded-xl border border-white/10 bg-white/5 px-4 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-green/50 focus:ring-1 focus:ring-green/30 transition-all";

const socialBtnClass =
  "flex items-center justify-center gap-2 h-11 w-full rounded-xl border border-white/10 bg-white/5 text-sm text-white/80 hover:bg-white/[0.08] transition-colors";

const TRUST_ITEMS = [
  "Fixed pricing — know the cost upfront",
  "Human review on every filing",
  "EN · ES · PL · RO support",
] as const;

export function AuthScreen() {
  const router = useRouter();
  const t = useTranslations("Auth");
  const tValidation = useTranslations("Auth.validation");
  const tA11y = useTranslations("Auth.a11y");
  const [mode, setMode] = React.useState<AuthMode>("login");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [form, setForm] = React.useState<FormState>({
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = React.useState<FormErrors>({});

  const onFieldChange =
    (field: keyof FormState) => (event: React.ChangeEvent<HTMLInputElement>) => {
      const value = event.target.value;
      setForm((prev) => ({ ...prev, [field]: value }));
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    };

  const onModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setErrors({});
  };

  const onSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate(mode, form, tValidation);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 250));
    router.push("/app");
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-col justify-between bg-[#08111E] p-10 relative overflow-hidden">
        {/* Subtle green radial glow top-right */}
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(0,230,118,0.07) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 z-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green to-teal flex items-center justify-center text-sm font-black text-bg shrink-0">
            F
          </div>
          <span className="font-heading text-lg font-semibold text-text">FinTax</span>
        </Link>

        {/* Middle content */}
        <div className="z-10 space-y-8">
          <div>
            <p className="text-xs font-semibold uppercase tracking-widest text-green mb-4">
              Trusted by internationals in NL
            </p>
            <h2 className="font-heading text-4xl font-bold text-text leading-tight mb-4">
              Your Dutch taxes,
              <br />
              done right in
              <br />
              your language.
            </h2>
            <p className="text-secondary text-sm leading-relaxed max-w-xs">
              Fixed pricing, human review on every filing, and multilingual support — EN, ES, PL,
              RO. No surprises.
            </p>
          </div>

          <div className="space-y-3">
            {TRUST_ITEMS.map((item) => (
              <div key={item} className="flex items-center gap-3">
                <div className="w-5 h-5 rounded-full bg-green/15 flex items-center justify-center shrink-0">
                  <Check className="size-3 text-green" aria-hidden="true" />
                </div>
                <span className="text-sm text-secondary">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Testimonial */}
        <div className="z-10 bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-sm italic text-secondary leading-relaxed mb-4">
            &ldquo;They translated every Belastingdienst letter and I finally understood what to
            do.&rdquo;
          </p>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-text">Elena P.</p>
              <p className="text-xs text-muted">Employee, Rotterdam</p>
            </div>
            <span className="text-yellow-400 tracking-tight" aria-label="5 stars">
              ★★★★★
            </span>
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL ── */}
      <div className="bg-[#0D1B2A] flex items-center justify-center px-6 py-12">
        <div className="max-w-md w-full mx-auto">
          {/* Mobile-only logo */}
          <div className="flex lg:hidden items-center gap-2.5 mb-8">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green to-teal flex items-center justify-center text-sm font-black text-bg shrink-0">
              F
            </div>
            <span className="font-heading text-lg font-semibold text-text">FinTax</span>
          </div>

          {/* Eyebrow + Title */}
          <div className="mb-8">
            <p className="text-xs font-semibold uppercase tracking-widest text-green mb-2">
              {t("eyebrow")}
            </p>
            <h1 className="font-heading text-3xl font-bold text-text">{t("title")}</h1>
          </div>

          {/* Mode tabs */}
          <div
            className="mb-6 grid grid-cols-2 rounded-xl border border-white/10 bg-white/5 p-1"
            role="tablist"
            aria-label={tA11y("modeLabel")}
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "login"}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                mode === "login" ? "bg-white/10 text-white" : "text-white/50 hover:text-white/80"
              )}
              onClick={() => onModeChange("login")}
            >
              {t("tabs.login")}
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "register"}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                mode === "register"
                  ? "bg-white/10 text-white"
                  : "text-white/50 hover:text-white/80"
              )}
              onClick={() => onModeChange("register")}
            >
              {t("tabs.register")}
            </button>
          </div>

          {/* Social buttons */}
          <div className="mb-5 grid grid-cols-2 gap-3">
            <button type="button" className={socialBtnClass}>
              <svg aria-hidden="true" viewBox="0 0 24 24" className="size-4" fill="currentColor">
                <path d="M12 4.75c1.88 0 3.15.81 3.87 1.48l2.85-2.78C16.97 1.84 14.7.75 12 .75 7.31.75 3.28 3.42 1.29 7.31l3.34 2.59C5.44 6.83 8.42 4.75 12 4.75z" />
                <path d="M23.49 12.27c0-.79-.07-1.54-.21-2.27H12v4.3h6.46c-.28 1.5-1.13 2.78-2.41 3.64l3.7 2.87c2.16-1.99 3.74-4.93 3.74-8.54z" />
                <path d="M4.63 14.1a7.2 7.2 0 010-4.2L1.29 7.31a11.26 11.26 0 000 9.38l3.34-2.59z" />
                <path d="M12 23.25c2.7 0 4.97-.89 6.63-2.43l-3.7-2.87c-1.02.69-2.32 1.1-3.93 1.1-3.58 0-6.56-2.08-7.37-5.15L1.29 16.7c1.99 3.89 6.02 6.55 10.71 6.55z" />
              </svg>
              {t("social.google")}
            </button>
            <button type="button" className={socialBtnClass}>
              <Apple className="size-4" aria-hidden="true" />
              {t("social.apple")}
            </button>
          </div>

          {/* Divider */}
          <div className="mb-5 flex items-center gap-3 text-xs text-muted">
            <span className="h-px flex-1 bg-white/10" />
            <span>{t("social.emailDivider")}</span>
            <span className="h-px flex-1 bg-white/10" />
          </div>

          {/* Form */}
          <form className="space-y-4" onSubmit={onSubmit} noValidate>
            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-1.5 block text-xs text-white/50">
                {t("form.email")}
              </label>
              <div className="relative">
                <Mail
                  className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30"
                  aria-hidden="true"
                />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  value={form.email}
                  onChange={onFieldChange("email")}
                  className={cn(inputClass, "pl-9", errors.email ? "border-error" : "")}
                  placeholder={t("form.emailPlaceholder")}
                />
              </div>
              {errors.email ? <p className="mt-1 text-xs text-error">{errors.email}</p> : null}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-1.5 block text-xs text-white/50">
                {t("form.password")}
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  value={form.password}
                  onChange={onFieldChange("password")}
                  className={cn(inputClass, "pr-10", errors.password ? "border-error" : "")}
                  placeholder={t("form.passwordPlaceholder")}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? tA11y("hidePassword") : tA11y("showPassword")}
                >
                  {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.password ? (
                <p className="mt-1 text-xs text-error">{errors.password}</p>
              ) : null}
            </div>

            {/* Confirm password */}
            {mode === "register" ? (
              <div>
                <label htmlFor="confirmPassword" className="mb-1.5 block text-xs text-white/50">
                  {t("form.confirmPassword")}
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={form.confirmPassword}
                    onChange={onFieldChange("confirmPassword")}
                    className={cn(
                      inputClass,
                      "pr-10",
                      errors.confirmPassword ? "border-error" : ""
                    )}
                    placeholder={t("form.confirmPasswordPlaceholder")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition-colors"
                    onClick={() => setShowConfirmPassword((prev) => !prev)}
                    aria-label={
                      showConfirmPassword
                        ? tA11y("hideConfirmPassword")
                        : tA11y("showConfirmPassword")
                    }
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
                {errors.confirmPassword ? (
                  <p className="mt-1 text-xs text-error">{errors.confirmPassword}</p>
                ) : null}
              </div>
            ) : null}

            {/* Submit */}
            <Button type="submit" size="lg" className="mt-2 w-full rounded-xl" loading={isSubmitting}>
              {mode === "login" ? t("form.submitLogin") : t("form.submitRegister")}
            </Button>
          </form>

          {/* Back link */}
          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-sm text-white/40 underline-offset-4 transition-colors hover:text-white/70 hover:underline"
            >
              {t("form.backToLanding")}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
