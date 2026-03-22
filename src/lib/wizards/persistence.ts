"use client";

import { createClient } from "@/lib/supabase/client";

export interface WizardSnapshot<T = Record<string, unknown>> {
  hasDraft: boolean;
  version: 2;
  updatedAt: string;
  progressStep: number | null;
  selectedService: string | null;
  caseId?: string | null;
  draftStatus?: string | null;
  payload: Partial<T>;
}

export async function persistWizardSnapshot(params: {
  storageKey: string;
  caseId?: string;
  payload: Record<string, unknown>;
}) {
  const snapshot = buildLocalWizardSnapshot(params);

  if (typeof window !== "undefined") {
    window.localStorage.setItem(params.storageKey, JSON.stringify(snapshot));
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
  const snapshot = readWizardSnapshot<T>(storageKey);
  if (!snapshot?.payload) return fallback;

  return mergeWithFallback(fallback, snapshot.payload);
}

export function hasLocalWizardProgress(storageKey: string): boolean {
  return Boolean(readWizardSnapshot(storageKey)?.hasDraft);
}

export function readWizardSnapshot<T>(storageKey: string): WizardSnapshot<T> | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(storageKey);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<WizardSnapshot<T>> & { selectedService?: string | null };
    if (!parsed || typeof parsed !== "object") return null;

    return {
      hasDraft: Boolean(parsed.hasDraft),
      version: 2,
      updatedAt: typeof parsed.updatedAt === "string" ? parsed.updatedAt : new Date().toISOString(),
      progressStep: typeof parsed.progressStep === "number" ? parsed.progressStep : null,
      selectedService: typeof parsed.selectedService === "string" ? parsed.selectedService : null,
      caseId: typeof parsed.caseId === "string" ? parsed.caseId : null,
      draftStatus: typeof parsed.draftStatus === "string" ? parsed.draftStatus : null,
      payload: typeof parsed.payload === "object" && parsed.payload !== null ? parsed.payload : {},
    };
  } catch {
    return null;
  }
}

function sanitizeWizardPayload(payload: Record<string, unknown>) {
  return sanitizeValue(payload) as Record<string, unknown>;
}

function buildLocalWizardSnapshot(params: {
  caseId?: string;
  payload: Record<string, unknown>;
}): WizardSnapshot {
  return {
    hasDraft: true,
    version: 2,
    updatedAt: new Date().toISOString(),
    progressStep: typeof params.payload.currentStep === "number" ? params.payload.currentStep : null,
    selectedService: typeof params.payload.selectedService === "string" ? params.payload.selectedService : null,
    caseId: params.caseId ?? null,
    draftStatus: typeof params.payload.draftStatus === "string" ? params.payload.draftStatus : null,
    payload: sanitizeWizardPayload(params.payload),
  };
}

function mergeWithFallback<T>(fallback: T, payload: Partial<T>): T {
  if (!fallback || typeof fallback !== "object") return fallback;

  const result = { ...(fallback as Record<string, unknown>) };
  const payloadObject = payload as Record<string, unknown>;

  for (const key of Object.keys(result)) {
    if (key in payloadObject) {
      result[key] = payloadObject[key];
    }
  }

  return result as T;
}

function sanitizeValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeValue(item));
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value).map(([key, nextValue]) => [key, key.toLowerCase() === "bsn" ? null : sanitizeValue(nextValue)]),
    );
  }

  return value;
}
