import { NextResponse } from "next/server";

import type { ApiErrorCode, ApiMeta } from "@/types/api";

import { buildApiFailure, buildApiSuccess, STATUS_BY_ERROR_CODE } from "./contracts";

export function apiSuccess<T>(data: T, meta?: ApiMeta) {
  return NextResponse.json(buildApiSuccess(data, meta));
}

export function apiError(code: ApiErrorCode, message?: string, meta?: ApiMeta) {
  return NextResponse.json(buildApiFailure(code, message, meta), { status: STATUS_BY_ERROR_CODE[code] });
}
