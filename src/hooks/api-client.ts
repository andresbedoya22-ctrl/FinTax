async function parseEnvelope<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | { data: T; error: null }
    | { data: null; error: { code: string; message?: string } }
    | null;

  if (!response.ok || !payload || payload.error) {
    const code = payload && "error" in payload && payload.error ? payload.error.code : "internal";
    const message = payload && "error" in payload && payload.error?.message ? payload.error.message : "request_failed";
    throw new Error(`${code}:${message}`);
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
