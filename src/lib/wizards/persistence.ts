"use client";

import { createClient } from "@/lib/supabase/client";

export async function persistWizardSnapshot(params: {
  storageKey: string;
  caseId?: string;
  payload: Record<string, unknown>;
}) {
  const metadata = buildLocalWizardMetadata(params.payload);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(params.storageKey, JSON.stringify(metadata));
  }

  if (!params.caseId) return;

  try {
    const supabase = createClient();
    if (!supabase) return;
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return;

    await supabase
      .from("cases")
      .update({ wizard_data: sanitizeWizardPayload(params.payload), updated_at: new Date().toISOString() })
      .eq("id", params.caseId)
      .eq("user_id", user.id);
  } catch {
    // Local persistence still works if Supabase is not configured.
  }
}

export function loadWizardSnapshot<T>(storageKey: string, fallback: T): T {
  void storageKey;
  return fallback;
}

export function hasLocalWizardProgress(storageKey: string): boolean {
  if (typeof window === "undefined") return false;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { hasDraft?: boolean };
    return Boolean(parsed.hasDraft);
  } catch {
    return false;
  }
}

function sanitizeWizardPayload(payload: Record<string, unknown>) {
  const clone = { ...payload };
  if ("bsn" in clone) clone.bsn = null;
  return clone;
}

function buildLocalWizardMetadata(payload: Record<string, unknown>) {
  return {
    hasDraft: true,
    updatedAt: new Date().toISOString(),
    progressStep: typeof payload.currentStep === "number" ? payload.currentStep : null,
    selectedService: typeof payload.selectedService === "string" ? payload.selectedService : null,
  };
}
