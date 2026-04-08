import { createClient } from "@supabase/supabase-js";

export function createSupabaseAdminClient() {
  const url =
    process.env.DOCFLOW_SUPABASE_URL ??
    process.env.SUPABASE_URL ??
    process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey =
    process.env.DOCFLOW_SUPABASE_SERVICE_ROLE_KEY ??
    process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceRoleKey) {
    throw new Error(
      "missing_supabase_admin_env:DOCFLOW_SUPABASE_URL|SUPABASE_URL|NEXT_PUBLIC_SUPABASE_URL and DOCFLOW_SUPABASE_SERVICE_ROLE_KEY|SUPABASE_SERVICE_ROLE_KEY are required"
    );
  }

  return createClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
