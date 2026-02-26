import assert from "node:assert/strict";

import { extractCheckoutCompletedPayload } from "../src/lib/stripe/webhook.ts";

const payload = extractCheckoutCompletedPayload({
  id: "cs_test_123",
  metadata: { case_id: "case-1", user_id: "user-1", case_type: "tax_return_p" },
  payment_intent: "pi_123",
  amount_total: 8900,
  currency: "eur",
  payment_method_types: ["ideal"],
});

assert.deepEqual(payload, {
  caseId: "case-1",
  userId: "user-1",
  caseType: "tax_return_p",
  checkoutSessionId: "cs_test_123",
  paymentIntentId: "pi_123",
  amount: 89,
  currency: "EUR",
  paymentMethod: "ideal",
});

console.log("stripe-webhook-mapper: ok");

