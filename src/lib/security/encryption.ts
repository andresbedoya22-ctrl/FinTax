import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";

const ALGO = "aes-256-gcm";
const IV_LENGTH = 12;

type KeyRing = {
  activeKeyId: string;
  keys: Map<string, Buffer>;
};

function decodeKey(raw: string) {
  const normalized = raw.trim();
  if (/^[0-9a-fA-F]{64}$/.test(normalized)) {
    return Buffer.from(normalized, "hex");
  }
  return Buffer.from(normalized, "base64");
}

function parseKeyRing(): KeyRing {
  const ring = new Map<string, Buffer>();
  const legacy = process.env.BSN_ENCRYPTION_KEY;
  if (legacy) {
    const decoded = decodeKey(legacy);
    if (decoded.length !== 32) throw new Error("BSN_ENCRYPTION_KEY must decode to 32 bytes");
    ring.set("v1", decoded);
  }

  const rawRing = process.env.BSN_ENCRYPTION_KEYS;
  if (rawRing) {
    const normalized = rawRing.trim();
    if (normalized.startsWith("{")) {
      const parsed = JSON.parse(normalized) as Record<string, string>;
      for (const [keyId, keyValue] of Object.entries(parsed)) {
        const decoded = decodeKey(keyValue);
        if (decoded.length !== 32) throw new Error(`BSN_ENCRYPTION_KEYS[${keyId}] must decode to 32 bytes`);
        ring.set(keyId, decoded);
      }
    } else {
      const pairs = normalized.split(",").map((pair) => pair.trim()).filter(Boolean);
      for (const pair of pairs) {
        const [keyId, keyValue] = pair.split(":");
        if (!keyId || !keyValue) throw new Error("BSN_ENCRYPTION_KEYS must use key_id:key format");
        const decoded = decodeKey(keyValue);
        if (decoded.length !== 32) throw new Error(`BSN_ENCRYPTION_KEYS[${keyId}] must decode to 32 bytes`);
        ring.set(keyId.trim(), decoded);
      }
    }
  }

  if (ring.size === 0) throw new Error("No BSN encryption keys configured");

  const activeFromEnv = process.env.BSN_ENCRYPTION_ACTIVE_KEY_ID?.trim();
  const activeKeyId = activeFromEnv && ring.has(activeFromEnv) ? activeFromEnv : Array.from(ring.keys())[0];
  return { activeKeyId, keys: ring };
}

function getKeyBuffer(keyId: string) {
  const { keys } = parseKeyRing();
  const key = keys.get(keyId);
  if (!key) {
    throw new Error(`Missing BSN key for key_id=${keyId}`);
  }
  return key;
}

export type EncryptedBsn = {
  keyId: string;
  ciphertext: string;
};

export function encryptBsn(value: string): EncryptedBsn {
  const { activeKeyId } = parseKeyRing();
  const key = getKeyBuffer(activeKeyId);
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGO, key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();
  return {
    keyId: activeKeyId,
    ciphertext: `${iv.toString("base64")}:${authTag.toString("base64")}:${encrypted.toString("base64")}`,
  };
}

export function decryptBsn(keyId: string, ciphertext: string): string {
  const [ivB64, tagB64, dataB64] = ciphertext.split(":");
  if (!ivB64 || !tagB64 || !dataB64) throw new Error("Invalid encrypted payload format");
  const key = getKeyBuffer(keyId);
  const decipher = createDecipheriv(ALGO, key, Buffer.from(ivB64, "base64"));
  decipher.setAuthTag(Buffer.from(tagB64, "base64"));
  const decrypted = Buffer.concat([decipher.update(Buffer.from(dataB64, "base64")), decipher.final()]);
  return decrypted.toString("utf8");
}

export function encryptString(value: string): string {
  const { keyId, ciphertext } = encryptBsn(value);
  return `${keyId}:${ciphertext}`;
}

export function decryptString(payload: string): string {
  const [keyId, ivB64, tagB64, dataB64] = payload.split(":");
  if (!keyId || !ivB64 || !tagB64 || !dataB64) throw new Error("Invalid encrypted payload format");
  return decryptBsn(keyId, `${ivB64}:${tagB64}:${dataB64}`);
}
