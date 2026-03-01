import assert from "node:assert/strict";

import { hashIdentifier, sanitizeText, sanitizeUnknown } from "../src/lib/observability/sanitize.ts";

const input = "email john@example.com and bsn 123456789";
const output = sanitizeText(input);
assert.equal(output.includes("john@example.com"), false);
assert.equal(output.includes("123456789"), false);
assert.equal(output.includes("[redacted-email]"), true);
assert.equal(output.includes("[redacted-bsn]"), true);

const nested = sanitizeUnknown({
  email: "person@site.com",
  profile: { bsn: "123456782" },
  tags: ["ok", "987654321"],
});
assert.equal(JSON.stringify(nested).includes("person@site.com"), false);
assert.equal(JSON.stringify(nested).includes("123456782"), false);

const hashed = hashIdentifier("user_123");
assert.equal(typeof hashed, "string");
assert.equal(hashed.startsWith("h"), true);

console.log("observability-sanitize: ok");
