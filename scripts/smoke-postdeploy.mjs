function fail(message) {
  throw new Error(message);
}

async function request(url, label) {
  const response = await fetch(url, {
    method: "GET",
    redirect: "manual",
    headers: {
      Accept: "application/json, text/html;q=0.9,*/*;q=0.8",
    },
  });
  if (!response) {
    fail(`${label}: no response`);
  }
  return response;
}

async function checkRoot(baseUrl) {
  const response = await request(baseUrl, "root");
  if (response.status < 200 || response.status > 399) {
    fail(`root returned ${response.status}`);
  }
}

async function checkHealth(baseUrl) {
  const response = await request(`${baseUrl}/api/health`, "health");
  if (!response.ok) {
    fail(`/api/health returned ${response.status}`);
  }
  const payload = await response.json().catch(() => null);
  if (!payload || payload.error || payload.data?.status !== "ok") {
    fail("/api/health payload is not a success envelope with status=ok");
  }
}

async function checkSecurityHeaders(baseUrl) {
  const response = await request(baseUrl, "security headers");
  const required = [
    "strict-transport-security",
    "x-frame-options",
    "x-content-type-options",
    "referrer-policy",
  ];
  for (const header of required) {
    if (!response.headers.get(header)) {
      fail(`missing security header: ${header}`);
    }
  }
}

async function checkUnauthorizedEnvelope(baseUrl, apiPath) {
  const response = await request(`${baseUrl}${apiPath}`, apiPath);
  if (response.status !== 401) {
    fail(`${apiPath} expected 401, got ${response.status}`);
  }
  const payload = await response.json().catch(() => null);
  if (!payload || payload.data !== null || payload.error?.code !== "unauthorized") {
    fail(`${apiPath} did not return unauthorized API envelope`);
  }
}

async function main() {
  const baseUrl = process.env.POSTDEPLOY_BASE_URL ?? process.env.STAGING_URL;
  if (!baseUrl) {
    fail("Missing POSTDEPLOY_BASE_URL (or STAGING_URL fallback)");
  }

  await checkRoot(baseUrl);
  await checkHealth(baseUrl);
  await checkSecurityHeaders(baseUrl);
  await checkUnauthorizedEnvelope(baseUrl, "/api/cases");
  await checkUnauthorizedEnvelope(baseUrl, "/api/notifications");

  console.log("smoke:postdeploy PASS");
}

main().catch((error) => {
  console.error("smoke:postdeploy FAIL");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
