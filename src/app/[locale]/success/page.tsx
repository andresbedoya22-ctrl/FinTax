import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { StripeSuccessScreen } from "@/components/fintax/flows/StripeSuccessScreen";
import { AppShell } from "@/components/fintax/layout";
import { createClient } from "@/lib/supabase/server";
import { getStripeServerClient } from "@/lib/stripe/server";

export const metadata: Metadata = {
  robots: {
    index: false,
    follow: false,
  },
};

export default async function SuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ locale }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const supabase = await createClient().catch(() => null);
  const stripe = getStripeServerClient();

  const {
    data: { user },
  } = supabase ? await supabase.auth.getUser() : { data: { user: null } };

  if (!user) {
    redirect(`/${locale}/auth?next=/${locale}/success`);
  }

  const sessionId = typeof resolvedSearchParams.session_id === "string" ? resolvedSearchParams.session_id : null;
  if (!sessionId || !stripe || !supabase) {
    return <AppShell><StripeSuccessScreen caseId={null} initialStatus="invalid" initialCaseStatus={null} sessionId={sessionId} /></AppShell>;
  }

  const session = await stripe.checkout.sessions.retrieve(sessionId).catch(() => null);
  const caseId = session?.metadata?.case_id ?? null;
  const metadataUserId = session?.metadata?.user_id ?? null;

  if (!session || !caseId || metadataUserId !== user.id) {
    return <AppShell><StripeSuccessScreen caseId={caseId} initialStatus="invalid" initialCaseStatus={null} sessionId={sessionId} /></AppShell>;
  }

  const { data: caseRecord } = await supabase
    .from("cases")
    .select("id,status,paid_at,case_type")
    .eq("id", caseId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (!caseRecord) {
    return <AppShell><StripeSuccessScreen caseId={caseId} initialStatus="invalid" initialCaseStatus={null} sessionId={sessionId} /></AppShell>;
  }

  const initialStatus =
    session.payment_status === "paid" && (caseRecord.status === "paid" || Boolean(caseRecord.paid_at))
      ? "paid"
      : session.payment_status === "paid"
        ? "pending"
        : "invalid";

  return (
    <AppShell>
      <StripeSuccessScreen
        caseId={caseId}
        initialStatus={initialStatus}
        initialCaseStatus={caseRecord.status}
        initialCaseType={caseRecord.case_type}
        sessionId={sessionId}
      />
    </AppShell>
  );
}
