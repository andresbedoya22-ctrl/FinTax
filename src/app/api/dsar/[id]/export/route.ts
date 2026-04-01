import { parseIdParam } from "@/lib/api/contracts";
import { requireAuthedUser } from "@/lib/api/auth";
import { apiError } from "@/lib/api/response";
import { buildDsarExportBundle } from "@/lib/dsar/export";
import { createAdminClient } from "@/lib/supabase/server";

export async function GET(_: Request, context: { params: Promise<{ id: string }> }) {
  const parsedParams = parseIdParam(await context.params);
  if (!parsedParams.success) return apiError("invalid_params");

  const authed = await requireAuthedUser();
  if ("errorResponse" in authed) return authed.errorResponse;

  const service = await createAdminClient().catch(() => null);
  if (!service) return apiError("internal", "admin_client_unavailable");

  const { data: dsarRequest, error } = await service
    .from("dsar_requests")
    .select("id,user_id,request_type,status")
    .eq("id", parsedParams.data.id)
    .eq("user_id", authed.user.id)
    .maybeSingle();

  if (error) return apiError("internal", "dsar_export_lookup_failed");
  if (!dsarRequest || dsarRequest.request_type !== "export") return apiError("not_found", "dsar_export_not_found");

  const bundle = await buildDsarExportBundle(service, authed.user.id).catch(() => null);
  if (!bundle) return apiError("internal", "dsar_export_build_failed");

  return new Response(JSON.stringify(bundle, null, 2), {
    status: 200,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "content-disposition": `attachment; filename="fintax-dsar-export-${parsedParams.data.id}.json"`,
      "cache-control": "private, no-store",
    },
  });
}
