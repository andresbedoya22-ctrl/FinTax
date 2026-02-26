import { NextResponse } from "next/server";
import { z } from "zod";

import { encryptString } from "@/lib/security/encryption";
import { createAdminClient, createClient } from "@/lib/supabase/server";

const schema = z.object({
  caseType: z.string().min(1),
  fullName: z.string().min(2),
  bsn: z.string().min(4),
  taxYear: z.number().int().optional(),
});

export async function POST(request: Request) {
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "invalid_payload" }, { status: 400 });

  const supabase = await createClient().catch(() => null);
  const admin = await createAdminClient().catch(() => null);
  if (!supabase || !admin) {
    return NextResponse.json({ caseId: null, mock: true });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const encryptedBsn = encryptString(parsed.data.bsn);

  await admin
    .from("profiles")
    .update({ full_name: parsed.data.fullName, bsn_encrypted: encryptedBsn, updated_at: new Date().toISOString() })
    .eq("id", user.id);

  const { data: existing } = await admin
    .from("cases")
    .select("id")
    .eq("user_id", user.id)
    .eq("case_type", parsed.data.caseType)
    .eq("status", "draft")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (existing?.id) return NextResponse.json({ caseId: existing.id, mock: false });

  const { data: created, error } = await admin
    .from("cases")
    .insert({
      user_id: user.id,
      case_type: parsed.data.caseType,
      status: "draft",
      display_name: `${parsed.data.caseType} ${parsed.data.taxYear ?? ""}`.trim(),
      tax_year: parsed.data.taxYear ?? null,
      wizard_data: { fullName: parsed.data.fullName, taxYear: parsed.data.taxYear ?? null, bsn_present: true },
      wizard_completed: false,
    })
    .select("id")
    .single();

  if (error) return NextResponse.json({ error: "draft_create_failed" }, { status: 500 });
  return NextResponse.json({ caseId: created.id, mock: false });
}

