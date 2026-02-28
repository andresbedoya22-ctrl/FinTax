import { createClient } from "@supabase/supabase-js";
import Stripe from "stripe";

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing env var: ${name}`);
  }
  return value;
}

async function main() {
  const supabaseUrl = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const serviceRoleKey = requireEnv("SUPABASE_SERVICE_ROLE_KEY");
  const stripeSecret = requireEnv("STRIPE_SECRET_KEY");

  const supabase = createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
  const stripe = new Stripe(stripeSecret);

  const { data: payments, error } = await supabase
    .from("payments")
    .select("id, case_id, stripe_payment_intent_id, status")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw error;

  const drifts = [];

  for (const payment of payments ?? []) {
    if (!payment.stripe_payment_intent_id) continue;
    try {
      const intent = await stripe.paymentIntents.retrieve(payment.stripe_payment_intent_id);
      const stripeSucceeded = intent.status === "succeeded";
      const dbSucceeded = payment.status === "succeeded";
      if (stripeSucceeded !== dbSucceeded) {
        drifts.push({
          paymentId: payment.id,
          caseId: payment.case_id,
          dbStatus: payment.status,
          stripeStatus: intent.status,
        });
      }
    } catch {
      drifts.push({
        paymentId: payment.id,
        caseId: payment.case_id,
        dbStatus: payment.status,
        stripeStatus: "lookup_failed",
      });
    }
  }

  if (drifts.length === 0) {
    console.log("stripe-reconcile: no drift detected");
    return;
  }

  console.log("stripe-reconcile: drift detected");
  for (const drift of drifts) {
    console.log(JSON.stringify(drift));
  }
  process.exitCode = 1;
}

main().catch((error) => {
  console.error("stripe-reconcile: failed");
  console.error(error);
  process.exit(1);
});
