import { Resend } from "resend";

import { getEnv } from "../env";

let resendSingleton: Resend | null = null;

export function getResendClient() {
  const { RESEND_API_KEY: apiKey } = getEnv();
  if (!apiKey) return null;

  if (!resendSingleton) {
    resendSingleton = new Resend(apiKey);
  }

  return resendSingleton;
}

export async function sendCaseEmailNotification(params: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResendClient();
  if (!resend) {
    return { sent: false, reason: "missing_resend_api_key" as const };
  }

  const env = getEnv();
  const from = env.RESEND_FROM_EMAIL ?? "FinTax <notifications@fintax.local>";
  if (env.NODE_ENV === "production" && from.endsWith("@fintax.local>")) {
    return { sent: false, reason: "invalid_production_from_email" as const };
  }

  await resend.emails.send({
    from,
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  return { sent: true as const };
}
