import { z } from "zod";

import { requireAuthedUser } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";
import { consumeRateLimit } from "@/lib/security/rate-limit";
import { getStripeServerClient } from "@/lib/stripe/server";

const schema = z.object({
  caseId: z.string().min(1),
  locale: z.string().default("en"),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return apiError("invalid_payload");
  }

  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) {
    return authed.errorResponse;
  }

  const ipAddress = request.headers.get("x-client-ip") ?? "unknown";
  const rateLimit = consumeRateLimit({
    key: `stripe_checkout:${authed.user.id}:${ipAddress}`,
    limit: 5,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return apiError("conflict", "rate_limit_exceeded", { retryAfterSeconds: rateLimit.retryAfterSeconds });
  }

  const { data: caseRecord, error: caseError } = await authed.supabase
    .from("cases")
    .select("id,user_id,case_type,status,display_name")
    .eq("id", parsed.data.caseId)
    .eq("user_id", authed.user.id)
    .maybeSingle();

  if (caseError) {
    return apiError("internal", "case_lookup_failed");
  }

  if (!caseRecord) {
    return apiError("not_found", "case_not_found");
  }

  if (!["draft", "pending_payment"].includes(caseRecord.status)) {
    return apiError("conflict", "case_not_payable");
  }

  const { data: pricing, error: pricingError } = await authed.supabase
    .from("service_pricing")
    .select("name,price")
    .eq("case_type", caseRecord.case_type)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (pricingError) {
    return apiError("internal", "service_pricing_lookup_failed");
  }

  if (!pricing) {
    return apiError("conflict", "service_pricing_missing");
  }

  const stripe = getStripeServerClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!stripe) {
    if (process.env.NODE_ENV === "production") {
      return apiError("internal", "stripe_not_configured");
    }

    return apiSuccess({
      checkoutUrl: `${appUrl}/${parsed.data.locale}/dashboard?mockCheckout=1&caseId=${parsed.data.caseId}`,
      id: null,
      mock: true,
    });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["ideal", "card"],
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(Number(pricing.price) * 100),
          product_data: {
            name: pricing.name || `FinTax ${caseRecord.case_type}`,
          },
        },
      },
    ],
    client_reference_id: caseRecord.id,
    success_url: `${appUrl}/${parsed.data.locale}/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${appUrl}/${parsed.data.locale}/dashboard?payment=cancelled&caseId=${parsed.data.caseId}`,
    metadata: {
      case_id: caseRecord.id,
      user_id: authed.user.id,
      case_type: caseRecord.case_type,
    },
  });

  return apiSuccess({ checkoutUrl: session.url, id: session.id, mock: false }, { remaining: rateLimit.remaining });
}
