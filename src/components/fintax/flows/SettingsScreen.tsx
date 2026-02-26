"use client";

import { useLocale, useTranslations } from "next-intl";
import * as React from "react";

import { Button } from "@/components/fintax/Button";
import { Card, CardBody, CardHeader } from "@/components/fintax/Card";
import { Badge, Skeleton } from "@/components/ui";
import { useCurrentProfile } from "@/hooks/useCurrentProfile";
import { createClient } from "@/lib/supabase/client";
import type { Payment, Profile } from "@/types/database";

const ENABLE_DATA_REQUEST_ACTIONS = false;
const supportedLocales = ["en", "nl", "es", "pl", "ro"] as const;

export function SettingsScreen() {
  const t = useTranslations("Settings");
  const locale = useLocale();
  const supabase = createClient();
  const { profile, loading } = useCurrentProfile();

  const [language, setLanguage] = React.useState<Profile["preferred_language"]>("en");
  const [theme, setTheme] = React.useState<Profile["theme"]>("dark");
  const [notificationEmail, setNotificationEmail] = React.useState(true);
  const [notificationInApp, setNotificationInApp] = React.useState(true);
  const [payments, setPayments] = React.useState<Payment[]>([]);
  const [paymentsLoading, setPaymentsLoading] = React.useState(true);
  const [settingsMessage, setSettingsMessage] = React.useState<string | null>(null);
  const [settingsError, setSettingsError] = React.useState<string | null>(null);
  const [resettingPassword, setResettingPassword] = React.useState(false);

  React.useEffect(() => {
    if (!profile) return;
    setLanguage(profile.preferred_language);
    setTheme(profile.theme);
    setNotificationEmail(profile.notification_email);
    setNotificationInApp(profile.notification_in_app);
  }, [profile]);

  React.useEffect(() => {
    let active = true;

    const loadPayments = async () => {
      setPaymentsLoading(true);
      if (!supabase) {
        if (active) {
          setPayments([]);
          setPaymentsLoading(false);
        }
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        if (active) {
          setPayments([]);
          setPaymentsLoading(false);
        }
        return;
      }

      const { data } = await supabase
        .from("payments")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5);

      if (active) {
        setPayments((data as Payment[] | null) ?? []);
        setPaymentsLoading(false);
      }
    };

    void loadPayments();
    return () => {
      active = false;
    };
  }, [supabase]);

  const onResetPassword = async () => {
    setSettingsMessage(null);
    setSettingsError(null);
    if (!supabase || !profile?.email) {
      setSettingsError("Password reset is unavailable in this environment.");
      return;
    }

    setResettingPassword(true);
    const redirectTo = `${window.location.origin}/${locale}/auth`;
    const { error } = await supabase.auth.resetPasswordForEmail(profile.email, { redirectTo });
    setResettingPassword(false);

    if (error) {
      setSettingsError(error.message);
      return;
    }

    setSettingsMessage("Password reset email sent.");
  };

  const onSavePreferences = async () => {
    setSettingsMessage(null);
    setSettingsError(null);
    if (!supabase || !profile?.id) {
      setSettingsError("Settings save is unavailable in this environment.");
      return;
    }

    const { error } = await supabase
      .from("profiles")
      .update({
        preferred_language: language,
        theme,
        notification_email: notificationEmail,
        notification_in_app: notificationInApp,
        updated_at: new Date().toISOString(),
      })
      .eq("id", profile.id);

    if (error) {
      setSettingsError(error.message);
      return;
    }

    setSettingsMessage("Settings saved.");
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-copper">Settings</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.03em] text-text">{t("title")}</h2>
        <p className="mt-2 text-sm text-secondary">{t("subtitle")}</p>
      </div>

      {settingsMessage ? <div className="rounded-xl border border-green/25 bg-green/10 px-4 py-3 text-sm text-green">{settingsMessage}</div> : null}
      {settingsError ? <div className="rounded-xl border border-error/30 bg-error/10 px-4 py-3 text-sm text-error">{settingsError}</div> : null}

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-text">{t("sections.profile")}</h3>
              <Badge variant="neutral">Profile</Badge>
            </div>
          </CardHeader>
          <CardBody className="space-y-3 text-sm text-secondary">
            <FieldRow label={t("fields.name")} value={loading ? null : profile?.full_name ?? "FinTax User"} />
            <FieldRow label={t("fields.email")} value={loading ? null : profile?.email ?? "Not available"} />
            <FieldRow label={t("fields.phone")} value={loading ? null : (profile?.phone || "Not set")} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="text-base font-semibold text-text">{t("sections.security")}</h3></CardHeader>
          <CardBody className="space-y-3">
            <div className="rounded-xl border border-border/35 bg-surface2/20 p-3 text-sm text-secondary">{t("security.password")}</div>
            <div className="rounded-xl border border-border/35 bg-surface2/20 p-3 text-sm text-secondary">{t("security.sessions")}</div>
            <div className="rounded-xl border border-border/35 bg-surface2/15 p-3">
              <p className="mb-2 text-xs uppercase tracking-[0.12em] text-muted">Security status</p>
              <Skeleton className="h-3 w-full" />
              <Skeleton className="mt-2 h-3 w-4/5" />
            </div>
            <Button type="button" variant="secondary" onClick={onResetPassword} disabled={resettingPassword || loading}>
              {resettingPassword ? "Sending..." : t("security.resetPassword")}
            </Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="text-base font-semibold text-text">{t("sections.notifications")}</h3></CardHeader>
          <CardBody className="space-y-3">
            <ToggleRow label={t("notifications.email")} checked={notificationEmail} onChange={setNotificationEmail} />
            <ToggleRow label={t("notifications.inApp")} checked={notificationInApp} onChange={setNotificationInApp} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="text-base font-semibold text-text">{t("sections.languageAppearance")}</h3></CardHeader>
          <CardBody className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-secondary">{t("appearance.language")}</span>
              <select className={selectClass} value={language} onChange={(e) => setLanguage(e.target.value as Profile["preferred_language"])}>
                {supportedLocales.map((code) => (
                  <option key={code} value={code}>{code.toUpperCase()}</option>
                ))}
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-secondary">{t("appearance.theme")}</span>
              <select className={selectClass} value={theme} onChange={(e) => setTheme(e.target.value as Profile["theme"])}>
                <option value="dark">{t("appearance.dark")}</option>
                <option value="light">{t("appearance.light")}</option>
              </select>
            </label>
            <div className="md:col-span-2">
              <Button type="button" variant="secondary" onClick={onSavePreferences} disabled={loading}>
                Save preferences
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="text-base font-semibold text-text">{t("sections.billing")}</h3></CardHeader>
          <CardBody className="space-y-2">
            {paymentsLoading ? (
              <>
                <Skeleton className="h-16 w-full rounded-xl" />
                <Skeleton className="h-16 w-full rounded-xl" />
              </>
            ) : payments.length > 0 ? (
              payments.map((payment) => (
                <div key={payment.id} className="rounded-xl border border-border/35 bg-surface2/20 px-4 py-3 text-sm text-secondary">
                  <div className="flex items-center justify-between gap-3">
                    <span>{payment.case_id}</span>
                    <span className="font-heading tracking-[-0.02em] text-green">EUR {Number(payment.amount).toFixed(2)}</span>
                  </div>
                  <p className="mt-1 text-xs text-muted">{payment.status} | {payment.payment_method ?? "card"}</p>
                </div>
              ))
            ) : (
              <div className="rounded-xl border border-border/35 bg-surface2/15 px-4 py-3 text-sm text-secondary">
                No payment records yet.
              </div>
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="text-base font-semibold text-text">{t("sections.privacy")}</h3></CardHeader>
          <CardBody className="space-y-3 text-sm text-secondary">
            <p>{t("privacy.copy")}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="secondary" disabled={!ENABLE_DATA_REQUEST_ACTIONS}>
                {t("privacy.exportData")}
              </Button>
              <Button type="button" variant="danger" disabled={!ENABLE_DATA_REQUEST_ACTIONS}>
                {t("privacy.deleteRequest")}
              </Button>
              {!ENABLE_DATA_REQUEST_ACTIONS ? <Badge variant="neutral">Coming soon</Badge> : null}
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
}

function FieldRow({ label, value }: { label: string; value: string | null }) {
  if (value === null) return <Skeleton className="h-5 w-full" />;
  return <div><span className="text-muted">{label}: </span>{value}</div>;
}

function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)} className={`flex items-center justify-between rounded-xl border px-4 py-3 text-sm ${checked ? "border-green/35 bg-green/8 text-text" : "border-border/35 bg-surface2/20 text-secondary"}`}>
      <span>{label}</span>
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${checked ? "bg-green" : "bg-white/30"}`} />
    </button>
  );
}

const selectClass = "h-11 w-full rounded-xl border border-border/35 bg-surface2/20 px-3 text-sm text-text outline-none focus:border-copper/40";
