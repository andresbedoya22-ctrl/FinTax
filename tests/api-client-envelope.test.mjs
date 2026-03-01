import assert from "node:assert/strict";

import { ApiClientError, apiGet, apiPost, isApiClientError } from "../src/hooks/api-client.ts";

function makeJsonResponse(payload, status = 200) {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "content-type": "application/json" },
  });
}

async function run() {
  const originalFetch = globalThis.fetch;

  try {
    globalThis.fetch = async () => makeJsonResponse({ data: [{ id: "case_1" }], error: null }, 200);
    const success = await apiGet("/api/cases");
    assert.deepEqual(success, [{ id: "case_1" }]);

    globalThis.fetch = async () => makeJsonResponse({ data: { id: "dsar_1", request_type: "export" }, error: null }, 200);
    const created = await apiPost("/api/dsar", { requestType: "export" });
    assert.deepEqual(created, { id: "dsar_1", request_type: "export" });

    globalThis.fetch = async () =>
      makeJsonResponse({ data: null, error: { code: "unauthorized", message: "session_missing" } }, 401);
    await assert.rejects(
      () => apiGet("/api/notifications"),
      (error) =>
        isApiClientError(error) &&
        error.code === "unauthorized" &&
        error.message === "session_missing" &&
        error.status === 401,
    );

    const direct = new ApiClientError({ code: "internal", message: "request_failed", status: 500 });
    assert.equal(isApiClientError(direct), true);
    console.log("api-client-envelope: ok");
  } finally {
    globalThis.fetch = originalFetch;
  }
}

run().catch((error) => {
  console.error("api-client-envelope: failed");
  throw error;
});
