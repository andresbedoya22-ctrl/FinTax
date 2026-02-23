"use client";

import { Apple, Check, Eye, EyeOff, Mail } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

import { Button } from "@/components/fintax/Button";
import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";

type AuthMode = "login" | "register";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

const registerSchema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    terms: z.boolean().refine((v) => v === true, { message: "You must accept the terms" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;

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
  const tA11y = useTranslations("Auth.a11y");
  const supabase = createClient();

  const [mode, setMode] = React.useState<AuthMode>("login");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);

  const loginForm = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "" },
  });

  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      email: "",
      password: "",
      confirmPassword: "",
      fullName: "",
      terms: false,
    },
  });

  const isSubmitting =
    mode === "login"
      ? loginForm.formState.isSubmitting
      : registerForm.formState.isSubmitting;

  const onModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setServerError(null);
    loginForm.reset();
    registerForm.reset();
  };

  const onLoginSubmit = async (values: LoginValues) => {
    setServerError(null);
    if (!supabase) {
      setServerError("Supabase is not configured in this environment.");
      return;
    }
    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    router.push("/app");
  };

  const onRegisterSubmit = async (values: RegisterValues) => {
    setServerError(null);
    if (!supabase) {
      setServerError("Supabase is not configured in this environment.");
      return;
    }
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName },
        emailRedirectTo: `${window.location.origin}/en/auth/callback`,
      },
    });
    if (error) {
      setServerError(error.message);
      return;
    }
    router.push("/onboarding");
  };

  const onGoogleLogin = async () => {
    if (!supabase) {
      setServerError("Supabase is not configured in this environment.");
      return;
    }
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/en/auth/callback`,
      },
    });
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      {/* ── LEFT PANEL ── */}
      <div className="hidden lg:flex flex-col justify-between bg-[#08111E] p-10 relative overflow-hidden">
        <div
          className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none"
          style={{
            background:
              "radial-gradient(circle at top right, rgba(0,230,118,0.07) 0%, transparent 60%)",
          }}
          aria-hidden="true"
        />

        <Link href="/" className="flex items-center gap-2.5 z-10">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-green to-teal flex items-center justify-center text-sm font-black text-bg shrink-0">
            F
          </div>
          <span className="font-heading text-lg font-semibold text-text">FinTax</span>
        </Link>

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
            <button type="button" className={socialBtnClass} onClick={onGoogleLogin}>
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

          {/* Server error */}
          {serverError && (
            <div className="mb-4 rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">
              {serverError}
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === "login" && (
            <form
              className="space-y-4"
              onSubmit={loginForm.handleSubmit(onLoginSubmit)}
              noValidate
            >
              <div>
                <label htmlFor="login-email" className="mb-1.5 block text-xs text-white/50">
                  {t("form.email")}
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30"
                    aria-hidden="true"
                  />
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    {...loginForm.register("email")}
                    className={cn(
                      inputClass,
                      "pl-9",
                      loginForm.formState.errors.email ? "border-error" : ""
                    )}
                    placeholder={t("form.emailPlaceholder")}
                  />
                </div>
                {loginForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-error">
                    {loginForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="login-password" className="mb-1.5 block text-xs text-white/50">
                  {t("form.password")}
                </label>
                <div className="relative">
                  <input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    {...loginForm.register("password")}
                    className={cn(
                      inputClass,
                      "pr-10",
                      loginForm.formState.errors.password ? "border-error" : ""
                    )}
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
                {loginForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-error">
                    {loginForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <Button
                type="submit"
                size="lg"
                className="mt-2 w-full rounded-xl"
                loading={isSubmitting}
              >
                {t("form.submitLogin")}
              </Button>
            </form>
          )}

          {/* REGISTER FORM */}
          {mode === "register" && (
            <form
              className="space-y-4"
              onSubmit={registerForm.handleSubmit(onRegisterSubmit)}
              noValidate
            >
              <div>
                <label htmlFor="reg-name" className="mb-1.5 block text-xs text-white/50">
                  {t("form.fullName")}
                </label>
                <input
                  id="reg-name"
                  type="text"
                  autoComplete="name"
                  {...registerForm.register("fullName")}
                  className={cn(
                    inputClass,
                    registerForm.formState.errors.fullName ? "border-error" : ""
                  )}
                  placeholder={t("form.fullNamePlaceholder")}
                />
                {registerForm.formState.errors.fullName && (
                  <p className="mt-1 text-xs text-error">
                    {registerForm.formState.errors.fullName.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="reg-email" className="mb-1.5 block text-xs text-white/50">
                  {t("form.email")}
                </label>
                <div className="relative">
                  <Mail
                    className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-white/30"
                    aria-hidden="true"
                  />
                  <input
                    id="reg-email"
                    type="email"
                    autoComplete="email"
                    {...registerForm.register("email")}
                    className={cn(
                      inputClass,
                      "pl-9",
                      registerForm.formState.errors.email ? "border-error" : ""
                    )}
                    placeholder={t("form.emailPlaceholder")}
                  />
                </div>
                {registerForm.formState.errors.email && (
                  <p className="mt-1 text-xs text-error">
                    {registerForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="reg-password" className="mb-1.5 block text-xs text-white/50">
                  {t("form.password")}
                </label>
                <div className="relative">
                  <input
                    id="reg-password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...registerForm.register("password")}
                    className={cn(
                      inputClass,
                      "pr-10",
                      registerForm.formState.errors.password ? "border-error" : ""
                    )}
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
                {registerForm.formState.errors.password && (
                  <p className="mt-1 text-xs text-error">
                    {registerForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="reg-confirm" className="mb-1.5 block text-xs text-white/50">
                  {t("form.confirmPassword")}
                </label>
                <div className="relative">
                  <input
                    id="reg-confirm"
                    type={showConfirmPassword ? "text" : "password"}
                    autoComplete="new-password"
                    {...registerForm.register("confirmPassword")}
                    className={cn(
                      inputClass,
                      "pr-10",
                      registerForm.formState.errors.confirmPassword ? "border-error" : ""
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
                {registerForm.formState.errors.confirmPassword && (
                  <p className="mt-1 text-xs text-error">
                    {registerForm.formState.errors.confirmPassword.message}
                  </p>
                )}
              </div>

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input
                  id="reg-terms"
                  type="checkbox"
                  {...registerForm.register("terms")}
                  className="mt-0.5 h-4 w-4 shrink-0 accent-green"
                />
                <label htmlFor="reg-terms" className="text-xs text-white/50 leading-relaxed">
                  {t("form.termsLabel")}{" "}
                  <a href="#" className="text-teal underline-offset-2 hover:underline">
                    {t("form.termsLink")}
                  </a>
                </label>
              </div>

              <Button
                type="submit"
                size="lg"
                className="mt-2 w-full rounded-xl"
                loading={isSubmitting}
              >
                {t("form.submitRegister")}
              </Button>
            </form>
          )}

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
