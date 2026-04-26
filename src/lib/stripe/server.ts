import Stripe from "stripe";

import { getEnv } from "../env";

let stripeSingleton: Stripe | null = null;

export function getStripeServerClient() {
  const { STRIPE_SECRET_KEY: secretKey } = getEnv();
  if (!secretKey) return null;

  if (!stripeSingleton) {
    stripeSingleton = new Stripe(secretKey, {
      apiVersion: "2026-01-28.clover",
    });
  }

  return stripeSingleton;
}
