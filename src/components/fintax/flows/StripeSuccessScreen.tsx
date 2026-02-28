"use client";

import { CheckCircle2, LoaderCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import * as React from "react";

import { Button } from "@/components/fintax/Button";
import { Card, CardBody, CardHeader } from "@/components/fintax/Card";
import { apiGet } from "@/hooks/api-client";
import { Link } from "@/i18n/navigation";
import type { Case } from "@/types/database";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 20;

export function StripeSuccessScreen() {
  const t = useTranslations("PaymentSuccess");
  const searchParams = useSearchParams();
  const caseId = searchParams.get("caseId");
  const [status, setStatus] = React.useState<"loading" | "paid" | "pending" | "error">("loading");
  const [currentCase, setCurrentCase] = React.useState<Case | null>(null);

  React.useEffect(() => {
    if (!caseId) {
      setStatus("error");
      return;
    }

    let pollCount = 0;
    let active = true;

    const poll = async () => {
      while (active && pollCount < MAX_POLLS) {
        pollCount += 1;
        try {
          const data = await apiGet<Case>(`/api/cases/${caseId}`);
          if (!active) return;
          setCurrentCase(data);

          if (data.status === "paid" || data.paid_at) {
            setStatus("paid");
            return;
          }
          setStatus("pending");
        } catch {
          if (!active) return;
          setStatus("error");
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, POLL_INTERVAL_MS));
      }

      if (active) {
        setStatus("pending");
      }
    };

    void poll();

    return () => {
      active = false;
    };
  }, [caseId]);

  return (
    <div className="mx-auto max-w-3xl py-16">
      <Card>
        <CardHeader>
          <p className="text-xs uppercase tracking-[0.16em] text-copper">{t("eyebrow")}</p>
          <h1 className="mt-2 font-heading text-3xl tracking-[-0.03em] text-text">{t("title")}</h1>
          <p className="mt-2 text-sm text-secondary">{t("subtitle")}</p>
        </CardHeader>
        <CardBody className="space-y-5">
          {status === "loading" || status === "pending" ? (
            <div className="flex items-center gap-3 rounded-xl border border-border/35 bg-surface2/20 p-4 text-sm text-secondary">
              <LoaderCircle className="h-4 w-4 animate-spin text-copper" />
              {status === "loading" ? t("loading") : t("pending")}
            </div>
          ) : null}

          {status === "paid" ? (
            <div className="flex items-center gap-3 rounded-xl border border-green/35 bg-green/10 p-4 text-sm text-text">
              <CheckCircle2 className="h-4 w-4 text-green" />
              {t("confirmed")}
            </div>
          ) : null}

          {status === "error" ? (
            <div className="rounded-xl border border-error/35 bg-error/10 p-4 text-sm text-secondary">
              {t("error")}
            </div>
          ) : null}

          <div className="rounded-xl border border-border/35 bg-surface2/20 p-4 text-sm text-secondary">
            <p>{t("caseId")}: {caseId ?? "-"}</p>
            <p className="mt-1">{t("status")}: {currentCase?.status ?? "-"}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard">
              <Button type="button">{t("dashboardCta")}</Button>
            </Link>
            <Link href={caseId ? `/tax-return/${caseId}` : "/tax-return"}>
              <Button type="button" variant="secondary">{t("caseCta")}</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
