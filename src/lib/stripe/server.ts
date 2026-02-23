import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function getStripeServerClient() {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;

  if (!stripeSingleton) {
    stripeSingleton = new Stripe(secretKey, {
      apiVersion: "2026-01-28.clover",
    });
  }

  return stripeSingleton;
}
