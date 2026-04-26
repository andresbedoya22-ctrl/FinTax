import { z } from "zod";

const optionalTrimmedString = z.string().trim().optional().transform((value) => (value ? value : undefined));

const publicEnvSchema = z.object({
  NEXT_PUBLIC_APP_URL: z.string().trim().url().optional(),
  NEXT_PUBLIC_SUPABASE_URL: z.string().trim().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: optionalTrimmedString,
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: optionalTrimmedString,
  NEXT_PUBLIC_DEFAULT_LOCALE: optionalTrimmedString.default("en"),
  NEXT_PUBLIC_SUPPORTED_LOCALES: optionalTrimmedString.default("en,nl,es,ro,pl"),
  NEXT_PUBLIC_USE_MOCK_NOTIFICATIONS: optionalTrimmedString.default("0"),
});

const serverEnvSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
  SUPABASE_SERVICE_ROLE_KEY: optionalTrimmedString,
  STRIPE_SECRET_KEY: optionalTrimmedString,
  STRIPE_WEBHOOK_SECRET: optionalTrimmedString,
  RESEND_API_KEY: optionalTrimmedString,
  RESEND_FROM_EMAIL: optionalTrimmedString,
  UPSTASH_REDIS_REST_URL: z.string().trim().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: optionalTrimmedString,
  ALLOWED_ORIGINS: optionalTrimmedString,
  APP_ENCRYPTION_KEY: optionalTrimmedString,
  BSN_ENCRYPTION_KEY: optionalTrimmedString,
  BSN_ENCRYPTION_KEYS: optionalTrimmedString,
  BSN_ENCRYPTION_ACTIVE_KEY_ID: optionalTrimmedString,
  BSN_ENCRYPTION_KEY_CURRENT: optionalTrimmedString,
  BSN_ENCRYPTION_KEY_PREVIOUS: optionalTrimmedString,
  DOCFLOW_SUPABASE_URL: z.string().trim().url().optional(),
  DOCFLOW_SUPABASE_SERVICE_ROLE_KEY: optionalTrimmedString,
  STAGING_URL: z.string().trim().url().optional(),
  STAGING_SUPABASE_URL: z.string().trim().url().optional(),
  STAGING_SUPABASE_ANON_KEY: optionalTrimmedString,
  STAGING_SUPABASE_SERVICE_ROLE_KEY: optionalTrimmedString,
  PROD_SUPABASE_URL: z.string().trim().url().optional(),
  PROD_SUPABASE_SERVICE_ROLE_KEY: optionalTrimmedString,
  STAGING_STRIPE_KEY: optionalTrimmedString,
  PROD_STRIPE_KEY: optionalTrimmedString,
  STAGING_BSN_KEY: optionalTrimmedString,
  PROD_BSN_KEY: optionalTrimmedString,
  STRIPE_PRICE_TAX_RETURN_BASIC: optionalTrimmedString,
  STRIPE_PRICE_TAX_RETURN_PLUS: optionalTrimmedString,
  STRIPE_PRICE_BENEFITS_APPLICATION: optionalTrimmedString,
});

export type PublicEnv = z.output<typeof publicEnvSchema>;
export type ServerEnv = z.output<typeof serverEnvSchema>;
export type AppEnv = PublicEnv & ServerEnv;

export function getPublicEnv(source: NodeJS.ProcessEnv = process.env): PublicEnv {
  return publicEnvSchema.parse(source);
}

export function getServerEnv(source: NodeJS.ProcessEnv = process.env): ServerEnv {
  const parsed = serverEnvSchema.parse(source);

  if (parsed.NODE_ENV === "production") {
    const requiredInProduction = {
      NEXT_PUBLIC_APP_URL: source.NEXT_PUBLIC_APP_URL,
      NEXT_PUBLIC_SUPABASE_URL: source.NEXT_PUBLIC_SUPABASE_URL,
      NEXT_PUBLIC_SUPABASE_ANON_KEY: source.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: parsed.SUPABASE_SERVICE_ROLE_KEY,
      STRIPE_SECRET_KEY: parsed.STRIPE_SECRET_KEY,
      STRIPE_WEBHOOK_SECRET: parsed.STRIPE_WEBHOOK_SECRET,
    } as const;

    for (const [key, value] of Object.entries(requiredInProduction)) {
      if (!value || !value.trim()) {
        throw new Error(`${key} is required in production`);
      }
    }
  }

  return parsed;
}

export function getEnv(source: NodeJS.ProcessEnv = process.env): AppEnv {
  if (typeof window !== "undefined") {
    throw new Error("getEnv() is server-only");
  }

  return {
    ...getPublicEnv(source),
    ...getServerEnv(source),
  };
}

export function getBsnKeyRingEnv(source: NodeJS.ProcessEnv = process.env) {
  const env = getEnv(source);

  if (env.BSN_ENCRYPTION_KEYS) {
    return {
      rawRing: env.BSN_ENCRYPTION_KEYS,
      activeKeyId: env.BSN_ENCRYPTION_ACTIVE_KEY_ID,
    };
  }

  if (env.BSN_ENCRYPTION_KEY_CURRENT || env.BSN_ENCRYPTION_KEY_PREVIOUS) {
    const keyPairs = [
      env.BSN_ENCRYPTION_KEY_CURRENT ? `current:${env.BSN_ENCRYPTION_KEY_CURRENT}` : null,
      env.BSN_ENCRYPTION_KEY_PREVIOUS ? `previous:${env.BSN_ENCRYPTION_KEY_PREVIOUS}` : null,
      env.BSN_ENCRYPTION_KEY ? `legacy:${env.BSN_ENCRYPTION_KEY}` : null,
    ].filter(Boolean);

    return {
      rawRing: keyPairs.join(","),
      activeKeyId: env.BSN_ENCRYPTION_KEY_CURRENT ? "current" : env.BSN_ENCRYPTION_ACTIVE_KEY_ID,
    };
  }

  return {
    rawRing: env.BSN_ENCRYPTION_KEY ?? undefined,
    activeKeyId: env.BSN_ENCRYPTION_ACTIVE_KEY_ID,
  };
}
