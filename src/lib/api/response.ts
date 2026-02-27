import { NextResponse } from "next/server";

import type { ApiErrorCode, ApiMeta } from "@/types/api";

const STATUS_BY_ERROR_CODE: Record<ApiErrorCode, number> = {
  unauthorized: 401,
  invalid_payload: 400,
  invalid_params: 400,
  not_found: 404,
  forbidden: 403,
  conflict: 409,
  internal: 500,
};

export function apiSuccess<T>(data: T, meta?: ApiMeta) {
  return NextResponse.json({
    data,
    error: null,
    ...(meta ? { meta } : {}),
  });
}

export function apiError(code: ApiErrorCode, message?: string, meta?: ApiMeta) {
  return NextResponse.json(
    {
      data: null,
      error: {
        code,
        ...(message ? { message } : {}),
      },
      ...(meta ? { meta } : {}),
    },
    { status: STATUS_BY_ERROR_CODE[code] },
  );
}
