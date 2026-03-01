import { apiError, apiSuccess } from "@/lib/api/response";
import { createAdminClient } from "@/lib/supabase/server";

type HealthPayload = {
  status: "ok" | "degraded";
  version: string;
  checks: {
    db: "ok" | "error";
    storage: "ok" | "skipped";
  };
};

export async function GET() {
  let db: "ok" | "error" = "error";
  const storage: "ok" | "skipped" = "skipped";

  try {
    const supabase = await createAdminClient();
    const { error } = await supabase.from("service_pricing").select("id").limit(1);
    if (!error) db = "ok";
  } catch {
    db = "error";
  }

  const payload: HealthPayload = {
    status: db === "ok" ? "ok" : "degraded",
    version:
      process.env.VERCEL_GIT_COMMIT_SHA ??
      process.env.NEXT_PUBLIC_APP_VERSION ??
      process.env.npm_package_version ??
      "unknown",
    checks: { db, storage },
  };

  if (payload.status === "degraded") {
    return apiError("internal", "health_degraded", { requestId: "health" });
  }

  return apiSuccess(payload);
}
