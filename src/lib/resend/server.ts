import { Resend } from "resend";

let resendSingleton: Resend | null = null;

export function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
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

  await resend.emails.send({
    from: "FinTax <notifications@fintax.local>",
    to: params.to,
    subject: params.subject,
    html: params.html,
  });

  return { sent: true as const };
}
