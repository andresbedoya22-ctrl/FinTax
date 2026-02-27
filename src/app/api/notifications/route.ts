import { z } from "zod";

import { requireAuthedUser } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";

const querySchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export async function GET(request: Request) {
  const parsedQuery = querySchema.safeParse(Object.fromEntries(new URL(request.url).searchParams));
  if (!parsedQuery.success) return apiError("invalid_params");

  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const limit = parsedQuery.data.limit ?? 20;

  const { data, error } = await authed.supabase
    .from("notifications")
    .select("id, user_id, case_id, title, message, type, is_read, link, created_at")
    .eq("user_id", authed.user.id)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return apiError("internal");

  return apiSuccess(data ?? [], { limit });
}
