import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/server";
import { getStripeServerClient } from "@/lib/stripe/server";
import { extractCheckoutCompletedPayload, isCheckoutSessionAlreadyProcessed } from "@/lib/stripe/webhook";

async function handleCheckoutCompleted(event: Stripe.Event) {
  const stripe = getStripeServerClient();
  const admin = await createAdminClient().catch(() => null);
  if (!stripe || !admin) return { processed: false, reason: "dependencies_unavailable" };

  const session = event.data.object as Stripe.Checkout.Session;
  const payload = extractCheckoutCompletedPayload(session);
  if (!payload) return { processed: false, reason: "missing_metadata" };

  const { data: existingPayment } = await admin
    .from("payments")
    .select("id,status")
    .eq("stripe_checkout_session_id", payload.checkoutSessionId)
    .maybeSingle();

  if (isCheckoutSessionAlreadyProcessed({ existingPaymentId: existingPayment?.id })) {
    return { processed: true, idempotent: true, paymentId: existingPayment?.id ?? null };
  }

  const paymentRow = {
    user_id: payload.userId,
    case_id: payload.caseId,
    stripe_payment_intent_id: payload.paymentIntentId ?? `pi_missing_${payload.checkoutSessionId}`,
    stripe_checkout_session_id: payload.checkoutSessionId,
    amount: payload.amount,
    currency: payload.currency,
    status: "succeeded" as const,
    payment_method: payload.paymentMethod,
    updated_at: new Date().toISOString(),
  };

  const { data: insertedPayment, error: paymentError } = await admin.from("payments").insert(paymentRow).select("id").single();
  if (paymentError) {
    if (isCheckoutSessionAlreadyProcessed({ insertErrorMessage: `${paymentError.message}` })) {
      return { processed: true, idempotent: true };
    }
    return { processed: false, reason: "payment_insert_failed" };
  }

  await admin
    .from("cases")
    .update({
      status: "paid",
      stripe_payment_id: payload.paymentIntentId ?? payload.checkoutSessionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.caseId)
    .eq("user_id", payload.userId)
    .in("status", ["pending_payment", "draft"]);

  return { processed: true, paymentId: insertedPayment?.id ?? null };
}

export async function POST(request: Request) {
  const stripe = getStripeServerClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe || !webhookSecret) {
    return NextResponse.json({ received: false, reason: "stripe_not_configured" }, { status: 400 });
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ received: false, reason: "missing_signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  } catch {
    return NextResponse.json({ received: false, reason: "invalid_signature" }, { status: 400 });
  }

  switch (event.type) {
    case "checkout.session.completed": {
      const result = await handleCheckoutCompleted(event);
      return NextResponse.json({ received: true, type: event.type, ...result });
    }
    case "payment_intent.payment_failed": {
      return NextResponse.json({ received: true, type: event.type, processed: true });
    }
    default:
      return NextResponse.json({ received: true, type: event.type, ignored: true });
  }
}
