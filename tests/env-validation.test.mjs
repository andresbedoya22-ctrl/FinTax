import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

import { getEnv, getPublicEnv, getServerEnv } from "../src/lib/env.ts";

const repoRoot = process.cwd();

const safeEnv = {
  NODE_ENV: "development",
  NEXT_PUBLIC_APP_URL: "http://localhost:3000",
  NEXT_PUBLIC_SUPABASE_URL: "https://example.supabase.co",
  NEXT_PUBLIC_SUPABASE_ANON_KEY: "anon-key",
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: "pk_test_123",
  NEXT_PUBLIC_DEFAULT_LOCALE: "en",
  NEXT_PUBLIC_SUPPORTED_LOCALES: "en,nl,es,ro,pl",
  SUPABASE_SERVICE_ROLE_KEY: "service-role-key",
  STRIPE_SECRET_KEY: "sk_test_123",
  STRIPE_WEBHOOK_SECRET: "whsec_123",
  RESEND_API_KEY: "re_123",
  RESEND_FROM_EMAIL: "FinTax <ops@example.com>",
  UPSTASH_REDIS_REST_URL: "https://example.upstash.io",
  UPSTASH_REDIS_REST_TOKEN: "token",
  BSN_ENCRYPTION_KEY: "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
};

function test(name, fn) {
  try {
    fn();
    console.log(`env-validation: ${name} ok`);
  } catch (error) {
    console.error(`env-validation: ${name} failed`);
    throw error;
  }
}

test(".env.example exists", () => {
  assert.equal(fs.existsSync(path.join(repoRoot, ".env.example")), true);
});

test("env validation passes with a safe example env", () => {
  const env = getEnv(safeEnv);
  assert.equal(env.NEXT_PUBLIC_APP_URL, "http://localhost:3000");
  assert.equal(env.STRIPE_SECRET_KEY, "sk_test_123");
});

test("production missing STRIPE_SECRET_KEY fails", () => {
  assert.throws(
    () =>
      getServerEnv({
        ...safeEnv,
        NODE_ENV: "production",
        STRIPE_SECRET_KEY: "",
      }),
    /STRIPE_SECRET_KEY is required in production/,
  );
});

test("client env never includes service role key", () => {
  const publicEnv = getPublicEnv(safeEnv);
  assert.equal("SUPABASE_SERVICE_ROLE_KEY" in publicEnv, false);
  assert.equal(publicEnv.NEXT_PUBLIC_SUPABASE_URL, "https://example.supabase.co");
});
