import { createClient } from "@supabase/supabase-js";

function fail(message) {
  throw new Error(message);
}

async function expectHttpOk(url, label) {
  const response = await fetch(url, { method: "GET", redirect: "manual" });
  if (!response.ok) {
    fail(`${label} returned ${response.status}`);
  }
  return response;
}

async function verifyHealth(stagingUrl) {
  const response = await expectHttpOk(`${stagingUrl}/api/health`, "/api/health");
  const payload = await response.json().catch(() => null);
  if (!payload?.data?.status || payload.data.status !== "ok") {
    fail("health payload is not ok");
  }
}

async function verifyHeaders(stagingUrl) {
  const response = await expectHttpOk(stagingUrl, "staging root");
  const required = [
    "strict-transport-security",
    "x-frame-options",
    "x-content-type-options",
    "referrer-policy",
  ];
  for (const name of required) {
    if (!response.headers.get(name)) {
      fail(`missing security header: ${name}`);
    }
  }
}

function verifyKeyIsolation() {
  const checks = [
    ["STAGING_SUPABASE_URL", "PROD_SUPABASE_URL"],
    ["STAGING_STRIPE_KEY", "PROD_STRIPE_KEY"],
    ["STAGING_BSN_KEY", "PROD_BSN_KEY"],
  ];
  for (const [stagingKey, prodKey] of checks) {
    const stagingValue = process.env[stagingKey];
    const prodValue = process.env[prodKey];
    if (stagingValue && prodValue && stagingValue === prodValue) {
      fail(`FATAL: ${stagingKey} === ${prodKey}`);
    }
  }
}

async function verifyRlsWithAnon(stagingSupabaseUrl, stagingAnonKey) {
  const anon = createClient(stagingSupabaseUrl, stagingAnonKey, {
    auth: { persistSession: false },
  });
  const [profiles, cases] = await Promise.all([
    anon.from("profiles").select("id").limit(1),
    anon.from("cases").select("id").limit(1),
  ]);
  if (profiles.error || cases.error) {
    fail("RLS check failed: unable to query profiles/cases with anon client");
  }
  if ((profiles.data ?? []).length > 0 || (cases.data ?? []).length > 0) {
    fail("RLS check failed: anon client can read protected rows");
  }
}

async function verifyMigrationsIfConfigured() {
  const stagingUrl = process.env.STAGING_SUPABASE_URL;
  const prodUrl = process.env.PROD_SUPABASE_URL;
  const stagingService = process.env.STAGING_SUPABASE_SERVICE_ROLE_KEY;
  const prodService = process.env.PROD_SUPABASE_SERVICE_ROLE_KEY;

  if (!stagingUrl || !prodUrl || !stagingService || !prodService) {
    console.warn("migrations parity skipped: missing service-role env vars");
    return;
  }

  const staging = createClient(stagingUrl, stagingService, { auth: { persistSession: false } });
  const prod = createClient(prodUrl, prodService, { auth: { persistSession: false } });

  const [stagingMigrations, prodMigrations] = await Promise.all([
    staging.from("schema_migrations").select("version").order("version", { ascending: true }),
    prod.from("schema_migrations").select("version").order("version", { ascending: true }),
  ]);

  if (stagingMigrations.error || prodMigrations.error) {
    fail("migrations parity check failed: unable to read schema_migrations");
  }

  const stagingLast = stagingMigrations.data?.at(-1)?.version ?? null;
  const prodLast = prodMigrations.data?.at(-1)?.version ?? null;
  if (stagingLast !== prodLast) {
    fail(`Migrations desync: staging=${stagingLast} prod=${prodLast}`);
  }
}

async function main() {
  const stagingUrl = process.env.STAGING_URL;
  const stagingSupabaseUrl = process.env.STAGING_SUPABASE_URL;
  const stagingAnonKey = process.env.STAGING_SUPABASE_ANON_KEY;

  if (!stagingUrl) fail("Missing STAGING_URL");
  if (!stagingSupabaseUrl) fail("Missing STAGING_SUPABASE_URL");
  if (!stagingAnonKey) fail("Missing STAGING_SUPABASE_ANON_KEY");

  verifyKeyIsolation();
  await verifyHealth(stagingUrl);
  await verifyHeaders(stagingUrl);
  await verifyRlsWithAnon(stagingSupabaseUrl, stagingAnonKey);
  await verifyMigrationsIfConfigured();

  console.log("smoke:staging PASS");
}

main().catch((error) => {
  console.error("smoke:staging FAIL");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
