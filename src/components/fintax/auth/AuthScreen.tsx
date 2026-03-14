"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AlertTriangle, Apple, Eye, EyeOff, LoaderCircle, Lock, Mail, ShieldCheck } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";
import { Badge, Button, Input, Tabs, TabsList, TabsTrigger, buttonVariants } from "@/components/ui";

type AuthMode = "login" | "register" | "forgot";
type AppLocale = "en" | "es" | "pl" | "ro" | "nl";
type AuthIntent = "tax-return" | "benefits";
type PendingAuthIntent = { intent: AuthIntent; service?: string; next: string };
type AuthScreenSearchParams = {
  intent?: string;
  service?: string;
  next?: string;
  reason?: string;
};

const AUTH_INTENT_SESSION_KEY = "fintax.pending_intent";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
const registerSchema = z
  .object({
    fullName: z.string().min(2),
    email: z.string().email(),
    password: z.string().min(8),
    confirmPassword: z.string().min(8),
    terms: z.boolean().refine((v) => v === true, { message: "You must accept terms and privacy notice." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });
const forgotSchema = z.object({ email: z.string().email() });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type ForgotValues = z.infer<typeof forgotSchema>;

const authCopy = {
  en: {
    title: "Welcome back",
    registerHint: "First time here?",
    registerHintLink: "Create your free account",
    loginSubtitle: "Sign in to continue with your FinTax case workspace.",
    registerSubtitle: "Create your account to start secure intake and onboarding.",
    forgotTitle: "Reset your password",
    forgotSubtitle: "Enter your account email and we will send a secure reset link.",
    forgotLink: "Forgot your password?",
    forgotSubmit: "Send reset link",
    forgotBack: "Back to sign in",
    resetInfo: "If this email exists, a reset link has been sent.",
    trustEyebrow: "Account trust and security",
    trustTitle: "Recover what matters, with a controlled process.",
    trustBody: "Authentication, route protection and onboarding checks run in the same operational workflow.",
    trustList: [
      "Specialist-reviewed tax workflow after login",
      "Locale-aware routes and secure callback handling",
      "No guaranteed outcomes or fabricated claims",
    ],
    quoteLabel: "Internal placeholder",
    quoteText: "Trust panel quote intentionally marked as placeholder until a verified testimonial source is approved.",
    quoteAuthor: "Placeholder source - not public proof",
  },
  es: {
    title: "Bienvenido de nuevo",
    registerHint: "Primera vez?",
    registerHintLink: "Crea tu cuenta gratis",
    loginSubtitle: "Inicia sesion para continuar en tu workspace de FinTax.",
    registerSubtitle: "Crea tu cuenta para empezar intake seguro y onboarding.",
    forgotTitle: "Restablecer contrasena",
    forgotSubtitle: "Introduce el correo de tu cuenta y enviaremos un enlace seguro.",
    forgotLink: "Olvidaste tu contrasena?",
    forgotSubmit: "Enviar enlace",
    forgotBack: "Volver a iniciar sesion",
    resetInfo: "Si este correo existe, se envio un enlace de recuperacion.",
    trustEyebrow: "Confianza y seguridad",
    trustTitle: "Recupera lo que te corresponde, con proceso controlado.",
    trustBody: "La autenticacion, proteccion de rutas y checks de onboarding funcionan en el mismo flujo operativo.",
    trustList: [
      "Flujo fiscal con revision profesional tras iniciar sesion",
      "Rutas por locale y callback seguro",
      "Sin promesas garantizadas ni claims inventados",
    ],
    quoteLabel: "Placeholder interno",
    quoteText: "La cita del panel de confianza esta marcada como placeholder hasta contar con fuente verificable.",
    quoteAuthor: "Fuente placeholder - no prueba publica",
  },
} as const;

function uiText(locale: string) {
  return authCopy[(locale === "es" ? "es" : "en") as keyof typeof authCopy];
}

function normalizeIntentPath(intent?: string | null, service?: string | null) {
  const resolvedIntent: AuthIntent | null = intent === "benefits" || intent === "tax-return" ? intent : null;
  if (!resolvedIntent) return "/app";
  const base = resolvedIntent === "benefits" ? "/benefits" : "/tax-return";
  if (!service) return base;
  const params = new URLSearchParams({ service });
  return `${base}?${params.toString()}`;
}

function readPendingIntent(searchParams: URLSearchParams | AuthScreenSearchParams): PendingAuthIntent | null {
  const get = (key: keyof AuthScreenSearchParams) =>
    searchParams instanceof URLSearchParams ? searchParams.get(key) : searchParams[key] ?? null;
  const intent = get("intent");
  const service = get("service");
  const next = get("next");
  if (next && next.startsWith("/")) return { intent: "tax-return", next, service: undefined };
  if (intent === "tax-return" || intent === "benefits") {
    return { intent, service: service ?? undefined, next: normalizeIntentPath(intent, service) };
  }
  return null;
}

function getStoredPendingIntent(): PendingAuthIntent | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.sessionStorage.getItem(AUTH_INTENT_SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Partial<PendingAuthIntent>;
    if (!parsed.next || typeof parsed.next !== "string" || !parsed.next.startsWith("/")) return null;
    return {
      intent: parsed.intent === "benefits" ? "benefits" : "tax-return",
      service: typeof parsed.service === "string" ? parsed.service : undefined,
      next: parsed.next,
    };
  } catch {
    return null;
  }
}

function storePendingIntent(pending: PendingAuthIntent | null) {
  if (typeof window === "undefined") return;
  if (!pending) {
    window.sessionStorage.removeItem(AUTH_INTENT_SESSION_KEY);
    return;
  }
  window.sessionStorage.setItem(AUTH_INTENT_SESSION_KEY, JSON.stringify(pending));
}

function resolveAuthSuccessPath(searchParams: URLSearchParams | AuthScreenSearchParams) {
  return readPendingIntent(searchParams)?.next ?? getStoredPendingIntent()?.next ?? "/app";
}

function withLocalePrefix(path: string, locale: AppLocale) {
  if (path.startsWith(`/${locale}/`)) return path;
  return `/${locale}${path}`;
}

function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return <label htmlFor={htmlFor} className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-muted">{children}</label>;
}

function FieldMessage({ error }: { error?: string }) {
  if (!error) return null;
  return <p className="mt-1.5 text-xs text-error">{error}</p>;
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 flex items-start gap-3 rounded-[var(--radius-md)] border border-error/30 bg-error/10 px-4 py-3 text-sm text-red-200">
      <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" />
      <p>{message}</p>
    </div>
  );
}

function InfoBanner({ message }: { message: string }) {
  return (
    <div className="mb-4 rounded-[var(--radius-md)] border border-green/30 bg-green/10 px-4 py-3 text-sm text-secondary">
      {message}
    </div>
  );
}

export function AuthScreen({ initialSearchParams = {} }: { initialSearchParams?: AuthScreenSearchParams }) {
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const t = useTranslations("Auth");
  const tA11y = useTranslations("Auth.a11y");
  const local = uiText(locale);
  const supabase = createClient();
  const isAppleEnabled = process.env.NEXT_PUBLIC_AUTH_APPLE_ENABLED === "true";

  const [mode, setMode] = React.useState<AuthMode>("login");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [forgotInfo, setForgotInfo] = React.useState<string | null>(null);
  const [isAppleLoading, setIsAppleLoading] = React.useState(false);
  const pendingIntent = readPendingIntent(initialSearchParams);
  const mfaRequired = initialSearchParams.reason === "mfa_required";

  React.useEffect(() => {
    storePendingIntent(pendingIntent);
  }, [pendingIntent]);

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", fullName: "", terms: false },
  });
  const forgotForm = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema), defaultValues: { email: "" } });

  const isSubmitting =
    mode === "login"
      ? loginForm.formState.isSubmitting
      : mode === "register"
        ? registerForm.formState.isSubmitting
        : forgotForm.formState.isSubmitting;

  const onModeChange = (nextMode: AuthMode) => {
    setMode(nextMode);
    setServerError(null);
    setForgotInfo(null);
  };

  const onLoginSubmit = async (values: LoginValues) => {
    setServerError(null);
    if (!supabase) return setServerError("Supabase is not configured in this environment.");
    const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
    if (error) return setServerError(error.message);
    router.push(resolveAuthSuccessPath(initialSearchParams));
  };

  const onRegisterSubmit = async (values: RegisterValues) => {
    setServerError(null);
    if (!supabase) return setServerError("Supabase is not configured in this environment.");
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: {
        data: { full_name: values.fullName },
        emailRedirectTo: `${window.location.origin}/${locale}/auth/callback?next=${encodeURIComponent(withLocalePrefix(resolveAuthSuccessPath(initialSearchParams), locale))}`,
      },
    });
    if (error) return setServerError(error.message);
    const nextPath = resolveAuthSuccessPath(initialSearchParams);
    router.push(nextPath === "/app" ? "/onboarding" : `/onboarding?next=${encodeURIComponent(nextPath)}`);
  };

  const onGoogleLogin = async () => {
    setServerError(null);
    if (!supabase) return setServerError("Supabase is not configured in this environment.");
    const nextPath = resolveAuthSuccessPath(initialSearchParams);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/${locale}/auth/callback?next=${encodeURIComponent(withLocalePrefix(nextPath, locale))}` },
    });
    if (error) setServerError(error.message);
  };

  const onAppleClick = async () => {
    setServerError(null);
    if (!supabase) return setServerError("Supabase is not configured in this environment.");
    if (!isAppleEnabled) return;
    setIsAppleLoading(true);
    const nextPath = resolveAuthSuccessPath(initialSearchParams);
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "apple",
      options: { redirectTo: `${window.location.origin}/${locale}/auth/callback?next=${encodeURIComponent(withLocalePrefix(nextPath, locale))}` },
    });
    setIsAppleLoading(false);
    if (error) setServerError(error.message);
  };

  const onForgotSubmit = async (values: ForgotValues) => {
    setServerError(null);
    setForgotInfo(null);
    if (!supabase) return setServerError("Supabase is not configured in this environment.");
    const redirectTo = `${window.location.origin}/${locale}/auth`;
    const { error } = await supabase.auth.resetPasswordForEmail(values.email, { redirectTo });
    if (error) return setServerError(error.message);
    setForgotInfo(local.resetInfo);
  };

  return (
    <div className="min-h-screen bg-[#f7faf7]">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-2">
        <section className="flex items-center justify-center bg-white px-6 py-10 lg:px-12">
          <div className="w-full max-w-[500px]">
            <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-md text-text">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-green/35 bg-green/10 text-xs font-black text-green">F</span>
              <span className="font-heading text-xl tracking-tight">FinTax</span>
            </Link>

            <div className="mt-10">
              <h1 className="font-heading text-6xl leading-[0.95] tracking-[-0.03em] text-text">{local.title}</h1>
              {mode !== "forgot" ? (
                <p className="mt-3 text-2xl text-secondary">
                  {local.registerHint}{" "}
                  <button type="button" className="focus-ring underline underline-offset-4 hover:text-text" onClick={() => onModeChange("register")}>
                    {local.registerHintLink}
                  </button>
                </p>
              ) : null}
            </div>

            <div className="mt-8 rounded-[var(--radius-xl)] border border-border/55 bg-surface p-6">
              <Tabs value={mode === "forgot" ? "login" : mode} defaultValue="login" onValueChange={(value) => onModeChange(value as AuthMode)} className="mb-5">
                <TabsList className="w-full">
                  <TabsTrigger value="login" className="flex-1">{t("tabs.login")}</TabsTrigger>
                  <TabsTrigger value="register" className="flex-1">{t("tabs.register")}</TabsTrigger>
                </TabsList>
              </Tabs>

              {serverError ? <ErrorBanner message={serverError} /> : null}
              {forgotInfo && mode === "forgot" ? <InfoBanner message={forgotInfo} /> : null}
              {mfaRequired ? <InfoBanner message="Admin access requires MFA. Sign in and complete enrollment first." /> : null}

              {mode === "login" ? <p className="mb-4 text-sm text-secondary">{local.loginSubtitle}</p> : null}
              {mode === "register" ? <p className="mb-4 text-sm text-secondary">{local.registerSubtitle}</p> : null}

              {mode !== "forgot" ? (
                <>
                  <div className="mb-4 space-y-2">
                    <Button type="button" variant="secondary" className="h-12 w-full justify-center text-base" onClick={onGoogleLogin}>
                      {t("social.google")}
                    </Button>
                    {isAppleEnabled ? (
                      <Button type="button" variant="secondary" className="h-12 w-full justify-center text-base" disabled={isAppleLoading} onClick={onAppleClick}>
                        {isAppleLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Apple className="h-4 w-4" />}
                        {t("social.apple")}
                      </Button>
                    ) : null}
                  </div>
                  <div className="mb-5 flex items-center gap-3 text-sm text-muted">
                    <span className="h-px flex-1 bg-border/50" />
                    <span>{t("social.emailDivider")}</span>
                    <span className="h-px flex-1 bg-border/50" />
                  </div>
                </>
              ) : null}

              {mode === "login" && (
                <form className="space-y-4" onSubmit={loginForm.handleSubmit(onLoginSubmit)} noValidate>
                  <div>
                    <FieldLabel htmlFor="login-email">{t("form.email")}</FieldLabel>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <Input
                        id="login-email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@email.com"
                        {...loginForm.register("email")}
                        className={cn("h-12 pl-10 text-base", loginForm.formState.errors.email && "border-error/60 focus-visible:border-error")}
                      />
                    </div>
                    <FieldMessage error={loginForm.formState.errors.email?.message} />
                  </div>

                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <FieldLabel htmlFor="login-password">{t("form.password")}</FieldLabel>
                      <button type="button" className="focus-ring text-sm text-secondary underline underline-offset-4 hover:text-text" onClick={() => onModeChange("forgot")}>
                        {local.forgotLink}
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <Input
                        id="login-password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="Enter your password"
                        {...loginForm.register("password")}
                        className={cn("h-12 pl-10 pr-10 text-base", loginForm.formState.errors.password && "border-error/60 focus-visible:border-error")}
                      />
                      <button
                        type="button"
                        className="focus-ring absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-text"
                        onClick={() => setShowPassword((prev) => !prev)}
                        aria-label={showPassword ? tA11y("hidePassword") : tA11y("showPassword")}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <FieldMessage error={loginForm.formState.errors.password?.message} />
                  </div>

                  <Button type="submit" size="lg" className="h-12 w-full justify-center text-base" disabled={isSubmitting}>
                    {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    {t("form.submitLogin")}
                  </Button>
                </form>
              )}

              {mode === "register" && (
                <form className="space-y-4" onSubmit={registerForm.handleSubmit(onRegisterSubmit)} noValidate>
                  <div>
                    <FieldLabel htmlFor="reg-name">{t("form.fullName")}</FieldLabel>
                    <Input
                      id="reg-name"
                      type="text"
                      autoComplete="name"
                      placeholder="Your full name"
                      {...registerForm.register("fullName")}
                      className={cn("h-12 text-base", registerForm.formState.errors.fullName && "border-error/60 focus-visible:border-error")}
                    />
                    <FieldMessage error={registerForm.formState.errors.fullName?.message} />
                  </div>

                  <div>
                    <FieldLabel htmlFor="reg-email">{t("form.email")}</FieldLabel>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <Input
                        id="reg-email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@email.com"
                        {...registerForm.register("email")}
                        className={cn("h-12 pl-10 text-base", registerForm.formState.errors.email && "border-error/60 focus-visible:border-error")}
                      />
                    </div>
                    <FieldMessage error={registerForm.formState.errors.email?.message} />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div>
                      <FieldLabel htmlFor="reg-password">{t("form.password")}</FieldLabel>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <Input
                          id="reg-password"
                          type={showPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="At least 8 characters"
                          {...registerForm.register("password")}
                          className={cn("h-12 pl-10 pr-10 text-base", registerForm.formState.errors.password && "border-error/60 focus-visible:border-error")}
                        />
                        <button
                          type="button"
                          className="focus-ring absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-text"
                          onClick={() => setShowPassword((prev) => !prev)}
                          aria-label={showPassword ? tA11y("hidePassword") : tA11y("showPassword")}
                        >
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <FieldMessage error={registerForm.formState.errors.password?.message} />
                    </div>
                    <div>
                      <FieldLabel htmlFor="reg-confirm">{t("form.confirmPassword")}</FieldLabel>
                      <div className="relative">
                        <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <Input
                          id="reg-confirm"
                          type={showConfirmPassword ? "text" : "password"}
                          autoComplete="new-password"
                          placeholder="Repeat password"
                          {...registerForm.register("confirmPassword")}
                          className={cn("h-12 pl-10 pr-10 text-base", registerForm.formState.errors.confirmPassword && "border-error/60 focus-visible:border-error")}
                        />
                        <button
                          type="button"
                          className="focus-ring absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-text"
                          onClick={() => setShowConfirmPassword((prev) => !prev)}
                          aria-label={showConfirmPassword ? tA11y("hideConfirmPassword") : tA11y("showConfirmPassword")}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </div>
                      <FieldMessage error={registerForm.formState.errors.confirmPassword?.message} />
                    </div>
                  </div>

                  <label htmlFor="reg-terms" className="flex items-start gap-3 rounded-[var(--radius-md)] border border-border/45 bg-surface2/35 p-3 text-sm text-secondary">
                    <input
                      id="reg-terms"
                      type="checkbox"
                      {...registerForm.register("terms")}
                      className="mt-0.5 h-4 w-4 rounded border-border/70 bg-surface2/70 accent-[rgb(var(--accent-green))]"
                    />
                    <span className="leading-6">
                      {t("form.termsLabel")}{" "}
                      <Link href="/legal/terms" className="text-copper underline underline-offset-4">{t("form.termsLink")}</Link>
                    </span>
                  </label>
                  {registerForm.formState.errors.terms ? <p className="text-xs text-error">{String(registerForm.formState.errors.terms.message)}</p> : null}

                  <Button type="submit" size="lg" className="h-12 w-full justify-center text-base" disabled={isSubmitting}>
                    {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                    {t("form.submitRegister")}
                  </Button>
                </form>
              )}

              {mode === "forgot" && (
                <form className="space-y-4" onSubmit={forgotForm.handleSubmit(onForgotSubmit)} noValidate>
                  <div>
                    <h2 className="font-heading text-3xl tracking-[-0.03em] text-text">{local.forgotTitle}</h2>
                    <p className="mt-2 text-sm leading-6 text-secondary">{local.forgotSubtitle}</p>
                  </div>
                  <div>
                    <FieldLabel htmlFor="forgot-email">{t("form.email")}</FieldLabel>
                    <div className="relative">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                      <Input
                        id="forgot-email"
                        type="email"
                        autoComplete="email"
                        placeholder="name@email.com"
                        {...forgotForm.register("email")}
                        className={cn("h-12 pl-10 text-base", forgotForm.formState.errors.email && "border-error/60 focus-visible:border-error")}
                      />
                    </div>
                    <FieldMessage error={forgotForm.formState.errors.email?.message} />
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button type="submit" size="lg" className="h-12" disabled={isSubmitting}>
                      {isSubmitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}
                      {local.forgotSubmit}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => onModeChange("login")}>{local.forgotBack}</Button>
                  </div>
                </form>
              )}

              <div className="mt-6 border-t border-border/35 pt-5 text-center">
                <p className="mb-3 text-xs text-muted">By continuing, you accept Terms and Privacy Notice.</p>
                <div className="mb-4 flex items-center justify-center gap-3 text-xs">
                  <Link href="/legal/terms" className="text-secondary hover:text-text">Terms</Link>
                  <span className="text-muted">|</span>
                  <Link href="/legal/privacy" className="text-secondary hover:text-text">Privacy</Link>
                </div>
                <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "border-transparent")}>{t("form.backToLanding")}</Link>
              </div>
            </div>
          </div>
        </section>

        <aside className="relative hidden overflow-hidden bg-[#123525] lg:flex lg:flex-col lg:justify-between lg:px-14 lg:py-12">
          <div className="absolute inset-0 bg-gradient-to-br from-[#184f38] via-[#123525] to-[#0f2e22]" />
          <div className="absolute right-[-40px] top-[35%] h-[260px] w-[260px] rounded-full bg-green/20 blur-3xl" aria-hidden="true" />
          <div className="absolute bottom-[-120px] left-[-80px] h-[280px] w-[280px] rounded-full bg-green/15 blur-3xl" aria-hidden="true" />

          <div className="relative z-10">
            <Badge variant="success">{local.trustEyebrow}</Badge>
            <h2 className="mt-6 max-w-[12ch] font-heading text-6xl leading-[0.92] tracking-[-0.04em] text-white">{local.trustTitle}</h2>
            <p className="mt-6 max-w-[48ch] text-2xl leading-tight text-white/85">{local.trustBody}</p>
            <div className="mt-8 h-px w-full bg-white/25" />
            <ul className="mt-7 space-y-3">
              {local.trustList.map((item) => (
                <li key={item} className="flex items-start gap-3 text-2xl leading-tight text-white/90">
                  <ShieldCheck className="mt-1 h-6 w-6 text-green-200" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="relative z-10 mt-10 rounded-[var(--radius-xl)] border border-white/25 bg-white p-6 text-[#102217]">
            <p className="text-xs uppercase tracking-[0.12em] text-[#2f5b46]">{local.quoteLabel}</p>
            <p className="mt-2 text-2xl leading-snug">{local.quoteText}</p>
            <p className="mt-3 text-lg text-[#244233]">{local.quoteAuthor}</p>
          </div>
        </aside>
      </div>
    </div>
  );
}
