"use client";

import { ArrowRight, CheckCircle2, LoaderCircle, ShieldCheck } from "lucide-react";
import { useTranslations } from "next-intl";
import * as React from "react";

import { Button } from "@/components/fintax/Button";
import { Card, CardBody, CardHeader } from "@/components/fintax/Card";
import { apiGet } from "@/hooks/api-client";
import { Link } from "@/i18n/navigation";
import type { Case } from "@/types/database";

const POLL_INTERVAL_MS = 3000;
const MAX_POLLS = 20;

export function StripeSuccessScreen({
  caseId,
  initialStatus,
  initialCaseStatus,
  initialCaseType,
  sessionId,
}: {
  caseId: string | null;
  initialStatus: "paid" | "pending" | "invalid";
  initialCaseStatus?: string | null;
  initialCaseType?: Case["case_type"] | null;
  sessionId?: string | null;
}) {
  const t = useTranslations("PaymentSuccess");
  const [status, setStatus] = React.useState<"loading" | "paid" | "pending" | "error">(
    initialStatus === "paid" ? "paid" : initialStatus === "pending" ? "pending" : "error",
  );
  const [currentCase, setCurrentCase] = React.useState<Case | null>(
    initialCaseStatus ? ({ status: initialCaseStatus, case_type: initialCaseType } as Case) : null,
  );
  const caseHref =
    caseId && currentCase?.case_type && !currentCase.case_type.startsWith("tax_return") && currentCase.case_type !== "btw_declaration"
      ? `/benefits/${caseId}`
      : caseId
        ? `/tax-return/${caseId}`
        : "/tax-return";

  React.useEffect(() => {
    if (!caseId || initialStatus !== "pending") {
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
  }, [caseId, initialStatus]);

  return (
    <div className="mx-auto max-w-4xl py-16">
      <Card className="overflow-hidden rounded-[30px] border-white/70 bg-white shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
        <CardHeader>
          <div className="grid size-16 place-items-center rounded-[20px] bg-[#EAF7EC] text-[#3F9E48]">
            <ShieldCheck className="size-8" />
          </div>
          <p className="mt-6 text-xs font-semibold uppercase tracking-[0.16em] text-[#3F9E48]">{t("eyebrow")}</p>
          <h1 className="mt-2 text-[clamp(2.2rem,4vw,3.4rem)] font-bold leading-tight tracking-[-0.03em] text-[#102033]">{t("title")}</h1>
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
            <p className="mt-1">Session: {sessionId ?? "-"}</p>
            <p className="mt-1">{t("status")}: {currentCase?.status ?? "-"}</p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link href="/dashboard">
              <Button type="button" rightIcon={<ArrowRight className="size-4" />}>{t("dashboardCta")}</Button>
            </Link>
            <Link href={caseHref}>
              <Button type="button" variant="secondary">{t("caseCta")}</Button>
            </Link>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
