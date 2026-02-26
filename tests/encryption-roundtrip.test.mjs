import assert from "node:assert/strict";

import { decryptString, encryptString } from "../src/lib/security/encryption.ts";

process.env.BSN_ENCRYPTION_KEY = "MDEyMzQ1Njc4OWFiY2RlZjAxMjM0NTY3ODlhYmNkZWY=";

const plaintext = "123456789";
const encrypted = encryptString(plaintext);
assert.notEqual(encrypted, plaintext);
assert.equal(decryptString(encrypted), plaintext);
console.log("encryption-roundtrip: ok");

