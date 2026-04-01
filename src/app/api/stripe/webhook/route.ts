import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { createAdminClient } from "@/lib/supabase/server";
import { sendPaymentConfirmedEmail } from "@/lib/email/notifications";
import { getStripeServerClient } from "@/lib/stripe/server";
import {
  extractCheckoutCompletedPayload,
  isCheckoutSessionAlreadyProcessed,
  isStripeEventAlreadyProcessed,
} from "@/lib/stripe/webhook";

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
      paid_at: new Date().toISOString(),
      stripe_payment_id: payload.paymentIntentId ?? payload.checkoutSessionId,
      updated_at: new Date().toISOString(),
    })
    .eq("id", payload.caseId)
    .eq("user_id", payload.userId)
    .in("status", ["pending_payment", "draft"]);

  const [{ data: profile }, { data: caseRecord }] = await Promise.all([
    admin.from("profiles").select("email,preferred_language").eq("id", payload.userId).maybeSingle(),
    admin.from("cases").select("display_name,case_type").eq("id", payload.caseId).maybeSingle(),
  ]);

  if (profile?.email) {
    await sendPaymentConfirmedEmail({
      to: profile.email,
      locale: profile.preferred_language ?? "en",
      caseName: caseRecord?.display_name ?? caseRecord?.case_type ?? payload.caseType,
      caseId: payload.caseId,
    });
  }

  return { processed: true, paymentId: insertedPayment?.id ?? null };
}

async function registerStripeEvent(event: Stripe.Event) {
  const admin = await createAdminClient().catch(() => null);
  if (!admin) return { ok: false, reason: "admin_client_unavailable" as const };

  const { error } = await admin.from("stripe_events").insert({
    stripe_event_id: event.id,
    type: event.type,
    payload: event,
    status: "processing"
  });

  if (!error) return { ok: true, idempotent: false as const };
  
  if (isStripeEventAlreadyProcessed(error.message)) {
    // Check if it's stuck in processing for more than 15 mins (stale lock timeout)
    const { data: existingEvent } = await admin.from("stripe_events").select("status,created_at").eq("stripe_event_id", event.id).maybeSingle();
    if (existingEvent?.status === "processing") {
      const createdAt = new Date(existingEvent.created_at).getTime();
      const ageInMinutes = (Date.now() - createdAt) / 1000 / 60;
      if (ageInMinutes > 15) {
        // Lock expired. Overwrite it so we can retry.
        return { ok: true, idempotent: false as const };
      }
    }
    return { ok: true, idempotent: true as const };
  }

  return { ok: false, reason: "stripe_event_insert_failed" as const };
}

async function markStripeEventStatus(eventId: string, status: "completed" | "failed") {
  const admin = await createAdminClient().catch(() => null);
  if (!admin) return;
  await admin.from("stripe_events").update({ status, processed_at: new Date().toISOString() }).eq("stripe_event_id", eventId);
}

async function deleteStripeEventLock(eventId: string) {
  const admin = await createAdminClient().catch(() => null);
  if (!admin) return;
  await admin.from("stripe_events").delete().eq("stripe_event_id", eventId);
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
      const registration = await registerStripeEvent(event);
      if (!registration.ok) {
        return NextResponse.json(
          { received: false, reason: registration.reason, type: event.type },
          { status: 500 }
        );
      }
      if (registration.idempotent) {
        return NextResponse.json({ received: true, type: event.type, processed: true, idempotent: true });
      }

      const result = await handleCheckoutCompleted(event);
      if (result.processed || result.idempotent) {
         await markStripeEventStatus(event.id, "completed");
         return NextResponse.json({ received: true, type: event.type, ...result });
      } else {
         // Release the lock so Stripe can retry
         await deleteStripeEventLock(event.id);
         return NextResponse.json(
           { received: false, type: event.type, reason: result.reason ?? "processing_failed_lock_released" },
           { status: 500 }
         );
      }
    }
    case "payment_intent.payment_failed": {
      return NextResponse.json({ received: true, type: event.type, processed: true });
    }
    default:
      return NextResponse.json({ received: true, type: event.type, ignored: true });
  }
}
