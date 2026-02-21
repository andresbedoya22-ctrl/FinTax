"use client";

import { Apple, Eye, EyeOff, Mail } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import * as React from "react";

import { Button } from "@/components/fintax/Button";
import { Card, CardBody } from "@/components/fintax/Card";
import { cn } from "@/lib/cn";

type AuthMode = "login" | "register";

type FormState = {
  email: string;
  password: string;
  confirmPassword: string;
};

type FormErrors = Partial<Record<keyof FormState, string>>;

function validate(mode: AuthMode, form: FormState): FormErrors {
  const errors: FormErrors = {};
  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email);

  if (!emailOk) errors.email = "Enter a valid email address.";
  if (form.password.length < 8) errors.password = "Password must be at least 8 characters.";
  if (mode === "register" && form.confirmPassword !== form.password) {
    errors.confirmPassword = "Passwords do not match.";
  }

  return errors;
}

export function AuthScreen() {
  const router = useRouter();
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
    const validationErrors = validate(mode, form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) return;

    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 250));
    router.push("/app");
  };

  return (
    <Card className="mx-auto w-full max-w-xl border-border/60 bg-surface/80">
      <CardBody className="p-6 sm:p-8">
        <div className="mb-6">
          <p className="text-sm uppercase tracking-[0.16em] text-teal">Account access</p>
          <h1 className="mt-2 text-3xl font-semibold text-text">Welcome to FinTax</h1>
        </div>

        <div
          className="mb-6 grid grid-cols-2 rounded-md border border-border/60 bg-surface2 p-1"
          role="tablist"
          aria-label="Authentication mode"
        >
          <button
            type="button"
            role="tab"
            aria-selected={mode === "login"}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              mode === "login" ? "bg-bg text-text" : "text-secondary hover:text-text"
            )}
            onClick={() => onModeChange("login")}
          >
            Login
          </button>
          <button
            type="button"
            role="tab"
            aria-selected={mode === "register"}
            className={cn(
              "rounded-md px-3 py-2 text-sm font-medium transition-colors",
              mode === "register" ? "bg-bg text-text" : "text-secondary hover:text-text"
            )}
            onClick={() => onModeChange("register")}
          >
            Create account
          </button>
        </div>

        <div className="mb-5 grid gap-3 sm:grid-cols-2">
          <Button type="button" variant="secondary" className="w-full">
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="size-4"
              fill="currentColor"
            >
              <path d="M12 4.75c1.88 0 3.15.81 3.87 1.48l2.85-2.78C16.97 1.84 14.7.75 12 .75 7.31.75 3.28 3.42 1.29 7.31l3.34 2.59C5.44 6.83 8.42 4.75 12 4.75z" />
              <path d="M23.49 12.27c0-.79-.07-1.54-.21-2.27H12v4.3h6.46c-.28 1.5-1.13 2.78-2.41 3.64l3.7 2.87c2.16-1.99 3.74-4.93 3.74-8.54z" />
              <path d="M4.63 14.1a7.2 7.2 0 010-4.2L1.29 7.31a11.26 11.26 0 000 9.38l3.34-2.59z" />
              <path d="M12 23.25c2.7 0 4.97-.89 6.63-2.43l-3.7-2.87c-1.02.69-2.32 1.1-3.93 1.1-3.58 0-6.56-2.08-7.37-5.15L1.29 16.7c1.99 3.89 6.02 6.55 10.71 6.55z" />
            </svg>
            Continue with Google
          </Button>
          <Button type="button" variant="secondary" className="w-full">
            <Apple className="size-4" aria-hidden="true" />
            Continue with Apple
          </Button>
        </div>

        <div className="mb-5 flex items-center gap-3 text-xs text-muted">
          <span className="h-px flex-1 bg-border/70" />
          <span>or continue with email</span>
          <span className="h-px flex-1 bg-border/70" />
        </div>

        <form className="space-y-4" onSubmit={onSubmit} noValidate>
          <div>
            <label htmlFor="email" className="mb-1.5 block text-sm text-secondary">
              Email
            </label>
            <div className="relative">
              <Mail
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted"
                aria-hidden="true"
              />
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={onFieldChange("email")}
                className={cn(
                  "h-11 w-full rounded-md border bg-bg pl-9 pr-3 text-sm text-text placeholder:text-muted",
                  "outline-none transition-colors focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                  errors.email ? "border-error" : "border-border/70"
                )}
                placeholder="you@example.com"
              />
            </div>
            {errors.email ? <p className="mt-1 text-xs text-error">{errors.email}</p> : null}
          </div>

          <div>
            <label htmlFor="password" className="mb-1.5 block text-sm text-secondary">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                value={form.password}
                onChange={onFieldChange("password")}
                className={cn(
                  "h-11 w-full rounded-md border bg-bg px-3 pr-10 text-sm text-text placeholder:text-muted",
                  "outline-none transition-colors focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                  errors.password ? "border-error" : "border-border/70"
                )}
                placeholder="At least 8 characters"
              />
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {errors.password ? <p className="mt-1 text-xs text-error">{errors.password}</p> : null}
          </div>

          {mode === "register" ? (
            <div>
              <label htmlFor="confirmPassword" className="mb-1.5 block text-sm text-secondary">
                Confirm password
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
                    "h-11 w-full rounded-md border bg-bg px-3 pr-10 text-sm text-text placeholder:text-muted",
                    "outline-none transition-colors focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg",
                    errors.confirmPassword ? "border-error" : "border-border/70"
                  )}
                  placeholder="Repeat password"
                />
                <button
                  type="button"
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-muted transition-colors hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
                  onClick={() => setShowConfirmPassword((prev) => !prev)}
                  aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                >
                  {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                </button>
              </div>
              {errors.confirmPassword ? (
                <p className="mt-1 text-xs text-error">{errors.confirmPassword}</p>
              ) : null}
            </div>
          ) : null}

          <Button type="submit" className="mt-2 w-full" loading={isSubmitting}>
            {mode === "login" ? "Login" : "Create account"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Link
            href="/"
            className="text-sm text-secondary underline-offset-4 transition-colors hover:text-text hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-bg"
          >
            Back to landing
          </Link>
        </div>
      </CardBody>
    </Card>
  );
}
