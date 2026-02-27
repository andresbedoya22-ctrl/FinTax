import { z } from "zod";

import type { ApiErrorCode, ApiFailure, ApiMeta, ApiSuccess } from "@/types/api";

export const STATUS_BY_ERROR_CODE: Record<ApiErrorCode, number> = {
  unauthorized: 401,
  invalid_payload: 400,
  invalid_params: 400,
  not_found: 404,
  forbidden: 403,
  conflict: 409,
  internal: 500,
};

const idParamSchema = z.object({
  id: z.string().uuid(),
});

const notificationsLimitSchema = z.object({
  limit: z.coerce.number().int().min(1).max(100).optional(),
});

export function buildApiSuccess<T>(data: T, meta?: ApiMeta): ApiSuccess<T> {
  return {
    data,
    error: null,
    ...(meta ? { meta } : {}),
  };
}

export function buildApiFailure(code: ApiErrorCode, message?: string, meta?: ApiMeta): ApiFailure {
  return {
    data: null,
    error: {
      code,
      ...(message ? { message } : {}),
    },
    ...(meta ? { meta } : {}),
  };
}

export function parseIdParam(params: { id: string }) {
  return idParamSchema.safeParse(params);
}

export function parseNotificationsLimit(query: Record<string, string | undefined>) {
  return notificationsLimitSchema.safeParse(query);
}
