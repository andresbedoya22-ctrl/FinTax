import { requireAdminUser } from "@/lib/api/auth";
import { apiError, apiSuccess } from "@/lib/api/response";

export async function GET() {
  const admin = await requireAdminUser();
  if ("errorResponse" in admin) return admin.errorResponse;

  const { data, error } = await admin.supabase
    .from("service_pricing")
    .select("id, case_type, name, description, price, is_active, created_at")
    .order("created_at", { ascending: false });

  if (error) return apiError("internal");

  return apiSuccess(data ?? []);
}
