"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
  AlertTriangle,
  Apple,
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Clock3,
  FileCheck2,
  FileLock2,
  Landmark,
} from "lucide-react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import * as React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Link, useRouter } from "@/i18n/navigation";
import { cn } from "@/lib/cn";
import { createClient } from "@/lib/supabase/client";
import { Badge, Button, Card, Input, Tabs, TabsList, TabsTrigger, Textarea, buttonVariants } from "@/components/ui";

type AuthMode = "login" | "register" | "forgot";
type AppLocale = "en" | "es" | "pl" | "ro" | "nl";

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(8) });
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
const forgotSchema = z.object({ email: z.string().email(), note: z.string().optional() });

type LoginValues = z.infer<typeof loginSchema>;
type RegisterValues = z.infer<typeof registerSchema>;
type ForgotValues = z.infer<typeof forgotSchema>;

const TRUST_ITEMS = [
  { icon: ShieldCheck, text: "Fixed pricing and clear scope before work starts" },
  { icon: FileCheck2, text: "Human-reviewed filings and multilingual guidance" },
  { icon: FileLock2, text: "Secure upload flow for tax documents and letters" },
  { icon: Clock3, text: "Fast response expectations and status visibility" },
] as const;

const extraCopy = {
  en: {
    authTitle: "Premium account access",
    authSubtitle: "Access your secure workspace for tax returns, letters and benefits. The underlying auth flow remains unchanged in this UI refactor.",
    forgotTitle: "Forgot password",
    forgotSubtitle: "Enter your email to continue. Password reset delivery is a UI placeholder in this phase.",
    rememberMe: "Remember me on this device",
    forgotLink: "Forgot password?",
    secureMicrocopy: "Secure sign-in. Your credentials are handled through the existing authentication flow.",
    forgotSubmit: "Continue",
    forgotBack: "Back to login",
    forgotBanner: "Password reset flow placeholder. Auth backend behavior was intentionally left unchanged in this phase.",
    leftEyebrow: "Editorial fintech authentication",
    leftTitle: "Serious access for serious tax work",
    leftBody: "One workspace for filings, government letters and multilingual guidance. Designed to reduce confusion at the first authenticated step.",
    quote: "The process felt secure and clear from the first login screen.",
    quoteRole: "Client - Rotterdam",
  },
  es: {
    authTitle: "Acceso premium a la cuenta",
    authSubtitle: "Accede a tu espacio seguro para declaraciones, cartas y beneficios. El flujo de autenticacion no cambia en este refactor UI.",
    forgotTitle: "Olvide mi contrasena",
    forgotSubtitle: "Introduce tu correo para continuar. El envio de reset es un placeholder UI en esta fase.",
    rememberMe: "Recordarme en este dispositivo",
    forgotLink: "Olvidaste tu contrasena?",
    secureMicrocopy: "Inicio de sesion seguro. Tus credenciales usan el flujo de autenticacion existente.",
    forgotSubmit: "Continuar",
    forgotBack: "Volver a iniciar sesion",
    forgotBanner: "Placeholder de reset de contrasena. La logica backend de auth no se modifico en esta fase.",
    leftEyebrow: "Autenticacion fintech editorial",
    leftTitle: "Acceso serio para trabajo fiscal serio",
    leftBody: "Un solo espacio para declaraciones, cartas oficiales y soporte multilingue.",
    quote: "El proceso se sintio seguro y claro desde la primera pantalla.",
    quoteRole: "Cliente - Rotterdam",
  },
  pl: {
    authTitle: "Premium dostep do konta",
    authSubtitle: "Bezpieczny workspace dla deklaracji, pism i benefitow. Logika auth pozostaje bez zmian w tym refaktorze UI.",
    forgotTitle: "Nie pamietam hasla",
    forgotSubtitle: "Podaj email, aby kontynuowac. Reset hasla to placeholder UI w tej fazie.",
    rememberMe: "Zapamietaj mnie na tym urzadzeniu",
    forgotLink: "Zapomniales hasla?",
    secureMicrocopy: "Bezpieczne logowanie. Dane logowania sa obslugiwane przez istniejacy flow auth.",
    forgotSubmit: "Kontynuuj",
    forgotBack: "Wroc do logowania",
    forgotBanner: "Placeholder resetu hasla. Logika backend auth pozostala bez zmian w tej fazie.",
    leftEyebrow: "Autoryzacja fintech editorial",
    leftTitle: "Powazny dostep do powaznej pracy podatkowej",
    leftBody: "Jeden workspace dla deklaracji, pism urzedowych i wsparcia wielojezycznego.",
    quote: "Ekran logowania od razu budowal zaufanie i porzadek procesu.",
    quoteRole: "Klient - Rotterdam",
  },
  ro: {
    authTitle: "Acces premium la cont",
    authSubtitle: "Acces la workspace securizat pentru declaratii, scrisori si beneficii. Fluxul auth existent ramane neschimbat.",
    forgotTitle: "Am uitat parola",
    forgotSubtitle: "Introdu emailul pentru a continua. Resetarea parolei este placeholder UI in aceasta faza.",
    rememberMe: "Tine-ma minte pe acest dispozitiv",
    forgotLink: "Ai uitat parola?",
    secureMicrocopy: "Autentificare securizata. Credentialele folosesc fluxul existent de autentificare.",
    forgotSubmit: "Continua",
    forgotBack: "Inapoi la login",
    forgotBanner: "Placeholder pentru reset parola. Logica backend auth nu a fost modificata in aceasta faza.",
    leftEyebrow: "Autentificare fintech editoriala",
    leftTitle: "Acces serios pentru munca fiscala serioasa",
    leftBody: "Un singur workspace pentru declaratii, scrisori oficiale si suport multilingv.",
    quote: "Prima impresie a fost de siguranta si claritate, exact ce aveam nevoie.",
    quoteRole: "Client - Rotterdam",
  },
} as const;

function uiText(locale: string) {
  return extraCopy[(["en", "es", "pl", "ro"].includes(locale) ? locale : "en") as keyof typeof extraCopy];
}
function panelAnim(delay: number): React.CSSProperties {
  return { animation: "fadeUp 560ms cubic-bezier(.22,.61,.36,1) both", animationDelay: `${delay}ms` };
}
function FieldLabel({ htmlFor, children }: { htmlFor: string; children: React.ReactNode }) {
  return <label htmlFor={htmlFor} className="mb-1.5 block text-xs uppercase tracking-[0.12em] text-muted">{children}</label>;
}
function FieldMessage({ error, touched, successText }: { error?: string; touched?: boolean; successText?: string }) {
  if (error) return <p className="mt-1.5 text-xs text-error">{error}</p>;
  if (touched && successText) return <p className="mt-1.5 text-xs text-green">{successText}</p>;
  return null;
}
function ErrorBanner({ message }: { message: string }) {
  return <div className="mb-4 flex items-start gap-3 rounded-[var(--radius-md)] border border-error/35 bg-error/10 px-4 py-3 text-sm text-red-200"><AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-error" /><p>{message}</p></div>;
}
function InfoBanner({ message }: { message: string }) {
  return <div className="mb-4 flex items-start gap-3 rounded-[var(--radius-md)] border border-copper/35 bg-copper/8 px-4 py-3 text-sm text-secondary"><ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-copper" /><p>{message}</p></div>;
}
function LoadingLabel({ loading, label }: { loading: boolean; label: string }) {
  return <>{loading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : null}{loading ? `${label}...` : label}</>;
}

export function AuthScreen() {
  const router = useRouter();
  const locale = useLocale() as AppLocale;
  const local = uiText(locale);
  const t = useTranslations("Auth");
  const tA11y = useTranslations("Auth.a11y");
  const supabase = createClient();

  const [mode, setMode] = React.useState<AuthMode>("login");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(true);
  const [serverError, setServerError] = React.useState<string | null>(null);
  const [forgotInfo, setForgotInfo] = React.useState<string | null>(null);
  const [isAppleLoading, setIsAppleLoading] = React.useState(false);

  const loginForm = useForm<LoginValues>({ resolver: zodResolver(loginSchema), defaultValues: { email: "", password: "" } });
  const registerForm = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: { email: "", password: "", confirmPassword: "", fullName: "", terms: false },
  });
  const forgotForm = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema), defaultValues: { email: "", note: "" } });

  const isSubmitting = mode === "login" ? loginForm.formState.isSubmitting : mode === "register" ? registerForm.formState.isSubmitting : forgotForm.formState.isSubmitting;

  const onModeChange = (nextMode: AuthMode) => { setMode(nextMode); setServerError(null); setForgotInfo(null); };

  const onLoginSubmit = async (values: LoginValues) => {
    setServerError(null);
    if (!supabase) return setServerError("Supabase is not configured in this environment.");
    const { error } = await supabase.auth.signInWithPassword({ email: values.email, password: values.password });
    if (error) return setServerError(error.message);
    router.push("/app");
  };

  const onRegisterSubmit = async (values: RegisterValues) => {
    setServerError(null);
    if (!supabase) return setServerError("Supabase is not configured in this environment.");
    const { error } = await supabase.auth.signUp({
      email: values.email,
      password: values.password,
      options: { data: { full_name: values.fullName }, emailRedirectTo: `${window.location.origin}/en/auth/callback` },
    });
    if (error) return setServerError(error.message);
    router.push("/onboarding");
  };

  const onGoogleLogin = async () => {
    setServerError(null);
    if (!supabase) return setServerError("Supabase is not configured in this environment.");
    await supabase.auth.signInWithOAuth({ provider: "google", options: { redirectTo: `${window.location.origin}/en/auth/callback` } });
  };

  const onAppleClick = async () => {
    setIsAppleLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 450));
    setIsAppleLoading(false);
    setServerError("Apple sign-in is not configured in this environment.");
  };

  const onForgotSubmit = async () => {
    setForgotInfo(null);
    await new Promise((resolve) => setTimeout(resolve, 450));
    setForgotInfo(local.forgotBanner);
  };

  return (
    <div className="relative min-h-screen bg-mesh">
      <div className="mx-auto grid min-h-screen max-w-[1600px] lg:grid-cols-[1.05fr_0.95fr]">
        <aside className="relative hidden overflow-hidden border-r border-border/35 p-8 lg:flex lg:flex-col lg:justify-between xl:p-10">
          <div className="absolute inset-0">
            <Image src="/visuals/hero-bg.png" alt="" width={1920} height={1080} className="h-full w-full object-cover opacity-20" aria-hidden="true" />
            <div className="absolute inset-0 bg-gradient-to-br from-bg via-bg/85 to-surface/85" />
          </div>

          <div className="relative z-10" style={panelAnim(0)}>
            <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-md text-text">
              <span className="grid h-8 w-8 place-items-center rounded-lg border border-copper/30 bg-copper/10 font-heading text-sm text-copper">F</span>
              <span className="font-heading text-lg tracking-tight">FinTax</span>
            </Link>
          </div>

          <div className="relative z-10 space-y-7" style={panelAnim(90)}>
            <div>
              <Badge variant="copper" className="mb-4">{local.leftEyebrow}</Badge>
              <h2 className="max-w-[14ch] font-heading text-4xl leading-[0.95] tracking-[-0.04em] text-text xl:text-5xl">{local.leftTitle}</h2>
              <p className="mt-4 max-w-[48ch] text-sm leading-6 text-secondary">{local.leftBody}</p>
            </div>

            <div className="grid gap-3">
              {TRUST_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.text} className="editorial-frame rounded-[var(--radius-lg)] bg-surface2/35 p-4">
                    <div className="flex items-start gap-3">
                      <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full border border-green/20 bg-green/10 text-green">
                        <Icon className="h-4 w-4" />
                      </div>
                      <p className="text-sm leading-6 text-secondary">{item.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
              <Card variant="panel" padding="sm" className="bg-surface/45">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">Workspace preview</p>
                <Image src="/visuals/app-mock.png" alt="FinTax app mockup" width={1600} height={1000} className="mt-3 h-[170px] w-full rounded-xl border border-border/40 object-cover" />
              </Card>
              <Card variant="soft" padding="sm" className="bg-surface2/45">
                <p className="text-xs uppercase tracking-[0.14em] text-muted">Trust signal</p>
                <p className="mt-3 font-heading text-xl leading-tight text-text">&ldquo;{local.quote}&rdquo;</p>
                <p className="mt-3 text-xs uppercase tracking-[0.12em] text-muted">{local.quoteRole}</p>
                <Image src="/visuals/letter-mock.png" alt="Letter mock preview" width={1400} height={1000} className="mt-4 h-[96px] w-full rounded-lg border border-border/40 object-cover" />
              </Card>
            </div>
          </div>

          <div className="relative z-10 rounded-[var(--radius-lg)] border border-border/40 bg-surface/35 p-4" style={panelAnim(160)}>
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Secure microcopy</p>
            <div className="mt-2 flex items-start gap-2">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-copper" />
              <p className="text-sm leading-6 text-secondary">{local.secureMicrocopy}</p>
            </div>
          </div>
        </aside>

        <section className="flex items-center justify-center px-4 py-8 sm:px-6 lg:px-8">
          <div className="w-full max-w-[620px]">
            <div className="mb-6 flex items-center justify-between lg:hidden" style={panelAnim(0)}>
              <Link href="/" className="focus-ring inline-flex items-center gap-2 rounded-md text-text">
                <span className="grid h-8 w-8 place-items-center rounded-lg border border-copper/30 bg-copper/10 font-heading text-sm text-copper">F</span>
                <span className="font-heading text-lg tracking-tight">FinTax</span>
              </Link>
              <Badge variant="neutral">Secure auth</Badge>
            </div>

            <Card variant="panel" padding="none" className="overflow-hidden" style={panelAnim(70)}>
              <div className="border-b border-border/35 bg-surface/45 p-5 sm:p-6">
                <p className="text-xs uppercase tracking-[0.16em] text-copper">{t("eyebrow")}</p>
                <h1 className="mt-2 font-heading text-3xl tracking-[-0.03em] text-text sm:text-4xl">{local.authTitle}</h1>
                <p className="mt-3 max-w-[58ch] text-sm leading-6 text-secondary">{local.authSubtitle}</p>
              </div>

              <div className="p-5 sm:p-6">
                <Tabs value={mode === "forgot" ? "login" : mode} defaultValue="login" onValueChange={(value) => onModeChange(value as AuthMode)} className="mb-5">
                  <TabsList className="w-full">
                    <TabsTrigger value="login" className="flex-1">{t("tabs.login")}</TabsTrigger>
                    <TabsTrigger value="register" className="flex-1">{t("tabs.register")}</TabsTrigger>
                  </TabsList>
                </Tabs>

                {serverError ? <ErrorBanner message={serverError} /> : null}
                {forgotInfo && mode === "forgot" ? <InfoBanner message={forgotInfo} /> : null}

                {mode !== "forgot" ? (
                  <>
                    <div className="mb-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      <Button type="button" variant="secondary" className="w-full justify-center" onClick={onGoogleLogin}>{t("social.google")}</Button>
                      <Button type="button" variant="secondary" className="w-full justify-center" disabled={isAppleLoading} onClick={onAppleClick}>
                        {isAppleLoading ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Apple className="h-4 w-4" />} {t("social.apple")}
                      </Button>
                    </div>
                    <div className="mb-5 flex items-center gap-3 text-xs text-muted"><span className="h-px flex-1 bg-border/50" /><span>{t("social.emailDivider")}</span><span className="h-px flex-1 bg-border/50" /></div>
                  </>
                ) : null}

                {mode === "login" && (
                  <form className="space-y-4" onSubmit={loginForm.handleSubmit(onLoginSubmit)} noValidate>
                    <div>
                      <FieldLabel htmlFor="login-email">{t("form.email")}</FieldLabel>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <Input id="login-email" type="email" autoComplete="email" placeholder={t("form.emailPlaceholder")} {...loginForm.register("email")} className={cn("pl-9", loginForm.formState.errors.email && "border-error/60 focus-visible:border-error")} />
                      </div>
                      <FieldMessage error={loginForm.formState.errors.email?.message} touched={Boolean(loginForm.formState.touchedFields.email) && !loginForm.formState.errors.email} successText="Email format looks valid." />
                    </div>

                    <div>
                      <FieldLabel htmlFor="login-password">{t("form.password")}</FieldLabel>
                      <div className="relative">
                        <Input id="login-password" type={showPassword ? "text" : "password"} autoComplete="current-password" placeholder={t("form.passwordPlaceholder")} {...loginForm.register("password")} className={cn("pr-10", loginForm.formState.errors.password && "border-error/60 focus-visible:border-error")} />
                        <button type="button" className="focus-ring absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-text" onClick={() => setShowPassword((prev) => !prev)} aria-label={showPassword ? tA11y("hidePassword") : tA11y("showPassword")}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                      </div>
                      <FieldMessage error={loginForm.formState.errors.password?.message} touched={Boolean(loginForm.formState.touchedFields.password) && !loginForm.formState.errors.password} successText="Password length is valid." />
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <label className="flex items-center gap-2 text-sm text-secondary"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="h-4 w-4 rounded border-border/70 bg-surface2/70 accent-[rgb(var(--accent-green))]" /><span>{local.rememberMe}</span></label>
                      <button type="button" className="focus-ring rounded px-1 py-0.5 text-sm text-copper hover:text-text" onClick={() => onModeChange("forgot")}>{local.forgotLink}</button>
                    </div>

                    <p className="rounded-[var(--radius-md)] border border-border/40 bg-surface2/35 px-3 py-2 text-xs leading-5 text-muted">{local.secureMicrocopy}</p>
                    <Button type="submit" size="lg" className="w-full justify-center" disabled={isSubmitting}><LoadingLabel loading={isSubmitting} label={t("form.submitLogin")} /></Button>
                  </form>
                )}

                {mode === "register" && (
                  <form className="space-y-4" onSubmit={registerForm.handleSubmit(onRegisterSubmit)} noValidate>
                    <div>
                      <FieldLabel htmlFor="reg-name">{t("form.fullName")}</FieldLabel>
                      <Input id="reg-name" type="text" autoComplete="name" placeholder={t("form.fullNamePlaceholder")} {...registerForm.register("fullName")} className={cn(registerForm.formState.errors.fullName && "border-error/60 focus-visible:border-error")} />
                      <FieldMessage error={registerForm.formState.errors.fullName?.message} touched={Boolean(registerForm.formState.touchedFields.fullName) && !registerForm.formState.errors.fullName} successText="Looks good." />
                    </div>

                    <div>
                      <FieldLabel htmlFor="reg-email">{t("form.email")}</FieldLabel>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <Input id="reg-email" type="email" autoComplete="email" placeholder={t("form.emailPlaceholder")} {...registerForm.register("email")} className={cn("pl-9", registerForm.formState.errors.email && "border-error/60 focus-visible:border-error")} />
                      </div>
                      <FieldMessage error={registerForm.formState.errors.email?.message} touched={Boolean(registerForm.formState.touchedFields.email) && !registerForm.formState.errors.email} successText="Email format looks valid." />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <FieldLabel htmlFor="reg-password">{t("form.password")}</FieldLabel>
                        <div className="relative">
                          <Input id="reg-password" type={showPassword ? "text" : "password"} autoComplete="new-password" placeholder={t("form.passwordPlaceholder")} {...registerForm.register("password")} className={cn("pr-10", registerForm.formState.errors.password && "border-error/60 focus-visible:border-error")} />
                          <button type="button" className="focus-ring absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-text" onClick={() => setShowPassword((prev) => !prev)} aria-label={showPassword ? tA11y("hidePassword") : tA11y("showPassword")}>{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                        </div>
                        <FieldMessage error={registerForm.formState.errors.password?.message} touched={Boolean(registerForm.formState.touchedFields.password) && !registerForm.formState.errors.password} successText="Password length is valid." />
                      </div>

                      <div>
                        <FieldLabel htmlFor="reg-confirm">{t("form.confirmPassword")}</FieldLabel>
                        <div className="relative">
                          <Input id="reg-confirm" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password" placeholder={t("form.confirmPasswordPlaceholder")} {...registerForm.register("confirmPassword")} className={cn("pr-10", registerForm.formState.errors.confirmPassword && "border-error/60 focus-visible:border-error")} />
                          <button type="button" className="focus-ring absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted hover:text-text" onClick={() => setShowConfirmPassword((prev) => !prev)} aria-label={showConfirmPassword ? tA11y("hideConfirmPassword") : tA11y("showConfirmPassword")}>{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}</button>
                        </div>
                        <FieldMessage error={registerForm.formState.errors.confirmPassword?.message} touched={Boolean(registerForm.formState.touchedFields.confirmPassword) && !registerForm.formState.errors.confirmPassword} successText="Passwords match." />
                      </div>
                    </div>

                    <div className="rounded-[var(--radius-md)] border border-border/40 bg-surface2/35 p-3">
                      <label htmlFor="reg-terms" className="flex items-start gap-3 text-sm text-secondary">
                        <input id="reg-terms" type="checkbox" {...registerForm.register("terms")} className="mt-0.5 h-4 w-4 rounded border-border/70 bg-surface2/70 accent-[rgb(var(--accent-green))]" />
                        <span className="leading-6">{t("form.termsLabel")} <a href="#" className="text-copper underline underline-offset-4">{t("form.termsLink")}</a></span>
                      </label>
                      {registerForm.formState.errors.terms ? <p className="mt-2 text-xs text-error">{String(registerForm.formState.errors.terms.message)}</p> : null}
                    </div>

                    <p className="rounded-[var(--radius-md)] border border-border/40 bg-surface2/35 px-3 py-2 text-xs leading-5 text-muted">{local.secureMicrocopy}</p>
                    <Button type="submit" size="lg" className="w-full justify-center" disabled={isSubmitting}><LoadingLabel loading={isSubmitting} label={t("form.submitRegister")} /></Button>
                  </form>
                )}

                {mode === "forgot" && (
                  <form className="space-y-4" onSubmit={forgotForm.handleSubmit(onForgotSubmit)} noValidate>
                    <div>
                      <h2 className="font-heading text-2xl tracking-[-0.03em] text-text">{local.forgotTitle}</h2>
                      <p className="mt-2 text-sm leading-6 text-secondary">{local.forgotSubtitle}</p>
                    </div>
                    <div>
                      <FieldLabel htmlFor="forgot-email">{t("form.email")}</FieldLabel>
                      <div className="relative">
                        <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                        <Input id="forgot-email" type="email" autoComplete="email" placeholder={t("form.emailPlaceholder")} {...forgotForm.register("email")} className={cn("pl-9", forgotForm.formState.errors.email && "border-error/60 focus-visible:border-error")} />
                      </div>
                      <FieldMessage error={forgotForm.formState.errors.email?.message} touched={Boolean(forgotForm.formState.touchedFields.email) && !forgotForm.formState.errors.email} successText="Email format looks valid." />
                    </div>
                    <div>
                      <FieldLabel htmlFor="forgot-note">Context</FieldLabel>
                      <Textarea id="forgot-note" resize="vertical" className="min-h-[90px]" placeholder="Access issue or callback problem (optional)" {...forgotForm.register("note")} />
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <Button type="submit" disabled={isSubmitting}><LoadingLabel loading={isSubmitting} label={local.forgotSubmit} /></Button>
                      <Button type="button" variant="ghost" onClick={() => onModeChange("login")}>{local.forgotBack}</Button>
                    </div>
                  </form>
                )}

                <div className="mt-6 border-t border-border/35 pt-5 text-center">
                  <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }), "border-transparent")}>{t("form.backToLanding")}</Link>
                </div>
              </div>
            </Card>

            <div className="mt-4 grid gap-3 lg:hidden" style={panelAnim(110)}>
              <Card variant="soft" padding="sm" className="bg-surface2/45">
                <div className="flex items-start gap-3">
                  <Landmark className="mt-0.5 h-4 w-4 text-copper" />
                  <p className="text-sm leading-6 text-secondary">Belastingdienst letters and filing tasks are handled in the same secure workspace after login.</p>
                </div>
              </Card>
              <Card variant="soft" padding="sm" className="bg-surface2/45">
                <Image src="/visuals/app-mock.png" alt="App mockup" width={1600} height={1000} className="h-[120px] w-full rounded-lg border border-border/40 object-cover" />
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
