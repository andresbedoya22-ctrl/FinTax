"use client";

import { useTranslations } from "next-intl";
import * as React from "react";

import { Button } from "@/components/fintax/Button";
import { Card, CardBody, CardHeader } from "@/components/fintax/Card";
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
        <h2 className="text-2xl font-semibold text-white">{t("title")}</h2>
        <p className="mt-1 text-sm text-white/60">{t("subtitle")}</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <CardHeader><h3 className="text-base font-semibold text-white">{t("sections.profile")}</h3></CardHeader>
          <CardBody className="space-y-3 text-sm text-white/80">
            <div><span className="text-white/50">{t("fields.name")}: </span>{mockProfile.full_name}</div>
            <div><span className="text-white/50">{t("fields.email")}: </span>{mockProfile.email}</div>
            <div><span className="text-white/50">{t("fields.phone")}: </span>{mockProfile.phone}</div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="text-base font-semibold text-white">{t("sections.security")}</h3></CardHeader>
          <CardBody className="space-y-3">
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">{t("security.password")}</div>
            <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/70">{t("security.sessions")}</div>
            <Button type="button" variant="secondary">{t("security.resetPassword")}</Button>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="text-base font-semibold text-white">{t("sections.notifications")}</h3></CardHeader>
          <CardBody className="space-y-3">
            <ToggleRow label={t("notifications.email")} checked={notificationEmail} onChange={setNotificationEmail} />
            <ToggleRow label={t("notifications.inApp")} checked={notificationInApp} onChange={setNotificationInApp} />
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="text-base font-semibold text-white">{t("sections.languageAppearance")}</h3></CardHeader>
          <CardBody className="grid gap-3 md:grid-cols-2">
            <label className="space-y-1 text-sm">
              <span className="text-white/60">{t("appearance.language")}</span>
              <select className={selectClass} value={language} onChange={(e) => setLanguage(e.target.value as typeof language)}>
                <option value="en">EN</option>
                <option value="es">ES</option>
              </select>
            </label>
            <label className="space-y-1 text-sm">
              <span className="text-white/60">{t("appearance.theme")}</span>
              <select className={selectClass} value={theme} onChange={(e) => setTheme(e.target.value as typeof theme)}>
                <option value="dark">{t("appearance.dark")}</option>
                <option value="light">{t("appearance.light")}</option>
              </select>
            </label>
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="text-base font-semibold text-white">{t("sections.billing")}</h3></CardHeader>
          <CardBody className="space-y-2">
            {mockPayments.map((payment) => (
              <div key={payment.id} className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
                <div className="flex items-center justify-between gap-3">
                  <span>{payment.case_id}</span>
                  <span className="text-green">EUR {payment.amount.toFixed(2)}</span>
                </div>
                <p className="mt-1 text-xs text-white/50">{payment.status} · {payment.payment_method}</p>
              </div>
            ))}
          </CardBody>
        </Card>

        <Card>
          <CardHeader><h3 className="text-base font-semibold text-white">{t("sections.privacy")}</h3></CardHeader>
          <CardBody className="space-y-3 text-sm text-white/70">
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
    <button type="button" onClick={() => onChange(!checked)} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80">
      <span>{label}</span>
      <span className={`inline-block h-2.5 w-2.5 rounded-full ${checked ? "bg-green" : "bg-white/30"}`} />
    </button>
  );
}

const selectClass = "h-11 w-full rounded-xl border border-white/10 bg-white/5 px-3 text-sm text-white outline-none focus:border-green/40";
