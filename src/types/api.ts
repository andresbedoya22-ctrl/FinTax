export type ApiErrorCode =
  | "unauthorized"
  | "invalid_payload"
  | "invalid_params"
  | "not_found"
  | "forbidden"
  | "conflict"
  | "internal";

export interface ApiErrorShape {
  code: ApiErrorCode;
  message?: string;
}

export interface ApiMeta {
  [key: string]: unknown;
}

export interface ApiSuccess<T> {
  data: T;
  error: null;
  meta?: ApiMeta;
}

export interface ApiFailure {
  data: null;
  error: ApiErrorShape;
  meta?: ApiMeta;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;
