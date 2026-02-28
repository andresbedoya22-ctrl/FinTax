import type { ApiErrorCode } from "@/types/api";

type ApiEnvelope<T> =
  | { data: T; error: null }
  | { data: null; error: { code: ApiErrorCode | string; message?: string } };

export class ApiClientError extends Error {
  code: ApiErrorCode | string;
  status: number;

  constructor(input: { code: ApiErrorCode | string; message: string; status: number }) {
    super(input.message);
    this.name = "ApiClientError";
    this.code = input.code;
    this.status = input.status;
  }
}

export function isApiClientError(error: unknown): error is ApiClientError {
  return error instanceof ApiClientError;
}

function getErrorFromPayload<T>(payload: ApiEnvelope<T> | null) {
  if (!payload || !("error" in payload) || !payload.error) {
    return { code: "internal", message: "request_failed" };
  }
  return {
    code: payload.error.code ?? "internal",
    message: payload.error.message ?? "request_failed",
  };
}

async function parseEnvelope<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as ApiEnvelope<T> | null;

  if (!response.ok || !payload || payload.error) {
    const { code, message } = getErrorFromPayload(payload);
    throw new ApiClientError({ code, message, status: response.status });
  }

  return payload.data;
}

export async function apiGet<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
    cache: "no-store",
  });

  return parseEnvelope<T>(response);
}
