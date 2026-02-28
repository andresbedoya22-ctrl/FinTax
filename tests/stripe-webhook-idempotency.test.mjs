import assert from "node:assert/strict";

import {
  isCheckoutSessionAlreadyProcessed,
  isStripeEventAlreadyProcessed,
} from "../src/lib/stripe/webhook.ts";

assert.equal(isCheckoutSessionAlreadyProcessed({ existingPaymentId: "pay_123" }), true);
assert.equal(
  isCheckoutSessionAlreadyProcessed({ insertErrorMessage: "duplicate key value violates unique constraint" }),
  true
);
assert.equal(isCheckoutSessionAlreadyProcessed({ insertErrorMessage: "network timeout" }), false);
assert.equal(isCheckoutSessionAlreadyProcessed({}), false);
assert.equal(isStripeEventAlreadyProcessed("duplicate key value violates unique constraint"), true);
assert.equal(isStripeEventAlreadyProcessed("UNIQUE violation"), true);
assert.equal(isStripeEventAlreadyProcessed("network timeout"), false);

console.log("stripe-webhook-idempotency: ok");
