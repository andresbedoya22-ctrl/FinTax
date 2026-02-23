import { NextResponse } from "next/server";
import { z } from "zod";

import { getStripeServerClient } from "@/lib/stripe/server";

const schema = z.object({
  caseId: z.string().min(1),
  userId: z.string().min(1),
  caseType: z.string().min(1),
  amount: z.number().positive(),
  locale: z.string().default("en"),
});

export async function POST(request: Request) {
  const json = await request.json().catch(() => null);
  const parsed = schema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "invalid_payload" }, { status: 400 });
  }

  const stripe = getStripeServerClient();
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!stripe) {
    return NextResponse.json({
      checkoutUrl: `${appUrl}/${parsed.data.locale}/dashboard?mockCheckout=1&caseId=${parsed.data.caseId}`,
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
          unit_amount: Math.round(parsed.data.amount * 100),
          product_data: {
            name: `FinTax ${parsed.data.caseType}`,
          },
        },
      },
    ],
    success_url: `${appUrl}/${parsed.data.locale}/dashboard?payment=success&caseId=${parsed.data.caseId}`,
    cancel_url: `${appUrl}/${parsed.data.locale}/dashboard?payment=cancelled&caseId=${parsed.data.caseId}`,
    metadata: {
      case_id: parsed.data.caseId,
      user_id: parsed.data.userId,
      case_type: parsed.data.caseType,
    },
  });

  return NextResponse.json({ checkoutUrl: session.url, id: session.id, mock: false });
}
