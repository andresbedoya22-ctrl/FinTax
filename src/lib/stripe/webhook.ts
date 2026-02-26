import type Stripe from "stripe";

export type CheckoutCompletedPayload = {
  caseId: string;
  userId: string;
  caseType: string;
  checkoutSessionId: string;
  paymentIntentId: string | null;
  amount: number;
  currency: string;
  paymentMethod: string | null;
};

export function isCheckoutSessionAlreadyProcessed(input: {
  existingPaymentId?: string | null;
  insertErrorMessage?: string | null;
}) {
  if (input.existingPaymentId) return true;
  if (!input.insertErrorMessage) return false;
  return input.insertErrorMessage.toLowerCase().includes("duplicate");
}

export function extractCheckoutCompletedPayload(session: Stripe.Checkout.Session): CheckoutCompletedPayload | null {
  const caseId = session.metadata?.case_id;
  const userId = session.metadata?.user_id;
  const caseType = session.metadata?.case_type;
  if (!caseId || !userId || !caseType) return null;

  return {
    caseId,
    userId,
    caseType,
    checkoutSessionId: session.id,
    paymentIntentId: typeof session.payment_intent === "string" ? session.payment_intent : null,
    amount: (session.amount_total ?? 0) / 100,
    currency: (session.currency ?? "eur").toUpperCase(),
    paymentMethod: session.payment_method_types?.[0] ?? null,
  };
}
