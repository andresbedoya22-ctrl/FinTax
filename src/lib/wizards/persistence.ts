"use client";

import { createClient } from "@/lib/supabase/client";

export async function persistWizardSnapshot(params: {
  storageKey: string;
  caseId?: string;
  payload: Record<string, unknown>;
}) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(params.storageKey, JSON.stringify(params.payload));
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
      .update({ wizard_data: params.payload, updated_at: new Date().toISOString() })
      .eq("id", params.caseId)
      .eq("user_id", user.id);
  } catch {
    // Local persistence still works if Supabase is not configured.
  }
}

export function loadWizardSnapshot<T>(storageKey: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;

  try {
    const raw = window.localStorage.getItem(storageKey);
    return raw ? ({ ...fallback, ...JSON.parse(raw) } as T) : fallback;
  } catch {
    return fallback;
  }
}
