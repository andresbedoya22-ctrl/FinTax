import { apiError, apiSuccess } from "@/lib/api/response";
import { parseDsarCreatePayload } from "@/lib/api/contracts";
import { requireAuthedUser } from "@/lib/api/auth";
import type { DsarRequest } from "@/types/database";

const DSAR_WINDOW_DAYS = 30;

function computeDueAtIso() {
  const due = new Date();
  due.setUTCDate(due.getUTCDate() + DSAR_WINDOW_DAYS);
  return due.toISOString();
}

export async function GET() {
  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) {
    return authed.errorResponse;
  }

  const { data, error } = await authed.supabase
    .from("dsar_requests")
    .select("id,user_id,request_type,status,requested_payload,resolution_notes,due_at,resolved_at,created_at,updated_at")
    .eq("user_id", authed.user.id)
    .order("created_at", { ascending: false });

  if (error) {
    return apiError("internal", "dsar_list_failed");
  }

  return apiSuccess((data as DsarRequest[] | null) ?? []);
}

export async function POST(request: Request) {
  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) {
    return authed.errorResponse;
  }

  const payload = await request.json().catch(() => null);
  const parsed = parseDsarCreatePayload(payload);
  if (!parsed.success) {
    return apiError("invalid_payload", "invalid_dsar_request");
  }

  const now = new Date().toISOString();
  const { data, error } = await authed.supabase
    .from("dsar_requests")
    .insert({
      user_id: authed.user.id,
      request_type: parsed.data.requestType,
      requested_payload: parsed.data.details ?? {},
      due_at: computeDueAtIso(),
      created_at: now,
      updated_at: now,
    })
    .select("id,user_id,request_type,status,requested_payload,resolution_notes,due_at,resolved_at,created_at,updated_at")
    .single();

  if (error) {
    return apiError("internal", "dsar_create_failed");
  }

  return apiSuccess(data as DsarRequest, { dueWindowDays: DSAR_WINDOW_DAYS });
}
