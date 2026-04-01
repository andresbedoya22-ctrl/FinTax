import type { CaseStatus, DsarRequestType } from "@/types/database";

import { sendCaseEmailNotification } from "@/lib/resend/server";

type EmailDispatchResult = {
  sent: boolean;
  reason?: string;
};

function shouldSendEmails() {
  return Boolean(process.env.RESEND_API_KEY);
}

function buildDashboardUrl(locale: string, path: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return `${appUrl}/${locale}${path}`;
}

export async function sendPaymentConfirmedEmail(params: {
  to: string;
  locale: string;
  caseName: string;
  caseId: string;
}): Promise<EmailDispatchResult> {
  if (!shouldSendEmails()) return { sent: false, reason: "missing_resend_api_key" };

  return sendCaseEmailNotification({
    to: params.to,
    subject: "Payment confirmed",
    html: `<p>Your payment for <strong>${params.caseName}</strong> has been confirmed.</p><p>You can review your case here: <a href="${buildDashboardUrl(params.locale, `/tax-return/${params.caseId}`)}">open case</a>.</p>`,
  });
}

export async function sendCaseStatusEmail(params: {
  to: string;
  locale: string;
  caseName: string;
  caseId: string;
  nextStatus: CaseStatus;
  note?: string | null;
}): Promise<EmailDispatchResult> {
  if (!shouldSendEmails()) return { sent: false, reason: "missing_resend_api_key" };

  const noteHtml = params.note ? `<p>Internal note shared with your case: ${params.note}</p>` : "";
  return sendCaseEmailNotification({
    to: params.to,
    subject: `Case update: ${params.caseName}`,
    html: `<p>Your case <strong>${params.caseName}</strong> is now in status <strong>${params.nextStatus}</strong>.</p>${noteHtml}<p>Track progress here: <a href="${buildDashboardUrl(params.locale, `/tax-return/${params.caseId}`)}">open case</a>.</p>`,
  });
}

export async function sendDsarEmail(params: {
  to: string;
  locale: string;
  requestType: DsarRequestType;
  state: "received" | "completed";
  downloadPath?: string;
}): Promise<EmailDispatchResult> {
  if (!shouldSendEmails()) return { sent: false, reason: "missing_resend_api_key" };

  const downloadHtml =
    params.state === "completed" && params.downloadPath
      ? `<p>Your export is ready: <a href="${buildDashboardUrl(params.locale, params.downloadPath)}">download export</a>.</p>`
      : "";

  return sendCaseEmailNotification({
    to: params.to,
    subject: params.state === "completed" ? "Your privacy export is ready" : "Privacy request received",
    html: `<p>Your ${params.requestType} privacy request has been ${params.state}.</p>${downloadHtml}`,
  });
}
