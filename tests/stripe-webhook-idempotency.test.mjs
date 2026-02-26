import assert from "node:assert/strict";

import { isCheckoutSessionAlreadyProcessed } from "../src/lib/stripe/webhook.ts";

assert.equal(isCheckoutSessionAlreadyProcessed({ existingPaymentId: "pay_123" }), true);
assert.equal(
  isCheckoutSessionAlreadyProcessed({ insertErrorMessage: "duplicate key value violates unique constraint" }),
  true
);
assert.equal(isCheckoutSessionAlreadyProcessed({ insertErrorMessage: "network timeout" }), false);
assert.equal(isCheckoutSessionAlreadyProcessed({}), false);

console.log("stripe-webhook-idempotency: ok");
