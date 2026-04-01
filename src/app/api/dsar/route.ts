import { apiError, apiSuccess } from "@/lib/api/response";
import { parseDsarCreatePayload } from "@/lib/api/contracts";
import { requireAuthedUser } from "@/lib/api/auth";
import { buildDsarExportBundle } from "@/lib/dsar/export";
import { sendDsarEmail } from "@/lib/email/notifications";
import { createAdminClient } from "@/lib/supabase/server";
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

  const admin = await createAdminClient().catch(() => null);
  if (!admin) {
    return apiError("internal", "admin_client_unavailable");
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

  const { data: profile } = await admin
    .from("profiles")
    .select("email,preferred_language")
    .eq("id", authed.user.id)
    .maybeSingle();

  if (profile?.email) {
    await sendDsarEmail({
      to: profile.email,
      locale: profile.preferred_language ?? "en",
      requestType: data.request_type,
      state: "received",
    });
  }

  if (data.request_type !== "export") {
    return apiSuccess(data as DsarRequest, { dueWindowDays: DSAR_WINDOW_DAYS });
  }

  const bundle = await buildDsarExportBundle(admin, authed.user.id).catch(() => null);
  if (!bundle) {
    return apiSuccess(data as DsarRequest, { dueWindowDays: DSAR_WINDOW_DAYS, exportReady: false });
  }

  const downloadPath = `/api/dsar/${data.id}/export`;
  const resolvedAt = new Date().toISOString();
  const { data: completed, error: completionError } = await admin
    .from("dsar_requests")
    .update({
      status: "completed",
      resolution_notes: "export_generated_authenticated_download",
      requested_payload: {
        ...(data.requested_payload ?? {}),
        generated_at: bundle.generated_at,
        delivery_mode: "authenticated_download",
        download_path: downloadPath,
      },
      resolved_at: resolvedAt,
      updated_at: resolvedAt,
    })
    .eq("id", data.id)
    .eq("user_id", authed.user.id)
    .select("id,user_id,request_type,status,requested_payload,resolution_notes,due_at,resolved_at,created_at,updated_at")
    .single();

  if (completionError || !completed) {
    return apiSuccess(data as DsarRequest, { dueWindowDays: DSAR_WINDOW_DAYS, exportReady: false });
  }

  if (profile?.email) {
    await sendDsarEmail({
      to: profile.email,
      locale: profile.preferred_language ?? "en",
      requestType: completed.request_type,
      state: "completed",
      downloadPath,
    });
  }

  return apiSuccess(completed as DsarRequest, { dueWindowDays: DSAR_WINDOW_DAYS, exportReady: true, downloadPath });
}
