import { createClient } from "@supabase/supabase-js";

import { decryptBsn, encryptBsn } from "../src/lib/security/encryption.ts";

function getSupabaseAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY are required");
  }
  return createClient(url, key, { auth: { persistSession: false } });
}

function parseLegacyPayload(payload) {
  const [keyId, ivB64, tagB64, dataB64] = payload.split(":");
  if (!keyId || !ivB64 || !tagB64 || !dataB64) throw new Error("Invalid legacy bsn_encrypted payload");
  return { keyId, ciphertext: `${ivB64}:${tagB64}:${dataB64}` };
}

async function main() {
  const force = process.argv.includes("--force");
  const supabase = getSupabaseAdminClient();

  const { data, error } = await supabase
    .from("profiles")
    .select("id, bsn_key_id, bsn_ciphertext, bsn_encrypted")
    .not("bsn_encrypted", "is", null)
    .limit(10000);

  if (error) throw error;

  const rows = data ?? [];
  let updated = 0;

  for (const row of rows) {
    const source = row.bsn_key_id && row.bsn_ciphertext
      ? { keyId: row.bsn_key_id, ciphertext: row.bsn_ciphertext }
      : parseLegacyPayload(row.bsn_encrypted);

    const plaintext = decryptBsn(source.keyId, source.ciphertext);
    const next = encryptBsn(plaintext);

    if (!force && next.keyId === source.keyId) {
      continue;
    }

    const { error: updateError } = await supabase
      .from("profiles")
      .update({
        bsn_key_id: next.keyId,
        bsn_ciphertext: next.ciphertext,
        bsn_encrypted: `${next.keyId}:${next.ciphertext}`,
      })
      .eq("id", row.id);

    if (updateError) throw updateError;
    updated += 1;
  }

  console.log(`bsn-reencrypt: scanned=${rows.length} updated=${updated}`);
}

main().catch((error) => {
  console.error("bsn-reencrypt: failed");
  console.error(error);
  process.exit(1);
});
