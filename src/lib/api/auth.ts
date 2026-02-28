import { z } from "zod";

import { createClient } from "@/lib/supabase/server";

import { apiError } from "./response";

const supabaseEnvSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1),
});

export async function requireAuthedUser() {
  const parsedEnv = supabaseEnvSchema.safeParse(process.env);
  if (!parsedEnv.success) {
    return { errorResponse: apiError("internal", "supabase_not_configured") } as const;
  }

  const supabase = await createClient().catch(() => null);
  if (!supabase) {
    return { errorResponse: apiError("internal", "supabase_client_unavailable") } as const;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return { errorResponse: apiError("unauthorized") } as const;
  }

  return { supabase, user } as const;
}

export async function requireAdminUser() {
  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) {
    return authed;
  }

  const { data, error } = await authed.supabase
    .from("profiles")
    .select("role")
    .eq("id", authed.user.id)
    .eq("role", "admin")
    .maybeSingle();

  if (error) {
    return { errorResponse: apiError("internal") } as const;
  }

  if (!data) {
    return { errorResponse: apiError("forbidden") } as const;
  }

  return authed;
}
