import assert from "node:assert/strict";

import { decryptBsn, decryptString, encryptBsn, encryptString } from "../src/lib/security/encryption.ts";

const plaintext = "123456789";

process.env.BSN_ENCRYPTION_KEYS = JSON.stringify({
  v1: "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=",
  v2: "ZmVkY2JhOTg3NjU0MzIxMGZlZGNiYTk4NzY1NDMyMTA=",
});
process.env.BSN_ENCRYPTION_ACTIVE_KEY_ID = "v2";

const encrypted = encryptBsn(plaintext);
assert.equal(encrypted.keyId, "v2");
assert.notEqual(encrypted.ciphertext, plaintext);
assert.equal(decryptBsn(encrypted.keyId, encrypted.ciphertext), plaintext);

process.env.BSN_ENCRYPTION_ACTIVE_KEY_ID = "v1";
const legacyPayload = encryptString(plaintext);

process.env.BSN_ENCRYPTION_ACTIVE_KEY_ID = "v2";
assert.equal(decryptString(legacyPayload), plaintext);

console.log("encryption-roundtrip: ok");
