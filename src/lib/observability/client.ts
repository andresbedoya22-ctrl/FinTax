import { hashIdentifier, sanitizeText, sanitizeUnknown } from "@/lib/observability/sanitize";

export type AppErrorContext = {
  userId?: string | null;
  caseId?: string | null;
  action: string;
  env?: string;
};

type SentryLike = {
  setContext?: (name: string, context: Record<string, unknown>) => void;
  captureException?: (error: unknown) => void;
};

function getSentryClient(): SentryLike | null {
  const candidate = (globalThis as { Sentry?: SentryLike }).Sentry;
  if (!candidate) return null;
  return candidate;
}

export function captureAppError(error: Error, context: AppErrorContext) {
  const sanitizedMessage = sanitizeText(error.message || "unknown_error");
  const payload = {
    userId_hash: context.userId ? hashIdentifier(context.userId) : null,
    caseId: context.caseId ?? null,
    action: context.action,
    env: context.env ?? process.env.NODE_ENV ?? "unknown",
  };

  const sentry = getSentryClient();
  if (sentry?.setContext) {
    sentry.setContext("app", payload);
  }
  if (sentry?.captureException) {
    sentry.captureException(new Error(sanitizedMessage));
    return;
  }

  const safeError = {
    message: sanitizedMessage,
    stack: sanitizeUnknown(error.stack ?? ""),
    context: payload,
  };
  console.error("[app_error]", safeError);
}
