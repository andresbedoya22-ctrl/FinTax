import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { getStripeServerClient } from "@/lib/stripe/server";

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
    case "checkout.session.completed":
    case "payment_intent.payment_failed":
      break;
    default:
      break;
  }

  return NextResponse.json({ received: true, type: event.type });
}
