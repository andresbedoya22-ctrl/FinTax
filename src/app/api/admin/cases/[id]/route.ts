import { z } from "zod";

import { canTransitionCaseStatus } from "@/domain/cases/status-transitions";
import { sendCaseStatusEmail } from "@/lib/email/notifications";
import { requireAdminUser } from "@/lib/api/auth";
import { parseIdParam } from "@/lib/api/contracts";
import { apiError, apiSuccess } from "@/lib/api/response";
import { createAdminClient } from "@/lib/supabase/server";
import type { CaseStatus } from "@/types/database";

const schema = z
  .object({
    status: z
      .enum([
        "draft",
        "pending_payment",
        "paid",
        "pending_authorization",
        "authorized",
        "in_review",
        "pending_documents",
        "submitted",
        "completed",
        "rejected",
      ])
      .optional(),
    notesInternal: z.string().trim().max(2000).nullable().optional(),
    assignToSelf: z.boolean().optional(),
    sendNotification: z.boolean().optional(),
    locale: z.string().trim().min(2).max(5).optional(),
  })
  .refine((value) => value.status !== undefined || value.notesInternal !== undefined || value.assignToSelf, {
    message: "empty_admin_update",
  });

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const parsedParams = parseIdParam(await context.params);
  if (!parsedParams.success) return apiError("invalid_params");

  const admin = await requireAdminUser();
  if ("errorResponse" in admin) return admin.errorResponse;

  const parsedBody = schema.safeParse(await request.json().catch(() => null));
  if (!parsedBody.success) return apiError("invalid_payload", "invalid_admin_case_update");

  const service = await createAdminClient().catch(() => null);
  if (!service) return apiError("internal", "admin_client_unavailable");

  const { data: existingCase, error: lookupError } = await service
    .from("cases")
    .select("id,user_id,status,display_name,assigned_admin,notes_internal")
    .eq("id", parsedParams.data.id)
    .maybeSingle();

  if (lookupError) return apiError("internal", "admin_case_lookup_failed");
  if (!existingCase) return apiError("not_found", "admin_case_not_found");

  const nextStatus = parsedBody.data.status as CaseStatus | undefined;
  if (nextStatus && !canTransitionCaseStatus(existingCase.status as CaseStatus, nextStatus)) {
    return apiError("conflict", "invalid_case_status_transition");
  }

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (nextStatus) {
    updates.status = nextStatus;
    if (nextStatus === "paid" && !("paid_at" in existingCase)) {
      updates.paid_at = new Date().toISOString();
    }
  }

  if (parsedBody.data.notesInternal !== undefined) {
    updates.notes_internal = parsedBody.data.notesInternal || null;
  }

  if (parsedBody.data.assignToSelf) {
    updates.assigned_admin = admin.user.id;
  }

  const { data: updatedCase, error: updateError } = await service
    .from("cases")
    .update(updates)
    .eq("id", parsedParams.data.id)
    .select("id,user_id,case_type,status,display_name,tax_year,deadline,estimated_refund,actual_refund,paid_at,wizard_data,wizard_completed,machtiging_status,machtiging_code,stripe_payment_id,assigned_admin,notes_internal,legal_hold,legal_hold_reason,legal_hold_set_at,created_at,updated_at")
    .single();

  if (updateError) return apiError("internal", "admin_case_update_failed");

  await service.from("admin_activity_log").insert({
    admin_id: admin.user.id,
    case_id: parsedParams.data.id,
    action: "admin_case_updated",
    details: {
      status_from: existingCase.status,
      status_to: nextStatus ?? existingCase.status,
      assigned_admin: parsedBody.data.assignToSelf ? admin.user.id : existingCase.assigned_admin,
      notes_updated: parsedBody.data.notesInternal !== undefined,
      send_notification: parsedBody.data.sendNotification ?? false,
    },
  });

  const shouldNotify = Boolean(parsedBody.data.sendNotification || nextStatus);
  if (shouldNotify) {
    const { data: profile } = await service
      .from("profiles")
      .select("email,preferred_language,notification_email")
      .eq("id", existingCase.user_id)
      .maybeSingle();

    if (profile?.email && profile.notification_email !== false) {
      await sendCaseStatusEmail({
        to: profile.email,
        locale: parsedBody.data.locale ?? profile.preferred_language ?? "en",
        caseName: updatedCase.display_name ?? updatedCase.case_type,
        caseId: updatedCase.id,
        nextStatus: updatedCase.status as CaseStatus,
        note: parsedBody.data.notesInternal,
      });
    }
  }

  return apiSuccess(updatedCase);
}
