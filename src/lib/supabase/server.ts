import { createServerClient } from "@supabase/ssr";
import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

import { getEnv } from "../env";

type CookieOptions = {
  domain?: string;
  maxAge?: number;
  path?: string;
};

function secureCookieOptions(options?: CookieOptions) {
  return {
    ...options,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: true,
  };
}

export async function createClient() {
  const cookieStore = await cookies();
  const env = getEnv();

  return createServerClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, secureCookieOptions(options))
            );
          } catch {
            // Called from a Server Component; middleware handles cookie writes.
          }
        },
      },
    }
  );
}

export async function createAdminClient() {
  const env = getEnv();

  return createSupabaseClient(
    env.NEXT_PUBLIC_SUPABASE_URL!,
    env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
        detectSessionInUrl: false,
      },
    }
  );
}
