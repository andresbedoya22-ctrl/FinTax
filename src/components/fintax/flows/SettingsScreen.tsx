"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { Button } from "@/components/fintax/Button";
import { Card, CardBody, CardHeader } from "@/components/fintax/Card";
import { Badge, Skeleton } from "@/components/ui";
import { mockPayments, mockProfile } from "@/lib/mock-data";

export function SettingsScreen() {
  const t = useTranslations("Settings");
  const [language, setLanguage] = React.useState(mockProfile.preferred_language);
  const [theme, setTheme] = React.useState(mockProfile.theme);
  const [notificationEmail, setNotificationEmail] = React.useState(mockProfile.notification_email);
  const [notificationInApp, setNotificationInApp] = React.useState(mockProfile.notification_in_app);

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-[0.16em] text-copper">Settings</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold tracking-[-0.03em] text-text">{t("title")}</h2>
        <p className="mt-2 text-sm text-secondary">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-base font-semibold text-text">{t("sections.profile")}</h3>
              <Badge variant="neutral">Profile</Badge>
            </div>
          </CardHeader>
          <CardBody className="space-y-3 text-sm text-secondary">
            <div><span className="text-muted">{t("fields.name")}: </span>{mockProfile.full_name}</div>
            <div><span className="text-muted">{t("fields.email")}: </span>{mockProfile.email}</div>
            <div><span className="text-muted">{t("fields.phone")}: </span>{mockProfile.phone}</div>
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
            <Button type="button" variant="secondary">{t("security.resetPassword")}</Button>
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
              <select className={selectClass} value={language} onChange={(e) => setLanguage(e.target.value as typeof language)}>
                <option value="en">EN</option>
                <option value="nl">NL</option>
                <option value="es">ES</option>
                <option value="pl">PL</option>
                <option value="ro">RO</option>
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-secondary">{t("appearance.theme")}</span>
              <select className={selectClass} value={theme} onChange={(e) => setTheme(e.target.value as typeof theme)}>
                <option value="dark">{t("appearance.dark")}</option>
                <option value="light">{t("appearance.light")}</option>
              </select>
            </label>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="text-base font-semibold text-text">{t("sections.billing")}</h3></CardHeader>
          <CardBody className="space-y-2">
            {mockPayments.map((payment) => (
              <div key={payment.id} className="rounded-xl border border-border/35 bg-surface2/20 px-4 py-3 text-sm text-secondary">
                <div className="flex items-center justify-between gap-3">
                  <span>{payment.case_id}</span>
                  <span className="font-heading tracking-[-0.02em] text-green">EUR {payment.amount.toFixed(2)}</span>
                </div>
                <p className="mt-1 text-xs text-muted">{payment.status} | {payment.payment_method}</p>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="text-base font-semibold text-text">{t("sections.privacy")}</h3></CardHeader>
          <CardBody className="space-y-3 text-sm text-secondary">
            <p>{t("privacy.copy")}</p>
            <div className="flex flex-wrap gap-2">
              <Button type="button" variant="secondary">{t("privacy.exportData")}</Button>
              <Button type="button" variant="danger">{t("privacy.deleteRequest")}</Button>
            </div>
          </CardBody>
        </Card>
      </div>
    </div>
  );
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

